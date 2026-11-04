import { useEffect, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { CINE_EASE } from '../lib/cine';

// Small pieces of app-wide behaviour that make the site feel like an app
// instead of a set of separate pages.

/**
 * On a phone the top bar and the tab bar together take a lot of the screen.
 * This slides them away while the page is scrolled down and brings them back
 * the moment the person scrolls up (or reaches the top or bottom). It only
 * sets html[data-chrome]; the CSS in styles/tailwind.css does the movement
 * and only applies below the tablet breakpoint.
 */
export function ScrollChrome() {
  useEffect(() => {
    const root = document.documentElement;
    let last = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const delta = y - last;
      if (y < 80 || y >= max - 40) {
        root.dataset.chrome = 'shown';
      } else if (delta > 8) {
        root.dataset.chrome = 'hidden';
      } else if (delta < -8) {
        root.dataset.chrome = 'shown';
      }
      if (Math.abs(delta) > 8) last = y;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    root.dataset.chrome = 'shown';
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      delete root.dataset.chrome;
    };
  }, []);
  return null;
}

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
 * Each new page settles in with a slow fade. Opacity only (no movement or
 * blur), so it can never shift layout or break fixed-position popups; the
 * movement belongs to the things inside the page (see ui/Cine).
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  return (
    <motion.div
      key={pathname}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: CINE_EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Feeds the pointer position to any .spot card so its pool of light follows
 * the cursor. Does nothing on touch screens.
 */
export function PointerLight() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.('.spot') as HTMLElement | null;
      if (!el) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      document.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
