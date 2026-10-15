import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readJsonFile, writeJsonFile, isAuthorizedAdmin } from "./_github.js";

const CONTENT_PATH = "data/site-content.json";

type Overrides = Record<string, string>;

// Editable site copy (headlines, supporting lines, section titles, button
// labels). Only values that differ from the defaults built into the site are
// stored; an empty value means "use the default again".
//   GET /api/content            public, the overrides (cached at the edge)
//   PUT /api/content  body: { values: { "<key>": "<text>", ... } }
//                               admin only, REPLACES the whole overrides object
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    try {
      const { data } = await readJsonFile<Overrides>(CONTENT_PATH, {});
      res.setHeader("Cache-Control", "public, max-age=0, s-maxage=30, stale-while-revalidate=120");
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "PUT") {
    if (!isAuthorizedAdmin(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const values = req.body?.values;
    if (!values || typeof values !== "object" || Array.isArray(values)) {
      return res.status(400).json({ error: "Body must be { values: { key: text } }" });
    }

    const entries = Object.entries(values as Record<string, unknown>);
    if (entries.length > 200) {
      return res.status(400).json({ error: "Too many fields" });
    }

    const clean: Overrides = {};
    for (const [key, value] of entries) {
      if (!/^[a-z0-9_.]{1,60}$/.test(key)) {
        return res.status(400).json({ error: `Invalid field name: ${key}` });
      }
      if (typeof value !== "string") {
        return res.status(400).json({ error: `Field ${key} must be text` });
      }
      const text = value.trim();
      if (text.length > 800) {
        return res.status(400).json({ error: `Field ${key} is longer than 800 characters` });
      }
      if (text) clean[key] = text;
    }

    try {
      const { sha } = await readJsonFile<Overrides>(CONTENT_PATH, {});
      await writeJsonFile(CONTENT_PATH, clean, sha, `Edit site content (${Object.keys(clean).length} fields)`);
      return res.status(200).json(clean);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader("Allow", "GET, PUT");
  return res.status(405).json({ error: "Method not allowed" });
}
