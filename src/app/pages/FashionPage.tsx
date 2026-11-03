import fashionFindsHero from '../../imports/fashion-finds-hero.webp';
import photoPresetsHero from '../../imports/photo-presets-hero.webp';
import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { SocialFooter } from '../components/SocialFooter';
import { BookMeModal } from '../components/BookMeModal';
import UniverseShopCard from "../components/UniverseShopCard";
import SharedSectionDivider from '../components/SectionDivider';
import { useContent } from '../lib/siteContent';
import { GeometricBackdrop } from '../components/GeometricBackdrop';
import { FASHION, FASHION_DARK } from '../lib/theme';
import img1 from '../../imports/IMG_7304.webp';
import img2 from '../../imports/IMG_7549.webp';
import img3 from '../../imports/IMG_4929.webp';
import img4 from '../../imports/IMG_6867_Original.webp';
import img5 from '../../imports/IMG_8935.webp';
import modelingImg from '../../imports/trend-territory-modeling-portrait.webp';

const carouselImages = [img1, img2, img3, img4, img5];

// Two offers only: collaborations already include creative direction on set, and
// modeling is for select campaigns. Both open the same "Book me" pop-up (DMs).
const services = [
  {
    title: 'Brand Collaborations',
    tag: 'Open for brands',
    desc: 'Authentic content, creative direction on set and promotion for brands that fit.',
    points: ['Content', 'Creative direction', 'TikTok + Instagram'],
    word: 'Collab',
    image: img2,
    position: '50% 55%',
  },
  {
    title: 'Brand Modeling',
    tag: 'Select campaigns',
    desc: 'Available for fashion, lifestyle and creative campaigns that suit the look.',
    points: ['Fashion', 'Lifestyle', 'Creative campaigns'],
    word: 'Model',
    image: modelingImg,
    position: '50% 50%',
  },
];

const shop = [
  {
    title: 'Fashion Finds',
    description: 'Curated products, discoveries, and recommendations.',
    image: fashionFindsHero,
    cta: 'Browse Finds',
    tag: 'LIVE',
    href: '/fashion/finds',
  },
  {
    title: 'Lightroom Presets',
    description: 'Premium editing presets.',
    image: photoPresetsHero,
    cta: 'Get Presets',
    tag: 'LIVE',
    href: '/fashion/presets',
  },
];

// Round "Book me" button with the words circling it. Turns slowly; still for reduced motion.
function BookBadge({ id, label, onClick, className }: { id: string; label: string; onClick: () => void; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`group/badge grid h-28 w-28 place-items-center rounded-full bg-[#D98E2B] text-[#0F0F11] shadow-[0_14px_44px_-12px_rgba(217,142,43,0.65)] transition-transform duration-300 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D98E2B] md:h-32 md:w-32 ${className ?? ''}`}
    >
      <motion.svg
        viewBox="0 0 100 100"
        aria-hidden
        className="col-start-1 row-start-1 h-full w-full"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      >
        <defs>
          <path id={id} d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
        </defs>
        <text fontSize="9" fontWeight="700" fill="currentColor" textLength="228" lengthAdjust="spacing">
          <textPath href={`#${id}`}>BOOK ME • BOOK ME • BOOK ME • </textPath>
        </text>
      </motion.svg>
      <span aria-hidden className="col-start-1 row-start-1 text-3xl leading-none transition-transform duration-300 group-hover/badge:rotate-45">↗</span>
    </button>
  );
}

const marquee = ['Brand collaborations', 'Creative direction on set', 'Brand modeling', 'TikTok + Instagram'];

