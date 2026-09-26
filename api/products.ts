import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "crypto";
import { readProducts, writeProducts, isAuthorizedAdmin } from "./_github";

// One endpoint, four verbs, backed by data/products.json in this repo
// (read/written via the GitHub Contents API — see api/_github.ts):
//   GET    /api/products?type=fashion_find            — public, Live rows only
//   GET    /api/products?type=fashion_find&all=1       — admin, every status
//   POST   /api/products                                — admin, create
//   PATCH  /api/products?id=<id>                        — admin, update
//   DELETE /api/products?id=<id>                        — admin, delete
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
      if (!wantsAll) result = result.filter((p) => p.status === "Live");
      result.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
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
      const newProduct = { id: randomUUID(), ...req.body, created_at: now, updated_at: now };
      const updated = [...products, newProduct];
      await writeProducts(updated, sha, `Add product: ${newProduct.name}`);
      return res.status(201).json(newProduct);
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

      const updatedProduct = { ...products[index], ...req.body, id, updated_at: new Date().toISOString() };
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
      const updated = products.filter((p) => p.id !== id);
      await writeProducts(updated, sha, `Delete product: ${target?.name || id}`);
      return res.status(204).end();
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader("Allow", "GET, POST, PATCH, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
