import street from '../../imports/IMG_7304.webp';
import pair from '../../imports/IMG_7549.webp';
import garden from '../../imports/IMG_4929.webp';
import pavement from '../../imports/IMG_6867_Original.webp';
import wall from '../../imports/IMG_8935.webp';
import stripes from '../../imports/trend-territory-modeling-portrait.webp';

// The gallery: frames from Keem's shoots plus the edited looks. Every photo here
// is one already published on the site. To add a frame, put the photo in
// src/imports (or public/) and add a row below; the home strip and the /gallery
// page both read this list, so nothing else needs touching.

export type FrameKind = 'Street' | 'Pair' | 'Studio' | 'Looks';

export interface Frame {
  id: string;
  src: string;
  title: string;
  /** One honest line about what is in the photo. */
  note: string;
  kind: FrameKind;
  /** Width divided by height. */
  ratio: number;
  /** Where the photo is anchored when it is cropped (CSS object-position). */
  position?: string;
  /** Photographer credit, shown under the photo in the viewer (e.g. "Photo: Name"). Leave out when unknown. */
  credit?: string;
  /** Optional page the frame links to (a look links to its preset page). */
  href?: string;
}

export const FRAMES: Frame[] = [
  { id: 'highway', src: street, title: 'Highway', note: 'Leather vest, grey trousers, an empty road.', kind: 'Street', ratio: 3 / 4, position: '50% 62%' },
  { id: 'stripes', src: stripes, title: 'Trend Territory', note: 'Pink and cream stripes, shot in the studio.', kind: 'Studio', ratio: 3 / 4, position: '50% 40%' },
  { id: 'old-garden', src: '/presets/old-garden-after.webp', title: 'Old Garden', note: 'Muted olive and warm shadows.', kind: 'Looks', ratio: 3 / 4 },
  { id: 'pair', src: pair, title: 'Same wall', note: 'Matching leather and hats on a concrete ledge.', kind: 'Pair', ratio: 3 / 4, position: '50% 60%' },
  { id: 'pavement', src: pavement, title: 'Pavement', note: 'Cap, tank, wide shorts and sneakers.', kind: 'Street', ratio: 3 / 4, position: '50% 55%' },
  { id: 'amber-hour', src: '/presets/amber-hour-after.webp', title: 'Amber Hour', note: 'Warm, soft and lifted.', kind: 'Looks', ratio: 3 / 4 },
  { id: 'garden', src: garden, title: 'White on white', note: 'A garden, two outfits and one red rose.', kind: 'Pair', ratio: 3 / 4, position: '50% 55%' },
  { id: 'welcome', src: wall, title: 'Welcome', note: 'A painted wall that says hello.', kind: 'Street', ratio: 4 / 3, position: '50% 50%' },
  { id: 'cold-frame', src: '/presets/cold-frame-after.webp', title: 'Cold Frame', note: 'Cool, crisp and close.', kind: 'Looks', ratio: 3 / 4 },
  { id: 'storm-grey', src: '/presets/storm-grey-after.webp', title: 'Storm Grey', note: 'Slate tones and deep contrast.', kind: 'Looks', ratio: 3 / 4 },
];

export const FRAME_KINDS: ('All' | FrameKind)[] = ['All', 'Street', 'Pair', 'Studio', 'Looks'];
