import { useEffect, useState } from 'react';
import { getMediaKit } from './products';

// The TikTok follower count, read from the "Media Kit" sheet that Akeem keeps
// up to date. It is the only audience number the site shows, because it is the
// one that is a plain fact. If the sheet cannot be reached (or has no usable
// number) this returns null and every place that shows it simply stays hidden.

const KEY = 'kv_tiktok_followers';

function readCache(): number | null {
  try {
    const v = Number(sessionStorage.getItem(KEY));
    return v > 0 ? v : null;
  } catch {
    return null;
  }
}

export function useTikTokFollowers(): number | null {
  const [count, setCount] = useState<number | null>(readCache);

  useEffect(() => {
    if (count !== null) return;
    let live = true;
    getMediaKit()
      .then((rows) => {
        if (!live || !Array.isArray(rows)) return;
        const row = rows.find(
          (r: any) => String(r?.Platform ?? '').toLowerCase() === 'tiktok' && (r?.Status === undefined || r?.Status === 'Live')
        );
        const n = typeof row?.Followers === 'number' ? row.Followers : parseFloat(String(row?.Followers ?? '').replace(/,/g, ''));
        if (n > 0) {
          setCount(n);
          try {
            sessionStorage.setItem(KEY, String(n));
          } catch {
            /* private window: it is just looked up again */
          }
        }
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [count]);

  return count;
}

/** 33900 -> "33.9K" (rounded down, so the number is never overstated). */
export function compactCount(n: number): string {
  if (n >= 1000) return `${(Math.floor(n / 100) / 10).toFixed(1).replace(/\.0$/, '')}K`;
  return String(Math.floor(n));
}
