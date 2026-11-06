/**
 * KEEMVERSE: free-look signups and funnel events
 * ==============================================
 * Receives two kinds of POST from the website's server (never straight from a
 * visitor's browser):
 *   action 'free_look'  /api/lead   a visitor asks for the free look
 *   action 'events'     /api/event   a small batch of anonymous funnel events
 *
 * Splice into the SAME Apps Script project as checkout (docs/apps-script-verify.gs)
 * and the custom requests inbox (docs/apps-script-requests.gs). Not standalone.
 *
 * WHY THIS SHAPE
 * - Emails live only in this Sheet (the repo is public). The "Leads" and
 *   "Events" tabs are NOT in SHEET_CONFIG, which keeps them off the public
 *   ?sheet= endpoint. Do not add them there.
 * - Only the website's server knows REQUESTS_SECRET, so a stranger who finds
 *   the /exec URL cannot add rows or trigger emails.
 * - The free look is delivered by EMAIL ONLY (one-time link, same token system
 *   as paid downloads). That proves the address is real and stops bots farming
 *   links.
 * - Events never contain a name or an email: a random per-visit id, the page,
 *   the event name, the look or item, the traffic source and campaign.
 *
 * SETUP
 * 1. Make the free file. Easiest: in the "Lightroom Presets" tab add ONE row
 *    for the free look (it is never shown on the site, because the site reads
 *    products from the console, not from this tab):
 *      Preset Name   = e.g.  Old Garden: Essential (free)
 *      Drive File Id = the ZIP holding that look's Essential .xmp (keep it small)
 *      Status        = Hidden
 *    handleDownload finds the file by Preset Name, exactly as for paid items.
 * 2. Project Settings -> Script Properties, add:
 *      FREE_LOOK_ITEM = Old Garden: Essential (free)     (the exact Preset Name)
 *    (REQUESTS_SECRET, WEBAPP_URL and NOTIFY_EMAIL already exist.)
 * 3. Paste the functions below anywhere in the project. Reuse the existing
 *    jsonResponse(), safeCell() and LockService pattern; do not paste a second
 *    copy of those.
 * 4. In the existing doPost(e) add these two lines at the top, next to the
 *    custom-request line:
 *      var fl = parsePostAction(e, 'free_look'); if (fl) return handleFreeLook(fl);
 *      var ev = parsePostAction(e, 'events');    if (ev) return handleEvents(ev);
 * 5. Deploy -> Manage deployments -> Edit -> New version -> Deploy. The /exec
 *    URL does not change.
 * 6. On the site: Admin -> Content -> Home page -> "Free look: name of the look"
 *    (leave empty to keep the form hidden; type the look's name to switch it on).
 *
 * LIMITS
 * - A normal Google account can email about 100 recipients a day through
 *   MailApp (a Workspace account about 1,500). If the list outgrows that, move
 *   delivery to a free email tool; the Leads tab exports cleanly.
 */

var LEADS_TAB = 'Leads';
var LEADS_HEADERS = ['Timestamp', 'Email', 'Item', 'Marketing Opt-in', 'Source', 'Campaign', 'Region', 'Status'];
var EVENTS_TAB = 'Events';
var EVENTS_HEADERS = ['Timestamp', 'Session', 'Event', 'Path', 'Item', 'Detail', 'Source', 'Campaign', 'Region'];
var FREE_LINK_HOURS = 72;
var FREE_MAX_DOWNLOADS = 3;

function parsePostAction(e, action) {
  try {
    var p = JSON.parse(e.postData.contents);
    return p && p.action === action ? p : null;
  } catch (err) {
    return null;
  }
}

function checkSecret(p) {
  var secret = PropertiesService.getScriptProperties().getProperty('REQUESTS_SECRET');
  return !!secret && p.secret === secret;
}

function ensureTab(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sheet;
}

