/**
 * KEEMVERSE — checkout verification + gated download (Google Drive delivery)
 * =========================================================================
 * Splice this into the SAME Apps Script project that already serves
 * getProducts()/getPresets() to the site. It does not run standalone.
 *
 * WHY THIS SHAPE
 * The buyer never receives a shareable file link. Files live in a PRIVATE
 * Drive folder with no sharing at all. After a verified payment this:
 *   1. Confirms the payment straight from Flutterwave (server-side, with the
 *      SECRET key — the browser's own "success" callback can be faked).
 *   2. Mints a random token, logs it to a "Downloads" index tab (with an
 *      expiry, a download cap, and a Revoked flag you can flip by hand).
 *   3. Emails the buyer a tokenised URL that points back at THIS script,
 *      not at the file.
 *   4. When that URL is opened, re-checks the token, reads the master ZIP
 *      from Drive, injects a per-buyer LICENSE.txt (so any leaked copy is
 *      traceable), repackages, and streams it to the browser as an
 *      automatic download. No public URL is ever produced.
 *
 * SETUP BEFORE THIS WORKS
 * 1. Apps Script editor -> Project Settings -> Script Properties, add:
 *      FLUTTERWAVE_SECRET_KEY = <secret key; the TEST key is fine to start>
 *      WEBAPP_URL             = <this web app's own /exec URL>
 *    Never put the secret key in the source itself.
 * 2. "Lightroom Presets" tab was rebuilt (11-Sep-2026) for this native-
 *    checkout method — Gumroad-era columns (Purchase Link, Why I Created
 *    It, Rating, the old Preview/Before/After Image split) are gone.
 *    Current column order, A to O:
 *      Preset Name | Collection | Price | Status | Featured |
 *      Display Order | Drive File Id | Thumbnail | Banner | Description |
 *      What's Included | Installation | Compatible With | Tags | Date Added
 *    handleVerify/handleDownload below find fields by HEADER NAME
 *    (headers.indexOf(...)), so they don't care what order the columns are
 *    in. But the live script's SHEET_CONFIG["Lightroom Presets"].columns
 *    block uses FIXED COLUMN NUMBERS for autoSortProducts() — that block
 *    must be kept in sync with this layout by hand (FEATURED=5, NAME=1,
 *    DISPLAY_ORDER=6, STATUS=4, DATE=15; RATING no longer exists as a
 *    column, point it at 0 so it ties out harmlessly). If the "Lightroom
 *    Presets" columns are ever reordered again, update that config block
 *    or sorting silently reads the wrong cells.
 * 3. Add a "Downloads" tab. Paste as row 1 (A1):
 *      Token	Order Ref	Item	Buyer Email	Issued	Expires	Downloads	Max Downloads	Revoked
 * 4. Add an "Orders" tab. Paste as row 1 (A1):
 *      Timestamp	Email	Preset	Amount	Currency	Tx Ref	Status	Marketing Opt-in
 *    DO NOT add "Downloads" or "Orders" to SHEET_CONFIG — leaving them off
 *    the allowlist is what keeps them off the public ?sheet= endpoint.
 * 5. At the TOP of your existing doGet(e), before the sheet logic:
 *      if (e.parameter.action === 'verify')   return handleVerify(e);
 *      if (e.parameter.action === 'download') return handleDownload(e);
 *      if (e.parameter.action === 'restore')  return handleRestore(e);
 * 4. Paste the functions below anywhere in the project. If the project
 *    already has a jsonResponse(), reuse it — don't paste a second copy.
 * 5. Deploy -> Manage deployments -> Edit -> New version -> Deploy. The
 *    /exec URL does not change.
 */

var DOWNLOAD_EXPIRY_HOURS = 72;   // how long an issued link stays valid
var MAX_DOWNLOADS = 3;            // pulls allowed per issued link
var MAX_PACK_BYTES = 20 * 1024 * 1024; // safety ceiling for streamed delivery

