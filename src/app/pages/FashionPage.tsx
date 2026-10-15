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

const carouselImages = [img1, img2, img3, img4, img5];

const services = [
  {
    title: 'Brand Modeling',
    desc: 'Available for select fashion, lifestyle and creative campaigns.',
  },
  {
    title: 'Brand Collaborations',
    desc: 'Authentic content creation and brand promotion for aligned brands.',
  },
  {
    title: 'Wardrobe Styling',
    desc: 'Build a wardrobe that reflects your identity and lifestyle.',
  },
  {
    title: 'Creative Direction',
    desc: 'Visual concepts, campaigns, moodboards, and aesthetics.',
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
  const [modalOpen, setModalOpen] = useState(false);

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
      <BookMeModal open={modalOpen} onClose={() => setModalOpen(false)} />

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
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {services.map((svc, i) => (
                <motion.button
                  type="button"
                  key={svc.title}
                  onClick={() => setModalOpen(true)}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  className="card-lift glass group flex flex-col rounded-3xl p-5 text-left md:p-6"
                >
                  <span className="text-[13px] font-medium tabular-nums text-amber-ink">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-6 text-[15px] font-semibold leading-snug text-foreground md:text-base">{svc.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground md:text-sm">{svc.desc}</p>
                  <span className="mt-auto pt-5 text-[13px] font-semibold text-foreground">
                    Book me <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </span>
                </motion.button>
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
