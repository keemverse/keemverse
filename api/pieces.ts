import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "crypto";
import {
  readJsonFile,
  writeJsonFile,
  uploadBinaryFile,
  deleteFile,
  getFileSha,
  isAuthorizedAdmin,
} from "./_github.js";

const PIECES_PATH = "data/pieces.json";

type Piece = {
  id: string;
  category: string;
  groupName: string;
  variantName: string;
  imageUrl: string;
  imagePath: string;
  width: number;
  height: number;
  updatedAt: string;
};

// Layer Studio's saved-piece library, backed by data/pieces.json + image
// files under data/piece-assets/ in this repo (same GitHub-as-database
// pattern as api/products.ts) — shared across every device, unlike the
// prior per-browser IndexedDB version.
//   GET    /api/pieces                 — admin, list all
//   POST   /api/pieces                 — admin, create (uploads the image)
//   DELETE /api/pieces?id=<id>         — admin, delete (piece + its image)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isAuthorizedAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const { data } = await readJsonFile<Piece[]>(PIECES_PATH, []);
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "POST") {
    try {
      const { category, groupName, variantName, imageDataUrl, width, height } = req.body;
      if (!category || !groupName || !imageDataUrl || !width || !height) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const match = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(imageDataUrl);
      if (!match) return res.status(400).json({ error: "imageDataUrl must be a base64 data URL" });
      const [, mime, base64] = match;
      const ext = mime.split("/")[1] === "jpeg" ? "jpg" : mime.split("/")[1];

      const id = randomUUID();
      const imagePath = `data/piece-assets/${id}.${ext}`;
      const imageUrl = await uploadBinaryFile(imagePath, base64, `Add piece asset: ${groupName} (${variantName || "Default"})`);

      const { data: pieces, sha } = await readJsonFile<Piece[]>(PIECES_PATH, []);
      const piece: Piece = {
        id,
        category,
        groupName,
        variantName: variantName || "Default",
        imageUrl,
        imagePath,
        width,
        height,
        updatedAt: new Date().toISOString(),
      };
      const updated = [...pieces, piece];
      await writeJsonFile(PIECES_PATH, updated, sha, `Save piece: ${groupName} (${piece.variantName})`);
      return res.status(201).json(piece);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    if (typeof id !== "string") return res.status(400).json({ error: "Missing ?id=" });

    try {
      const { data: pieces, sha } = await readJsonFile<Piece[]>(PIECES_PATH, []);
      const target = pieces.find((p) => p.id === id);
      const updated = pieces.filter((p) => p.id !== id);
      await writeJsonFile(PIECES_PATH, updated, sha, `Delete piece: ${target?.groupName || id}`);

      if (target) {
        const assetSha = await getFileSha(target.imagePath);
        if (assetSha) await deleteFile(target.imagePath, assetSha, `Delete piece asset: ${target.groupName}`);
      }
      return res.status(204).end();
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader("Allow", "GET, POST, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
