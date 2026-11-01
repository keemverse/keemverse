/**
 * KEEMVERSE — custom design requests inbox
 * ========================================
 * Receives requests from the website's custom design form (via the
 * /api/requests function, never straight from a visitor's browser), saves
 * each one as a row in a PRIVATE "Custom Requests" tab, and emails the owner
 * with the request and one-tap reply links.
 *
 * Splice this into the SAME Apps Script project as the checkout script
 * (docs/apps-script-verify.gs). It does not run standalone.
 *
 * WHY THIS SHAPE
 * - The messages contain people's names and contact details. They are NOT
 *   kept in the GitHub repo (it is public); they live only in this Sheet.
 * - The tab is NOT in SHEET_CONFIG, which is what keeps it off the public
 *   ?sheet= endpoint. Do not add it there.
 * - Only the website's server knows REQUESTS_SECRET, so a random person who
 *   finds this /exec URL cannot write rows or trigger emails.
 *
 * SETUP
 * 1. Project Settings -> Script Properties, add:
 *      REQUESTS_SECRET = <a long random secret; the SAME value goes in the
 *                         Vercel project as REQUESTS_SECRET>
 *      NOTIFY_EMAIL    = <who gets the alert; one address or several,
 *                         comma separated. Optional: defaults to the
 *                         account that owns this script>
 * 2. Paste the functions below anywhere in the project.
 * 3. If the project ALREADY has a doPost(e), do not paste a second one: add
 *    the single line marked (A) inside the existing doPost instead.
 *    If it has no doPost, paste the one below.
 * 4. Reuse the existing jsonResponse() helper (do not paste a second copy).
 * 5. Deploy -> Manage deployments -> Edit -> New version -> Deploy. The
 *    /exec URL does not change.
 * 6. Open the Sheet once and share it with anyone who should read requests
 *    (for example Ini). The tab creates itself on the first request.
 */

var REQUESTS_TAB = 'Custom Requests';
var REQUESTS_HEADERS = [
  'Timestamp', 'Ref', 'Status', 'Name', 'Contact', 'For', 'Garment',
  'Needed by', 'What they want', 'Examples', 'Notes (yours)',
];
var REQUEST_STATUSES = ['New', 'Replied', 'Quoted', 'Won', 'Closed'];

// (A) If you already have doPost(e), add this line at its top instead of
//     pasting the function below:
//       var req = parseRequestPost(e); if (req) return handleCustomRequest(req);
function doPost(e) {
  var req = parseRequestPost(e);
  if (req) return handleCustomRequest(req);
  var rd = parseAdminRead(e);
  if (rd) return handleAdminRead(rd);
  var wr = parseAdminWrite(e);
  if (wr) return handleAdminWrite(wr);
  return jsonResponse({ ok: false, error: 'Unknown request.' });
}

function parseRequestPost(e) {
  try {
    var p = JSON.parse(e.postData.contents);
    return p && p.action === 'custom_request' ? p : null;
  } catch (err) {
    return null;
  }
}

