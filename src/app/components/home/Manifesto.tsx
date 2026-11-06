import { useRef } from 'react';
import { Link } from 'react-router-dom';
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

export default function Manifesto() {
  const t = useContent();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLParagraphElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.88', 'end 0.5'] });
  const text = t('home.manifesto');
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <section className="mt-20 md:mt-32" aria-label="About Keem">
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
      <Focus blur={false} y={10} className="mt-8">
        <Link to="/about" className="press inline-flex items-center gap-2 text-sm font-semibold text-foreground underline decoration-border underline-offset-[6px] transition-colors hover:decoration-foreground">
          {t('home.manifesto_link')} <span aria-hidden="true">→</span>
        </Link>
      </Focus>
    </section>
  );
}
