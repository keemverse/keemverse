// Minimal IndexedDB wrapper for Layer Studio projects and pieces. Both hold
// arbitrary user-imported images as data URLs, which can add up to several
// MB, well past what's safe to keep in localStorage, so this uses
// IndexedDB instead.

export type Layer = {
  id: string;
  name: string;
  src: string; // data URL
  x: number;
  y: number;
  width: number;
  height: number;
  // Set when this layer was added from a wardrobe/library group (not for
  // plain imports) — lets the UI offer "swap variant" without touching
  // position/size, by finding sibling variants under the same group.
  groupCategory?: PieceCategory;
  groupName?: string;
};

export type LayerProject = {
  id: string; // project name, used as the key
  layers: Layer[];
  updatedAt: number;
};

export type PieceCategory = "top" | "bottom" | "headwear" | "footwear" | "other";

export const PIECE_CATEGORIES: { id: PieceCategory; label: string }[] = [
  { id: "top", label: "Tops" },
  { id: "bottom", label: "Bottoms" },
  { id: "headwear", label: "Headwear" },
  { id: "footwear", label: "Footwear" },
  { id: "other", label: "Other" },
];

// A single reusable imported image (a garment, a prop, anything) saved once
// and available as a one-click add across every future project — distinct
// from a project, which is a whole saved canvas arrangement. Pieces are
// organized by category (top/bottom/headwear/footwear/other) and grouped by
// groupName, so several color/style variants of the same item (e.g. a
// "Hoodie" in Grey and Navy) can be saved under one group and swapped
// between, rather than each variant being its own unrelated entry.
export type LibraryPiece = {
  id: string; // `${category}:${groupName}:${variantName}`, used as the key
  category: PieceCategory;
  groupName: string;
  variantName: string;
  src: string; // data URL
  width: number;
  height: number;
  updatedAt: number;
};

const DB_NAME = "keemverse-layer-studio";
const PROJECTS_STORE = "projects";
const PIECES_STORE = "pieces";
const DB_VERSION = 2;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        db.createObjectStore(PROJECTS_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(PIECES_STORE)) {
        db.createObjectStore(PIECES_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveProject(project: LayerProject): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROJECTS_STORE, "readwrite");
    tx.objectStore(PROJECTS_STORE).put(project);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function listProjects(): Promise<LayerProject[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROJECTS_STORE, "readonly");
    const req = tx.objectStore(PROJECTS_STORE).getAll();
    req.onsuccess = () => resolve(req.result as LayerProject[]);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteProject(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROJECTS_STORE, "readwrite");
    tx.objectStore(PROJECTS_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveLibraryPiece(piece: LibraryPiece): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PIECES_STORE, "readwrite");
    tx.objectStore(PIECES_STORE).put(piece);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function listLibraryPieces(): Promise<LibraryPiece[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PIECES_STORE, "readonly");
    const req = tx.objectStore(PIECES_STORE).getAll();
    req.onsuccess = () => resolve(req.result as LibraryPiece[]);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteLibraryPiece(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PIECES_STORE, "readwrite");
    tx.objectStore(PIECES_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
