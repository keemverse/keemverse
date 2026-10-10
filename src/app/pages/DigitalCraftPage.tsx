import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { SocialFooter } from '../components/SocialFooter';
import { ComingSoonModal } from '../components/ComingSoonModal';
import { GeometricBackdrop } from '../components/GeometricBackdrop';
import { UpworkIcon, BehanceIcon } from '../components/Icons';
import { DigitalCraftHero } from '../components/DigitalCraftHero';
import { Btn, Marquee, SectionLabel } from '../components/CraftUI';
import { DigitalCraftShowcase, type ShowcaseTab } from '../components/DigitalCraftShowcase';
import { getDesigns, getDesignPacks, DEV_SAMPLE_DESIGNS, DEV_SAMPLE_PACKS, type Design, type DesignPack } from '../lib/designs';
import { DIGITAL_CRAFT_LAUNCH_AT } from '../lib/launch';
import { CRAFT, accentText } from '../lib/theme';

// True statements only: this strip is decoration, not a list of promises.
const MARQUEE_ITEMS = [
  'No templates',
  'Original art',
  'Preview before you buy',
  'Made for you',
  'Art packs to download',
  'Custom designs',
];

const services = [
  {
    title: 'Custom Art & Apparel Graphics',
    desc: 'Original illustrations and apparel artwork for creators and small brands, from first sketch to final files.',
  },
  {
    title: 'Creative Direction & Consultation',
    desc: 'Help shaping the look of an apparel line, merch, or creative project.',
  },
];

const SectionDivider = ({ label }: { label: string }) => <SectionLabel>{label}</SectionLabel>;

export function DigitalCraftPage() {
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [packs, setPacks] = useState<DesignPack[]>([]);
  const [tab, setTab] = useState<ShowcaseTab>('designs');
  const shopRef = useRef<HTMLElement>(null);

  // Dev-only layout preview: open /digital-craft?preview=designs while running
  // `pnpm dev`. Production builds never show it (DEV_SAMPLE_DESIGNS is empty).
  const previewing =
    import.meta.env.DEV && new URLSearchParams(window.location.search).get('preview') === 'designs';

  useEffect(() => {
    getDesigns().then(setDesigns);
    getDesignPacks().then(setPacks);
  }, []);

  // The grid appears only once the launch date (lib/launch.ts) has passed and
  // there is at least one real design. Until then: the opening-soon teaser.
  const launched = DIGITAL_CRAFT_LAUNCH_AT !== null && Date.now() >= Date.parse(DIGITAL_CRAFT_LAUNCH_AT);
  const showGrid = previewing || (launched && designs.length > 0);
  const gridDesigns = previewing ? DEV_SAMPLE_DESIGNS : designs;
  const showPacks = previewing || (launched && packs.length > 0);
  const gridPacks = previewing ? DEV_SAMPLE_PACKS : packs;

  const goTo = (next: ShowcaseTab) => {
    setTab(next);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    shopRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

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
          <DigitalCraftHero onShop={() => goTo('designs')} onPacks={() => goTo('packs')} onCustom={() => goTo('custom')} />

          {/* ── MARQUEE ── */}
          <div className="mt-12 md:mt-20">
            <Marquee items={MARQUEE_ITEMS} />
          </div>

          {/* ── SHOP ── */}
          <section ref={shopRef} className="mt-16 md:mt-24 scroll-mt-6">
            <SectionDivider label="Shop" />
            <DigitalCraftShowcase
              designs={gridDesigns}
              packs={gridPacks}
              showDesigns={showGrid}
              showPacks={showPacks}
              tab={tab}
              onTabChange={setTab}
            />
          </section>

          {/* ── WORK WITH ME ── */}
          <section className="mt-16 md:mt-24">
            <SectionDivider label="Work With Me" />
            <div className="grid grid-cols-2 gap-x-5 gap-y-9 md:gap-x-10 max-w-xl mx-auto">
              {services.map((svc, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex flex-col border-t border-border pt-5"
                >
                  <span className="mb-3 block text-[13px] italic leading-none text-amber-ink" style={{ fontFamily: 'Georgia, serif' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mb-1.5 text-base leading-snug text-foreground md:mb-2 md:text-lg" style={{ fontFamily: 'Georgia, serif' }}>
                    {svc.title}
                  </h3>
                  <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">{svc.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
              <Btn variant="dark" size="lg" className="w-full sm:w-auto" onClick={() => setComingSoon('Upwork')} icon={<UpworkIcon className="w-5 h-5" />}>
                Hire on Upwork
              </Btn>
              <Btn variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => setComingSoon('Behance')} icon={<BehanceIcon className="w-5 h-5" />}>
                View Behance
              </Btn>
            </div>
          </section>
        </div>
      </main>

      <SocialFooter />
    </div>
  );
}