function handleFreeLook(p) {
  if (!checkSecret(p)) return jsonResponse({ ok: false, error: 'Not authorised.' });

  var props   = PropertiesService.getScriptProperties();
  var item    = props.getProperty('FREE_LOOK_ITEM');
  var webApp  = props.getProperty('WEBAPP_URL');
  if (!item || !webApp) return jsonResponse({ ok: false, error: 'not_configured' });

  var email = String(p.email || '').toLowerCase().slice(0, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return jsonResponse({ ok: false, error: 'Bad email.' });

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  var token;
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var leads = ensureTab(ss, LEADS_TAB, LEADS_HEADERS);
    var dl    = ss.getSheetByName('Downloads');
    if (!dl) return jsonResponse({ ok: false, error: 'not_configured' });

    // Same person asking again within the link's life: re-send the SAME link.
    var dRows = dl.getDataRange().getValues();
    var dh = dRows[0];
    var cTok = dh.indexOf('Token'), cItem = dh.indexOf('Item'), cMail = dh.indexOf('Buyer Email'),
        cExp = dh.indexOf('Expires'), cRev = dh.indexOf('Revoked');
    var now = new Date();
    for (var i = dRows.length - 1; i >= 1; i--) {
      if (String(dRows[i][cItem]) === item && String(dRows[i][cMail]).toLowerCase() === email &&
          new Date(dRows[i][cExp]) > now && String(dRows[i][cRev]).toUpperCase() !== 'TRUE') {
        token = dRows[i][cTok];
        break;
      }
    }
    if (!token) {
      token = Utilities.getUuid();
      var expires = new Date(now.getTime() + FREE_LINK_HOURS * 3600 * 1000);
      dl.appendRow([token, 'lead-' + Utilities.getUuid().slice(0, 8), item, email, now, expires, 0, FREE_MAX_DOWNLOADS, 'FALSE']);
    }

    leads.appendRow([
      now, safeCell(email), safeCell(item), p.optIn === true ? 'Yes' : 'No',
      safeCell(String(p.source || '').slice(0, 80)), safeCell(String(p.campaign || '').slice(0, 80)),
      p.region === 'NG' ? 'NG' : 'ROW', 'Sent',
    ]);
  } finally {
    lock.releaseLock();
  }

  var link = webApp + '?action=download&token=' + token;
  try {
    MailApp.sendEmail({
      to: email,
      subject: 'Your free look from KEEMVERSE',
      body:
        'Hi,\n\n' +
        'Here is your free look. Download it here:\n\n' + link + '\n\n' +
        'The link works for ' + FREE_LINK_HOURS + ' hours and up to ' + FREE_MAX_DOWNLOADS + ' downloads.\n\n' +
        'To install: Lightroom Mobile, open a photo, Presets, the three dots, Import Presets, choose the file. ' +
        'Desktop: Develop module, right-click the Presets panel, Import Profiles & Presets.\n\n' +
        'If you like it, the full looks (three depth tiers each) are at keemverse.com/fashion/presets.\n\n' +
        '- Keem'
    });
  } catch (mailErr) {
    return jsonResponse({ ok: false, error: 'mail_failed' });
  }
  return jsonResponse({ ok: true });
}

function handleEvents(p) {
  if (!checkSecret(p)) return jsonResponse({ ok: false, error: 'Not authorised.' });
  var events = (p.events || []).slice(0, 25);
  if (!events.length) return jsonResponse({ ok: true });

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ensureTab(ss, EVENTS_TAB, EVENTS_HEADERS);
    var sid = safeCell(String(p.sid || '').slice(0, 40));
    var region = p.region === 'NG' ? 'NG' : 'ROW';
    var rows = events.map(function (e) {
      return [
        new Date(Number(e.t) || Date.now()), sid, safeCell(e.name), safeCell(e.path),
        safeCell(e.item), safeCell(e.detail), safeCell(e.source), safeCell(e.campaign), region,
      ];
    });
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, EVENTS_HEADERS.length).setValues(rows);
  } finally {
    lock.releaseLock();
  }
  return jsonResponse({ ok: true });
}
