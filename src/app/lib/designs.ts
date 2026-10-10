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
  /** Optional label on the card, e.g. "New drop". */
  tag?: string;
  /** Catalog code shown on the card, e.g. "KV-001". */
  code?: string;
  /** Collection name; filter chips appear when there are two or more. */
  collection?: string;
  /** Palette dots on the card, as hex colours. */
  swatches?: string[];
  /** One line shown when the card is hovered. */
  blurb?: string;
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
// can be judged before any real design exists. The sample art lives in the
// git-ignored `.dev-samples/` folder (sample images from the Arena prototype,
// not KEEMVERSE work) and `import.meta.env.DEV` is false in production
// builds, so none of this can reach the live site.
const sampleArt: Record<string, string> = import.meta.env.DEV
  ? (import.meta.glob('../../../.dev-samples/arena/*.jpg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>)
  : {};
const art = (name: string) => Object.entries(sampleArt).find(([path]) => path.includes(name))?.[1] ?? '/digital-craft/wears.webp';

export const DEV_SAMPLE_DESIGNS: Design[] = import.meta.env.DEV
  ? [
      { id: 's1', name: 'Sample art 01', price: '$29', image_url: art('sunset'), category: 'apparel', tag: 'New drop', code: 'KV-001', collection: 'Apparel', swatches: ['#FF4B1F', '#2440D8', '#FFC857', '#15171A'], blurb: 'A sample line for judging the layout.', purchase_link: 'https://example.com' },
      { id: 's2', name: 'Sample art 02', price: '$34', image_url: art('tiger'), category: 'apparel', tag: 'Top pick', code: 'KV-002', collection: 'Apparel', swatches: ['#FF4B1F', '#15171A', '#F4F2EC', '#2440D8'], blurb: 'Another sample line.' },
      { id: 's3', name: 'Sample art 03', price: '$24', image_url: art('topo'), category: 'art', code: 'KV-003', collection: 'Art', swatches: ['#2440D8', '#CDF25C', '#FF4B1F', '#15171A'] },
      { id: 's4', name: 'Sample art 04', price: '$29', image_url: art('botanic'), category: 'art', tag: 'Trending', code: 'KV-004', collection: 'Art', swatches: ['#CDF25C', '#FF4B1F', '#2440D8', '#15171A'] },
      { id: 's5', name: 'Sample art 05', price: '$32', image_url: art('rocket'), category: 'apparel', code: 'KV-005', collection: 'Apparel', swatches: ['#FF4B1F', '#15171A', '#F4F2EC'] },
      { id: 's6', name: 'Sample art 06', price: '$27', image_url: art('bauhaus'), category: 'art', tag: 'Studio pick', code: 'KV-006', collection: 'Art', swatches: ['#FFC857', '#2440D8', '#FF4B1F', '#15171A'] },
    ]
  : [];

// A downloadable pack of original art for creators. Delivered through the
// same payment and download pipeline the Lightroom presets use, so it needs
// no print partner and no shipping.
export type DesignPack = {
  id: string;
  name: string;
  description?: string;
  /** Display price, e.g. "$12". */
  price?: string;
  image_url: string;
  thumbnail?: string;
  /** What is inside, e.g. ["12 illustrations", "Bonus sticker sheet"]. */
  includes?: string[];
  /** File types, e.g. ["PNG", "SVG"]. */
  formats?: string[];
  purchase_link?: string | null;
  display_order?: number | null;
};

export async function getDesignPacks(): Promise<DesignPack[]> {
  try {
    const data: DesignPack[] = await getCatalogProducts('design_pack');
    return [...data].sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Layout preview only (dev server, ?preview=designs). Never in a production build.
export const DEV_SAMPLE_PACKS: DesignPack[] = import.meta.env.DEV
  ? [
      { id: 'p1', name: 'Sample pack one', price: '$12', image_url: art('botanic'), includes: ['12 illustrations'], formats: ['PNG', 'SVG'] },
      { id: 'p2', name: 'Sample pack two', price: '$18', image_url: art('bauhaus'), includes: ['20 illustrations', 'Sticker sheet'], formats: ['PNG'] },
    ]
  : [];
