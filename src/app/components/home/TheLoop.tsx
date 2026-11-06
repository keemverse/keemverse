import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { useContent } from '../../lib/siteContent';
import { useMediaQuery } from '../../lib/useMediaQuery';
import { Focus } from '../ui/Cine';
import findsImg from '../../../imports/fashion-finds-hero.webp';
import presetsImg from '../../../imports/photo-presets-hero.webp';
import studioImg from '../../../imports/trend-territory-modeling-portrait.webp';

// Three ways in, as three big lines. On a desktop a photo follows the cursor
// from line to line; on a phone each line carries its own small photo.

const ROWS = [
  { n: '01', title: 'Wear', line: 'Fashion Finds: pieces I picked for their design, quality or value.', to: '/fashion/finds', img: findsImg },
  { n: '02', title: 'Shoot', line: 'The gallery: frames from my shoots.', to: '/gallery', img: studioImg },
  { n: '03', title: 'Edit', line: 'Lightroom presets: looks I made, ready for your own photos.', to: '/fashion/presets', img: presetsImg },
];

export default function TheLoop() {
  const t = useContent();
  const reduce = useReducedMotion();
  const fine = useMediaQuery('(hover: hover) and (pointer: fine)');
  const box = useRef<HTMLDivElement | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 30 });
  const sy = useSpring(y, { stiffness: 260, damping: 30 });

  const track = (e: React.PointerEvent) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  };

  return (
    <section className="mt-24 md:mt-36" aria-label="Ways to follow along">
      <Focus as="p" blur={false} y={10} className="eyebrow text-amber-ink">
        {t('home.loop_eyebrow')}
      </Focus>

      <div ref={box} className="relative mt-6" onPointerMove={fine ? track : undefined} onPointerLeave={() => setHover(null)}>
        {ROWS.map((r, i) => (
          <Focus key={r.n} blur={false} y={26} delay={i * 0.08}>
            <Link
              to={r.to}
              onPointerEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              style={{ opacity: hover !== null && hover !== i ? 0.38 : 1 }}
              className="group flex items-center gap-4 border-t border-border py-6 transition-opacity duration-500 md:gap-8 md:py-10"
            >
              <span className="w-8 shrink-0 text-xs font-medium tracking-[0.2em] tabular-nums text-muted-foreground md:w-12">{r.n}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-[family-name:var(--font-display)] text-[clamp(2.75rem,9vw,6.5rem)] leading-none tracking-[-0.03em] text-foreground transition-transform duration-700 ease-out group-hover:translate-x-2 md:group-hover:translate-x-4">
                  {r.title}
                </span>
                <span className="mt-2 block max-w-md text-sm leading-relaxed text-muted-foreground md:hidden">{r.line}</span>
              </span>
              <span className="hidden max-w-[16rem] text-sm leading-relaxed text-muted-foreground md:block">{r.line}</span>
              <img src={r.img} alt="" loading="lazy" decoding="async" className="h-20 w-16 shrink-0 rounded-xl object-cover md:hidden" />
              <span
                aria-hidden="true"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border text-lg transition-all duration-500 group-hover:rotate-[-45deg] group-hover:border-foreground group-hover:bg-foreground group-hover:text-background md:h-14 md:w-14"
              >
                →
              </span>
            </Link>
          </Focus>
        ))}
        <div className="border-t border-border" />

        {fine && !reduce && (
          <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-20 hidden md:block">
            <motion.div style={{ x: sx, y: sy }}>
              <AnimatePresence>
                {hover !== null && (
                  <motion.img
                    key={hover}
                    src={ROWS[hover].img}
                    alt=""
                    className="-ml-[7.5rem] -mt-[10rem] h-[20rem] w-[15rem] rounded-2xl object-cover shadow-2xl"
                    initial={{ opacity: 0, scale: 0.88, rotate: -4 }}
                    animate={{ opacity: 1, scale: 1, rotate: -2 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
