import { getCatalogProducts } from './products';

// A Digital Craft design (art or apparel). Orders are fulfilled by a print
// partner, so a design only needs what a buyer sees plus where to buy it.
export type Design = {
  id: string;
  name: string;
  description?: string;
  /** Display price, e.g. "$39". USD first. */
  price?: string;
  image_url: string;
  thumbnail?: string;
  category?: 'art' | 'apparel';
  /** Primary place to buy (marketplace listing now, own checkout later). */
  purchase_link?: string | null;
  display_order?: number | null;
};

export async function getDesigns(): Promise<Design[]> {
  try {
    const data: Design[] = await getCatalogProducts('design');
    return [...data].sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Layout preview only: shown in `pnpm dev` with ?preview=designs so the grid
// can be judged before any real design exists. Never part of a production
// build (import.meta.env.DEV is false there, so this is tree-shaken out).
export const DEV_SAMPLE_DESIGNS: Design[] = import.meta.env.DEV
  ? [
      { id: 's1', name: 'Sample design one', price: '$29', image_url: '/digital-craft/wears.webp', category: 'apparel' },
      { id: 's2', name: 'Sample design two', price: '$34', image_url: '/digital-craft/design-packs.webp', category: 'art' },
      { id: 's3', name: 'Sample design three', price: '$29', image_url: '/digital-craft/design-packs.webp', category: 'apparel' },
      { id: 's4', name: 'Sample design four', price: '$24', image_url: '/digital-craft/wears.webp', category: 'art' },
    ]
  : [];
