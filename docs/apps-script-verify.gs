/**
 * KEEMVERSE — Flutterwave verification handler
 * ==============================================
 * This is NOT wired into your live Apps Script yet — it's a snippet to
 * splice into the existing project (the same one already serving
 * getProducts()/getPresets() to the site). It does not run standalone.
 *
 * WHAT IT DOES
 * When the checkout success page calls:
 *   GET {your existing web app URL}?action=verify&tx_ref=...&item_id=...
 * this:
 *   1. Confirms the transaction is genuinely paid, by asking Flutterwave
 *      directly (server-side, using the SECRET key — never trust the
 *      browser's own "payment succeeded" callback alone, it can be faked).
 *   2. Looks up the real download link for that preset by name.
 *   3. Logs the order to an "Orders" tab in the same spreadsheet —
 *      including whether the buyer opted in to marketing emails, read
 *      from Flutterwave's own verified transaction metadata (not a
 *      client-side value, so it can't be tampered with after checkout).
 *   4. Emails the buyer their download link directly (making good on
 *      what the success page already tells them happens).
 *   5. Returns { ok: true, downloadUrl } — or { ok: false, error } if
 *      anything doesn't check out.
 *
 * SETUP BEFORE THIS WORKS
 * 1. In the Apps Script editor: Project Settings → Script Properties →
 *    add FLUTTERWAVE_SECRET_KEY = <your secret key, test key is fine to
 *    start>. Never paste the secret key into the script source itself —
 *    Script Properties keeps it out of any code you might ever share.
 * 2. Add an "Orders" tab to the same Google Sheet the Presets/Products
 *    tabs live in, with header row:
 *    Timestamp | Email | Preset | Amount | Currency | Tx Ref | Status | Marketing Opt-in
 * 3. Splice the block below into your EXISTING doGet(e) function, as the
 *    FIRST check — before whatever logic currently reads `e.parameter.sheet`
 *    — so a `?action=verify` request short-circuits into this instead of
 *    falling through to the existing product-list logic:
 *
 *      function doGet(e) {
 *        if (e.parameter.action === 'verify') {
 *          return handleVerify(e);
 *        }
 *        // ...your existing doGet logic continues here, unchanged...
 *      }
 *
 *    Then add the two functions below anywhere else in the project.
 */

function handleVerify(e) {
  const txRef = e.parameter.tx_ref;
  const itemId = e.parameter.item_id; // this is the Preset Name, per CheckoutPage

  if (!txRef || !itemId) {
    return jsonResponse({ ok: false, error: "Missing tx_ref or item_id." });
  }

  const secretKey = PropertiesService.getScriptProperties().getProperty("FLUTTERWAVE_SECRET_KEY");
  if (!secretKey) {
    return jsonResponse({ ok: false, error: "Server not configured yet." });
  }

  // 1. Ask Flutterwave directly whether this transaction really succeeded.
  const verifyUrl =
    "https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=" +
    encodeURIComponent(txRef);

  const response = UrlFetchApp.fetch(verifyUrl, {
    method: "get",
    headers: { Authorization: "Bearer " + secretKey },
    muteHttpExceptions: true,
  });

  const result = JSON.parse(response.getContentText());

  if (result.status !== "success" || !result.data || result.data.status !== "successful") {
    return jsonResponse({ ok: false, error: "Payment not confirmed." });
  }

  const paidAmount = result.data.amount;
  const paidCurrency = result.data.currency;
  const buyerEmail = result.data.customer && result.data.customer.email;
  const buyerName = result.data.customer && result.data.customer.name;
  // Read from Flutterwave's own verified record, not anything the
  // client sent at verify-time — this is the transaction's real
  // metadata, set when the payment was initiated, so it can't be
  // edited after the fact by messing with the success-page URL.
  const marketingOptIn = result.data.meta && result.data.meta.marketing_opt_in === "yes";

  // 2. Look up the preset by name in the same sheet getPresets() reads,
  // to get its real price (to double check against what was paid) and
  // its real download link.
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Lightroom Presets");
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const nameCol = headers.indexOf("Preset Name");
  const priceCol = headers.indexOf("Price");
  const linkCol = headers.indexOf("Download Link"); // add this column if it doesn't exist yet

  let matchedRow = null;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][nameCol] === itemId) {
      matchedRow = rows[i];
      break;
    }
  }

  if (!matchedRow) {
    return jsonResponse({ ok: false, error: "Unknown item." });
  }

  const expectedAmount = parseFloat(String(matchedRow[priceCol]).replace(/[^0-9.]/g, ""));
  if (Math.abs(paidAmount - expectedAmount) > 1) {
    // Amount paid doesn't match the listed price — don't unlock.
    return jsonResponse({ ok: false, error: "Amount mismatch." });
  }

  const downloadUrl = matchedRow[linkCol];
  if (!downloadUrl) {
    return jsonResponse({ ok: false, error: "No download link configured for this preset yet." });
  }

  // 3. Log the order.
  const ordersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Orders");
  if (ordersSheet) {
    ordersSheet.appendRow([
      new Date(),
      buyerEmail || "",
      itemId,
      paidAmount,
      paidCurrency,
      txRef,
      "Paid",
      marketingOptIn ? "Yes" : "No",
    ]);
  }

  // 4. Email the buyer their download link directly.
  if (buyerEmail) {
    try {
      MailApp.sendEmail({
        to: buyerEmail,
        subject: "Your " + itemId + " download — KEEMVERSE",
        body:
          "Hi " + (buyerName || "there") + ",\n\n" +
          "Thanks for your purchase! Here's your download link:\n\n" +
          downloadUrl +
          "\n\n" +
          "If the link ever stops working or you lose it, just reply to this email with your order reference and we'll sort it out.\n\n" +
          "Order reference: " + txRef + "\n\n" +
          "— KEEMVERSE",
      });
    } catch (mailErr) {
      // Don't fail the whole request just because the email didn't send —
      // the buyer still gets the link directly on the success page.
    }
  }

  return jsonResponse({ ok: true, downloadUrl: downloadUrl });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
