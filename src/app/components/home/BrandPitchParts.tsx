import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { CINE_EASE } from '../../lib/cine';
import { BookMeModal } from '../BookMeModal';
import { useContent } from '../../lib/siteContent';
import { Focus } from '../ui/Cine';
import { track } from '../../lib/track';
import soloImg from '../../../imports/pack-solo-pinstripe.webp';
import duoImg from '../../../imports/pack-duo-yoruba.webp';
import retainerImg from '../../../imports/pack-retainer-green-stripe.webp';
import contentSoloImg from '../../../imports/pack-content-solo.webp';
import contentDuoImg from '../../../imports/pack-content-duo.webp';
import contentVideoImg from '../../../imports/pack-content-video.webp';
import { Check } from 'lucide-react';
import { formatPrice } from '../../lib/currency';
import { useRegion } from '../../lib/geo';
import { useGallery } from '../../lib/useGallery';

// The pieces of the brand pitch. The home page shows only a taste (the headline
// and the proof numbers); the full pitch lives on /brands, where brands who are
// interested in working together land. Both use these parts.
//
// Numbers are Keem's own TikTok Studio, last 365 days to 9 Nov 2026. Update the
// STATS and the PRICES together with the Rate Card tab when they change.

const STATS = [
  { value: '10.7M', label: 'video views' },
  { value: '6.9M', label: 'people reached' },
  { value: '47%', label: 'of viewers are women' },
  { value: '66%', label: 'are aged 18 to 24' },
];

const STEPS = [
  { n: '01', title: 'Pick a package', line: 'Choose whether I post it on my pages, or just hand you the content.' },
  { n: '02', title: 'Send the pieces', line: 'Up to three outfits from your range. After you book, I tell you where to send them.' },
  { n: '03', title: 'I style and film it', line: 'Posted packages go live within 7 days of delivery. Content-only packages arrive as files.' },
];

// Two ways to work together. "posted": I make it and post it on my own pages.
// "content": I make it and hand over the files; the brand posts it themselves.
// Prices live in this file and in the Rate Card tab: change them in both.
type Mode = 'posted' | 'content';

const MODES: Record<Mode, { tab: string; label: string; blurb: string }> = {
  posted: {
    tab: 'I want it posted',
    label: 'posted on my pages',
    blurb: 'I post the story on my TikTok, Instagram and Pinterest, and send you a short sales report after 7 days.',
  },
  content: {
    tab: 'Just the content',
    label: 'content only',
    blurb: 'I make it and hand you the files. You post it on your own channels and can use it for 12 months. I do not post it, and there is no sales report.',
  },
};

type Pack = {
  id: string;
  mode: Mode;
  title: string;
  line: string;
  includes: string[];
  duration: string;
  price: number;
  suffix?: string;
  img: string;
  pos: string;
  alt: string;
  tag?: string;
};

const POSTED_ITEMS = [
  '1 TikTok video',
  '1 TikTok photo carousel',
  '1 Instagram Reel',
  '5 Pinterest pins',
  'Goes up within 7 days',
  '1 round of edits before it posts',
  'Sales report after 7 days',
];
const POSTED_LIVE = 'Posts stay live on my pages for at least 30 days.';
const CONTENT_USE = 'Yours to use on your own channels for 12 months.';

