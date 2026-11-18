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

// Three separate picture sets, each its own file, so editing one can never change another:
//   gallery  the Gallery page
//   home     the story pictures on the main page (and the For brands page)
//   packs    the rate cards: one fixed picture per package on the For brands page
const SETS: Record<string, { file: string; assets: string; fixed: boolean }> = {
  gallery: { file: "data/gallery.json", assets: "data/gallery-assets", fixed: false },
  home: { file: "data/home-pictures.json", assets: "data/home-assets", fixed: false },
  packs: { file: "data/pack-pictures.json", assets: "data/pack-assets", fixed: true },
};

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
  featured: boolean; // no longer used: the home pictures are their own set now
  visible: boolean; // shows on the public gallery
  order: number;
  updatedAt: string;
};

// Pictures: every photo on the site, in three lists that the admin pages control. Stored as data/gallery.json plus the image files in this repo (the same
// GitHub-as-database pattern as api/pieces.ts), so a change shows without a code
// change. The admin login and any editor login (Ini) may manage it.
//   All calls take ?set=gallery (default) | home | packs
//   GET    /api/gallery                 public: visible items in order. With a login: every item.
//   POST   /api/gallery                 create (uploads the full image and its thumbnail)
//   PATCH  /api/gallery  {id, ...}      change title, note, kind, credit, link, crop focus, visible
//   PATCH  /api/gallery  {order:[ids]}  set the order
//   PUT    /api/gallery  {id, image...} replace the picture of an item (keeps its title and place)
//   DELETE /api/gallery?id=<id>         remove the item and its image files
//   The packs set has a fixed list of slots: no create or delete, only replace and edit.

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

const save = (file: string) => (items: Item[], sha: string | null, message: string) => writeJsonFile(file, items, sha, message);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const who = getIdentity(req);
  const setName = typeof req.query.set === "string" ? req.query.set : "gallery";
  const set = SETS[setName];
  if (!set) return res.status(400).json({ error: "Unknown picture set" });
  const GALLERY_PATH = set.file;
  const saveItems = save(set.file);

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
    if (set.fixed) return res.status(400).json({ error: "These slots are fixed. Replace the picture instead." });
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
      const imagePath = `${set.assets}/${id}.webp`;
      const thumbPath = `${set.assets}/${id}-thumb.webp`;
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
      await saveItems([...items, item], sha, `Save gallery photo: ${title}${by}`);
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
        await saveItems(next, sha, `Reorder gallery${by}`);
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
      await saveItems(items.map((i) => (i.id === id ? updated : i)), sha, `Edit gallery photo: ${updated.title}${by}`);
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "PUT") {
    try {
      const b = req.body || {};
      const full = dataUrl.exec(String(b.imageDataUrl || ""));
      const thumb = dataUrl.exec(String(b.thumbDataUrl || ""));
      const width = Number(b.width);
      const height = Number(b.height);
      if (!full || !thumb || !(width > 0) || !(height > 0)) {
        return res.status(400).json({ error: "Needs a WebP image, its thumbnail, width and height." });
      }
      const { data: items } = await readJsonFile<Item[]>(GALLERY_PATH, []);
      const target = items.find((i) => i.id === String(b.id || ""));
      if (!target) return res.status(404).json({ error: "Photo not found" });
      // A new file name every time, so browsers and the CDN never show the old picture.
      const stamp = randomUUID().slice(0, 8);
      const imagePath = `${set.assets}/${target.id}-${stamp}.webp`;
      const thumbPath = `${set.assets}/${target.id}-${stamp}-thumb.webp`;
      const imageUrl = await uploadBinaryFile(imagePath, full[1], `Replace picture: ${target.title}${by}`);
      const thumbUrl = await uploadBinaryFile(thumbPath, thumb[1], `Replace thumbnail: ${target.title}${by}`);
      // Re-read right before saving so two edits at once do not overwrite each other.
      const fresh = await readJsonFile<Item[]>(GALLERY_PATH, []);
      const current = fresh.data.find((i) => i.id === target.id) || target;
      const updated: Item = { ...current, imageUrl, thumbUrl, imagePath, thumbPath, width, height, updatedAt: new Date().toISOString() };
      await saveItems(fresh.data.map((i) => (i.id === target.id ? updated : i)), fresh.sha, `Replace picture: ${target.title}${by}`);
      for (const old of [current.imagePath, current.thumbPath]) {
        if (!old) continue;
        const oldSha = await getFileSha(old);
        if (oldSha) await deleteFile(old, oldSha, `Remove old picture: ${target.title}${by}`);
      }
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "DELETE") {
    if (set.fixed) return res.status(400).json({ error: "These slots are fixed. Replace the picture instead." });
    const { id } = req.query;
    if (typeof id !== "string") return res.status(400).json({ error: "Missing ?id=" });
    try {
      const { data: items, sha } = await readJsonFile<Item[]>(GALLERY_PATH, []);
      const target = items.find((i) => i.id === id);
      if (!target) return res.status(204).end();
      await saveItems(items.filter((i) => i.id !== id), sha, `Delete gallery photo: ${target.title}${by}`);
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

  res.setHeader("Allow", "GET, POST, PATCH, PUT, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
