// The gallery, as the admin Gallery page and the public pages see it. Backed by
// /api/gallery (data/gallery.json in the repo). Photos are always saved as WebP:
// a full size picture and a small thumbnail made in the browser.

export type GalleryItem = {
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
  position: string;
  credit: string;
  href: string;
  featured: boolean;
  visible: boolean;
  order: number;
  updatedAt: string;
};

export const GALLERY_KINDS = ['Solo', 'Duo', 'Street', 'Studio', 'Editorial'];

function headers(secret?: string): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (secret) h['x-admin-secret'] = secret;
  return h;
}

async function ok(res: Response, fallback: string) {
  if (res.ok || res.status === 204) return res;
  let msg = fallback;
  try {
    const j = await res.json();
    if (j?.error) msg = j.error;
  } catch {
    /* keep the fallback */
  }
  throw new Error(msg);
}

export async function fetchGallery(secret?: string): Promise<GalleryItem[]> {
  const res = await ok(await fetch('/api/gallery', { headers: headers(secret) }), 'Could not load the gallery');
  return res.json();
}

export type NewPhoto = {
  title: string;
  note?: string;
  kind: string;
  credit?: string;
  href?: string;
  featured?: boolean;
  visible?: boolean;
  position?: string;
  imageDataUrl: string;
  thumbDataUrl: string;
  width: number;
  height: number;
};

export async function createGalleryItem(secret: string, photo: NewPhoto): Promise<GalleryItem> {
  const res = await ok(
    await fetch('/api/gallery', { method: 'POST', headers: headers(secret), body: JSON.stringify(photo) }),
    'Could not save the photo'
  );
  return res.json();
}

export async function updateGalleryItem(secret: string, id: string, patch: Partial<GalleryItem>): Promise<GalleryItem> {
  const res = await ok(
    await fetch('/api/gallery', { method: 'PATCH', headers: headers(secret), body: JSON.stringify({ id, ...patch }) }),
    'Could not save the change'
  );
  return res.json();
}

export async function reorderGallery(secret: string, ids: string[]): Promise<void> {
  await ok(
    await fetch('/api/gallery', { method: 'PATCH', headers: headers(secret), body: JSON.stringify({ order: ids }) }),
    'Could not save the order'
  );
}

export async function deleteGalleryItem(secret: string, id: string): Promise<void> {
  await ok(
    await fetch(`/api/gallery?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: headers(secret) }),
    'Could not delete the photo'
  );
}

function loadFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('That file is not a picture the browser can open.'));
    };
    img.src = url;
  });
}

function toWebp(img: HTMLImageElement, maxSide: number, quality: number) {
  const k = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * k));
  const h = Math.max(1, Math.round(img.naturalHeight * k));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
  return { dataUrl: canvas.toDataURL('image/webp', quality), width: w, height: h };
}

// Turns any picture into a web-ready WebP (up to 1600 px) and a small thumbnail
// (640 px), so nobody has to convert or resize anything first.
export async function preparePhoto(file: File) {
  const img = await loadFile(file);
  let quality = 0.84;
  let full = toWebp(img, 1600, quality);
  // Keep the upload comfortably under the server's request limit.
  while (full.dataUrl.length > 2_600_000 && quality > 0.5) {
    quality -= 0.1;
    full = toWebp(img, 1600, quality);
  }
  const thumb = toWebp(img, 640, 0.78);
  if (!full.dataUrl.startsWith('data:image/webp')) {
    throw new Error('This browser cannot make WebP pictures. Try Chrome or Safari.');
  }
  return { imageDataUrl: full.dataUrl, thumbDataUrl: thumb.dataUrl, width: full.width, height: full.height };
}
