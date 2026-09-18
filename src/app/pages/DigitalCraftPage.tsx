import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SocialFooter } from '../components/SocialFooter';
import { ComingSoonModal } from '../components/ComingSoonModal';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { GeometricBackdrop } from '../components/GeometricBackdrop';
import { UpworkIcon, BehanceIcon } from '../components/Icons';
import UniverseShopCard from "../components/UniverseShopCard";
import { CRAFT, CRAFT_DARK } from '../lib/theme';
import craftPageHero from '../../imports/craft-quality-hero_2.webp';
import printableGraphicsHero from '../../imports/printable-graphics-hero.webp';
import dtfDesignPacksHero from '../../imports/dtf-design-packs-hero.webp';
import artistPaletteIcon from '../../imports/icons3d/artist-palette-3d.png';
import briefcaseIcon from '../../imports/icons3d/briefcase-3d.png';

const services = [
  {
    icon: artistPaletteIcon,
    title: 'Graphics & Print Asset Creation',
    desc: 'From concept to production-ready artwork — including cleanup and optimization of low-quality files.',
  },
  {
    icon: briefcaseIcon,
    title: 'Creative Consultation & Support',
    desc: 'Professional guidance for apparel, print, and creative projects.',
  },
];

const shop = [
  {
    title: 'Printable Graphics',
    description: 'Production-ready artwork for apparel, decals, stickers, cups, posters, and creative projects.',
    image: printableGraphicsHero,
    cta: 'Coming Soon',
    tag: 'PENDING',
    href: '#',
  },
  {
    title: 'Apparel Design Packs',
    description: 'Premium print-ready artwork designed for apparel brands and print businesses, ready for any printing method.',
    image: dtfDesignPacksHero,
    cta: 'Coming Soon',
    tag: 'PENDING',
    href: '#',
  },
];

const stats = [
  { value: '4+', label: 'Years Experience' },
  { value: '3k+', label: 'Projects & Optimizations' },
  { value: '99.9%', label: 'Quality Guarantee' },
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

export function DigitalCraftPage() {
  const [comingSoon, setComingSoon] = useState<string | null>(null);

  return (
    <div className="relative min-h-screen text-stone-900" style={{ backgroundColor: '#FBFAF7' }}>
      <GeometricBackdrop />
      <ComingSoonModal
        open={!!comingSoon}
        onClose={() => setComingSoon(null)}
        title={comingSoon ? `${comingSoon} — Coming Soon` : 'Coming Soon'}
        description="This shop isn't live yet — check back soon."
      />

      <main className="relative z-10 pt-8 pb-0 px-5 md:px-8">
        <div className="max-w-6xl mx-auto">

          {/* ── HERO ── */}
          <section>
            {/* There's dead space cushioning the product cluster on every
                side, so a landscape crop works fine as long as it stays
                centered — the earlier object-bottom override was what cut
                elements off, not the source composition itself. */}
            <div className="relative w-full overflow-hidden rounded-3xl aspect-[4/3] md:aspect-[16/9]" style={{ maxHeight: '70vh' }}>
              <ImageWithFallback
                src={craftPageHero}
                alt="Digital Craft — production-ready artwork"
                className="w-full h-full object-cover"
              />

              {/* Bottom gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/50 to-transparent pointer-events-none" />

              {/* Hero copy — positioned at bottom like Fashion */}
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
  DIGITAL CRAFTSMANSHIP
</p>

<h1
  className="text-white leading-tight whitespace-nowrap"
  style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(0.85rem, 5vw, 3.5rem)' }}
>
  Designing for production quality
</h1>
                </motion.div>
              </div>
            </div>
          </section>
          <section className="mt-16">
            <div className="max-w-xl mx-auto text-center">
{/* Introduction */}
<p className="text-stone-700 font-medium text-lg md:text-xl mb-4">
  Hi, I'm Keem.
</p>

{/* Large statement */}
<h2
  className="mb-6 leading-snug text-stone-900"
  style={{
    fontFamily: 'Georgia, serif',
    fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
  }}
>
  I help creators, apparel brands, and print businesses solve design and production problems.
</h2>

{/* Supporting statement */}
<p className="text-stone-600 leading-loose text-base md:text-lg mb-10">
  From custom graphics and production-ready artwork to print file optimization
  and repair, I help apparel brands, creators, and print businesses deliver
  creative designs, clean files, and better prints.
</p>

            </div>

{/* Stats below — quiet supporting row, not a competing card block */}
            <div className="mt-10 flex items-start justify-center gap-6 md:gap-10 max-w-md mx-auto">
              {stats.map((s, i) => (
                <div key={s.label} className="flex items-center gap-6 md:gap-10">
                  {i > 0 && <div className="h-8 w-px bg-stone-300/70" />}
                  <div className="flex flex-col items-center text-center">
                    <span className="font-bold text-stone-900 text-base md:text-lg">
                      {s.value}
                    </span>
                    <span className="text-[10px] md:text-xs text-stone-400 uppercase tracking-wider leading-tight mt-0.5">
                      {s.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Supporting tagline */}
          </section>

          {/* ── WORK WITH ME ── */}
  <section className="mt-20">
            <SectionDivider label="Work With Me" />
            <div className="grid grid-cols-2 gap-x-5 gap-y-9 md:gap-x-10 max-w-xl mx-auto">
              {services.map((svc, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex flex-col"
                >
                  <img
                    src={svc.icon}
                    alt=""
                    className="w-7 h-7 mb-3"
                    style={{ filter: 'sepia(0.65) saturate(1.3) hue-rotate(-8deg) brightness(0.92)' }}
                  />
                  <h3 className="font-bold mb-1.5 md:mb-2 text-stone-900 text-sm md:text-base leading-snug">
                    {svc.title}
                  </h3>
                  <p className="text-stone-600 text-xs md:text-sm leading-relaxed">{svc.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-10">
              <a
                href="https://www.upwork.com/freelancers/~0106ded5c187eb05c8?mp_source=share"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-8 py-4 rounded-full border border-stone-300 bg-[#ECE5D9] text-stone-900 font-bold text-sm shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_8px_20px_rgba(0,0,0,.06)] hover:bg-[#E5DDCF] hover:-translate-y-0.5 transition-all"
              >
                <UpworkIcon className="w-5 h-5" />
                Hire on Upwork
              </a>
              <button
                onClick={() => setComingSoon('Behance')}
                className="flex items-center gap-2.5 px-8 py-4 rounded-full border border-stone-300 bg-[#ECE5D9] text-stone-900 font-bold text-sm shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_8px_20px_rgba(0,0,0,.06)] hover:bg-[#E5DDCF] hover:-translate-y-0.5 transition-all"
              >
                <BehanceIcon className="w-5 h-5" />
                View Behance
              </button>
            </div>
          </section>

          {/* ── SHOP ── */}
          <section className="mt-24">
            <SectionDivider label="Shop" />

            <p className="text-center text-sm text-stone-500 mb-8">
              Curated. Created. Designed for your world.
            </p>

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
    onOpen={() => setComingSoon(item.title)}
    accent={CRAFT}
    accentDark={CRAFT_DARK}
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
