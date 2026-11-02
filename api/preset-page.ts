import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readProducts } from "./_github.js";

// Link previews for each Lightroom preset page.
//
// WhatsApp, TikTok, Instagram, iMessage, X and Slack read a link's title,
// description and picture from the raw HTML and do not run scripts, so every
// look used to show the generic KEEMVERSE card. vercel.json sends only those
// crawlers (matched on their User-Agent) here; real visitors keep getting the
// plain static page, exactly as before.
//
//   GET /api/preset-page?slug=old-garden
//
// The function takes the site's own index.html and swaps the title, description
// and picture tags for that look's. Anything unexpected (unknown look, catalog
// unreachable) serves the page unchanged, so a preview can fall back to the
// generic card but a link never breaks.

const SITE = "https://www.keemverse.com";
const FALLBACK_HOST = "www.keemverse.com";

const isPack = (name: unknown) => /preset pack/i.test(String(name ?? ""));
const plainName = (name: unknown) => String(name ?? "").replace(": Lightroom Preset", "");
const slugOf = (p: any) =>
  isPack(p?.name)
    ? "pack"
    : plainName(p?.name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Preview text: the listing's first sentences, without the refund line (no
// guarantee wording in ad copy) and short enough not to be cut off.
export function previewText(description: unknown): string {
  const sentences = String(description ?? "")
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s && !/money-back|guarantee|refund/i.test(s));
  let out = "";
  for (const s of sentences) {
    if ((out + " " + s).trim().length > 190) break;
    out = (out + " " + s).trim();
  }
  return out || "A Lightroom preset with three depth tiers: Essential, Graded and Cinematic.";
}

export function withLookTags(html: string, look: { slug: string; title: string; description: string }): string {
  const title = escapeHtml(look.title);
  const description = escapeHtml(look.description);
  const url = `${SITE}/fashion/presets/${look.slug}`;
  const image = `${SITE}/presets/og/${look.slug}.jpg`;

  const set = (source: string, pattern: RegExp, tag: string) => (pattern.test(source) ? source.replace(pattern, tag) : source);

  let out = html;
  out = set(out, /<title>[^<]*<\/title>/, `<title>${title}</title>`);
  out = set(out, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${description}" />`);
  out = set(out, /<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${title}" />`);
  out = set(out, /<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${description}" />`);
  out = set(out, /<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}" />`);
  out = set(out, /<meta property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${image}" />`);
  out = set(out, /<meta property="og:image:width" content="[^"]*"\s*\/?>/, `<meta property="og:image:width" content="1200" />`);
  out = set(out, /<meta property="og:image:height" content="[^"]*"\s*\/?>/, `<meta property="og:image:height" content="675" />`);
  out = set(out, /<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${title}" />`);
  out = set(out, /<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${description}" />`);
  out = set(out, /<meta name="twitter:image" content="[^"]*"\s*\/?>/, `<meta name="twitter:image" content="${image}" />`);
  return out;
}

// Only ever fetch the page from this site's own hosts.
function originFor(req: VercelRequest): string {
  const raw = req.headers["x-forwarded-host"] ?? req.headers.host;
  const host = String(Array.isArray(raw) ? raw[0] : raw ?? "").toLowerCase();
  return /^([a-z0-9-]+\.)*(keemverse\.com|vercel\.app)$/.test(host) ? `https://${host}` : `https://${FALLBACK_HOST}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = typeof req.query.slug === "string" ? req.query.slug.toLowerCase() : "";

  let page: string;
  try {
    const r = await fetch(`${originFor(req)}/index.html`, { headers: { Accept: "text/html" } });
    if (!r.ok) throw new Error(String(r.status));
    page = await r.text();
  } catch {
    res.setHeader("Cache-Control", "no-store");
    return res.status(502).send("Page unavailable");
  }

  let html = page;
  if (/^[a-z0-9-]{1,60}$/.test(slug)) {
    try {
      const { products } = await readProducts();
      const hit = products.find((p) => p.type === "preset" && p.status === "Live" && slugOf(p) === slug);
      if (hit) {
        const name = isPack(hit.name) ? "Keemverse Preset Pack" : `${plainName(hit.name)} Lightroom Preset`;
        html = withLookTags(page, {
          slug,
          title: `${name} | KEEMVERSE`,
          description: previewText(hit.description),
        });
      }
    } catch {
      /* catalog unreachable: serve the page with its generic tags */
    }
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=3600");
  return res.status(200).send(html);
}