const PACKS: Pack[] = [
  {
    id: 'solo-posted',
    mode: 'posted',
    title: 'Solo Outfit Story',
    line: 'Just me, in up to three of your outfits.',
    includes: POSTED_ITEMS,
    duration: POSTED_LIVE,
    price: 250000,
    img: soloImg,
    pos: '50% 40%',
    alt: 'A solo outfit story: wide pinstripe trousers and a white shirt with a tie',
  },
  {
    id: 'duo-posted',
    mode: 'posted',
    title: 'Duo Outfit Story',
    line: 'Two of us, in up to three outfits. The format that has done best for me.',
    includes: ['Two of us in frame', ...POSTED_ITEMS],
    duration: POSTED_LIVE,
    price: 350000,
    img: duoImg,
    pos: '50% 45%',
    alt: 'A duo outfit story: a pair in matching native wear at a sacred grove',
    tag: 'Strongest format',
  },
  {
    id: 'retainer',
    mode: 'posted',
    title: 'Monthly Retainer',
    line: 'A steady drip of stories, solo or duo, all month.',
    includes: [
      '4 outfit stories a month',
      '4 TikTok videos and 4 carousels',
      '4 Instagram Reels',
      '20 Pinterest pins',
      'About one story goes up a week',
      'Sales report every month',
    ],
    duration: '3-month minimum. Posts stay live for at least 30 days.',
    price: 300000,
    suffix: ' a month',
    img: retainerImg,
    pos: '50% 40%',
    alt: 'A monthly series: a pair in matching green striped polos outside a building',
  },
  {
    id: 'solo-photos',
    mode: 'content',
    title: 'Solo Photo Set',
    line: 'Edited photos of your pieces, with just me in frame.',
    includes: ['12 edited photos from one shoot', 'Up to 3 of your outfits', 'Files delivered within 7 days', 'You post them yourself'],
    duration: CONTENT_USE,
    price: 150000,
    img: contentSoloImg,
    pos: '50% 35%',
    alt: 'A solo studio look: a white shirt, tan shorts and green shoes, stepping onto a box',
  },
  {
    id: 'duo-photos',
    mode: 'content',
    title: 'Duo Photo Set',
    line: 'Edited photos of your pieces on the two of us.',
    includes: ['12 edited photos from one shoot', 'Up to 3 of your outfits', 'Two of us in frame', 'Files delivered within 7 days', 'You post them yourself'],
    duration: CONTENT_USE,
    price: 220000,
    img: contentDuoImg,
    pos: '50% 40%',
    alt: 'A pair in matching cream and green outfits, walking on grass',
  },
  {
    id: 'photo-video',
    mode: 'content',
    title: 'Photos and Video',
    line: 'The photo set plus a short vertical video.',
    includes: ['12 edited photos', '1 vertical video, 30 to 45 seconds', 'Solo or duo, you choose', 'Files delivered within 10 days', 'You post them yourself'],
    duration: CONTENT_USE,
    price: 300000,
    img: contentVideoImg,
    pos: '50% 40%',
    alt: 'A calm studio portrait in a beige two-piece set',
  },
];

export function ProofBand() {
  return (
    <Focus blur={false} y={20} delay={0.1}>
      <div className="border-y border-border py-8 md:py-10">
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
  );
}

// The stories are the "Main page pictures" in the admin (/admin/home-pictures):
// the first four visible ones, in order. They are separate from the Gallery.
function useStories() {
  return useGallery('home').slice(0, 4);
}

