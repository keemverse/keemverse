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
};

export type LayerProject = {
  id: string; // project name, used as the key
  layers: Layer[];
  updatedAt: number;
};

// A single reusable imported image (a garment, a prop, anything) saved once
// and available as a one-click add across every future project — distinct
// from a project, which is a whole saved canvas arrangement.
export type LibraryPiece = {
  id: string; // piece name, used as the key
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
