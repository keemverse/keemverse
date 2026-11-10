import { useState } from 'react';
import { BookMeModal } from '../BookMeModal';
import { useContent } from '../../lib/siteContent';
import { Focus } from '../ui/Cine';
import { track } from '../../lib/track';
import soloImg from '../../../imports/pack-solo-pinstripe.webp';
import duoImg from '../../../imports/pack-duo-yoruba.webp';
import retainerImg from '../../../imports/pack-retainer-green-stripe.webp';
import { formatPrice } from '../../lib/currency';
import { useRegion } from '../../lib/geo';

// The brand pitch. This is the page's job now: a fashion brand lands here and
// can answer three questions in half a minute. Will my clothes look good (the
// photos), will the right people see it (the numbers), and what does it cost
// and how do I start (the packages and the button).
//
// Numbers are Keem's own TikTok Studio, last 365 days to 9 Nov 2026. Update the
// STATS and the PRICES together with the Rate Card tab when they change.

const STATS = [
  { value: '10.7M', label: 'video views' },
  { value: '6.9M', label: 'people reached' },
  { value: '47%', label: 'of viewers are women' },
  { value: '80%', label: 'watch from Nigeria' },
];

// My biggest posts of the last 365 days (TikTok Studio, to 9 Nov 2026), views rounded.
const POSTS = [
  { title: 'Vintage couple style', when: 'Oct 2025', views: 1000000, label: '1M' },
  { title: 'Green and black palette, for two', when: '7 months ago', views: 610000, label: '610K' },
  { title: 'A visual love story, in outfits', when: '9 months ago', views: 567000, label: '567K' },
  { title: 'Minimal outfits, a cinematic story for two', when: '6 months ago', views: 506000, label: '506K' },
  { title: 'Monochrome, in structure and presence', when: '2 months ago', views: 492000, label: '492K' },
  { title: 'An effortless outfit idea for two', when: '5 months ago', views: 481000, label: '481K' },
];

const STEPS = [
  { n: '01', title: 'Send the pieces', line: 'Three outfits from your range, or a list I can pick up. I plan the story with you.' },
  { n: '02', title: 'I style and shoot', line: 'A solo or duo outfit story: video, carousel, Reel and Pinterest pins.' },
  { n: '03', title: 'You see what sold', line: 'Every post carries a WhatsApp tag and your code, with a short sales report after 7 days.' },
];

type Pack = {
  title: string;
  line: string;
  price: number;
  suffix?: string;
  img: string;
  pos: string;
  alt: string;
  tag?: string;
};

const PACKS: Pack[] = [
  { title: 'Solo Outfit Story', line: 'One model, up to three of your outfits.', price: 250000, img: soloImg, pos: '50% 40%', alt: 'A solo outfit story: wide pinstripe trousers and a white shirt with a tie' },
  {
    title: 'Duo Outfit Story',
    line: 'Two models, up to three outfits. The format that has travelled furthest.',
    price: 350000,
    img: duoImg,
    pos: '50% 45%',
    alt: 'A duo outfit story: a pair in matching native wear at a sacred grove',
    tag: 'Strongest format',
  },
  { title: 'Monthly Retainer', line: 'Four stories a month, solo or duo, with a monthly sales report. Three month minimum.', price: 300000, suffix: ' a month', img: retainerImg, pos: '50% 40%', alt: 'A monthly series: a pair in matching green striped polos outside a building' },
];