function handleVerify(e) {
  var txRef  = e.parameter.tx_ref;
  var itemId = e.parameter.item_id; // the Preset Name, per CheckoutPage

  if (!txRef || !itemId) {
    return jsonResponse({ ok: false, error: 'Missing tx_ref or item_id.' });
  }

  var props     = PropertiesService.getScriptProperties();
  var secretKey = props.getProperty('FLUTTERWAVE_SECRET_KEY');
  var webAppUrl = props.getProperty('WEBAPP_URL');
  if (!secretKey || !webAppUrl) {
    return jsonResponse({ ok: false, error: 'Server not configured yet.' });
  }

  // 1. Confirm the payment directly with Flutterwave.
  var verifyUrl =
    'https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=' +
    encodeURIComponent(txRef);
  var res = UrlFetchApp.fetch(verifyUrl, {
    method: 'get',
    headers: { Authorization: 'Bearer ' + secretKey },
    muteHttpExceptions: true,
  });
  var result = JSON.parse(res.getContentText());
  // Accept both statuses Flutterwave can return for a genuinely successful
  // payment -- the client-side callback in flutterwave.ts already treats
  // "successful" and "completed" as equivalent (bank transfers in
  // particular can come back as "completed"); the server check must match
  // or it silently rejects a real payment.
  var okStatus = result.data && (result.data.status === 'successful' || result.data.status === 'completed');
  if (result.status !== 'success' || !okStatus) {
    return jsonResponse({ ok: false, error: 'Payment not confirmed.' });
  }

  var paid       = result.data.amount;
  var currency   = result.data.currency;
  var buyerEmail = result.data.customer && result.data.customer.email;
  var buyerName  = result.data.customer && result.data.customer.name;
  // Read from Flutterwave's own verified record, set when payment was
  // initiated — not anything the client sends at verify-time.
  var optIn = result.data.meta && result.data.meta.marketing_opt_in === 'yes';

  // 2. Look the preset up in the same sheet getPresets() reads.
  var ss   = SpreadsheetApp.getActiveSpreadsheet();
  var rows = ss.getSheetByName('Lightroom Presets').getDataRange().getValues();
  var h    = rows[0];
  var cName  = h.indexOf('Preset Name');
  var cPrice = h.indexOf('Price');
  var cFile  = h.indexOf('Drive File Id');

  var row = null;
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][cName] === itemId) { row = rows[i]; break; }
  }
  if (!row) return jsonResponse({ ok: false, error: 'Unknown item.' });

  var expected = parseFloat(String(row[cPrice]).replace(/[^0-9.]/g, ''));
  if (Math.abs(paid - expected) > 1) {
    return jsonResponse({ ok: false, error: 'Amount mismatch.' });
  }
  if (!row[cFile]) {
    return jsonResponse({ ok: false, error: 'No file configured for this preset yet.' });
  }

  // 3. Mint a token and log it to the Downloads index.
  var token   = Utilities.getUuid();
  var now     = new Date();
  var expires = new Date(now.getTime() + DOWNLOAD_EXPIRY_HOURS * 3600 * 1000);
  ss.getSheetByName('Downloads').appendRow([
    token, txRef, itemId, buyerEmail || '', now, expires, 0, MAX_DOWNLOADS, 'FALSE',
  ]);

  // 4. Log the order.
  var orders = ss.getSheetByName('Orders');
  if (orders) {
    orders.appendRow([
      now, buyerEmail || '', itemId, paid, currency, txRef, 'Paid', optIn ? 'Yes' : 'No',
    ]);
  }

  var downloadUrl = webAppUrl + '?action=download&token=' + token;

  // 5. Email the buyer the tokenised link (also expiry/cap controlled).
  if (buyerEmail) {
    try {
      MailApp.sendEmail({
        to: buyerEmail,
        subject: 'Your ' + itemId + ' download — KEEMVERSE',
        body:
          'Hi ' + (buyerName || 'there') + ',\n\n' +
          'Thanks for your purchase! Download your files here:\n\n' +
          downloadUrl + '\n\n' +
          'This link works for ' + DOWNLOAD_EXPIRY_HOURS + ' hours and up to ' +
          MAX_DOWNLOADS + ' downloads. If it expires or you lose your files, ' +
          'reply to this email with your order reference and we\'ll re-send.\n\n' +
          'Order reference: ' + txRef + '\n\n— KEEMVERSE',
      });
    } catch (mailErr) {
      // Non-fatal — the success page still shows the same link.
    }
  }

  return jsonResponse({ ok: true, downloadUrl: downloadUrl });
}

