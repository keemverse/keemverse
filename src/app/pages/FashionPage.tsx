import fashionFindsHero from '../../imports/fashion-finds-hero.webp';
import photoPresetsHero from '../../imports/photo-presets-hero.webp';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
import modelingImg from '../../imports/trend-territory-modeling.webp';

const carouselImages = [img1, img2, img3, img4, img5];

// Two offers only: collaborations already include creative direction on set, and
// modeling is for select campaigns. Both open the same "Book me" pop-up (DMs).
const services = [
  {
    title: 'Brand Collaborations',
    tag: 'Open for brands',
    desc: 'Authentic content, creative direction on set and promotion for brands that fit.',
    points: ['Content', 'Creative direction', 'TikTok + Instagram'],
    image: img2,
    position: '50% 62%',
  },
  {
    title: 'Brand Modeling',
    tag: 'Select campaigns',
    desc: 'Available for fashion, lifestyle and creative campaigns that suit the look.',
    points: ['Fashion', 'Lifestyle', 'Creative campaigns'],
    image: modelingImg,
    position: '15% 50%',
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

export function FashionPage() {
  const t = useContent();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [bookTopic, setBookTopic] = useState<string | null>(null);

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
            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
              {services.map((svc, i) => (
                <motion.article
                  key={svc.title}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative isolate overflow-hidden rounded-3xl bg-stone-900 lg:aspect-square"
                >
                  {/* Phones: photo on top, text panel below (nothing sits on the faces).
                      Wide screens (lg): the photo fills the card and the text sits on a gradient. */}
                  <div className="relative aspect-[4/3] overflow-hidden lg:absolute lg:inset-0 lg:aspect-auto">
                    <ImageWithFallback
                      src={svc.image}
                      alt={`${svc.title}: Keem in a brand shoot`}
                      className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      style={{ objectPosition: svc.position }}
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-stone-950/90 via-stone-950/45 to-transparent lg:block" />

                  <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm lg:left-7 lg:top-7">
                    {svc.tag}
                  </span>

                  <div className="relative p-6 pt-5 text-white lg:absolute lg:inset-x-0 lg:bottom-0 lg:p-8">
                    <h3 className="text-display-md text-white">{svc.title}</h3>
                    <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-white/80 md:text-[15px]">{svc.desc}</p>
                    <p className="mt-3 text-xs tracking-wide text-white/60">{svc.points.join('  ·  ')}</p>
                    <button
                      type="button"
                      onClick={() => setBookTopic(svc.title)}
                      className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-stone-900 transition-colors hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      Book me
                      <span aria-hidden className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </button>
                  </div>
                </motion.article>
              ))}
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
