import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check } from 'lucide-react';
import { useContent } from '../../lib/siteContent';
import { useRegion } from '../../lib/geo';
import { formatPrice } from '../../lib/currency';
import { lookSlug, plainName, type PackDeal } from '../../lib/presetDeal';
import { Focus } from '../ui/Cine';
import { track } from '../../lib/track';

// "Which look is yours?" A visitor picks the photo they would post first. Choosing
// is a small commitment, the picked look then reads as theirs, and the pack is
// offered right next to it with its real saving. Every figure comes from the
// catalogue (nothing typed in), and there is no countdown or made-up scarcity.

export default function LookPicker({ looks, deal }: { looks: any[]; deal: PackDeal | null }) {
  const t = useContent();
  const region = useRegion();
  const reduce = useReducedMotion();
  const [pickedId, setPickedId] = useState<string | null>(null);
  const picked = looks.find((l) => String(l.id) === pickedId) ?? null;
  const tags = picked
    ? String(picked.tags || '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
        .slice(0, 3)
    : [];

  return (
    <div className="mx-auto mt-20 max-w-4xl md:mt-28">
      <Focus className="text-center" blur={false} y={14}>
        <h3 className="text-display-md">{t('home.picker_title')}</h3>
        <p className="mt-2 text-muted-foreground">{t('home.picker_sub')}</p>
      </Focus>

      <div role="radiogroup" aria-label="Pick a look" className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {looks.map((l, i) => {
          const on = String(l.id) === pickedId;
          const dim = pickedId !== null && !on;
          return (
            <Focus key={l.id} blur={false} y={24} delay={i * 0.07}>
              <button
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => {
                  setPickedId(String(l.id));
                  track('look_pick', { item: lookSlug(l) });
                }}
                className={`group spot cine-sheen relative block w-full overflow-hidden rounded-2xl text-left outline-offset-4 transition-all duration-500 ${
                  on ? 'ring-2 ring-[color:var(--fashion-display)] ring-offset-4 ring-offset-background' : ''
                } ${dim ? 'opacity-55 saturate-50' : ''}`}
                style={{ aspectRatio: '3 / 4' }}
              >
                <img
                  src={l.after_image}
                  alt={plainName(l.name)}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.05] motion-reduce:transition-none"
                />
                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/65 to-transparent" />
                <span className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 text-white">
                  <span className="font-[family-name:var(--font-display)] text-lg leading-tight">{plainName(l.name)}</span>
                  {on && (
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-black">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                </span>
              </button>
            </Focus>
          );
        })}
      </div>

      <div className="min-h-[1px]" aria-live="polite">
        <AnimatePresence mode="wait">
          {picked && (
            <motion.div
              key={picked.id}
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="glass mx-auto mt-8 max-w-2xl rounded-3xl p-6 text-center md:p-8"
            >
              <p className="eyebrow text-amber-ink">{t('home.picker_result')}</p>
              <p className="mt-3 font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3rem)] leading-none tracking-[-0.02em]">
                {plainName(picked.name)}
              </p>
              {tags.length > 0 && <p className="mt-3 text-[13px] capitalize text-muted-foreground">{tags.join('  ·  ')}</p>}
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to={`/fashion/presets/${lookSlug(picked)}`}
                  onClick={() => track('look_open', { item: lookSlug(picked), detail: 'picker' })}
                  className="press inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-7 text-sm font-semibold text-background transition-opacity hover:opacity-90"
                >
                  Get {plainName(picked.name)} · {formatPrice(picked.price, region)}
                </Link>
              </div>
              {deal && (
                <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Want them all? The Preset Pack holds all {deal.lookCount} looks and every look added later, for {deal.packLabel}: you save{' '}
                  <strong className="text-foreground">{deal.saveLabel}</strong>. The pack price rises as new looks are added.{' '}
                  <Link
                    to="/fashion/presets/pack"
                    onClick={() => track('pack_click', { item: 'pack', detail: 'picker' })}
                    className="text-foreground underline underline-offset-4"
                  >
                    See the pack
                  </Link>
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-muted-foreground">
        {['Download link sent to your email', 'Lightroom Mobile and Desktop', 'Three depth tiers in every look'].map((x) => (
          <li key={x} className="inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-[color:var(--craft-ink)]" aria-hidden="true" />
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}