function handleDownload(e) {
  var token = e.parameter.token;
  if (!token) return htmlMessage('Invalid link', 'This download link is missing its token.');

  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Downloads');
  var data  = sheet.getDataRange().getValues();
  var h     = data[0];
  var cTok = h.indexOf('Token'),   cItem = h.indexOf('Item'),
      cEmail = h.indexOf('Buyer Email'), cRef = h.indexOf('Order Ref'),
      cExp = h.indexOf('Expires'), cCnt = h.indexOf('Downloads'),
      cMax = h.indexOf('Max Downloads'), cRev = h.indexOf('Revoked');

  var r = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][cTok]) === token) { r = i; break; }
  }
  if (r === -1) {
    return htmlMessage('Invalid link',
      'We could not find this download. Contact support with your order reference.');
  }

  var rec = data[r];
  if (String(rec[cRev]).toUpperCase() === 'TRUE') {
    return htmlMessage('Link disabled', 'This link has been disabled. Contact support.');
  }
  if (new Date() > new Date(rec[cExp])) {
    return htmlMessage('Link expired',
      'This link has expired. Reply to your order email and we\'ll re-send it.');
  }
  if (Number(rec[cCnt]) >= Number(rec[cMax])) {
    return htmlMessage('Limit reached',
      'This link has hit its download limit. Contact support to re-issue it.');
  }

  // Find the master file for this item.
  var pRows = ss.getSheetByName('Lightroom Presets').getDataRange().getValues();
  var pH = pRows[0];
  var pcName = pH.indexOf('Preset Name'), pcFile = pH.indexOf('Drive File Id');
  var fileId = null;
  for (var j = 1; j < pRows.length; j++) {
    if (pRows[j][pcName] === rec[cItem]) { fileId = pRows[j][pcFile]; break; }
  }
  if (!fileId) return htmlMessage('Not available', 'This item has no file configured. Contact support.');

  var bytes;
  try {
    bytes = DriveApp.getFileById(fileId).getBlob().getBytes();
  } catch (err) {
    return htmlMessage('Not available',
      'We could not open the file. Contact support with your order reference.');
  }
  if (bytes.length > MAX_PACK_BYTES) {
    return htmlMessage('Manual delivery needed',
      'This pack is too large for automatic delivery. Contact support and we\'ll send it directly.');
  }

  // Repackage with a per-buyer licence stamp.
  var out;
  try {
    var parts = Utilities.unzip(Utilities.newBlob(bytes, 'application/zip', 'master.zip'));
    var lic =
      'KEEMVERSE — personal licence\n\n' +
      'Licensed to: ' + rec[cEmail] + '\n' +
      'Order reference: ' + rec[cRef] + '\n' +
      'Issued: ' + new Date().toISOString() + '\n\n' +
      'This copy is personally licensed and traceable to the email above.\n' +
      'Please do not share or resell it.\n';
    parts.push(Utilities.newBlob(lic, 'text/plain', 'LICENSE.txt'));
    out = Utilities.zip(parts, String(rec[cItem]).replace(/[^\w\-]+/g, '_') + '.zip');
  } catch (err) {
    return htmlMessage('File problem',
      'The download could not be prepared. Contact support with your order reference.');
  }

  // Count this pull.
  sheet.getRange(r + 1, cCnt + 1).setValue(Number(rec[cCnt]) + 1);

  var b64   = Utilities.base64Encode(out.getBytes());
  var fname = out.getName();
  var html =
    '<!doctype html><meta charset="utf-8"><title>Your download</title>' +
    '<body style="font:16px/1.5 system-ui,-apple-system,sans-serif;margin:0;padding:48px 24px;' +
    'text-align:center;background:#F5F2EA;color:#1D1C19">' +
    '<h2 style="font-family:Georgia,serif;font-weight:600">Your download is starting…</h2>' +
    '<p>If it doesn\'t start on its own, use the button below.</p>' +
    '<p style="margin-top:16px"><a id="dl" download="' + fname + '" ' +
    'href="data:application/zip;base64,' + b64 + '" ' +
    'style="display:inline-block;padding:14px 28px;border-radius:999px;background:#1D1C19;' +
    'color:#fff;text-decoration:none;font-weight:600">Download ' + fname + '</a></p>' +
    '<p style="color:#8a8580;font-size:14px;margin-top:28px">' +
    'You can close this tab once the file has saved.</p>' +
    '<script>setTimeout(function(){document.getElementById("dl").click();},400);</script>' +
    '</body>';
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Self-serve "lost your download?" — no accounts, just email + the Orders
 * log. Mints a fresh token for every item that email has a Paid order for
 * and emails all the links in one message. Always returns the same generic
 * { ok: true } response regardless of whether a match was found, so this
 * can't be used to check whether a given email has ever bought anything.
 */
