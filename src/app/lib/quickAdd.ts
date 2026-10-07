// Parses the "Quick add" paste block on /admin/products into Fashion Find
// field values. One item = a few `key: value` lines; several items are
// separated by a line containing only `---`. Unknown keys are ignored and
// a block with no name is dropped, so a stray paste can't create junk rows.

export type QuickAddItem = {
  name: string;
  price?: string;
  category?: string;
  rating?: string;
  tags?: string;
  description?: string;
  why_picked?: string;
  image_url?: string;
  direct_product_link?: string;
  source?: string;
  affiliate_link?: string;
  status?: string;
};

const ALIASES: Record<string, keyof QuickAddItem> = {
  name: "name",
  price: "price",
  category: "category",
  rating: "rating",
  tags: "tags",
  description: "description",
  desc: "description",
  why: "why_picked",
  why_picked: "why_picked",
  image: "image_url",
  image_url: "image_url",
  link: "direct_product_link",
  direct: "direct_product_link",
  direct_product_link: "direct_product_link",
  source: "source",
  affiliate: "affiliate_link",
  affiliate_link: "affiliate_link",
  status: "status",
};

export function parseQuickAdd(text: string): QuickAddItem[] {
  return text
    .split(/^\s*-{3,}\s*$/m)
    .map((block) => {
      const item: Record<string, string> = {};
      for (const line of block.split("\n")) {
        const m = line.match(/^\s*([a-z_ ]+?)\s*:\s*(.*)$/i);
        if (!m) continue;
        const key = ALIASES[m[1].trim().toLowerCase().replace(/\s+/g, "_")];
        if (key) item[key] = m[2].trim();
      }
      return item;
    })
    .filter((item) => item.name) as QuickAddItem[];
}
