import { priceFor } from './currency';
import type { Region } from './geo';

// The Preset Pack is every look in one purchase (and every future look free),
// so it is the better deal whenever the single looks add up to more than it
// costs. The saving is worked out from the live prices, never typed in, so it
// stays true when a price is changed in the admin.

export const isPack = (preset: any): boolean => /preset pack/i.test(String(preset?.name ?? ''));

/** "Amber Hour: Lightroom Preset" -> "Amber Hour". */
export const plainName = (name: unknown): string => String(name ?? '').replace(': Lightroom Preset', '');

/** Short, shareable name for a look: "amber-hour". The pack is simply "pack". */
export function lookSlug(preset: any): string {
  if (isPack(preset)) return 'pack';
  return plainName(preset?.name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export type PackDeal = {
  pack: any;
  /** "₦2,100" or "$2": what the pack saves over buying every single look. */
  saveLabel: string;
  /** "₦9,900" or "$7": what the pack costs this visitor. */
  packLabel: string;
};

export function packDeal(presets: any[], region: Region | null): PackDeal | null {
  if (!region) return null;
  const pack = presets.find(isPack);
  const singles = presets.filter((p) => !isPack(p));
  if (!pack || singles.length < 2) return null;

  const packPrice = priceFor(pack.price, region);
  if (!packPrice) return null;

  let total = 0;
  for (const single of singles) {
    const price = priceFor(single.price, region);
    // A single listed in another currency than the pack cannot be compared.
    if (!price || price.currency !== packPrice.currency) return null;
    total += price.amount;
  }

  const save = total - packPrice.amount;
  if (save <= 0) return null;

  const money = (n: number) => (packPrice.currency === 'USD' ? `$${n.toLocaleString()}` : `₦${n.toLocaleString()}`);
  return { pack, saveLabel: money(save), packLabel: money(packPrice.amount) };
}
