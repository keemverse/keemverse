import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MotionConfig, motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from './ui/drawer';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { useIsMobile } from './ui/use-mobile';
import { getCatalogProducts } from '../lib/products';
import { FASHION, SAND } from '../lib/theme';
import fashionPageHero from '../../imports/IMG_7304.webp';

// A quick "where to?" chooser for people who arrive from the link in bio.
// It only ever shows for links that carry a bio marker (?from=bio or
// ?utm_medium=bio), so normal home-page and Craft traffic never sees it.
// Then it shows once per visit, a moment after the home page loads, only
// when the home page was the visitor's entry page and they have not started
// scrolling yet. Add ?chooser=off to a link to suppress it. A phone gets a bottom sheet
// (swipe down to dismiss); a desktop gets a centred card. Each door shows
// three real pictures pulled from the page it leads to (the top finds in
// the order the Fashion Finds page itself uses, and the preset thumbnails).
// Choosing a door goes straight to that page; closing it leaves the home
// page as it was.

// Captured once, when the app first loads: was the home page the first page
// this visitor opened? A direct link to /fashion/finds, /fashion/presets or a
// product never shows the chooser, and neither does the home page reached
// later from inside the site.
const ENTERED_ON_HOME = typeof window === 'undefined' ? true : window.location.pathname === '/';

const SEEN_KEY = 'kv_chooser_seen';
const SHOW_AFTER_MS = 1200;
const MAX_SCROLL_PX = 160;
const SHOTS = 3;

// Used until the live lists arrive, or if they cannot be fetched.
const FALLBACK_FINDS = [fashionPageHero];
const FALLBACK_PRESETS = [
  '/presets/amber-hour-thumbnail.webp',
  '/presets/cold-frame-thumbnail.webp',
  '/presets/storm-grey-thumbnail.webp',
];

type Door = {
  key: 'finds' | 'presets';
  label: string;
  sub: string;
  href: string;
};

const DOORS: Door[] = [
  { key: 'finds', label: 'Fashion Finds', sub: 'Shop my picks', href: '/fashion/finds?from=chooser' },
  { key: 'presets', label: 'Presets', sub: 'Lightroom presets', href: '/fashion/presets?from=chooser' },
];

function readSeen(): boolean {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* private window or blocked storage: it just may show again */
  }
}

function track(to: string) {
  try {
    // Vercel Web Analytics custom event; a harmless no-op if the plan or
    // script does not support custom events.
    (window as unknown as { va?: (...a: unknown[]) => void }).va?.('event', {
      name: 'chooser_choice',
      data: { to },
    });
  } catch {
    /* analytics must never break the page */
  }
}

// Same ordering rule the real pages apply: display_order first.
function topImages(rows: unknown, field: 'image_url' | 'thumbnail'): string[] {
  if (!Array.isArray(rows)) return [];
  return [...rows]
    .filter((r) => r && (r.status === undefined || r.status === 'Live') && (r[field] || r.image_url))
    .sort((a, b) => (a.display_order ?? 999999) - (b.display_order ?? 999999))
    .map((r) => (r[field] || r.image_url) as string)
    .slice(0, SHOTS);
}

