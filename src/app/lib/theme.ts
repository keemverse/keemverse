// Single source of truth for the two universe accent colors. Every
// button/badge that needs Fashion or Craft's color should import
// from here rather than hardcoding the hex values — change it once,
// it updates everywhere.

export const FASHION = '#D98E2B';
export const FASHION_DARK = '#B8741A';

// Teal and amber are one pair, used together on every page by role (see
// styles/tailwind.css): teal = signal/structure, amber = action/value.
export const CRAFT = '#1FA396';
export const CRAFT_DARK = '#12897D';
// Text-safe companion: the fill teal is only 3:1 on the ivory ground, so small
// text in the Craft accent uses this deeper ink (it lightens to #3CC4B6 in dark
// mode through the --craft-ink variable).
export const CRAFT_INK = '#0F7D72';

/** Colour of text sitting on a solid accent fill: dark ink on lime and amber (7:1 or better), white otherwise. */
export const onAccent = (accent: string) =>
  [CRAFT, FASHION].some((c) => c.toLowerCase() === accent.toLowerCase()) ? '#14120F' : '#ffffff';

/**
 * Colour to use when the accent itself is the text colour on the page ground.
 * Lime and amber are both too light to read as text on ivory, so each maps to
 * a darker ink in light mode (the CSS variables switch back to the accent
 * itself in dark mode, see styles/tailwind.css).
 */
export const accentText = (accent: string) => {
  const a = accent.toLowerCase();
  if (a === CRAFT.toLowerCase()) return 'var(--craft-ink)';
  if (a === FASHION.toLowerCase()) return 'var(--fashion-ink)';
  return accent;
};

// Brand neutrals (Brand Guidelines v4). Soft Sand is the signature tone and
// Warm Beige the accent warmth: they carry textures and highlights, while the
// universe accent above is kept for CTAs, tags and hover/active states.
export const SAND = '#D8C9B0';
export const BEIGE = '#A18C6B';
