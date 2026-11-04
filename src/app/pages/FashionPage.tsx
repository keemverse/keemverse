import { Focus, MaskLine } from '../components/ui/Cine';
import { CINE_EASE } from '../lib/cine';
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

const marquee = ['Brand collaborations', 'Creative direction on set', 'Brand modeling', 'TikTok + Instagram'];

export function FashionPage() {
  const t = useContent();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [bookTopic, setBookTopic] = useState<string | null>(null);
  const workRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress: workProgress } = useScroll({ target: workRef, offset: ['start end', 'end start'] });
  const driftA = useTransform(workProgress, [0, 1], reduceMotion ? [0, 0] : [24, -24]);
  const driftB = useTransform(workProgress, [0, 1], reduceMotion ? [0, 0] : [-16, 32]);

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
            <motion.div
              initial={{ opacity: 0, scale: 0.965 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: CINE_EASE }}
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
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, delay: 0.6, ease: CINE_EASE }}
                  style={{
                    filter: 'drop-shadow(0 0 12px rgba(29, 28, 25, 0.25))'
                  }}
                >
                  <p className="eyebrow text-white/70 mb-3">
                    {t('fashion.eyebrow')}
                  </p>
                  <h1 className="text-display-lg max-w-[18ch] text-white">
                    <MaskLine immediate delay={0.7}>{t('fashion.headline')}</MaskLine>
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
            </motion.div>
          </section>

          {/* ── INTRO ── */}
          <section className="mt-16">
            <Focus className="max-w-xl mx-auto text-center">
              <p className="text-foreground/80 font-medium text-lg md:text-xl mb-4">
                {t('fashion.intro_hi')}
              </p>
              <h2 className="text-display-md mb-6 text-foreground">
                {t('fashion.intro_title')}
              </h2>
              <p className="text-muted-foreground leading-loose text-base md:text-lg">
                {t('fashion.intro_body')}
              </p>
            </Focus>
          </section>

          {/* ── WORK WITH ME ── */}
          <section className="mt-24">
            <SharedSectionDivider label="Work with me" />
            {/* Media kit link removed while /fashion/media-kit is held in
                draft — add back once that page is routed live again. */}
            {/* Two arches, staggered, with giant type across them. Photos drift at different speeds
                on scroll; the round badge is the Book me button. */}
            <div ref={workRef} className="relative -mx-5 mt-6 overflow-x-clip px-5 pb-6 md:-mx-8 md:mt-10 md:px-8">
              <div className="mx-auto flex max-w-6xl flex-col gap-16 lg:grid lg:grid-cols-12 lg:gap-x-10 lg:gap-y-0">
                {services.map((svc, i) => (
                  <motion.figure
                    key={svc.title}
                    style={{ y: i === 0 ? driftA : driftB }}
                    className={
                      i === 0
                        ? 'relative w-[62%] min-w-[11rem] max-w-[17rem] self-start md:max-w-[19rem] lg:col-span-4 lg:col-start-2 lg:w-auto lg:max-w-none'
                        : 'relative w-[62%] min-w-[11rem] max-w-[17rem] self-end md:max-w-[19rem] lg:col-span-4 lg:col-start-7 lg:mt-28 lg:w-auto lg:max-w-none'
                    }
                  >
                    {/* The word rests on the arch like a crown, in the page's own text colour so it reads on light and dark. */}
                    <span
                      aria-hidden
                      className={`relative z-10 -mb-[0.1em] block select-none whitespace-nowrap font-[family-name:var(--font-display)] text-[clamp(3rem,13vw,5.5rem)] italic leading-[0.9] tracking-[-0.03em] text-foreground ${
                        i === 0 ? '' : 'text-right'
                      }`}
                    >
                      {svc.word}
                    </span>
                    <div className="group relative aspect-[3/4] overflow-hidden rounded-b-3xl rounded-t-[999px] bg-muted">
                      <ImageWithFallback
                        src={svc.image}
                        alt={`${svc.title}: Keem in a brand shoot`}
                        className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        style={{ objectPosition: svc.position }}
                      />
                    </div>
                    <figcaption className="mt-6">
                      <span className="inline-flex rounded-full border border-border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                        {svc.tag}
                      </span>
                      <h3 className="mt-4 text-display-md text-foreground">{svc.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{svc.desc}</p>
                      <p className="mt-3 text-xs tracking-wide text-muted-foreground/70">{svc.points.join('  ·  ')}</p>
                      <button
                        type="button"
                        onClick={() => setBookTopic(svc.title)}
                        className="group/cta mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                      >
                        Book me
                        <span aria-hidden className="inline-block transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5">↗</span>
                      </button>
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
