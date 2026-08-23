import { motion } from 'motion/react';
import { ShoppingBag, Camera, Palette, Layers } from 'lucide-react';
import { SocialFooter } from '../components/SocialFooter';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import fashionPageHero from '../../imports/IMG_7304.jpeg';
import craftPageHero from '../../imports/IMG_5353-Edit.jpeg';

const hero = [
  {
    title: 'fashion',
    description: 'Curated finds, styling, and visual storytelling.',
    image: fashionPageHero,
    cta: 'enter',
    tag: 'LIVE',
    href: '/fashion',
    accent: '#D98E2B',
    accentDark: '#B8741A',
    pills: [
      { label: 'finds', sub: 'curated fashion', icon: ShoppingBag, href: '/fashion/finds' },
      { label: 'presets', sub: 'lightroom presets', icon: Camera, href: '/fashion/presets' },
    ],
  },
  {
    title: 'craft',
    description: 'Production-ready artwork and design packs.',
    image: craftPageHero,
    cta: 'enter',
    tag: 'LIVE',
    href: '/digital-craft',
    accent: '#1FA396',
    accentDark: '#12897D',
    pills: [
      { label: 'graphics', sub: 'printable graphics', icon: Layers, href: '/digital-craft' },
      { label: 'DTF Designs', sub: 'dtf design packs', icon: Palette, href: '/digital-craft' },
    ],
  },
];

function HeroCard({
  title,
  description,
  image,
  cta,
  href,
  tag = 'LIVE',
  index = 0,
}: {
  title: string;
  description: string;
  image: string;
  cta: string;
  href: string;
  tag?: string;
  index?: number;
}) {
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="group flex flex-col overflow-hidden rounded-2xl md:rounded-[28px] bg-white border border-stone-200/60 shadow-sm hover:shadow-2xl transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
    >
      <div className="relative aspect-square md:aspect-[4/3] overflow-hidden">
        <div className="absolute -inset-px will-change-transform transition-all duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]">
          <ImageWithFallback src={image} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-white via-white/60 to-transparent" />
        </div>
        <span className="absolute top-2 left-2 md:top-4 md:left-4 rounded-full bg-white/95 text-[9px] md:text-[11px] tracking-wide font-semibold px-2 py-0.5 md:px-3 md:py-1 text-stone-900">
          {tag}
        </span>
      </div>

      <div className="flex flex-col flex-1 px-4 pb-5 pt-1 md:px-8 md:pb-8 -mt-4 md:-mt-10 relative z-10 text-center">
        <h3
          className="text-lg md:text-[2rem] text-stone-900"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {title}
        </h3>

        <p className="mt-1 text-xs md:text-sm leading-relaxed md:leading-7 text-stone-600 max-w-xs mx-auto">
          {description}
        </p>

        <div className="mt-3 md:mt-6">
          <span className="inline-flex items-center gap-1.5 md:gap-2 rounded-full border border-stone-300 bg-[#ECE5D9] px-4 py-2 md:px-7 md:py-3 text-[11px] md:text-xs font-semibold tracking-[0.15em] text-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_8px_20px_rgba(0,0,0,.06)] transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-0.5 group-hover:bg-[#E5DDCF]">
            {cta}
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        </div>
      </div>
    </motion.a>
  );
}

const taglineLines = [
  'One creator, two crafts,',
  'helping people build wardrobes and',
  'helping brands build production-ready artwork.',
];

// Reveals each line left-to-right, like it's being written out, rather
// than popping words in — one line at a time, in reading order.
function StoryTagline() {
  return (
    <p
      className="leading-relaxed text-stone-800"
      style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)' }}
    >
      {taglineLines.map((line, i) => (
        <span key={line} className="block overflow-hidden pb-[0.15em]">
          <motion.span
            className="inline-block"
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
            viewport={{ once: true, margin: '0px 0px -80px 0px' }}
            transition={{ duration: 0.9, delay: i * 0.55, ease: [0.65, 0, 0.35, 1] }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </p>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen text-stone-900" style={{ backgroundColor: '#F5F2EA' }}>
      <main className="pt-8 pb-0 px-5 md:px-8">
        <div className="max-w-6xl mx-auto">

          {/* ── HEADER ── */}
          <section className="text-center">
            <h1
              className="tracking-[0.3em] uppercase text-stone-900"
              style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.5rem, 4vw, 2.25rem)' }}
            >
              Keemverse
            </h1>
          </section>

          {/* ── TAGLINE ── */}
          <section className="mt-10 pb-2 text-center max-w-xl mx-auto">
            <StoryTagline />
            <div className="mx-auto mt-6 h-px w-16 bg-stone-300" />
          </section>

          {/* ── HERO CARDS + THEIR QUICK-LINK PILLS ── */}
          <section className="mt-12 pb-10">
            <div className="grid grid-cols-2 gap-3 md:gap-8 max-w-5xl mx-auto">
              {hero.map((item, i) => (
                <div key={item.title} className="flex flex-col">
                  <HeroCard
                    title={item.title}
                    description={item.description}
                    image={item.image}
                    cta={item.cta}
                    href={item.href}
                    tag={item.tag}
                    index={i}
                  />

                  <div className="grid grid-cols-2 gap-2 md:gap-3 mt-3 md:mt-4">
                    {item.pills.map((p, pi) => (
                      <motion.a
                        key={p.label}
                        href={p.href}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.05, y: -3 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.4, delay: 0.15 + i * 0.1 + pi * 0.06 }}
                        className="group flex flex-col items-center gap-1 rounded-full border px-3 py-4 md:px-4 md:py-5 text-center text-white transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)]"
                        style={{
                          backgroundColor: item.accent,
                          borderColor: item.accentDark,
                          boxShadow: `inset 0 1px 0 rgba(255,255,255,.35), 0 10px 24px -6px ${item.accent}99`,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = item.accentDark)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = item.accent)}
                      >
                        <p.icon className="w-5 h-5 mb-1" />
                        <span className="font-serif text-sm md:text-lg leading-none">{p.label}</span>
                        <span className="text-[9px] md:text-[10px] uppercase tracking-wider mt-1 text-white/80">
                          {p.sub}
                        </span>
                      </motion.a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>

      <div className="-mt-14">
        <SocialFooter />
      </div>
    </div>
  );
}
