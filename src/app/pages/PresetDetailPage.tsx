import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";

import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import BeforeAfter from "../components/ui/BeforeAfter";
import PresetCard from "../components/PresetCard";
import PresetFAQ from "../components/PresetFAQ";
import { SocialFooter } from "../components/SocialFooter";
import { getCatalogProducts } from "../lib/products";
import { formatPrice, priceFor } from "../lib/currency";
import { useRegion } from "../lib/geo";
import { isPack, lookSlug, packDeal, plainName } from "../lib/presetDeal";

const splitList = (text?: string) =>
  String(text || "")
    .split(/\r?\n|;/)
    .map((s) => s.trim())
    .filter(Boolean);

const TIERS = ["Essential", "Graded", "Cinematic"];

/** The pack, opened up: every look with its three tiers, what it adds up to, and the free-future-looks promise. */
function PackInside({ looks, deal, onOpen }: { looks: any[]; deal: ReturnType<typeof packDeal>; onOpen: (p: any) => void }) {
  const count = looks.length;
  return (
    <section className="mt-9" aria-label="Inside the pack">
      <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border bg-border text-center">
        {[
          [String(count), "looks"],
          [String(count * TIERS.length), "presets"],
          [String(TIERS.length), "tiers each"],
        ].map(([n, l]) => (
          <div key={l} className="bg-card px-2 py-4">
            <dt className="font-serif text-3xl leading-none text-foreground">{n}</dt>
            <dd className="mt-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{l}</dd>
          </div>
        ))}
      </dl>

      <ul className="mt-4 space-y-3">
        {looks.map((p) => {
          const tags = String(p.tags || "").split(",").map((t) => t.trim()).filter(Boolean).slice(0, 3).join(" · ");
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onOpen(p)}
                className="press flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-3 text-left transition-colors hover:border-foreground/30"
              >
                <ImageWithFallback src={p.thumbnail} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold text-foreground">{plainName(p.name)}</span>
                  <span className="mt-0.5 block truncate text-[12px] capitalize text-muted-foreground">{tags}</span>
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {TIERS.map((t) => (
                      <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-foreground/75">
                        {t}
                      </span>
                    ))}
                  </span>
                </span>
                <span aria-hidden="true" className="pr-1 text-muted-foreground">→</span>
              </button>
            </li>
          );
        })}

        <li className="flex items-center gap-4 rounded-2xl border border-dashed border-amber-ink/50 p-3">
          <span aria-hidden="true" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted font-serif text-3xl text-amber-ink">+</span>
          <span className="min-w-0">
            <span className="block text-[15px] font-semibold text-foreground">The next look</span>
            <span className="mt-0.5 block text-[12px] text-muted-foreground">Added to the pack free, for everyone who owns it.</span>
          </span>
        </li>
      </ul>

      {deal && (
        <div className="mt-5 rounded-2xl bg-foreground px-5 py-4 text-background">
          <p className="text-[12px] uppercase tracking-[0.16em] opacity-70">Bought one by one</p>
          <p className="mt-1 flex items-baseline gap-3">
            <span className="text-lg opacity-60 line-through">{deal.separateLabel}</span>
            <span className="text-2xl font-semibold">{deal.packLabel}</span>
            <span className="ml-auto rounded-full bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground">Save {deal.saveLabel}</span>
          </p>
          <p className="mt-2 text-[12px] leading-5 opacity-75">The pack grows with every new look, and the price goes up with it. Buy now and every future look is already yours.</p>
        </div>
      )}
    </section>
  );
}

/** One collapsible block. Open by default for the parts people read first. */
function Section({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <details open={defaultOpen} className="group border-t border-border py-1">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-[15px] font-semibold text-foreground [&::-webkit-details-marker]:hidden">
        {title}
        <span className="ml-4 text-xl leading-none text-muted-foreground transition-transform duration-300 group-open:rotate-45">+</span>
      </summary>
      <div className="pb-5 text-[15px] leading-7 text-muted-foreground">{children}</div>
    </details>
  );
}

