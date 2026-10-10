import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// The app is a single-page site, so the HTML shell is the same for every URL.
// This keeps the browser tab title, the description and the canonical link
// right for the page that is actually open (search engines run the script and
// read them), and marks private pages as noindex. Link-preview cards on
// TikTok, WhatsApp and Instagram do not run scripts, so they always use the
// brand-level tags in index.html.

const ORIGIN = 'https://www.keemverse.com';
const BRAND = 'KEEMVERSE';

type Meta = { title: string; description: string; noindex?: boolean };

const PAGES: Record<string, Meta> = {
  '/': {
    title: 'KEEMVERSE: one creator, two crafts',
    description: 'Fashion finds and Lightroom presets, plus original art to wear, download, or have made for you.',
  },
  '/fashion': {
    title: `Fashion | ${BRAND}`,
    description: 'Style as visual storytelling: brand modeling, collaborations, wardrobe styling, and a curated shop of finds and presets.',
  },
  '/fashion/finds': {
    title: `Fashion Finds | ${BRAND}`,
    description: 'Personally selected fashion finds, chosen for their design, quality or value.',
  },
  '/fashion/presets': {
    title: `Lightroom Presets | ${BRAND}`,
    description: 'Lightroom presets for a consistent, editorial look. Your download link is sent to your email after purchase.',
  },
  '/digital-craft': {
    title: `Digital Craft | ${BRAND}`,
    description: 'Original art to wear, art packs to download, and custom designs made just for you.',
  },
  '/about': { title: `About | ${BRAND}`, description: 'Who is behind KEEMVERSE and what it makes.' },
  '/contact': { title: `Contact | ${BRAND}`, description: 'Send a brief about a collaboration, a project or an order.' },
  '/refund-policy': { title: `Refund Policy | ${BRAND}`, description: 'How refunds work for presets and other digital downloads.' },
  '/privacy-policy': { title: `Privacy Policy | ${BRAND}`, description: 'How KEEMVERSE handles your information.' },
  '/terms': { title: `Terms | ${BRAND}`, description: 'The terms for using KEEMVERSE and buying from it.' },
};

function setTag(selector: string, create: () => HTMLElement, set: (el: HTMLElement) => void) {
  let el = document.head.querySelector(selector) as HTMLElement | null;
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  set(el);
}

export function usePageMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
    const isPrivate = path.startsWith('/admin') || path.startsWith('/checkout');
    const meta = PAGES[path] ?? PAGES['/'];

    document.title = meta.title;

    setTag('meta[name="description"]', () => Object.assign(document.createElement('meta'), { name: 'description' }), (el) =>
      el.setAttribute('content', meta.description)
    );
    setTag('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }), (el) =>
      el.setAttribute('href', ORIGIN + (path === '/' ? '/' : path))
    );
    setTag('meta[name="robots"]', () => Object.assign(document.createElement('meta'), { name: 'robots' }), (el) =>
      el.setAttribute('content', isPrivate ? 'noindex, nofollow' : 'index, follow')
    );
  }, [pathname]);
}
