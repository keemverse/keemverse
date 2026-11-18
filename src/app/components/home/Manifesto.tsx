import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useContent } from '../../lib/siteContent';
import { Focus } from '../ui/Cine';

// A paragraph that "reads itself in": each word brightens from faint to full as
// the section scrolls through the screen. Plain text for reduced motion.

function Word({ word, range, progress }: { word: string; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.26em] inline-block">
      {word}
    </motion.span>
  );
}

// What a brand gets from that, in three short lines.
const SOLUTION = [
  { n: '01', title: 'Styled', line: 'I choose how your pieces come together, so the outfit feels like something.' },
  { n: '02', title: 'Told', line: 'I turn it into a short story, solo or as a pair, made for TikTok, Instagram and Pinterest.' },
  { n: '03', title: 'Tracked', line: 'Every post carries your code, and I tell you honestly what it sold.' },
];

export default function Manifesto() {
  const t = useContent();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLParagraphElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.88', 'end 0.5'] });
  const text = t('home.manifesto');
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <section id="hi" className="mt-24 scroll-mt-24 md:mt-36" aria-label="About Keem">
      <Focus as="p" blur={false} y={10} className="eyebrow text-amber-ink">
        {t('home.manifesto_eyebrow')}
      </Focus>
      <p
        ref={ref}
        className="mt-5 max-w-4xl font-[family-name:var(--font-display)] text-[clamp(1.75rem,4.6vw,3.5rem)] leading-[1.14] tracking-[-0.015em] text-foreground"
        aria-label={text}
      >
        {reduce
          ? text
          : words.map((w, i) => (
              <Word
                key={`${w}-${i}`}
                word={w}
                progress={scrollYProgress}
                range={[i / words.length, Math.min(1, (i + 2) / words.length)]}
              />
            ))}
      </p>

      <div className="mt-14 border-t border-border pt-8">
        <Focus as="p" blur={false} y={10} className="eyebrow text-amber-ink">
          What that means for your brand
        </Focus>
        <ol className="mt-6 grid gap-8 md:grid-cols-3 md:gap-10">
          {SOLUTION.map((s, i) => (
            <Focus key={s.n} as="li" blur={false} y={20} delay={0.08 * i}>
              <span className="font-[family-name:var(--font-display)] text-3xl italic leading-none text-amber-ink/70">{s.n}</span>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl leading-tight">{s.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{s.line}</p>
            </Focus>
          ))}
        </ol>
      </div>

      <Focus blur={false} y={10} className="mt-10">
        <p className="font-[family-name:var(--font-display)] text-2xl italic text-muted-foreground">Keem</p>
      </Focus>
    </section>
  );
}
