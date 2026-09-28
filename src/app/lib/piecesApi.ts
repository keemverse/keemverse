// Layer Studio's saved-piece library, backed by /api/pieces (GitHub-as-
// database, same pattern as the product catalog) instead of per-browser
// IndexedDB — so a piece saved on one device shows up on every device.
import type { PieceCategory } from "./layerProjectsDb";

export type ApiPiece = {
  id: string;
  category: PieceCategory;
  groupName: string;
  variantName: string;
  imageUrl: string;
  width: number;
  height: number;
  updatedAt: string;
};

export async function listPieces(secret: string): Promise<ApiPiece[]> {
  const res = await fetch("/api/pieces", { headers: { "x-admin-secret": secret } });
  if (!res.ok) throw new Error("Failed to load pieces");
  return res.json();
}

export async function createPiece(
  secret: string,
  piece: { category: PieceCategory; groupName: string; variantName: string; imageDataUrl: string; width: number; height: number }
): Promise<ApiPiece> {
  const res = await fetch("/api/pieces", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-secret": secret },
    body: JSON.stringify(piece),
  });
  if (!res.ok) throw new Error("Failed to save piece");
  return res.json();
}

export async function deletePiece(secret: string, id: string): Promise<void> {
  const res = await fetch(`/api/pieces?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { "x-admin-secret": secret },
  });
  if (!res.ok && res.status !== 204) throw new Error("Failed to delete piece");
}
