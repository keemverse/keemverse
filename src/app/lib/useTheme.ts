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
  applyTheme(theme);
  listeners.forEach((l) => l());
}

function setTheme(next: Theme) {
  explicitChoice = next;
  theme = next;
  applyTheme(next);
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
