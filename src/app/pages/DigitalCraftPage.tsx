import React from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { SocialFooter } from '../components/SocialFooter';
import { UpworkIcon, BehanceIcon } from '../components/Icons';
import { FileImage, Briefcase, Layers, ShoppingBag } from 'lucide-react';
import tlogImg from '../../imports/tlog.png';
import heroPortrait from '../../imports/IMG_5353-Edit.jpeg';

const services = [
  {
    icon: Layers,
    title: 'Graphics & Print Asset Creation',
    desc: 'From concept to production-ready artwork.',
  },
  {
    icon: FileImage,
    title: 'Print File Cleanup & Optimization',
    desc: 'Fix low-quality files, improve output quality, and prepare for production.',
  },
  {
    icon: Briefcase,
    title: 'Creative Consultation & Support',
    desc: 'Professional guidance for apparel, print, and creative projects.',
  },
];

const shop = [
  {
    title: 'Printable Graphics',
    desc: 'Production-ready graphics for shirts, decals, stickers, Stanley cups, and craft projects.',
    tag: 'Live',
    cta: 'SHOP NOW',
  },
  {
    title: 'DTF Design Packs',
    desc: 'Design packs built specifically for DTF printing businesses.',
    tag: 'Live',
    cta: 'SHOP NOW',
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
  return (
    <div className="min-h-screen text-stone-900" style={{ backgroundColor: '#F5F2EA' }}>
      <main className="pt-8 pb-0 px-5 md:px-8">
        <div className="max-w-6xl mx-auto">

          {/* ── HERO ── */}
          <section>
            {/* Hero container - unified layout matching Fashion */}
            <div
              className="relative w-full overflow-hidden rounded-3xl"
              style={{ aspectRatio: '3/4', maxHeight: '90vh' }}
            >
              {/* Subtle grid overlay */}
              <svg
                className="absolute inset-0 w-full h-full opacity-[0.04] z-10 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <defs>
                  <pattern id="dc-hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1a1a" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dc-hero-grid)" />
              </svg>

              {/* Hero image */}
              <ImageWithFallback
                src={heroPortrait}
                alt="Digital Craft — editorial portrait"
                className="w-full h-full object-cover object-top"
              />

              {/* Bottom gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/85 via-stone-900/35 to-transparent pointer-events-none" />

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
  className="text-white leading-tight mb-3"
  style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
>
  Designing for production quality
</h1>

<p className="text-white/60 text-sm md:text-base max-w-sm leading-relaxed">
  From concept to production
  <br />
  Thoughtfully designed and executed
</p>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ── WHO I AM ── */}
          <section className="mt-24">
            <SectionDivider label="Who I Am" />
            <div className="max-w-xl mx-auto text-center">
              {/* Large statement */}
              <h2
                className="mb-6 leading-snug text-stone-900"
                style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
              >
                I help creators, apparel brands, and print businesses solve design and production problems.
              </h2>

              {/* Supporting statement */}
              <p className="text-stone-600 leading-loose text-base md:text-lg mb-12">
                From custom graphics and production-ready artwork to print file optimization and repair, I make sure creative assets are ready to perform.
              </p>

              {/* Key focus */}
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400">
                  Key Focus
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  {['Creative designs.', 'Clean files.', 'Better prints.'].map((line) => (
                    <span key={line} className="font-bold text-stone-900 text-base md:text-lg">
                      {line}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats below — separated for clarity */}
            <div className="mt-16 grid grid-cols-3 gap-4 max-w-md mx-auto">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center text-center p-5 rounded-2xl border border-stone-200/60"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  <span className="font-bold text-stone-900 mb-1" style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.6rem)' }}>
                    {s.value}
                  </span>
                  <span className="text-xs text-stone-500 uppercase tracking-wider leading-tight">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Supporting tagline */}
            <p className="text-stone-500 text-xs leading-relaxed text-center mt-8">
              Powered by modern production workflows, AI-assisted optimization, and quality-control systems.
            </p>
          </section>

          {/* ── WORK WITH ME ── */}
          <section className="mt-24">
            <SectionDivider label="Work With Me" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((svc, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="rounded-3xl p-7 md:p-8 transition-all border border-stone-200/60"
                  style={{
                    backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F9F7F2'
                  }}
                >
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: '#F5F2EC' }}>
                    <svc.icon className="w-5 h-5" style={{ color: '#1D1C19' }} />
                  </div>
                  <h3 className="font-bold mb-3 text-stone-900 leading-snug" style={{ fontSize: '1.05rem' }}>
                    {svc.title}
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{svc.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-10">
              <a
                href="#"
                className="flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#14A800] text-white font-bold text-sm hover:bg-[#0f8c00] transition-colors shadow-lg shadow-[#14A800]/20"
              >
                <UpworkIcon className="w-5 h-5" />
                Hire on Upwork
              </a>
              <a
                href="#"
                className="flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#1769FF] text-white font-bold text-sm hover:bg-[#0d55d9] transition-colors shadow-lg shadow-[#1769FF]/20"
              >
                <BehanceIcon className="w-5 h-5" />
                View Behance
              </a>
            </div>
          </section>

          {/* ── SHOP ── */}
          <section className="mt-24">
            <SectionDivider label="Shop" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
              {shop.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="group relative flex flex-col items-center text-center rounded-3xl p-8 md:p-10 transition-all border border-stone-200/60"
                  style={{
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <span className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full text-white" style={{ backgroundColor: '#1D1C19' }}>
                    {item.tag}
                  </span>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5 mt-1 group-hover:scale-110 transition-transform" style={{ backgroundColor: '#F5F2EC' }}>
                    <ShoppingBag className="w-6 h-6" style={{ color: '#1D1C19' }} />
                  </div>
                  <h3 className="font-bold mb-2 text-lg text-stone-900">{item.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed mb-6 flex-grow">{item.desc}</p>
                  <a
                    href="#"
                    className="px-6 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all border"
                    style={{
                      borderColor: '#1D1C19',
                      color: '#1D1C19'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1D1C19';
                      e.currentTarget.style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#1D1C19';
                    }}
                  >
                    {item.cta}
                  </a>
                </motion.div>
              ))}
            </div>
          </section>

        </div>
      </main>

      <SocialFooter />
    </div>
  );
}
