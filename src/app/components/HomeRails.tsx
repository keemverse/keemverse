import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Reveal } from './CraftUI';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getCatalogProducts } from '../lib/products';
import { formatPrice } from '../lib/currency';
import { useRegion } from '../lib/geo';

// Below the two-universe hero: a taste of what is inside each shop, so the home
// page shows real things instead of ending after two cards. Everything here is
// pulled from the same catalogue the shop pages use, in the same order, and the
// prices follow the same rule (Fashion Finds prices show only in Nigeria).

type Item = { id: string; name: string; image: string; price: string; tag: string };

function pick(rows: any[], imageField: 'image_url' | 'thumbnail', limit: number): any[] {
  return [...rows]
    .filter((r) => r && (r.status === undefined || r.status === 'Live') && (r[imageField] || r.image_url))
    .sort((a, b) => (a.display_order ?? 999999) - (b.display_order ?? 999999))
    .slice(0, limit);
}

function Rail({
  eyebrow,
  title,
  href,
  cta,
  items,
  loading,
}: {
  eyebrow: string;
  title: string;
  href: string;
  cta: string;
  items: Item[];
  loading: boolean;
}) {
  return (
    <section className="mt-16 md:mt-24">
      <Reveal>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-amber-ink">{eyebrow}</p>
            <h2 className="mt-2 text-display-md">{title}</h2>
          </div>
          <Link to={href} className="group hidden shrink-0 items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-foreground sm:inline-flex">
            {cta}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </Reveal>

      <div className="rail -mx-5 mt-6 px-5 pb-2 md:-mx-8 md:px-8">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-40 sm:w-48 md:w-56" aria-hidden="true">
                <div className="skeleton-shimmer aspect-[4/5] rounded-3xl" />
                <div className="skeleton-shimmer mt-3 h-3.5 w-3/4 rounded-full" />
              </div>
            ))
          : items.map((it) => (
              <Link key={it.id} to={href} className="group block w-40 sm:w-48 md:w-56" aria-label={it.name}>
                <div className="card-lift relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted">
                  <ImageWithFallback src={it.image} alt={it.name} className="card-img h-full w-full object-cover" />
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-stone-900 backdrop-blur">
                    {it.tag}
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 px-1 text-[13px] font-medium leading-snug text-foreground">{it.name}</p>
                {it.price && <p className="mt-1 px-1 text-[13px] font-semibold text-amber-ink">{it.price}</p>}
              </Link>
            ))}
      </div>

      <Link to={href} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 sm:hidden">
        {cta}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}

export default function HomeRails() {
  const region = useRegion();
  const [finds, setFinds] = useState<any[]>([]);
  const [presets, setPresets] = useState<any[]>([]);
  const [loadingFinds, setLoadingFinds] = useState(true);
  const [loadingPresets, setLoadingPresets] = useState(true);

  useEffect(() => {
    let live = true;
    getCatalogProducts('fashion_find')
      .then((rows) => live && setFinds(pick(rows, 'image_url', 8)))
      .catch(() => {})
      .finally(() => live && setLoadingFinds(false));
    getCatalogProducts('preset')
      .then((rows) => live && setPresets(pick(rows, 'thumbnail', 6)))
      .catch(() => {})
      .finally(() => live && setLoadingPresets(false));
    return () => {
      live = false;
    };
  }, []);

  const findItems: Item[] = finds.map((p) => ({
    id: String(p.id ?? p.name),
    name: p.name,
    image: p.image_url,
    price: region === 'NG' ? formatPrice(p.price, 'NG') : '',
    tag: p.source || 'Find',
  }));

  const presetItems: Item[] = presets.map((p) => ({
    id: String(p.id ?? p.name),
    name: p.name,
    image: p.thumbnail || p.image_url,
    price: formatPrice(p.price, region),
    tag: p.collection || 'Preset',
  }));

  // Hide a rail entirely if its catalogue could not be loaded or is empty.
  const showFinds = loadingFinds || findItems.length > 0;
  const showPresets = loadingPresets || presetItems.length > 0;

  return (
    <div className="max-w-5xl mx-auto">
      {showFinds && (
        <Rail
          eyebrow="Fashion finds"
          title="Fresh picks, chosen by hand"
          href="/fashion/finds"
          cta="See all finds"
          items={findItems}
          loading={loadingFinds}
        />
      )}

      {showPresets && (
        <Rail
          eyebrow="Lightroom presets"
          title="Looks you can reuse"
          href="/fashion/presets"
          cta="See all presets"
          items={presetItems}
          loading={loadingPresets}
        />
      )}

      <Reveal>
        <section className="mt-16 md:mt-24 glass sheen overflow-hidden rounded-[2rem] px-6 py-12 text-center md:px-12 md:py-16">
          <p className="eyebrow text-teal-ink">Something specific in mind?</p>
          <h2 className="mx-auto mt-3 max-w-xl text-display-lg">Tell me what you need and I'll make it.</h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Brand collaborations, custom artwork or a styling project. A short note is enough to start.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/contact"
              className="press inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Start a project
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/digital-craft"
              className="press inline-flex items-center gap-2 rounded-full border border-border px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-foreground/40"
            >
              See the craft side
            </Link>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