// The stories as a magazine spread: two across on a phone (four across on a
// desktop), the second column dropped a little so the grid is not a flat wall.
// Each frame slides in from its own side, the picture wipes up and settles.
export function StoriesRow({ bare = false }: { bare?: boolean }) {
  const reduce = useReducedMotion();
  const stories = useStories();
  const view = { once: true, margin: '0px 0px -8% 0px' };

  return (
    <div>
      {!bare && (
        <Focus as="p" blur={false} y={10} className="eyebrow text-amber-ink">
          Recent stories
        </Focus>
      )}
      <div className={(bare ? '' : 'mt-5 ') + 'overflow-x-clip grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-5 md:gap-y-0'}>
        {stories.map((st, i) => {
          const fromLeft = i % 2 === 0;
          const delay = (i % 2) * 0.14 + Math.floor(i / 2) * 0.06;
          return (
            <motion.figure
              key={st.id}
              initial={reduce ? false : { opacity: 0, x: fromLeft ? -64 : 64, y: 40 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={view}
              transition={{ duration: 1.05, delay, ease: CINE_EASE }}
              className={'group ' + (i % 2 === 1 ? 'mt-8 md:mt-14' : '')}
            >
              <motion.div
                initial={reduce ? false : { clipPath: 'inset(100% 0% 0% 0%)' }}
                whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
                viewport={view}
                transition={{ duration: 1.25, delay: delay + 0.08, ease: CINE_EASE }}
                className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted"
              >
                <motion.img
                  src={st.thumbUrl}
                  alt={`${st.title}: ${st.note}`}
                  loading="lazy"
                  draggable={false}
                  style={{ objectPosition: st.position }}
                  initial={reduce ? false : { scale: 1.2 }}
                  whileInView={{ scale: 1 }}
                  viewport={view}
                  transition={{ duration: 1.8, delay: delay + 0.08, ease: CINE_EASE }}
                  className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                />
              </motion.div>
              <motion.figcaption
                initial={reduce ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={view}
                transition={{ duration: 0.8, delay: delay + 0.55, ease: CINE_EASE }}
                className="mt-3 flex items-baseline justify-between gap-2"
              >
                <span className="font-[family-name:var(--font-display)] text-lg leading-tight text-foreground md:text-xl">{st.title}</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{st.kind}</span>
              </motion.figcaption>
            </motion.figure>
          );
        })}
      </div>
    </div>
  );
}

export function StepsList() {
  return (
    <ol className="grid gap-8 md:grid-cols-3 md:gap-10">
      {STEPS.map((s, i) => (
        <Focus key={s.n} as="li" blur={false} y={22} delay={0.08 * i}>
          <span className="font-[family-name:var(--font-display)] text-5xl italic leading-none text-amber-ink/70">{s.n}</span>
          <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl leading-tight md:text-3xl">{s.title}</h3>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{s.line}</p>
        </Focus>
      ))}
    </ol>
  );
}

export function PacksGrid() {
  const t = useContent();
  const region = useRegion();
  const [mode, setMode] = useState<Mode>('posted');
  const [topic, setTopic] = useState<string | null>(null);
  // Prices stay out of sight until someone asks: the work and the proof come first.
  const [priced, setPriced] = useState<Record<string, boolean>>({});
  // The rate card pictures are edited at /admin/rate-cards; the bundled ones are the fallback.
  const pics = useGallery('packs');
  const shown = PACKS.filter((p) => p.mode === mode).map((p) => {
    const pic = pics.find((x) => x.id === p.id);
    return pic ? { ...p, img: pic.thumbUrl, pos: pic.position } : p;
  });

  const open = (p: Pack) => {
    track('brand_click', { item: p.title, detail: p.mode });
    setTopic(p.title + ' (' + MODES[p.mode].label + ')');
  };

  return (
    <>
      <Focus blur={false} y={16}>
        <div role="tablist" aria-label="How do you want it delivered?" className="inline-flex rounded-full border border-border p-1">
          {(Object.keys(MODES) as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => {
                setMode(m);
                track('brand_click', { item: 'mode', detail: m });
              }}
              className={'press h-11 rounded-full px-5 text-sm font-semibold transition-colors ' + (mode === m ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}
            >
              {MODES[m].tab}
            </button>
          ))}
        </div>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">{MODES[mode].blurb}</p>
      </Focus>

      <div
        key={mode}
        className="-mx-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0"
      >
        {shown.map((p, i) => {
          const price = formatPrice(p.price, region, 'NGN');
          return (
            <Focus key={p.id} blur={false} y={26} delay={0.08 * i} className="w-[84%] shrink-0 snap-start md:w-auto">
              <article className={'group no-glass relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card ' + (p.tag ? 'ring-1 ring-amber-ink/40' : '')}>
                <div className="relative aspect-[5/4] overflow-hidden">
                  <img
                    src={p.img}
                    alt={p.alt}
                    loading="lazy"
                    draggable={false}
                    style={{ objectPosition: p.pos }}
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
                  />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  {p.tag && (
                    <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground">
                      {p.tag}
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="font-[family-name:var(--font-display)] text-3xl leading-tight text-white">{p.title}</h3>
                    <p className="mt-1 max-w-xs text-sm leading-snug text-white/80">{p.line}</p>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5 md:p-6">
                  <ul className="space-y-2 text-sm leading-snug">
                    {p.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-ink" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">{p.duration}</p>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                    {priced[p.id] && price ? (
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
                          if (price) setPriced((prev) => ({ ...prev, [p.id]: true }));
                          else open(p);
                        }}
                        className="press inline-flex min-h-11 items-center text-sm text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
                      >
                        See pricing
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => open(p)}
                      className="press inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
                    >
                      Book <span aria-hidden="true">↗</span>
                    </button>
                  </div>
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
    </>
  );
}