export default function PresetDetailPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const region = useRegion();

  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    getCatalogProducts("preset")
      .then((data) => setPresets([...data].sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999))))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  const preset = useMemo(() => presets.find((p) => lookSlug(p) === slug.toLowerCase()), [presets, slug]);
  const deal = packDeal(presets, region);
  const pack = isPack(preset);
  const name = pack ? preset?.name : plainName(preset?.name);

  const charge = preset && region ? priceFor(preset.price, region) : null;
  const priceLabel = preset ? formatPrice(preset.price, region) : "";

  const others = useMemo(() => presets.filter((p) => p !== preset && (pack ? !isPack(p) : true)), [presets, preset, pack]);
  const tags = String(preset?.tags || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 5);
  const included = splitList(preset?.whats_included);

  const buy = () => {
    if (!preset || !charge) return;
    navigate("/checkout", {
      state: {
        item: { id: preset.name, name: preset.name, amount: charge.amount, currency: charge.currency },
        image: preset.thumbnail,
        collection: preset.collection,
      },
    });
  };

  // Page title and description follow the look that is open.
  useEffect(() => {
    if (!preset) return;
    document.title = `${name}${pack ? "" : " Lightroom Preset"} | KEEMVERSE`;
  }, [preset, name, pack]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-6xl px-5 pt-10 md:px-8" aria-hidden="true">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="aspect-[3/4] rounded-3xl bg-muted" />
            <div className="space-y-4">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-12 w-3/4 rounded bg-muted" />
              <div className="h-24 rounded bg-muted" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!preset) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div>
          <p className="font-serif text-2xl text-foreground">{failed ? "Couldn't load this preset" : "We couldn't find that preset"}</p>
          <p className="mt-2 text-muted-foreground">{failed ? "Check your connection and try again." : "It may have moved or sold out."}</p>
          <Link to="/fashion/presets" className="press mt-6 inline-block rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background">
            See all presets
          </Link>
        </div>
      </div>
    );
  }

  const hasCompare = preset.before_image && preset.after_image;

  // Name and price: above the photo on phones, in the right column on desktop.
  const heading = (
    <>
      <p className="eyebrow text-amber-ink">
        {pack ? "Lightroom presets · the full pack" : `Lightroom preset · ${preset.collection}`}
      </p>
      <h1 className="mt-3 text-display-lg">{name}</h1>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="text-3xl font-semibold tracking-tight">{priceLabel || " "}</span>
        {pack && deal && <span className="rounded-full bg-foreground px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-background">Save {deal.saveLabel}</span>}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-5 pb-32 pt-6 md:px-8 md:pb-24 md:pt-10">
        <Link to="/fashion/presets" className="press inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
          <span aria-hidden="true">←</span> All presets
        </Link>

        <div className="mt-5 lg:hidden">{heading}</div>

        <div className="mt-6 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-16">
          {/* ---------- Pictures ---------- */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="lg:sticky lg:top-[calc(var(--nav-h,0px)+1.5rem)]"
          >
            {hasCompare ? (
              <BeforeAfter autoplay aspect="aspect-[3/4]" className="mx-auto max-w-md shadow-2xl lg:max-w-none" before={preset.before_image} after={preset.after_image} alt={name} />
            ) : (
              // No before/after photos (the pack): show the square image made for it, uncropped.
              <div className="mx-auto max-w-md overflow-hidden rounded-3xl bg-muted shadow-2xl lg:max-w-none">
                <ImageWithFallback
                  src={preset.thumbnail || preset.banner}
                  alt={name}
                  className={`w-full object-cover ${preset.thumbnail ? "aspect-square" : "aspect-video"}`}
                />
              </div>
            )}

            {preset.banner && hasCompare && (
              <figure className="mx-auto mt-5 max-w-md lg:max-w-none">
                <ImageWithFallback src={preset.banner} alt={`${name}, the three tiers`} className="aspect-video w-full rounded-2xl object-cover" />
                <figcaption className="mt-2 text-center text-[12px] text-muted-foreground">Essential, Cinematic and Graded on the same photo</figcaption>
              </figure>
            )}
          </motion.div>

          {/* ---------- Details ---------- */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hidden lg:block">{heading}</div>

            {tags.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <li key={t} className="rounded-full border border-border bg-card px-3 py-1 text-xs capitalize text-foreground/80">
                    {t}
                  </li>
                ))}
              </ul>
            )}

            {preset.description && <p className="mt-6 text-[16px] leading-8 text-muted-foreground">{preset.description}</p>}

            {/* Desktop buy button; phones get the sticky bar below */}
            <div className="mt-8 hidden md:block">
              <button
                onClick={buy}
                disabled={!charge}
                className="press group inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-7 py-4 text-sm font-semibold tracking-[0.12em] text-background shadow-xl transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                BUY NOW{priceLabel ? ` — ${priceLabel}` : ""}
                <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
              </button>
            </div>

            <ul className="mt-5 grid gap-2 text-[13px] text-muted-foreground sm:grid-cols-3 md:mt-4">
              <li className="flex items-start gap-2"><span aria-hidden="true" className="text-amber-ink">✓</span>Link by email as soon as you pay</li>
              <li className="flex items-start gap-2"><span aria-hidden="true" className="text-amber-ink">✓</span>Lightroom Mobile and Desktop</li>
              <li className="flex items-start gap-2"><span aria-hidden="true" className="text-amber-ink">✓</span>One payment, no subscription</li>
            </ul>

            {/* The pack, opened up */}
            {pack && others.length > 0 && (
              <PackInside looks={others} deal={deal} onOpen={(p) => navigate(`/fashion/presets/${lookSlug(p)}`)} />
            )}

            {/* Pack offer for a single look */}
            {!pack && deal && (
              <Link
                to={`/fashion/presets/${lookSlug(deal.pack)}`}
                className="press mt-8 block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/30"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-ink">Better value</p>
                <p className="mt-2 font-serif text-xl text-foreground">Want every look?</p>
                <p className="mt-1.5 text-[14px] leading-6 text-muted-foreground">
                  The Preset Pack has all {presets.filter((p) => !isPack(p)).length} looks and every look added later, free. {deal.packLabel}, so you save {deal.saveLabel} over buying them one by one.
                </p>
                <span className="mt-3 inline-block text-[13px] font-semibold text-foreground">See the pack →</span>
              </Link>
            )}

            {/* Details */}
            <div className="mt-10 border-b border-border">
              {included.length > 0 && (
                <Section title="What you get" defaultOpen>
                  <ul className="space-y-1.5">
                    {included.map((line) => (
                      <li key={line} className="flex items-start gap-2">
                        <span aria-hidden="true" className="mt-px text-amber-ink">✓</span>
                        {line}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
              {preset.why_created && <Section title="Why I made it">{preset.why_created}</Section>}
              {preset.installation && <Section title="How to install">{preset.installation}</Section>}
              {preset.compatible_with && <Section title="Works with">{preset.compatible_with}</Section>}
            </div>
          </motion.div>
        </div>

        {/* ---------- Other looks ---------- */}
        {!pack && others.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-6 text-display-md">More looks</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
              {others.map((p, i) => (
                <PresetCard
                  key={p.id}
                  name={p.name}
                  price={formatPrice(p.price, region)}
                  image={p.thumbnail}
                  collection={p.collection}
                  index={i}
                  badge={deal && isPack(p) ? `Save ${deal.saveLabel}` : undefined}
                  onOpen={() => navigate(`/fashion/presets/${lookSlug(p)}`)}
                />
              ))}
            </div>
          </section>
        )}

        <PresetFAQ />

        <p className="mt-10 text-center text-[13px] text-muted-foreground">
          Bought already? Get your links again on the{" "}
          <Link to="/fashion/presets" className="font-medium text-foreground underline underline-offset-4">
            Presets page
          </Link>{" "}
          under “Your downloads”.
        </p>
      </main>

      {/* Phone buy bar: sits just above the tab bar, and drops to the screen edge when the tabs slide away (.above-tabs) */}
      <div className="above-tabs fixed inset-x-0 z-30 border-t border-border/70 bg-background/95 px-5 py-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center gap-4">
          <div className="min-w-0">
            <p className="truncate text-[12px] text-muted-foreground">{name}</p>
            <p className="text-lg font-semibold leading-tight">{priceLabel || " "}</p>
          </div>
          <button
            onClick={buy}
            disabled={!charge}
            className="press ml-auto rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold tracking-[0.1em] text-background shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            BUY NOW
          </button>
        </div>
      </div>

      <SocialFooter />
    </div>
  );
}
