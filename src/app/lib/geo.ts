import { useEffect, useState } from 'react';

// Which price list a visitor sees: naira for visitors in Nigeria, US dollars
// for everyone else (and for anyone whose country cannot be worked out). The
// country comes from /api/geo, which reads Vercel's edge country header. It is
// looked up once per visit and kept in sessionStorage.

export type Region = 'NG' | 'ROW';

const KEY = 'kv_region';
const TIMEOUT_MS = 3000;

let inflight: Promise<Region> | null = null;

function readCached(): Region | null {
  try {
    const v = sessionStorage.getItem(KEY);
    return v === 'NG' || v === 'ROW' ? v : null;
  } catch {
    return null;
  }
}

function writeCached(r: Region) {
  try {
    sessionStorage.setItem(KEY, r);
  } catch {
    /* private window: it is just looked up again */
  }
}

// Local development only: add ?geo=NG to see the naira side without a VPN.
function devOverride(): Region | null {
  if (!import.meta.env.DEV || typeof window === 'undefined') return null;
  const g = new URLSearchParams(window.location.search).get('geo');
  if (!g) return null;
  return g.toUpperCase() === 'NG' ? 'NG' : 'ROW';
}

export function resolveRegion(): Promise<Region> {
  const override = devOverride();
  if (override) return Promise.resolve(override);

  const cached = readCached();
  if (cached) return Promise.resolve(cached);

  if (!inflight) {
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    inflight = fetch('/api/geo', { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : { country: null }))
      .then((d): Region => (d && d.country === 'NG' ? 'NG' : 'ROW'))
      .then((r) => {
        writeCached(r);
        return r;
      })
      // A failed lookup means dollars for this page view; it is not cached,
      // so the next page view tries again.
      .catch((): Region => 'ROW')
      .finally(() => {
        window.clearTimeout(timer);
        inflight = null;
      });
  }
  return inflight;
}

/** null while the country is being looked up (a few milliseconds, or instant when cached). */
export function useRegion(): Region | null {
  const [region, setRegion] = useState<Region | null>(() => devOverride() ?? readCached());

  useEffect(() => {
    if (region) return;
    let live = true;
    resolveRegion().then((r) => {
      if (live) setRegion(r);
    });
    return () => {
      live = false;
    };
  }, [region]);

  return region;
}
