import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "crypto";
import { readProducts, writeProducts, getRole, editorName } from "./_github.js";

// Fields that only the admin UI needs. They stay in data/products.json but are
// never sent to the public site: a Drive file id is the thing that delivers a
// paid download, so it must not be readable by every visitor.
const toPublic = ({ drive_file_id: _drive, ...rest }: Record<string, any>) => rest;

// What the "editor" login (a helper, e.g. Ini) is allowed to change. Everything
// else (links, images, names, descriptions, files, order, creating, deleting)
// is admin-only. Enforced here on the server, so it holds even if someone
// bypasses the admin page and calls the API directly.
const EDITOR_FIELDS = ["status", "price"] as const;
const STATUSES = ["Live", "Hidden", "Sold Out"];

// One endpoint, backed by data/products.json in this repo (read/written
// via the GitHub Contents API — see api/_github.ts):
//   GET    /api/products?type=fashion_find              — public, Live rows only
//   GET    /api/products?type=fashion_find&all=1        — admin or editor, every status
//   GET    /api/products?whoami=1                        — admin or editor, returns the role
//   POST   /api/products                                 — admin, create
//   PATCH  /api/products?id=<id>                         — admin: any field;
//          editor: only status and price
//   PATCH  /api/products?reorder=1  body: {ids: [...]}   — admin or editor, set
//          display_order for a whole type's list in ONE commit (drag-
//          reorder in the admin UI), rather than one PATCH per row
//   DELETE /api/products?id=<id>                         — admin, delete
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const role = getRole(req);

  if (req.method === "GET" && req.query.whoami === "1") {
    if (!role) return res.status(401).json({ error: "Unauthorized" });
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ role, name: role === "editor" ? editorName() : "admin" });
  }

  if (req.method === "GET") {
    const { type, all } = req.query;
    const wantsAll = all === "1";

    if (wantsAll && !role) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { products } = await readProducts();
      let result = products;
      if (typeof type === "string") result = result.filter((p) => p.type === type);
      if (!wantsAll) result = result.filter((p) => p.status === "Live");
      if (!wantsAll || role !== "admin") result = result.map(toPublic);
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

  if (!role) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Editors may PATCH only: change an existing product's status/price (field
  // whitelist in the branch below) or reorder (which writes display_order and
  // nothing else). Creating and deleting are admin-only.
  if (role === "editor" && req.method !== "PATCH") {
    return res.status(403).json({ error: "Editors can change status, price and order, nothing else." });
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
    if (!Array.isArray(ids) || ids.length > 500 || ids.some((i) => typeof i !== "string")) {
      return res.status(400).json({ error: "Body must be { ids: string[] } in the new order" });
    }

    try {
      const { products, sha } = await readProducts();
      const order = new Map(ids.map((id, index) => [id, index + 1]));
      const now = new Date().toISOString();
      const updated = products.map((p) =>
        order.has(p.id) ? { ...p, display_order: order.get(p.id), updated_at: now } : p
      );
      const by = role === "editor" ? ` (by ${editorName()})` : "";
      await writeProducts(updated, sha, `Reorder ${ids.length} products${by}`);
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

      const body = req.body && typeof req.body === "object" ? req.body : {};

      if (role === "editor") {
        const keys = Object.keys(body);
        const blocked = keys.filter((k) => !(EDITOR_FIELDS as readonly string[]).includes(k));
        if (blocked.length > 0) {
          return res.status(403).json({
            error: "Editors can only change status and price.",
            notAllowed: blocked,
          });
        }
        if (keys.length === 0) return res.status(400).json({ error: "Nothing to update." });
        if ("status" in body && !STATUSES.includes(body.status)) {
          return res.status(400).json({ error: `status must be one of: ${STATUSES.join(", ")}` });
        }
        if ("price" in body) {
          const price = body.price;
          if (typeof price !== "string" || price.length > 24 || !/\d/.test(price)) {
            return res.status(400).json({ error: "price must be text containing a number, e.g. ₦4,000" });
          }
        }
      }

      const updatedProduct = {
        ...products[index],
        ...body,
        id,
        created_at: products[index].created_at,
        updated_at: new Date().toISOString(),
      };
      const updated = [...products];
      updated[index] = updatedProduct;
      const by = role === "editor" ? ` (by ${editorName()})` : "";
      await writeProducts(updated, sha, `Update product: ${updatedProduct.name}${by}`);
      return res.status(200).json(role === "admin" ? updatedProduct : toPublic(updatedProduct));
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
