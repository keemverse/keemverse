// Prices are stored in the currency they were entered in (₦ by default, or $
// when the value starts with "$" / the sheet says USD). Visitors from anywhere
// should be able to read them, so a naira price is shown with an approximate
// dollar figure beside it. The dollar figure is a guide only: checkout still
// charges the amount in the currency it was priced in (see CheckoutPage).

// Approximate rate used for the "≈ $" hint. Update it when the naira moves a
// lot; it does not change what anyone is charged.
export const NGN_PER_USD = 1350;

export function approxUsd(ngn: number): string {
  const usd = ngn / NGN_PER_USD;
  if (usd >= 1) return `$${Math.round(usd).toLocaleString()}`;
  return `$${usd.toFixed(2)}`;
}

/** "₦4,000 (≈ $3)" for a naira price, "$12" for a dollar price. */
export function formatPrice(raw: unknown, currency?: unknown): string {
  const text = String(raw ?? '').trim();
  const amount = typeof raw === 'number' ? raw : parseFloat(text.replace(/[^0-9.]/g, ''));
  if (isNaN(amount)) return text;

  const isUsd = text.startsWith('$') || String(currency ?? '').toUpperCase() === 'USD';
  if (isUsd) return `$${amount.toLocaleString()}`;

  return `₦${amount.toLocaleString()} (≈ ${approxUsd(amount)})`;
}
