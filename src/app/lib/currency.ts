import type { Region } from './geo';

// Products are listed in naira (or in dollars when the value starts with "$"
// or the sheet says USD). Visitors in Nigeria see and pay naira; everyone else
// sees and pays US dollars at a straight conversion of the naira price.

// Straight-conversion rate. The Apps Script that verifies payments uses the
// same number (USD_PER_NGN_RATE in docs/apps-script-verify.gs); keep the two
// equal, or a dollar payment will not match the price the script expects.
export const NGN_PER_USD = 1350;

/** Whole US dollars for a naira price, never below $1. */
export function ngnToUsd(ngn: number): number {
  return Math.max(1, Math.round(ngn / NGN_PER_USD));
}

export type ParsedPrice = { amount: number; listedIn: 'NGN' | 'USD' } | null;

export function parsePrice(raw: unknown, currency?: unknown): ParsedPrice {
  const text = String(raw ?? '').trim();
  const amount = typeof raw === 'number' ? raw : parseFloat(text.replace(/[^0-9.]/g, ''));
  if (isNaN(amount)) return null;
  const isUsd = text.startsWith('$') || String(currency ?? '').toUpperCase() === 'USD';
  return { amount, listedIn: isUsd ? 'USD' : 'NGN' };
}

/** What a visitor in this region pays: the amount and currency to charge. */
export function priceFor(raw: unknown, region: Region, currency?: unknown) {
  const p = parsePrice(raw, currency);
  if (!p) return null;
  if (p.listedIn === 'USD') return { amount: p.amount, currency: 'USD' as const };
  if (region === 'NG') return { amount: p.amount, currency: 'NGN' as const };
  return { amount: ngnToUsd(p.amount), currency: 'USD' as const };
}

/**
 * "₦9,900" for Nigeria, "$7" elsewhere. Returns "" while the region is still
 * being looked up, so a visitor in Nigeria never sees dollars flash first.
 * Values that are not numbers (e.g. "Free") are returned as written.
 */
export function formatPrice(raw: unknown, region: Region | null, currency?: unknown): string {
  const p = parsePrice(raw, currency);
  if (!p) return String(raw ?? '').trim();
  if (p.listedIn === 'USD') return `$${p.amount.toLocaleString()}`;
  if (!region) return '';
  return region === 'NG' ? `₦${p.amount.toLocaleString()}` : `$${ngnToUsd(p.amount).toLocaleString()}`;
}
