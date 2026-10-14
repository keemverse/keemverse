import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingBag, Camera, Palette, Layers } from 'lucide-react';
import { SocialFooter } from '../components/SocialFooter';
import { ComingSoonModal } from '../components/ComingSoonModal';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { PillButton } from '../components/ui/PillButton';
import { AccentPillButton } from '../components/ui/AccentPillButton';
import { BurgerMenu } from '../components/ui/BurgerMenu';
import { GeometricBackdrop } from '../components/GeometricBackdrop';
import { BioChooser } from '../components/BioChooser';
import { FASHION, FASHION_DARK, CRAFT, CRAFT_DARK, accentText } from '../lib/theme';
import fashionPageHero from '../../imports/IMG_7304.webp';
import craftPageHero from '../../imports/craft-quality-hero_2.webp';
import keemverseWordmark from '../../imports/keemverse-wordmark.svg';

// Landing-page-only top bar: wordmark left, animated burger right.
// The universe pages keep their own back-button/toggle nav — this is
// a separate treatment just for "/".
function LandingNav() {
  const navigate = useNavigate();
  const [comingSoon, setComingSoon] = useState<string | null>(null);

  const items = [
    { label: 'Fashion', action: () => navigate('/fashion') },
    { label: 'Fashion Finds', action: () => navigate('/fashion/finds') },
    { label: 'Lightroom Presets', action: () => navigate('/fashion/presets') },
    { label: 'Craft', action: () => navigate('/digital-craft') },
    { label: 'Resources', action: () => setComingSoon('Resources') },
    { label: 'About', action: () => navigate('/about') },
    { label: 'Contact', action: () => navigate('/contact') },
  ];

  return (
    <div className="flex items-center justify-between relative">
      <ComingSoonModal
        open={!!comingSoon}
        onClose={() => setComingSoon(null)}
        title={comingSoon ? `${comingSoon} — Coming Soon` : 'Coming Soon'}
        description="This page isn't set up yet — check back soon."
      />

      <img
        src={keemverseWordmark}
        alt="Keemverse"
        className="h-[11px] md:h-[18px] w-auto object-contain"
      />

      <BurgerMenu items={items} />
    </div>
  );
}

const hero = [
  {
    title: 'fashion',
    description: 'Curated finds, styling, and visual storytelling.',
    image: fashionPageHero,
    cta: 'enter',
    tag: 'LIVE',
    href: '/fashion',
    accent: FASHION,
    accentDark: FASHION_DARK,
    pills: [
      { label: 'fashion finds', sub: 'shop my picks', icon: ShoppingBag, href: '/fashion/finds' },
      { label: 'presets', sub: 'lightroom presets', icon: Camera, href: '/fashion/presets' },
    ],
  },
  {
    title: 'craft',
    description: 'Production-ready artwork and design packs.',
    image: craftPageHero,
    cta: 'enter',
    tag: 'Coming Soon',
    href: '/digital-craft',
    accent: CRAFT,
    accentDark: CRAFT_DARK,
    pills: [
      { label: 'graphics', sub: 'printable graphics', icon: Layers, href: '/digital-craft' },
      { label: 'Apparel Designs', sub: 'apparel design packs', icon: Palette, href: '/digital-craft' },
    ],
  },
];

