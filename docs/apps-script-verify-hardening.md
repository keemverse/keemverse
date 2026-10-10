# Checkout verify: close two gaps (apply in the Apps Script project)

Found by reading the live script on 10 Oct 2026. Neither needs a website change.

## The gaps

1. **One payment can unlock every item priced the same.** `handleVerify` checks
   that the amount paid equals the price of the *requested* `item_id`, but never
   checks that the payment was *for* that item. The payment reference is built
   as `keemverse-<itemId>-<time>-<random>`, so anyone who replays the same
   `tx_ref` with a different `item_id` (all three single presets cost the same)
   gets a file for each.
2. **Currency is not compared.** `currency` is read but only the amount is
   compared, so a payment of the same number in a different currency would pass.
   Presets are priced in NGN.

A third, minor: calling verify again with the same reference mints a fresh
token (and a fresh download allowance) every time.

## The patch

In `handleVerify`, right after this existing block:

```js
  if (!row[cFile]) {
    return jsonResponse({ ok: false, error: "No file configured for this preset yet." });
  }
```

and before `// 3. Mint a token and log it to the Downloads index.`, add:

```js
  // 2b. The payment must be FOR this item (the reference is built as
  //     keemverse-<itemId>-<time>-<rand>) and in the item's currency.
  //     Without this, one payment could unlock every item priced the same.
  if (String(txRef).indexOf("keemverse-" + itemId + "-") !== 0) {
    return jsonResponse({ ok: false, error: "This payment is not for this item." });
  }
  const expectedCurrency = /\$/.test(String(row[cPrice])) ? "USD" : "NGN";
  if (currency !== expectedCurrency) {
    return jsonResponse({ ok: false, error: "Currency mismatch." });
  }

  // 2c. Calling verify again for the same payment and item (a refresh, or a
  //     replay) returns the link already issued instead of minting a new one.
  const dlSheet = ss.getSheetByName("Downloads");
  const dlRows  = dlSheet.getDataRange().getValues();
  const dh      = dlRows[0];
  const dTok = dh.indexOf("Token"), dRef = dh.indexOf("Order Ref"),
        dItem = dh.indexOf("Item"), dRev = dh.indexOf("Revoked");
  for (let k = 1; k < dlRows.length; k++) {
    if (String(dlRows[k][dRef]) === String(txRef) && String(dlRows[k][dItem]) === String(itemId)) {
      if (String(dlRows[k][dRev]).toUpperCase() === "TRUE") {
        return jsonResponse({ ok: false, error: "This link has been disabled. Contact support." });
      }
      return jsonResponse({ ok: true, downloadUrl: webAppUrl + "?action=download&token=" + dlRows[k][dTok] });
    }
  }
```

Deploy a new version afterwards. Test by buying one preset and refreshing /
re-calling verify (same link comes back, no second Orders row).

## Why it is safe for real buyers

The success page calls `verifyAndUnlock(state.txRef, state.item.id)` and the
reference is built from the same `item.id`, so every genuine purchase already
satisfies the new check.
