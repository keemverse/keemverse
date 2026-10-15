import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Camera, Layers, Palette } from 'lucide-react';
import type { ComponentType } from 'react';
import { FASHION, FASHION_DARK, CRAFT, CRAFT_DARK } from '../lib/theme';
import { Reveal } from './CraftUI';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getCatalogProducts } from '../lib/products';
import { formatPrice } from '../lib/currency';
import { useRegion } from '../lib/geo';
import { useContent } from '../lib/siteContent';

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

function ActionPill({
  to,
  label,
  icon: Icon,
  accent,
  accentDark,
}: {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  accent: string;
  accentDark: string;
}) {
  return (
    <Link
      to={to}
      className="press inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] leading-none text-white transition-colors duration-300"
      style={{
        backgroundColor: accent,
        borderColor: accentDark,
        fontFamily: 'var(--font-display)',
        boxShadow: `inset 0 1px 0 rgba(255,255,255,.3), 0 6px 14px -8px ${accent}88`,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = accentDark)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = accent)}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {label}
      <ArrowRight className="h-3.5 w-3.5 shrink-0" />
    </Link>
  );
}

function Rail({
  eyebrow,
  title,
  href,
  cta,
  icon,
  items,
  loading,
}: {
  eyebrow: string;
  title: string;
  href: string;
  cta: string;
  icon: ComponentType<{ className?: string }>;
  items: Item[];
  loading: boolean;
}) {
  return (
    <section className="mt-16 md:mt-24">
      <Reveal>
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="eyebrow text-amber-ink">{eyebrow}</p>
            <ActionPill to={href} label={cta} icon={icon} accent={FASHION} accentDark={FASHION_DARK} />
          </div>
          <h2 className="mt-3 text-display-md">{title}</h2>
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
                  <ImageWithFallback
                    src={it.image}
                    alt={it.name}
                    // Below the fold: let them load after the hero photo, not alongside it.
                    loading="lazy"
                    decoding="async"
                    className="card-img h-full w-full object-cover"
                  />
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-stone-900 backdrop-blur">
                    {it.tag}
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 px-1 text-[13px] font-medium leading-snug text-foreground">{it.name}</p>
                {it.price && <p className="mt-1 px-1 text-[13px] font-semibold text-amber-ink">{it.price}</p>}
              </Link>
            ))}
      </div>


    </section>
  );
}

export default function HomeRails() {
  const t = useContent();
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
          eyebrow={t('home.finds_eyebrow')}
          title={t('home.finds_title')}
          href="/fashion/finds"
          cta={t('home.finds_cta')}
          icon={ShoppingBag}
          items={findItems}
          loading={loadingFinds}
        />
      )}

      {showPresets && (
        <Rail
          eyebrow={t('home.presets_eyebrow')}
          title={t('home.presets_title')}
          href="/fashion/presets"
          cta={t('home.presets_cta')}
          icon={Camera}
          items={presetItems}
          loading={loadingPresets}
        />
      )}

      <Reveal>
        <section className="mt-16 md:mt-24">
          <p className="eyebrow text-teal-ink">{t('home.craft_eyebrow')}</p>
          <h2 className="mt-3 text-display-md">{t('home.craft_title')}</h2>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <ActionPill to="/digital-craft" label={t('home.craft_cta_1')} icon={Layers} accent={CRAFT} accentDark={CRAFT_DARK} />
            <ActionPill to="/digital-craft" label={t('home.craft_cta_2')} icon={Palette} accent={CRAFT} accentDark={CRAFT_DARK} />
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mt-16 md:mt-24 glass sheen overflow-hidden rounded-[2rem] px-6 py-12 text-center md:px-12 md:py-16">
          <p className="eyebrow text-teal-ink">{t('home.cta_eyebrow')}</p>
          <h2 className="mx-auto mt-3 max-w-xl text-display-lg">{t('home.cta_title')}</h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            {t('home.cta_body')}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/contact"
              className="press inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              {t('home.cta_primary')}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/digital-craft"
              className="press inline-flex items-center gap-2 rounded-full border border-border px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-foreground/40"
            >
              {t('home.cta_secondary')}
            </Link>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
