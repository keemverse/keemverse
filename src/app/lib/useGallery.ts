import { useEffect, useState } from 'react';
import { fetchGallery, type GalleryItem, type PictureSet } from './galleryApi';
import gallerySeed from '../../../data/gallery.json';
import homeSeed from '../../../data/home-pictures.json';
import packSeed from '../../../data/pack-pictures.json';

// The public picture lists. Each starts from the copy bundled with the site (so the
// first paint is instant and the site still works if the server is slow), then swaps
// in the live list from /api/gallery, which is what the admin pages edit.
//   gallery -> the Gallery page      home -> the story pictures on the main page and
//   For brands page      packs -> the rate card pictures

const sorted = (list: GalleryItem[]) => list.filter((i) => i.visible !== false).sort((a, b) => a.order - b.order);

const bundled: Record<PictureSet, GalleryItem[]> = {
  gallery: sorted(gallerySeed as GalleryItem[]),
  home: sorted(homeSeed as GalleryItem[]),
  packs: sorted(packSeed as GalleryItem[]),
};
const live: Partial<Record<PictureSet, GalleryItem[]>> = {};
const pending: Partial<Record<PictureSet, boolean>> = {};
const listeners = new Set<() => void>();

function load(set: PictureSet) {
  if (live[set] || pending[set]) return;
  pending[set] = true;
  fetchGallery(undefined, set)
    .then((items) => {
      if (Array.isArray(items) && items.length > 0) {
        live[set] = sorted(items);
        listeners.forEach((l) => l());
      }
    })
    .catch(() => {
      /* keep the bundled copy */
    })
    .finally(() => {
      pending[set] = false;
    });
}

export function useGallery(set: PictureSet = 'gallery'): GalleryItem[] {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    load(set);
    return () => {
      listeners.delete(l);
    };
  }, [set]);
  return live[set] ?? bundled[set];
}