export default function HomeBrands() {
  const t = useContent();
  const region = useRegion();
  const [topic, setTopic] = useState<string | null>(null);
  // Prices stay out of sight until someone asks: the work and the proof come first.
  const [priced, setPriced] = useState<Record<string, boolean>>({});

  const open = (name: string) => {
    track('brand_click', { item: name });
    setTopic(name);
  };

  return (
    <section id="for-brands" className="mt-24 scroll-mt-24 md:mt-36" aria-label="For brands">
      <Focus as="p" blur={false} y={10} className="eyebrow text-amber-ink">
        {t('home.brands_eyebrow')}
      </Focus>
      {/* Focus, not MaskLine: the title wraps to several lines and MaskLine is for single lines. */}
      <Focus blur={false} y={26} delay={0.05}>
        <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-[clamp(2.25rem,6.4vw,4.75rem)] leading-[1.02] tracking-[-0.025em]">
          {t('home.brands_title')}
        </h2>
      </Focus>
      <Focus as="p" blur={false} y={12} delay={0.12} className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
        {t('home.brands_lede')}
      </Focus>

      {/* Proof */}
      <Focus blur={false} y={20} delay={0.1} className="mt-10">
        <div className="glass sheen overflow-hidden rounded-3xl px-5 py-7 md:px-10 md:py-9">
          <dl className="grid grid-cols-2 gap-y-7 md:grid-cols-4 md:gap-y-0">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col px-2 md:px-6 ${i > 0 ? 'md:border-l md:border-border' : ''} ${i % 2 === 1 ? 'border-l border-border md:border-l' : ''}`}
              >
                <dt className="order-2 mt-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">{s.label}</dt>
                <dd className="font-[family-name:var(--font-display)] text-[clamp(2.4rem,7vw,4.25rem)] leading-none tracking-[-0.03em] text-foreground tabular-nums">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-7 text-xs text-muted-foreground">
            From my own TikTok Studio: the last 365 days, to 9 Nov 2026. Six of my seven biggest posts are outfits for two.
          </p>
        </div>
      </Focus>

      {/* Best posts */}
      <Focus blur={false} y={20} className="mt-14">
        <p className="eyebrow text-amber-ink">My biggest posts this year</p>
        <ul className="mt-5 divide-y divide-border border-y border-border">
          {POSTS.map((p) => (
            <li key={p.title} className="grid grid-cols-[1fr_auto] items-end gap-x-4 py-4 md:py-5">
              <div className="min-w-0">
                <p className="font-[family-name:var(--font-display)] text-lg leading-snug md:text-2xl">{p.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{p.when}</p>
              </div>
              <p className="font-[family-name:var(--font-display)] text-2xl tabular-nums md:text-4xl">
                {p.label} <span className="text-xs font-normal text-muted-foreground md:text-sm">views</span>
              </p>
              <div aria-hidden="true" className="col-span-2 mt-3 h-[3px] overflow-hidden rounded-full bg-border/60">
                <div className="h-full rounded-full bg-amber-ink/80" style={{ width: `${Math.round((p.views / 1000000) * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </Focus>

      {/* How it works */}
      <ol className="mt-16 grid gap-8 md:grid-cols-3 md:gap-10">
        {STEPS.map((s, i) => (
          <Focus key={s.n} as="li" blur={false} y={22} delay={0.08 * i}>
            <span className="font-[family-name:var(--font-display)] text-5xl italic leading-none text-amber-ink/70">{s.n}</span>
            <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl leading-tight md:text-3xl">{s.title}</h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{s.line}</p>
          </Focus>
        ))}
      </ol>

      {/* Packages */}
      <div className="-mx-5 mt-16 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
        {PACKS.map((p, i) => {
          const price = formatPrice(p.price, region, 'NGN');
          return (
            <Focus key={p.title} blur={false} y={26} delay={0.08 * i} className="w-[78%] shrink-0 snap-start md:w-auto">
              <article
                className={`group glass relative flex h-full flex-col overflow-hidden rounded-3xl ${
                  p.tag ? 'ring-1 ring-amber-ink/40' : ''
                }`}
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={p.img}
                    alt={p.alt}
                    loading="lazy"
                    draggable={false}
                    style={{ objectPosition: p.pos }}
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
                  />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  {p.tag && (
                    <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground">
                      {p.tag}
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                    <h3 className="font-[family-name:var(--font-display)] text-3xl leading-tight text-white">{p.title}</h3>
                    <p className="mt-1.5 max-w-xs text-sm leading-snug text-white/80">{p.line}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 p-5 md:p-6">
                  {priced[p.title] && price ? (
                    <p className="text-sm text-muted-foreground">
                      from{' '}
                      <span className="font-[family-name:var(--font-display)] text-2xl text-foreground tabular-nums">{price}</span>
                      {p.suffix}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        track('brand_click', { item: p.title, detail: 'see-pricing' });
                        if (price) setPriced((prev) => ({ ...prev, [p.title]: true }));
                        else open(p.title);
                      }}
                      className="press text-sm text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
                    >
                      See pricing
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => open(p.title)}
                    className="press inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
                  >
                    Book <span aria-hidden="true">↗</span>
                  </button>
                </div>
              </article>
            </Focus>
          );
        })}
      </div>

      <Focus as="p" blur={false} y={10} delay={0.1} className="mt-8 max-w-xl text-sm leading-relaxed text-muted-foreground">
        {t('home.brands_note')}
      </Focus>

      <BookMeModal open={topic !== null} topic={topic ?? undefined} onClose={() => setTopic(null)} />
    </section>
  );
}
