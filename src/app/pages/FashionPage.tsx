import fashionFindsHero from '../../imports/fashion-finds-hero.jpg';
import photoPresetsHero from '../../imports/photo-presets-hero.jpg';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { SocialFooter } from '../components/SocialFooter';
import { BookMeModal } from '../components/BookMeModal';
import UniverseShopCard from "../components/UniverseShopCard";
import img1 from '../../imports/IMG_7304.jpeg';
import img2 from '../../imports/IMG_7549.jpeg';
import img3 from '../../imports/IMG_4929.jpeg';
import img4 from '../../imports/IMG_6867_Original.jpeg';
import img5 from '../../imports/IMG_8935.jpeg';

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
    href: 'https://keemverse.gumroad.com',
  },
];

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 mb-14">
      <div className="h-px flex-1 bg-stone-300" />
      <span className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400">{label}</span>
      <div className="h-px flex-1 bg-stone-300" />
    </div>
  );
}

export function FashionPage() {
  const [current, setCurrent] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % carouselImages.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen text-stone-900" style={{ backgroundColor: '#F5F2EA' }}>
      <BookMeModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <main className="pt-8 pb-0 px-5 md:px-8">
        <div className="max-w-6xl mx-auto">

          {/* ── HERO ── */}
          <section>
            {/* Carousel container */}
            <div
              className="relative w-full overflow-hidden rounded-3xl"
              style={{ aspectRatio: '3/4', maxHeight: '90vh' }}
            >
              {/* Stacked crossfade images */}
              {carouselImages.map((img, i) => (
                <div
                  key={i}
                  className="absolute inset-0 transition-opacity"
                  style={{
                    opacity: i === current ? 1 : 0,
                    transitionDuration: '2000ms',
                    transitionTimingFunction: 'ease-in-out',
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
                  <p className="text-white/50 text-xs font-bold tracking-[0.35em] uppercase mb-4">
                    Soft Keem
                  </p>
                  <h1
                    className="text-white leading-tight mb-2"
                    style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
                  >
                    Fashion Storyteller
                  </h1>
                  <p className="text-white/75 mb-5" style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>
                    Visual Identity Explorer
                  </p>
                  <p className="text-white/55 text-sm md:text-base max-w-sm leading-relaxed">
                    Helping people express identity,<br />
                    emotion, and atmosphere through style.
                  </p>
                </motion.div>
              </div>

              {/* Dot indicators */}
              <div className="absolute bottom-6 right-8 flex gap-1.5">
                {carouselImages.map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full transition-all duration-500"
                    style={{
                      width: i === current ? '20px' : '6px',
                      height: '6px',
                      backgroundColor: i === current ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                    }}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* ── ABOUT ── */}
          <section className="mt-24">
            <SectionDivider label="About" />
            <div className="max-w-xl mx-auto text-center">
              <h2
                className="mb-6 leading-snug text-stone-900"
                style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
              >
                I believe style is visual storytelling.
              </h2>
              <p className="text-stone-600 leading-loose text-base md:text-lg">
                I help people build wardrobes,<br />
                campaigns, and creative worlds<br />
                that feel unmistakably theirs.
              </p>
            </div>
          </section>

          {/* ── WORK WITH ME ── */}
          <section className="mt-24">
            <SectionDivider label="Work With Me" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {services.map((svc, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="flex flex-col justify-between rounded-3xl p-7 md:p-8 transition-all border border-stone-200/60"
                  style={{
                    backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F9F7F2'
                  }}
                >
                  <div>
                    <h3 className="font-bold mb-3 text-stone-900" style={{ fontSize: '1.05rem' }}>
                      {svc.title}
                    </h3>
                    <p className="text-stone-600 text-sm leading-relaxed">{svc.desc}</p>
                  </div>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="mt-6 inline-flex items-center self-start px-6 py-2.5 rounded-full text-white text-xs font-bold tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:bg-stone-200"
                    style={{ backgroundColor: '#ECE5D9', color:'#1D1C19', boxShadow:'inset 0 1px 0 rgba(255,255,255,.8), 0 8px 20px rgba(0,0,0,.05)' }}
                  >
                    BOOK ME
                  </button>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── SHOP ── */}
          <section className="mt-24">
            <SectionDivider label="Shop" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
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