// Light mode: the two universes as ONE seamless piece, fashion on the left and
// craft on the right, each half its own link. The original photographs fade out
// on every edge (.hero-fade) and melt into the page, with a faint amber-to-teal
// seam between them. Dark mode: the same markup becomes two separate white
// cards with dark text, side by side. The quick links for each half sit
// directly beneath, in the same two columns.
function HeroPair({ items }: { items: typeof hero }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      // Same geometry in light and dark so nothing moves when the theme switches:
      // only paint changes. Light: one seamless piece, no box. Dark: each half
      // becomes its own white card, so each universe stays distinct.
      className="relative"
    >
      <div className="grid grid-cols-2 gap-3 md:gap-8">
        {items.map((item, i) => {
          const side = i === 0 ? 'left' : 'right';
          return (
            <a
              key={item.title}
              href={item.href}
              aria-label={`${item.title}: ${item.description}`}
              className="group flex flex-col overflow-hidden rounded-2xl md:rounded-[28px] border border-transparent bg-transparent shadow-none dark:border-stone-200/60 dark:bg-white dark:shadow-sm transition-[transform,box-shadow] duration-500 dark:hover:-translate-y-1.5 dark:hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground"
            >
              <div className="relative aspect-square md:aspect-[4/3]">
                <div
                  className="hero-fade absolute inset-0 will-change-transform transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]"
                >
                  <ImageWithFallback
                    src={item.image}
                    alt=""
                    className="w-full h-full object-cover object-[center_25%] md:object-center"
                  />
                </div>
                <span
                  className={`absolute top-2 md:top-4 rounded-full bg-white/95 text-[9px] md:text-[11px] tracking-wide font-semibold px-2 py-0.5 md:px-3 md:py-1 text-stone-900 ${
                    side === 'left' ? 'left-2 md:left-4' : 'right-2 md:right-4'
                  }`}
                >
                  {item.tag}
                </span>
              </div>

              <div className="flex flex-col flex-1 px-2 pb-3 pt-1 md:px-8 md:pb-4 -mt-6 md:-mt-12 relative z-10 text-center">
                <h3 className="text-lg md:text-[2rem] text-foreground dark:text-stone-900" style={{ fontFamily: 'Georgia, serif' }}>
                  {item.title}
                </h3>
                <p className="mt-1 text-xs md:text-sm leading-relaxed md:leading-7 text-muted-foreground dark:text-stone-600 max-w-xs mx-auto">
                  {item.description}
                </p>
                {/* mt-auto pins both "enter" buttons to the same line, even when one description wraps to more lines */}
                <div className="mt-auto pt-3 md:pt-6">
                  <PillButton groupHover>{item.cta}</PillButton>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* the seam: a faint hairline that runs amber to teal down the middle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-10 left-1/2 w-px -translate-x-1/2 transition-opacity dark:!opacity-0"
        style={{
          background: `linear-gradient(to bottom, transparent, ${FASHION} 30%, ${CRAFT} 70%, transparent)`,
          opacity: 0.4,
        }}
      />
    </motion.div>
  );
}

// Big color-coded headline — "creator" tinted Fashion amber, "crafts"
// tinted Craft teal, each word tied to the universe it names. Same
// clip-path reveal language as before, just promoted to the hero
// statement instead of a small italic line.
function HeroHeadline() {
  return (
    <div>
      <h1
        className="leading-[1.05] text-foreground"
        style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2.25rem, 7vw, 3.75rem)' }}
      >
        <span className="block overflow-hidden pb-[0.1em]">
          <motion.span
            className="inline-block"
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
            viewport={{ once: true, margin: '0px 0px -80px 0px' }}
            transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
          >
            One <span className="text-amber-display">creator</span>
          </motion.span>
        </span>
        <span className="block overflow-hidden pb-[0.1em]">
          <motion.span
            className="inline-block"
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
            viewport={{ once: true, margin: '0px 0px -80px 0px' }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.65, 0, 0.35, 1] }}
          >
            two <span className="text-teal-display">crafts</span>
          </motion.span>
        </span>
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="mt-5 text-muted-foreground leading-relaxed text-sm md:text-base"
      >
        Helping people build wardrobes and helping brands build production-ready artwork.
      </motion.p>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      <GeometricBackdrop />
      <main className="relative z-10 pt-8 pb-0 px-5 md:px-8">
        <div className="max-w-6xl mx-auto">

          {/* ── NAV ── */}
          <section>
            <LandingNav />
          </section>

          {/* ── HEADLINE ── */}
          <section className="mt-14 md:mt-20 pb-2 max-w-2xl">
            <HeroHeadline />
          </section>

          {/* ── ONE HERO CARD (fashion | craft) + THEIR QUICK-LINK PILLS ── */}
          <section className="mt-12 pb-10">
            <div className="max-w-5xl mx-auto">
              <HeroPair items={hero} />

              <div className="grid grid-cols-2 gap-3 md:gap-8 mt-3 md:mt-4">
                {hero.map((item, i) => (
                  <div key={item.title} className="grid grid-cols-2 gap-2 md:gap-3">
                    {item.pills.map((p, pi) => (
                      <AccentPillButton
                        key={p.label}
                        href={p.href}
                        icon={p.icon}
                        label={p.label}
                        sub={p.sub}
                        accent={item.accent}
                        accentDark={item.accentDark}
                        delay={0.15 + i * 0.1 + pi * 0.06}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      </main>

      <div className="-mt-14">
        <SocialFooter />
      </div>

      <BioChooser />
    </div>
  );
}