function handleRestore(e) {
  var email = String(e.parameter.email || '').trim().toLowerCase();
  var generic = { ok: true, message: 'If that email has a purchase with us, we\'ve sent the download link(s) to it.' };
  if (!email) return jsonResponse(generic);

  var props     = PropertiesService.getScriptProperties();
  var webAppUrl = props.getProperty('WEBAPP_URL');
  if (!webAppUrl) return jsonResponse(generic);

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ordersSheet = ss.getSheetByName('Orders');
  var downloadsSheet = ss.getSheetByName('Downloads');
  if (!ordersSheet || !downloadsSheet) return jsonResponse(generic);

  var rows = ordersSheet.getDataRange().getValues();
  var h = rows[0];
  var cEmail = h.indexOf('Email'), cPreset = h.indexOf('Preset'),
      cStatus = h.indexOf('Status'), cRef = h.indexOf('Tx Ref');

  // Distinct paid items for this email -> most recent tx ref per item.
  var items = {};
  for (var i = 1; i < rows.length; i++) {
    var rowEmail = String(rows[i][cEmail] || '').trim().toLowerCase();
    if (rowEmail === email && String(rows[i][cStatus]) === 'Paid') {
      items[rows[i][cPreset]] = rows[i][cRef];
    }
  }
  var itemNames = Object.keys(items);
  if (itemNames.length === 0) return jsonResponse(generic);

  var pRows = ss.getSheetByName('Lightroom Presets').getDataRange().getValues();
  var pH = pRows[0];
  var pcName = pH.indexOf('Preset Name'), pcFile = pH.indexOf('Drive File Id');

  var now     = new Date();
  var expires = new Date(now.getTime() + DOWNLOAD_EXPIRY_HOURS * 3600 * 1000);
  var links = [];

  itemNames.forEach(function (itemName) {
    var fileId = null;
    for (var j = 1; j < pRows.length; j++) {
      if (pRows[j][pcName] === itemName) { fileId = pRows[j][pcFile]; break; }
    }
    if (!fileId) return; // no file configured for this item — skip it

    var token = Utilities.getUuid();
    downloadsSheet.appendRow([
      token, items[itemName], itemName, email, now, expires, 0, MAX_DOWNLOADS, 'FALSE',
    ]);
    links.push({ name: itemName, url: webAppUrl + '?action=download&token=' + token });
  });

  if (links.length > 0) {
    var body = 'Hi,\n\nHere ' + (links.length === 1 ? 'is your download link' : 'are your download links') +
      ', refreshed and ready:\n\n';
    links.forEach(function (l) { body += l.name + ':\n' + l.url + '\n\n'; });
    body += 'Each link works for ' + DOWNLOAD_EXPIRY_HOURS + ' hours and up to ' + MAX_DOWNLOADS +
      ' downloads. Reply to this email if you need anything else.\n\n— KEEMVERSE';
    try {
      MailApp.sendEmail({ to: email, subject: 'Your KEEMVERSE downloads', body: body });
    } catch (mailErr) {}
  }

  return jsonResponse(generic);
}

function htmlMessage(title, msg) {
  var html =
    '<!doctype html><meta charset="utf-8"><title>' + title + '</title>' +
    '<body style="font:16px/1.5 system-ui,-apple-system,sans-serif;margin:0;padding:48px 24px;' +
    'text-align:center;background:#F5F2EA;color:#1D1C19">' +
    '<h2 style="font-family:Georgia,serif;font-weight:600">' + title + '</h2>' +
    '<p>' + msg + '</p>' +
    '<p style="color:#8a8580;font-size:14px;margin-top:24px">akeemtajudeen322@gmail.com</p>' +
    '</body>';
  return HtmlService.createHtmlOutput(html);
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
