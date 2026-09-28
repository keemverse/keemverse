import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readJsonFile, writeJsonFile, isAuthorizedAdmin } from "./_github.js";

const LAYOUTS_PATH = "data/layout-defaults.json";

type Layout = { x: number; y: number; width: number; height: number };
type Layouts = Record<string, Layout>; // keyed by `${category}:${groupName}`

// Remembered canvas position/size for a piece group (e.g. "top:T-shirt" or
// "other:Body model"), so adding any variant of that group next time drops
// it in already-fitted instead of centered at a default size. Stored
// centrally (same GitHub-as-database pattern as products/pieces) so it's
// consistent across every device, not just the one it was set on.
//   GET /api/layouts              — admin, the whole map
//   PUT /api/layouts  body: { key, layout: {x,y,width,height} } — admin, upsert one
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isAuthorizedAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const { data } = await readJsonFile<Layouts>(LAYOUTS_PATH, {});
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "PUT") {
    const { key, layout } = req.body || {};
    if (typeof key !== "string" || !layout) {
      return res.status(400).json({ error: "Body must be { key, layout: {x,y,width,height} }" });
    }
    try {
      const { data, sha } = await readJsonFile<Layouts>(LAYOUTS_PATH, {});
      const updated = { ...data, [key]: layout };
      await writeJsonFile(LAYOUTS_PATH, updated, sha, `Remember position: ${key}`);
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader("Allow", "GET, PUT");
  return res.status(405).json({ error: "Method not allowed" });
}
