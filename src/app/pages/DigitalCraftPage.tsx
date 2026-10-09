import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { SocialFooter } from '../components/SocialFooter';
import { ComingSoonModal } from '../components/ComingSoonModal';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { GeometricBackdrop } from '../components/GeometricBackdrop';
import { UpworkIcon, BehanceIcon } from '../components/Icons';
import { DesignTile } from '../components/DesignTile';
import { CountdownTeaser } from '../components/CountdownTeaser';
import { getDesigns, DEV_SAMPLE_DESIGNS, type Design } from '../lib/designs';
import { DIGITAL_CRAFT_LAUNCH_AT } from '../lib/launch';
import craftPageHero from '../../imports/craft-quality-hero_2.webp';
import artistPaletteIcon from '../../imports/icons3d/artist-palette-3d.png';
import briefcaseIcon from '../../imports/icons3d/briefcase-3d.png';

const services = [
  {
    icon: artistPaletteIcon,
    title: 'Custom Art & Apparel Graphics',
    desc: 'Original illustrations and apparel artwork for creators and small brands, from first sketch to final files.',
  },
  {
    icon: briefcaseIcon,
    title: 'Creative Direction & Consultation',
    desc: 'Help shaping the look of an apparel line, merch, or creative project.',
  },
];

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 mb-14">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">{label}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export function DigitalCraftPage() {
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);

  // Dev-only layout preview: open /digital-craft?preview=designs while running
  // `pnpm dev`. Production builds never show it (DEV_SAMPLE_DESIGNS is empty).
  const previewing =
    import.meta.env.DEV && new URLSearchParams(window.location.search).get('preview') === 'designs';

  useEffect(() => {
    getDesigns().then(setDesigns);
  }, []);

  // The grid appears only once the launch date (lib/launch.ts) has passed and
  // there is at least one real design. Until then: the opening-soon teaser.
  const launched = DIGITAL_CRAFT_LAUNCH_AT !== null && Date.now() >= Date.parse(DIGITAL_CRAFT_LAUNCH_AT);
  const showGrid = previewing || (launched && designs.length > 0);
  const gridDesigns = previewing ? DEV_SAMPLE_DESIGNS : designs;

  return (
    <div className="relative min-h-screen bg-background text-foreground">
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
                alt="Digital Craft — art and apparel"
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
  Art you can wear
</h1>
                </motion.div>
              </div>
            </div>
          </section>
          <section className="mt-16">
            <div className="max-w-xl mx-auto text-center">
{/* Introduction */}
<p className="text-foreground/80 font-medium text-lg md:text-xl mb-4">
  Hi, I'm Keem.
</p>

{/* Large statement */}
<h2
  className="mb-6 leading-snug text-foreground"
  style={{
    fontFamily: 'Georgia, serif',
    fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
  }}
>
  I make original art and apparel graphics for creators and small brands.
</h2>

{/* Supporting statement */}
<p className="text-muted-foreground leading-loose text-base md:text-lg">
  From custom illustrations to artwork made for apparel, I help creators and
  small brands turn an idea into something people want to wear.
</p>

            </div>
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
                  <h3 className="font-bold mb-1.5 md:mb-2 text-foreground text-sm md:text-base leading-snug">
                    {svc.title}
                  </h3>
                  <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">{svc.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-10">
              <button
                onClick={() => setComingSoon('Upwork')}
                className="flex items-center gap-2.5 px-8 py-4 rounded-full border border-border bg-primary text-primary-foreground font-bold text-sm shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_8px_20px_rgba(0,0,0,.06)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_8px_20px_rgba(0,0,0,.3)] hover:brightness-95 hover:-translate-y-0.5 transition-all"
              >
                <UpworkIcon className="w-5 h-5" />
                Hire on Upwork
              </button>
              <button
                onClick={() => setComingSoon('Behance')}
                className="flex items-center gap-2.5 px-8 py-4 rounded-full border border-border bg-primary text-primary-foreground font-bold text-sm shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_8px_20px_rgba(0,0,0,.06)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_8px_20px_rgba(0,0,0,.3)] hover:brightness-95 hover:-translate-y-0.5 transition-all"
              >
                <BehanceIcon className="w-5 h-5" />
                View Behance
              </button>
            </div>
          </section>

          {/* ── DESIGNS ── */}
          <section className="mt-24">
            <SectionDivider label="Designs" />

            {showGrid ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-8 md:gap-x-8 md:gap-y-12 max-w-5xl mx-auto">
                {gridDesigns.map((design, i) => (
                  <DesignTile key={design.id} design={design} index={i} />
                ))}
              </div>
            ) : (
              <CountdownTeaser launchAt={DIGITAL_CRAFT_LAUNCH_AT} />
            )}
          </section>

        </div>
      </main>

      <SocialFooter />
    </div>
  );
}
