import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Btn } from './CraftUI';
import { GARMENT_COLORS } from './GarmentStudio';
import { SAND } from '../lib/theme';
import craftPageHero from '../../imports/craft-quality-hero_2.webp';

// Hero in the spirit of the Arena landing page, finished with restraint:
// one status line, one headline, one short paragraph, one primary action
// and nothing else (the ticker below carries the three short promises).
// Lime appears only on the status dot, the last headline words and the
// primary button; everything else is warm neutral.
//
// Layout: on desktop it is text left, picture right (the picture overlaps
// the glass card). On phones the same pieces are composed as one column in a
// deliberate order: headline, paragraph, picture with the glass card hanging
// off its corner, then the actions. The text wrapper uses `contents` below
// lg so its children can be ordered around the picture.
//
// Copy rule: speak to the buyer's problem, not to how the business works.
// No follower counts here: those belong to Soft Keem, not Digital Craft.

export function DigitalCraftHero({
  onShop,
  onPacks,
  onCustom,
}: {
  onShop: () => void;
  onPacks: () => void;
  onCustom: () => void;
}) {
  return (
    <section className="relative isolate grid items-center lg:grid-cols-[1.05fr_1fr] lg:gap-x-20">
      {/* texture layers, kept faint: blueprint grid fading out at the edges, plus one soft sand glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[-1.25rem] -top-8 bottom-[-2rem] -z-10 blueprint text-[#A18C6B] opacity-[0.14] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_72%)] md:inset-x-[-2rem]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-10 -z-10 h-[420px] w-[420px] rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${SAND}4d, transparent 65%)` }}
      />

      <div className="contents lg:block">
        {/* 1. headline block */}
        <div className="order-1 lg:order-none">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-foreground"
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(2.75rem, 6.8vw, 4.5rem)',
              lineHeight: 1.04,
              letterSpacing: '-0.025em',
              textWrap: 'balance',
            }}
          >
            Original <span className="text-amber-display">art</span> you won't find{' '}
            <span className="text-teal-display">anywhere else.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground md:mt-7 md:text-[17px]"
          >
            Tired of the same prints everywhere? I'm Keem, and I make art for creators and small
            brands. <strong className="text-foreground font-semibold">Wear it</strong>,{' '}
            <strong className="text-foreground font-semibold">download it</strong>, or{' '}
            <strong className="text-foreground font-semibold">have something made just for you</strong>.
          </motion.p>
        </div>

        {/* 3. actions (after the picture on phones) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="order-3 mt-8 grid grid-cols-2 items-center gap-3 sm:flex sm:flex-wrap sm:gap-4 lg:order-none lg:mt-9"
        >
          <Btn size="lg" onClick={onShop} className="w-full px-4 sm:w-auto sm:px-8" icon={<span aria-hidden="true">↓</span>}>
            Shop apparel
          </Btn>
          <Btn size="lg" variant="outline" onClick={onPacks} className="w-full px-4 sm:w-auto sm:px-8">
            Art packs
          </Btn>
          <button
            type="button"
            onClick={onCustom}
            className="col-span-2 mt-1 inline-flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-foreground underline decoration-[color:var(--craft-ink)]/45 underline-offset-[6px] transition-colors hover:decoration-[color:var(--craft-ink)] sm:col-span-1 sm:mt-0 sm:px-2"
          >
            Get a custom design <span aria-hidden="true">→</span>
          </button>
        </motion.div>
      </div>

      {/* 2. the picture, with one glass card hanging off its corner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="relative order-2 mb-12 mt-10 md:mb-14 lg:order-none lg:mb-0 lg:mt-0"
      >
        <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-[0_30px_80px_-40px_rgba(29,28,25,0.4)]">
          <ImageWithFallback
            src={craftPageHero}
            alt="KEEMVERSE art and apparel: a printed tee, tote and mug"
            className="block aspect-[5/6] w-full origin-[55%_58%] scale-[1.22] object-cover md:aspect-[4/3] lg:aspect-[5/6]"
          />
          <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-black/5" />
        </div>

        <div className="absolute -bottom-8 left-4 w-[220px] rounded-2xl border border-white/30 bg-background/80 p-4 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.5)] backdrop-blur-xl lg:-left-6 lg:bottom-8">
          <p className="text-sm font-bold text-foreground">See it first</p>
          <p className="mt-1 text-xs leading-snug text-muted-foreground">Pick a tee, hoodie or tote, then a colour, before you buy.</p>
          <div className="mt-3 flex gap-1.5" aria-hidden="true">
            {GARMENT_COLORS.map((c) => (
              <span key={c.id} className="h-3.5 w-3.5 rounded-full ring-1 ring-foreground/15" style={{ backgroundColor: c.hex }} />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
