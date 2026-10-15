import { useEffect, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';

// Small pieces of app-wide behaviour that make the site feel like an app
// instead of a set of separate pages.

/** Each new page opens at the top (instantly), as people expect. */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

/**
 * Many buttons and links across the site are plain <a href="/..."> tags, which
 * make the browser reload the whole page (a white flash, and everything loads
 * again). This turns a click on any same-site link into a normal in-app
 * navigation. It skips new-tab links, downloads, modified clicks (ctrl/cmd),
 * anchors on the same page and /api URLs, which keep their default behaviour.
 */
export function InternalLinks() {
  const navigate = useNavigate();
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a) return;
      if (a.target && a.target !== '_self') return;
      if (a.hasAttribute('download')) return;
      if (a.origin !== window.location.origin) return;
      const raw = a.getAttribute('href') || '';
      if (raw.startsWith('#') || raw.startsWith('/api')) return;
      e.preventDefault();
      navigate(a.pathname + a.search + a.hash);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [navigate]);
  return null;
}

/**
 * A short fade as each page appears. Opacity only (no movement), so it can
 * never shift layout or break fixed-position popups.
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  return (
    <motion.div
      key={pathname}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