export function FashionPage() {
  const t = useContent();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [bookTopic, setBookTopic] = useState<string | null>(null);
  const workRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress: workProgress } = useScroll({ target: workRef, offset: ['start end', 'end start'] });
  const driftA = useTransform(workProgress, [0, 1], reduceMotion ? [0, 0] : [48, -48]);
  const driftB = useTransform(workProgress, [0, 1], reduceMotion ? [0, 0] : [-32, 64]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % carouselImages.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <GeometricBackdrop />
      <BookMeModal open={bookTopic !== null} topic={bookTopic ?? undefined} onClose={() => setBookTopic(null)} />

      <main className="relative z-10 pt-8 pb-0 px-5 md:px-8">
        <div className="max-w-6xl mx-auto">

          {/* ── HERO ── */}
          <section>
            {/* Carousel container */}
            <div
              className="relative w-full overflow-hidden rounded-3xl"
              style={{ aspectRatio: '3/4', maxHeight: '90vh' }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {/* Stacked crossfade images */}
              {carouselImages.map((img, i) => (
                <div
                  key={i}
                  className="absolute inset-0 transition-[opacity,transform] motion-reduce:transition-none"
                  style={{
                    opacity: i === current ? 1 : 0,
                    transform: i === current ? 'scale(1.06)' : 'scale(1)',
                    transitionDuration: i === current ? '2000ms, 7000ms' : '2000ms, 0ms',
                    transitionTimingFunction: 'ease-in-out, linear',
                  }}
                >
                  <ImageWithFallback
                    src={img}
                    alt={`Fashion editorial ${i + 1}`}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              ))}

              {/* Bottom gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/85 via-stone-900/35 to-transparent pointer-events-none" />

              {/* Fixed hero copy */}
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-14">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  style={{
                    filter: 'drop-shadow(0 0 12px rgba(29, 28, 25, 0.25))'
                  }}
                >
                  <p className="eyebrow text-white/70 mb-3">
                    {t('fashion.eyebrow')}
                  </p>
                  <h1 className="text-display-lg max-w-[18ch] text-white">
                    {t('fashion.headline')}
                  </h1>
                </motion.div>
              </div>

              {/* Slide controls */}
              <div className="absolute bottom-6 right-6 flex items-center gap-1 md:right-8">
                {carouselImages.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Show photo ${i + 1} of ${carouselImages.length}`}
                    aria-current={i === current}
                    onClick={() => setCurrent(i)}
                    className="grid h-6 place-items-center px-0.5"
                  >
                    <span
                      className="block rounded-full transition-all duration-500"
                      style={{
                        width: i === current ? '20px' : '6px',
                        height: '6px',
                        backgroundColor: i === current ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.4)',
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── INTRO ── */}
          <section className="mt-16">
            <div className="max-w-xl mx-auto text-center">
              <p className="text-foreground/80 font-medium text-lg md:text-xl mb-4">
                {t('fashion.intro_hi')}
              </p>
              <h2 className="text-display-md mb-6 text-foreground">
                {t('fashion.intro_title')}
              </h2>
              <p className="text-muted-foreground leading-loose text-base md:text-lg">
                {t('fashion.intro_body')}
              </p>
            </div>
          </section>

          {/* ── WORK WITH ME ── */}
          <section className="mt-24">
            <SharedSectionDivider label="Work with me" />
            {/* Media kit link removed while /fashion/media-kit is held in
                draft — add back once that page is routed live again. */}
            {/* Two arches, staggered, with giant type across them. Photos drift at different speeds
                on scroll; the round badge is the Book me button. */}
            <div ref={workRef} className="relative -mx-5 mt-6 overflow-x-clip px-5 pb-6 md:-mx-8 md:mt-10 md:px-8">
              <div className="mx-auto flex max-w-6xl flex-col gap-20 lg:grid lg:grid-cols-12 lg:gap-x-10 lg:gap-y-0">
                {services.map((svc, i) => (
                  <motion.figure
                    key={svc.title}
                    style={{ y: i === 0 ? driftA : driftB }}
                    className={
                      i === 0
                        ? 'relative w-[84%] max-w-[26rem] self-start md:max-w-[28rem] lg:col-span-5 lg:col-start-1 lg:w-auto lg:max-w-none'
                        : 'relative w-[84%] max-w-[26rem] self-end md:max-w-[28rem] lg:col-span-6 lg:col-start-7 lg:mt-32 lg:w-auto lg:max-w-none'
                    }
                  >
                    <div className="group relative">
                      <div className="relative aspect-[3/4] overflow-hidden rounded-b-3xl rounded-t-[999px] bg-muted">
                        <ImageWithFallback
                          src={svc.image}
                          alt={`${svc.title}: Keem in a brand shoot`}
                          className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                          style={{ objectPosition: svc.position }}
                        />
                      </div>
                      <span
                        aria-hidden
                        className={`pointer-events-none absolute top-[9%] select-none whitespace-nowrap font-[family-name:var(--font-display)] text-[clamp(3.6rem,15vw,9.5rem)] italic leading-[0.85] tracking-[-0.03em] text-white ${
                          i === 0 ? '-left-[3%] mix-blend-difference' : 'right-[3%] text-right drop-shadow-[0_2px_18px_rgba(0,0,0,0.25)]'
                        }`}
                      >
                        {svc.word}
                      </span>
                      <BookBadge
                        id={`book-badge-${i}`}
                        label={`Book me for ${svc.title}`}
                        onClick={() => setBookTopic(svc.title)}
                        className={`absolute -bottom-8 ${i === 0 ? '-right-3 md:-right-6' : '-left-3 md:-left-6'}`}
                      />
                    </div>
                    <figcaption className={`mt-10 max-w-[36ch] ${i === 0 ? '' : 'lg:ml-auto'}`}>
                      <span className="inline-flex rounded-full border border-border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                        {svc.tag}
                      </span>
                      <h3 className="mt-4 text-display-md text-foreground">{svc.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">{svc.desc}</p>
                      <p className="mt-3 text-xs tracking-wide text-muted-foreground/70">{svc.points.join('  ·  ')}</p>
                    </figcaption>
                  </motion.figure>
                ))}
              </div>

              {/* Drifting strip of what is on offer */}
              <div aria-hidden className="-mx-5 mt-24 overflow-hidden border-y border-border py-5 md:-mx-8">
                <motion.div
                  className="flex w-max gap-10 whitespace-nowrap"
                  animate={reduceMotion ? undefined : { x: ['0%', '-50%'] }}
                  transition={{ duration: 38, repeat: Infinity, ease: 'linear' }}
                >
                  {[0, 1].map((dup) => (
                    <div key={dup} className="flex shrink-0 items-center gap-10">
                      {marquee.map((m) => (
                        <React.Fragment key={m}>
                          <span className="text-display-md italic text-foreground/30">{m}</span>
                          <span className="text-amber-ink">✦</span>
                        </React.Fragment>
                      ))}
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </section>

          {/* ── SHOP ── */}
          <section className="mt-24">
            <SharedSectionDivider label="Shop" />
            <div className="grid grid-cols-2 gap-3 md:gap-8 max-w-5xl mx-auto">
              {shop.map((item, i) => (
  <UniverseShopCard
    key={item.title}
    title={item.title}
    description={item.description}
    image={item.image}
    cta={item.cta}
    href={item.href}
    tag={item.tag}
    index={i}
    accent={FASHION}
    accentDark={FASHION_DARK}
  />
))}
            </div>
          </section>

        </div>
      </main>

      <SocialFooter />
    </div>
  );
}