function useDoorImages(enabled: boolean) {
  const [finds, setFinds] = useState<string[]>(FALLBACK_FINDS);
  const [presets, setPresets] = useState<string[]>(FALLBACK_PRESETS);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const warm = (urls: string[]) =>
      urls.forEach((u) => {
        const i = new Image();
        i.src = u;
      });

    getCatalogProducts('fashion_find')
      .then((rows) => {
        const imgs = topImages(rows, 'image_url');
        if (!cancelled && imgs.length) {
          warm(imgs);
          setFinds(imgs);
        }
      })
      .catch(() => {
        /* keep the fallback picture */
      });

    getCatalogProducts('preset')
      .then((rows) => {
        const imgs = topImages(rows, 'thumbnail');
        if (!cancelled && imgs.length) {
          warm(imgs);
          setPresets(imgs);
        }
      })
      .catch(() => {
        /* keep the static thumbnails */
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { finds, presets };
}

function DoorCard({
  door,
  images,
  index,
  onChoose,
}: {
  door: Door;
  images: string[];
  index: number;
  onChoose: (to: string) => void;
}) {
  // One picture fills the whole strip; two or three share it equally.
  const shots = images.slice(0, SHOTS);
  const cols = shots.length === 1 ? 'grid-cols-1' : shots.length === 2 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.12 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={door.href}
        onClick={() => onChoose(door.key)}
        className="group block overflow-hidden rounded-2xl border transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          borderColor: 'rgba(20,18,15,.12)',
          boxShadow: '0 10px 24px -14px rgba(20,18,15,.55)',
        }}
      >
        <div className={`grid ${cols} gap-px bg-black/10`}>
          {shots.map((src, i) => (
            <div
              key={src + i}
              className={`overflow-hidden bg-muted ${shots.length === 1 ? 'aspect-[16/9]' : 'aspect-square md:aspect-[4/3]'}`}
            >
              <img
                src={src}
                alt=""
                loading="eager"
                decoding="async"
                className="h-full w-full object-cover object-[center_25%] transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.06]"
              />
            </div>
          ))}
        </div>

        <div
          className="flex items-center gap-3 px-4 py-3 transition-colors duration-300 group-hover:!bg-[var(--chooser-hover)] group-focus-visible:!bg-[var(--chooser-hover)]"
          style={{
            backgroundColor: SAND,
            color: '#14120F',
            ['--chooser-hover' as string]: FASHION,
          }}
        >
          <span className="flex flex-1 flex-col text-left">
            <span className="text-lg leading-none" style={{ fontFamily: 'var(--font-display)' }}>
              {door.label}
            </span>
            <span className="mt-1.5 text-[10px] uppercase tracking-[0.18em] opacity-70">{door.sub}</span>
          </span>
          <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </Link>
    </motion.div>
  );
}

function ChooserBody({
  images,
  onChoose,
  onDismiss,
}: {
  images: { finds: string[]; presets: string[] };
  onChoose: (to: string) => void;
  onDismiss: () => void;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="max-h-[78vh] overflow-y-auto px-5 pt-3 pb-5 md:px-7 md:pt-7 md:pb-7">
        <p className="text-center text-[10px] uppercase tracking-[0.3em] text-amber-ink" aria-hidden="true">
          Soft Keem
        </p>

        <div className="mt-2 text-center">
          <h2 className="text-foreground text-[1.75rem] leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Where to?
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Pick one and I'll take you straight there.</p>
        </div>

        <div className="mt-5 grid gap-3.5">
          {DOORS.map((d, i) => (
            <DoorCard
              key={d.key}
              door={d}
              images={d.key === 'finds' ? images.finds : images.presets}
              index={i}
              onChoose={onChoose}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="mt-3 w-full rounded-full py-2.5 text-xs tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2"
        >
          Just looking around
        </button>
      </div>
    </MotionConfig>
  );
}

export function BioChooser() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    if (!ENTERED_ON_HOME) return;
    if (readSeen()) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('chooser') === 'off') return;
    // Bio links only: set TikTok's to /?from=bio&utm_source=tiktok&utm_medium=bio
    // and Instagram's to /?from=bio&utm_source=instagram&utm_medium=bio.
    const fromBio = params.get('from') === 'bio' || params.get('utm_medium') === 'bio';
    if (!fromBio) return;

    // Start loading the pictures straight away so they are ready when it opens.
    setEligible(true);

    const t = window.setTimeout(() => {
      if (window.scrollY > MAX_SCROLL_PX) return;
      markSeen();
      setOpen(true);
    }, SHOW_AFTER_MS);

    return () => window.clearTimeout(t);
  }, []);

  const images = useDoorImages(eligible);
  const close = () => setOpen(false);
  const choose = (to: string) => {
    track(to);
    setOpen(false);
  };

  if (!eligible) return null;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent
          className="rounded-t-3xl pb-[env(safe-area-inset-bottom)]"
          // In-app browsers shift focus around; only a tap outside or a swipe should dismiss.
          onFocusOutside={(e) => e.preventDefault()}
        >
          <DrawerTitle className="sr-only">Where to?</DrawerTitle>
          <DrawerDescription className="sr-only">Choose Fashion Finds or Lightroom presets.</DrawerDescription>
          <ChooserBody images={images} onChoose={choose} onDismiss={close} />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-md rounded-3xl p-0 gap-0 overflow-hidden"
        onFocusOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Where to?</DialogTitle>
        <DialogDescription className="sr-only">Choose Fashion Finds or Lightroom presets.</DialogDescription>
        <ChooserBody images={images} onChoose={choose} onDismiss={close} />
      </DialogContent>
    </Dialog>
  );
}