// A cell that starts with = + - @ would be run as a formula by Sheets.
// Visitors control this text, so neutralise it with a leading apostrophe.
function safeCell(v) {
  var s = String(v == null ? '' : v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function handleCustomRequest(p) {
  var props  = PropertiesService.getScriptProperties();
  var secret = props.getProperty('REQUESTS_SECRET');
  if (!secret || p.secret !== secret) {
    return jsonResponse({ ok: false, error: 'Not authorised.' });
  }

  var name    = String(p.name || '').slice(0, 80);
  var contact = String(p.contact || '').slice(0, 120);
  var brief   = String(p.brief || '').slice(0, 2000);
  if (name.length < 2 || contact.length < 5 || brief.length < 20) {
    return jsonResponse({ ok: false, error: 'Incomplete request.' });
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  var ref;
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(REQUESTS_TAB);
    if (!sheet) {
      sheet = ss.insertSheet(REQUESTS_TAB);
      sheet.appendRow(REQUESTS_HEADERS);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, REQUESTS_HEADERS.length).setFontWeight('bold');
      var rule = SpreadsheetApp.newDataValidation().requireValueInList(REQUEST_STATUSES, true).build();
      sheet.getRange(2, 3, 1000, 1).setDataValidation(rule);
    }
    ref = 'CR-' + ('0000' + Math.max(1, sheet.getLastRow())).slice(-4);
    sheet.appendRow([
      new Date(), ref, 'New',
      safeCell(name), safeCell(contact), safeCell(p.project), safeCell(p.garment),
      safeCell(p.deadline), safeCell(brief), safeCell(p.refs), '',
    ]);
  } finally {
    lock.releaseLock();
  }

  // Alert + one-tap reply links. A failure here must never lose the request.
  try {
    var to = props.getProperty('NOTIFY_EMAIL') || Session.getEffectiveUser().getEmail();
    var digits = contact.replace(/[^0-9]/g, '');
    var isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    var lines = [
      'New custom design request ' + ref,
      '',
      'Name: ' + name,
      'Contact: ' + contact,
      'For: ' + (p.project || ''),
      p.garment ? 'Garment: ' + p.garment : null,
      p.deadline ? 'Needed by: ' + p.deadline : null,
      '',
      'What they want:',
      brief,
      p.refs ? '\nExamples: ' + p.refs : null,
      '',
    ].filter(function (l) { return l !== null; });
    if (digits.length >= 8 && !isEmail) {
      lines.push('Message them on WhatsApp: https://wa.me/' + digits);
    }
    if (isEmail) lines.push('Reply by email: just reply to this message.');
    lines.push('Open the inbox: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl());

    var mail = {
      to: to,
      subject: 'New custom design request ' + ref + ' from ' + name,
      body: lines.join('\n'),
    };
    if (isEmail) mail.replyTo = contact;
    MailApp.sendEmail(mail);
  } catch (mailErr) {
    // The row is already saved; the email is a convenience.
  }

  return jsonResponse({ ok: true, ref: ref });
}

// ===== Console read access (Orders, Downloads, Custom Requests) =====
// The admin console asks for these tabs through /api/admin-data. The request
// carries the same shared secret as the custom-requests form (REQUESTS_SECRET).
// Download tokens are never sent: a token is a working download link.
var ADMIN_READ_SHEETS = ['Orders', 'Downloads', 'Custom Requests'];
var ADMIN_READ_HIDE = { 'Token': true };
var ADMIN_READ_MAX = 500;

function parseAdminRead(e) {
  try {
    var p = JSON.parse(e.postData.contents);
    return p && p.action === 'admin_read' ? p : null;
  } catch (err) {
    return null;
  }
}

function handleAdminRead(p) {
  var secret = PropertiesService.getScriptProperties().getProperty('REQUESTS_SECRET');
  if (!secret || p.secret !== secret) return jsonResponse({ ok: false, error: 'Not authorised.' });
  if (ADMIN_READ_SHEETS.indexOf(p.sheet) === -1) return jsonResponse({ ok: false, error: 'Unknown sheet.' });

  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(p.sheet);
  if (!sh || sh.getLastRow() < 2) return jsonResponse({ ok: true, sheet: p.sheet, headers: [], rows: [], total: 0 });

  var tz = Session.getScriptTimeZone();
  var values = sh.getDataRange().getValues();
  var head = values[0];
  var keep = [];
  for (var c = 0; c < head.length; c++) {
    var h = String(head[c] || '').trim();
    if (h && !ADMIN_READ_HIDE[h]) keep.push({ i: c, name: h });
  }

  var out = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var any = false;
    var obj = { _row: r + 1 };
    for (var k = 0; k < keep.length; k++) {
      var v = row[keep[k].i];
      if (v instanceof Date) v = Utilities.formatDate(v, tz, "yyyy-MM-dd'T'HH:mm:ss");
      if (v !== '' && v !== null) any = true;
      obj[keep[k].name] = v;
    }
    if (any) out.push(obj);
  }

  var total = out.length;
  if (total > ADMIN_READ_MAX) out = out.slice(total - ADMIN_READ_MAX);
  return jsonResponse({
    ok: true,
    sheet: p.sheet,
    headers: keep.map(function (x) { return x.name; }),
    rows: out,
    total: total,
  });
}
// ===== end console read access =====

// ===== Console write access (two narrow actions) =====
// 1. set_revoked: switch every download link of one order + item off (or back on).
//    A revoked link stops working and "Already purchased?" will not mint a new one.
// 2. request_update: change a custom request's status and your note, found by its Ref.
// Nothing else can be written from the console. Same shared secret as the read access.
function parseAdminWrite(e) {
  try {
    var p = JSON.parse(e.postData.contents);
    return p && p.action === 'admin_write' ? p : null;
  } catch (err) {
    return null;
  }
}

function colIndex(headers, name) {
  for (var i = 0; i < headers.length; i++) if (String(headers[i]).trim() === name) return i;
  return -1;
}

function handleAdminWrite(p) {
  var secret = PropertiesService.getScriptProperties().getProperty('REQUESTS_SECRET');
  if (!secret || p.secret !== secret) return jsonResponse({ ok: false, error: 'Not authorised.' });

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (p.op === 'set_revoked') {
      var orderRef = String(p.orderRef || '');
      var item = String(p.item || '');
      if (!orderRef || !item) return jsonResponse({ ok: false, error: 'Missing order or item.' });
      var dl = ss.getSheetByName('Downloads');
      if (!dl) return jsonResponse({ ok: false, error: 'No Downloads tab.' });
      var dv = dl.getDataRange().getValues();
      var cRef = colIndex(dv[0], 'Order Ref'), cItem = colIndex(dv[0], 'Item'), cRev = colIndex(dv[0], 'Revoked');
      if (cRef < 0 || cItem < 0 || cRev < 0) return jsonResponse({ ok: false, error: 'Downloads tab columns not found.' });
      var changed = 0;
      for (var r = 1; r < dv.length; r++) {
        if (String(dv[r][cRef]) === orderRef && String(dv[r][cItem]) === item) {
          dl.getRange(r + 1, cRev + 1).setValue(p.revoked ? 'TRUE' : 'FALSE');
          changed++;
        }
      }
      if (changed === 0) return jsonResponse({ ok: false, error: 'No matching links found.' });
      return jsonResponse({ ok: true, changed: changed, revoked: !!p.revoked });
    }

    if (p.op === 'request_update') {
      var ref = String(p.ref || '');
      if (!ref) return jsonResponse({ ok: false, error: 'Missing request ref.' });
      var cr = ss.getSheetByName(REQUESTS_TAB);
      if (!cr) return jsonResponse({ ok: false, error: 'No Custom Requests tab.' });
      var rv = cr.getDataRange().getValues();
      var kRef = colIndex(rv[0], 'Ref'), kStatus = colIndex(rv[0], 'Status'), kNote = colIndex(rv[0], 'Notes (yours)');
      if (kRef < 0 || kStatus < 0 || kNote < 0) return jsonResponse({ ok: false, error: 'Custom Requests columns not found.' });
      for (var q = 1; q < rv.length; q++) {
        if (String(rv[q][kRef]) !== ref) continue;
        if (p.status !== undefined) {
          if (REQUEST_STATUSES.indexOf(p.status) === -1) return jsonResponse({ ok: false, error: 'Unknown status.' });
          cr.getRange(q + 1, kStatus + 1).setValue(p.status);
        }
        if (p.note !== undefined) {
          cr.getRange(q + 1, kNote + 1).setValue(safeCell(String(p.note).slice(0, 500)));
        }
        return jsonResponse({ ok: true, ref: ref });
      }
      return jsonResponse({ ok: false, error: 'Request not found.' });
    }

    return jsonResponse({ ok: false, error: 'Unknown action.' });
  } finally {
    lock.releaseLock();
  }
}
// ===== end console write access =====
