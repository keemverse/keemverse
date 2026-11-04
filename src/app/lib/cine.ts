// The cinematic motion language for the whole site. One set of curves and
// timings so every page moves the same way: slow to settle, never bouncy.

/** Long, soft landing (expo-out). The default for anything that arrives. */
export const CINE_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Slow in and slow out, for things that travel across the screen. */
export const CINE_INOUT: [number, number, number, number] = [0.76, 0, 0.24, 1];

/** Seconds. `quick` for small controls, `base` for text, `slow` for photos. */
export const CINE_DUR = { quick: 0.5, base: 1, slow: 1.6 } as const;

/** Gap between siblings that arrive one after another. */
export const CINE_STAGGER = 0.09;

/** How early (before it is fully on screen) something starts to arrive. */
export const CINE_MARGIN = '-8% 0px -8% 0px';
