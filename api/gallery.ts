import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "crypto";
import {
  readJsonFile,
  writeJsonFile,
  uploadBinaryFile,
  deleteFile,
  getFileSha,
  getIdentity,
} from "./_github.js";

const GALLERY_PATH = "data/gallery.json";

type Item = {
  id: string;
  title: string;
  note: string;
  kind: string;
  imageUrl: string;
  thumbUrl: string;
  imagePath: string;
  thumbPath: string;
  width: number;
  height: number;
  position: string; // CSS object-position: where a crop keeps the picture centred
  credit: string;
  href: string;
  featured: boolean; // shows on the home page and the For brands page (the first 4, in order)
  visible: boolean; // shows on the public gallery
  order: number;
  updatedAt: string;
};

// The gallery: every photo on the site, in one list that the admin Gallery page
// controls. Stored as data/gallery.json plus the image files in this repo (the same
// GitHub-as-database pattern as api/pieces.ts), so a change shows without a code
// change. The admin login and any editor login (Ini) may manage it.
//   GET    /api/gallery                 public: visible items in order. With a login: every item.
//   POST   /api/gallery                 create (uploads the full image and its thumbnail)
//   PATCH  /api/gallery  {id, ...}      change title, note, kind, credit, link, crop focus, featured, visible
//   PATCH  /api/gallery  {order:[ids]}  set the order
//   DELETE /api/gallery?id=<id>         remove the item and its image files

const POSITIONS = new Set(["0% 0%", "50% 0%", "100% 0%", "0% 50%", "50% 50%", "100% 50%", "0% 100%", "50% 100%", "100% 100%"]);
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const goodLink = (v: string) => v === "" || v.startsWith("/") || v.startsWith("https://");
const dataUrl = /^data:image\/webp;base64,([A-Za-z0-9+/=]+)$/;

// Position strings like "50% 62%" (from older photos) are fine too.
function cleanPosition(v: unknown, fallback: string) {
  const s = clean(v, 20);
  if (POSITIONS.has(s)) return s;
  return /^\d{1,3}% \d{1,3}%$/.test(s) ? s : fallback;
}

async function save(items: Item[], sha: string | null, message: string) {
  try {
    await writeJsonFile(GALLERY_PATH, items, sha, message);
  } catch (err: any) {
    // Two people saving at once: re-read and let the caller decide. One retry is enough for this tool.
    throw err;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const who = getIdentity(req);

  if (req.method === "GET") {
    try {
      const { data } = await readJsonFile<Item[]>(GALLERY_PATH, []);
      const sorted = [...data].sort((a, b) => a.order - b.order);
      if (!who) {
        res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=300");
        return res.status(200).json(sorted.filter((i) => i.visible !== false));
      }
      return res.status(200).json(sorted);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (!who) return res.status(401).json({ error: "Unauthorized" });
  const by = who.role === "editor" ? ` (by ${who.name})` : "";

  if (req.method === "POST") {
    try {
      const b = req.body || {};
      const full = dataUrl.exec(String(b.imageDataUrl || ""));
      const thumb = dataUrl.exec(String(b.thumbDataUrl || ""));
      const width = Number(b.width);
      const height = Number(b.height);
      if (!full || !thumb || !(width > 0) || !(height > 0)) {
        return res.status(400).json({ error: "Needs a WebP image, its thumbnail, width and height." });
      }
      const title = clean(b.title, 80);
      if (!title) return res.status(400).json({ error: "Give the photo a title." });
      const href = clean(b.href, 300);
      if (!goodLink(href)) return res.status(400).json({ error: "A link must start with / or https://" });

      const id = randomUUID();
      const imagePath = `data/gallery-assets/${id}.webp`;
      const thumbPath = `data/gallery-assets/${id}-thumb.webp`;
      const imageUrl = await uploadBinaryFile(imagePath, full[1], `Add gallery photo: ${title}${by}`);
      const thumbUrl = await uploadBinaryFile(thumbPath, thumb[1], `Add gallery thumbnail: ${title}${by}`);

      const { data: items, sha } = await readJsonFile<Item[]>(GALLERY_PATH, []);
      const item: Item = {
        id,
        title,
        note: clean(b.note, 240),
        kind: clean(b.kind, 30) || "Editorial",
        imageUrl,
        thumbUrl,
        imagePath,
        thumbPath,
        width,
        height,
        position: cleanPosition(b.position, "50% 50%"),
        credit: clean(b.credit, 120),
        href,
        featured: !!b.featured,
        visible: b.visible !== false,
        order: items.reduce((m, i) => Math.max(m, i.order), 0) + 1,
        updatedAt: new Date().toISOString(),
      };
      await save([...items, item], sha, `Save gallery photo: ${title}${by}`);
      return res.status(201).json(item);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "PATCH") {
    try {
      const b = req.body || {};
      const { data: items, sha } = await readJsonFile<Item[]>(GALLERY_PATH, []);

      if (Array.isArray(b.order)) {
        const ids: string[] = b.order.map(String);
        const rank = new Map(ids.map((id, i) => [id, i + 1]));
        const next = items.map((i) => (rank.has(i.id) ? { ...i, order: rank.get(i.id)! } : i));
        await save(next, sha, `Reorder gallery${by}`);
        return res.status(200).json({ ok: true });
      }

      const id = String(b.id || "");
      const target = items.find((i) => i.id === id);
      if (!target) return res.status(404).json({ error: "Photo not found" });

      const patch: Partial<Item> = {};
      if (typeof b.title === "string") {
        const t = clean(b.title, 80);
        if (!t) return res.status(400).json({ error: "A photo needs a title." });
        patch.title = t;
      }
      if (typeof b.note === "string") patch.note = clean(b.note, 240);
      if (typeof b.kind === "string") patch.kind = clean(b.kind, 30) || target.kind;
      if (typeof b.credit === "string") patch.credit = clean(b.credit, 120);
      if (typeof b.href === "string") {
        const h = clean(b.href, 300);
        if (!goodLink(h)) return res.status(400).json({ error: "A link must start with / or https://" });
        patch.href = h;
      }
      if (typeof b.position === "string") patch.position = cleanPosition(b.position, target.position);
      if (typeof b.featured === "boolean") patch.featured = b.featured;
      if (typeof b.visible === "boolean") patch.visible = b.visible;

      const updated = { ...target, ...patch, updatedAt: new Date().toISOString() };
      await save(items.map((i) => (i.id === id ? updated : i)), sha, `Edit gallery photo: ${updated.title}${by}`);
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    if (typeof id !== "string") return res.status(400).json({ error: "Missing ?id=" });
    try {
      const { data: items, sha } = await readJsonFile<Item[]>(GALLERY_PATH, []);
      const target = items.find((i) => i.id === id);
      if (!target) return res.status(204).end();
      await save(items.filter((i) => i.id !== id), sha, `Delete gallery photo: ${target.title}${by}`);
      for (const path of [target.imagePath, target.thumbPath]) {
        if (!path) continue;
        const fileSha = await getFileSha(path);
        if (fileSha) await deleteFile(path, fileSha, `Delete gallery file: ${target.title}${by}`);
      }
      return res.status(204).end();
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader("Allow", "GET, POST, PATCH, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
