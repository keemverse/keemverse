import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "crypto";
import { readProducts, writeProducts, isAuthorizedAdmin } from "./_github.js";

// Fields that only the admin UI needs. They stay in data/products.json but are
// never sent to the public site: a Drive file id is the thing that delivers a
// paid download, so it must not be readable by every visitor.
const toPublic = ({ drive_file_id: _drive, ...rest }: Record<string, any>) => rest;

// One endpoint, backed by data/products.json in this repo (read/written
// via the GitHub Contents API — see api/_github.ts):
//   GET    /api/products?type=fashion_find              — public, Live rows only
//   GET    /api/products?type=fashion_find&all=1        — admin, every status
//   POST   /api/products                                 — admin, create
//   PATCH  /api/products?id=<id>                         — admin, update one
//   PATCH  /api/products?reorder=1  body: {ids: [...]}   — admin, set
//          display_order for a whole type's list in ONE commit (drag-
//          reorder in the admin UI), rather than one PATCH per row
//   DELETE /api/products?id=<id>                         — admin, delete
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const { type, all } = req.query;
    const wantsAll = all === "1";

    if (wantsAll && !isAuthorizedAdmin(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { products } = await readProducts();
      let result = products;
      if (typeof type === "string") result = result.filter((p) => p.type === type);
      if (!wantsAll) result = result.filter((p) => p.status === "Live").map(toPublic);
      result.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));

      // Public reads are cached at the edge for a minute (and served stale
      // while refreshing) so a traffic spike doesn't hit the GitHub API once
      // per visitor. Admin reads must always be fresh.
      res.setHeader(
        "Cache-Control",
        wantsAll ? "no-store" : "public, max-age=0, s-maxage=60, stale-while-revalidate=300"
      );
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (!isAuthorizedAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "POST") {
    try {
      const { products, sha } = await readProducts();
      const now = new Date().toISOString();
      // id and timestamps are set here, after the body, so a request can't override them
      const newProduct = { ...req.body, id: randomUUID(), created_at: now, updated_at: now };
      const updated = [...products, newProduct];
      await writeProducts(updated, sha, `Add product: ${newProduct.name}`);
      return res.status(201).json(newProduct);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "PATCH" && req.query.reorder === "1") {
    const ids = req.body?.ids;
    if (!Array.isArray(ids) || ids.some((i) => typeof i !== "string")) {
      return res.status(400).json({ error: "Body must be { ids: string[] } in the new order" });
    }

    try {
      const { products, sha } = await readProducts();
      const order = new Map(ids.map((id, index) => [id, index + 1]));
      const now = new Date().toISOString();
      const updated = products.map((p) =>
        order.has(p.id) ? { ...p, display_order: order.get(p.id), updated_at: now } : p
      );
      await writeProducts(updated, sha, `Reorder ${ids.length} products`);
      return res.status(200).json({ success: true, count: ids.length });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "PATCH") {
    const { id } = req.query;
    if (typeof id !== "string") return res.status(400).json({ error: "Missing ?id=" });

    try {
      const { products, sha } = await readProducts();
      const index = products.findIndex((p) => p.id === id);
      if (index === -1) return res.status(404).json({ error: "Not found" });

      const updatedProduct = {
        ...products[index],
        ...req.body,
        id,
        created_at: products[index].created_at,
        updated_at: new Date().toISOString(),
      };
      const updated = [...products];
      updated[index] = updatedProduct;
      await writeProducts(updated, sha, `Update product: ${updatedProduct.name}`);
      return res.status(200).json(updatedProduct);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    if (typeof id !== "string") return res.status(400).json({ error: "Missing ?id=" });

    try {
      const { products, sha } = await readProducts();
      const target = products.find((p) => p.id === id);
      if (!target) return res.status(404).json({ error: "Not found" });
      const updated = products.filter((p) => p.id !== id);
      await writeProducts(updated, sha, `Delete product: ${target.name || id}`);
      return res.status(204).end();
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader("Allow", "GET, POST, PATCH, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
