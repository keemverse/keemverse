import { useEffect, useState } from 'react';
import { fetchGallery, type GalleryItem } from './galleryApi';
import seed from '../../../data/gallery.json';

// The public gallery list. It starts from the copy bundled with the site (so the
// first paint is instant and the site still works if the server is slow), then
// swaps in the live list from /api/gallery, which is what the admin Gallery page
// edits. Everything that shows photos (home, For brands, Gallery) reads from here.

const bundled = (seed as GalleryItem[]).filter((i) => i.visible !== false).sort((a, b) => a.order - b.order);
let live: GalleryItem[] | null = null;
let pending: Promise<void> | null = null;
const listeners = new Set<() => void>();

function load() {
  if (live || pending) return;
  pending = fetchGallery()
    .then((items) => {
      if (Array.isArray(items) && items.length > 0) {
        live = items.filter((i) => i.visible !== false).sort((a, b) => a.order - b.order);
        listeners.forEach((l) => l());
      }
    })
    .catch(() => {
      /* keep the bundled copy */
    })
    .finally(() => {
      pending = null;
    });
}

export function useGallery(): GalleryItem[] {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    load();
    return () => {
      listeners.delete(l);
    };
  }, []);
  return live ?? bundled;
}
