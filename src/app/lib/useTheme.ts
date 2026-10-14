import { useCallback, useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'keemverse-theme';
const media = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

function readExplicitChoice(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'dark' || stored === 'light' ? stored : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  return media?.matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

// Switching day to night (or back) is a slow, seamless fade, not a snap.
// While `theme-fade` is on <html>, colours, backgrounds, borders and shadows
// all transition over FADE_MS (see styles/tailwind.css). It is only used for
// a real switch, never for the first paint, and it is skipped for people who
// asked their device for reduced motion.
const FADE_MS = 2500;
let fadeTimer: number | undefined;

function applyThemeFaded(theme: Theme) {
  const root = document.documentElement;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!reduced) {
    root.classList.add('theme-fade');
    window.clearTimeout(fadeTimer);
    fadeTimer = window.setTimeout(() => root.classList.remove('theme-fade'), FADE_MS + 150);
    // make sure the transition engine has seen the old colours before they change
    void root.offsetWidth;
  }
  applyTheme(theme);
}

/**
 * Module-level store (not per-component state) so every useTheme() call
 * anywhere in the tree — NavBar's menu, the landing page's own menu, the
 * toggle switch itself — reads and reacts to the same value. Plain
 * useState per-instance looked fine in isolation but went stale the
 * moment two mounted copies existed at once: the switch would flip yet
 * a sibling label reading "Light mode" wouldn't, since nothing told it
 * the other instance's state had changed.
 *
 * Three states, same as Chrome's own light/dark handling: an explicit
 * choice (from the toggle, saved to localStorage) always wins; with no
 * explicit choice yet, this follows the device's prefers-color-scheme
 * live, so someone whose OS is set to dark gets dark on their first
 * visit without having to find the switch. Toggling makes a choice
 * explicit and pins it, overriding the device setting from then on.
 */
let explicitChoice: Theme | null = readExplicitChoice();
let theme: Theme = explicitChoice ?? systemTheme();
const listeners = new Set<() => void>();

function recompute() {
  const next = explicitChoice ?? systemTheme();
  if (next === theme) return;
  theme = next;
  applyThemeFaded(theme);
  listeners.forEach((l) => l());
}

function setTheme(next: Theme) {
  explicitChoice = next;
  theme = next;
  applyThemeFaded(next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // falls back to in-memory only for this visit
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return theme;
}

// Apply on module load so the very first paint already matches storage
// (or the device setting, when nothing's stored yet).
applyTheme(theme);

// Only matters pre-choice: if the device's OS-level setting changes
// (e.g. auto dark-at-sunset) while this tab is open and no explicit
// choice has been made here, follow it live.
media?.addEventListener('change', recompute);

export function useTheme() {
  const current = useSyncExternalStore(subscribe, getSnapshot, () => 'light');

  const toggleTheme = useCallback(() => {
    setTheme(current === 'dark' ? 'light' : 'dark');
  }, [current]);

  return { theme: current, toggleTheme };
}
