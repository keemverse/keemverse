import { useRef, type ElementType, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { CINE_DUR, CINE_EASE, CINE_MARGIN } from '../../lib/cine';

// Cinematic building blocks. Each one renders plain, finished content when
// the visitor has reduced motion switched on, so nothing is ever left hidden.

// Motion leaves "blur(0px)" behind after a rack-focus; that still makes the
// element a containing block for fixed children, so clear it once settled.
function settle(el: HTMLElement | null) {
  if (!el) return;
  el.style.filter = 'none';
  el.style.willChange = 'auto';
}

/**
 * Rack focus: arrives slightly soft and low, then pulls into focus. Good for
 * paragraphs, eyebrows, buttons and whole sections. Keep `blur` for a few
 * elements at a time (it is heavier on phones); lists use `blur={false}`.
 */
export function Focus({
  children,
  as = 'div',
  delay = 0,
  y = 22,
  blur = true,
  className,
  immediate = false,
}: {
  children: ReactNode;
  as?: 'div' | 'p' | 'span' | 'section' | 'li' | 'figure' | 'header';
  delay?: number;
  y?: number;
  blur?: boolean;
  className?: string;
  /** Play on load instead of when scrolled into view (for things above the fold). */
  immediate?: boolean;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const Tag = motion[as] as ElementType;
  if (reduce) {
    const Plain = as as ElementType;
    return <Plain className={className}>{children}</Plain>;
  }
  const from = { opacity: 0, y, ...(blur ? { filter: 'blur(10px)' } : {}) };
  const to = { opacity: 1, y: 0, ...(blur ? { filter: 'blur(0px)' } : {}) };
  const trigger = immediate
    ? { animate: to }
    : { whileInView: to, viewport: { once: true, margin: CINE_MARGIN } };
  return (
    <Tag
      ref={ref}
      className={className}
      initial={from}
      {...trigger}
      transition={{ duration: CINE_DUR.base, delay, ease: CINE_EASE }}
      onAnimationComplete={() => blur && settle(ref.current)}
    >
      {children}
    </Tag>
  );
}

/**
 * One line of a headline, rising out of a mask like a title card. Stack
 * several (each with a larger `delay`) for a multi-line headline. The padding
 * keeps descenders from being clipped.
 */
export function MaskLine({
  children,
  delay = 0,
  className = '',
  immediate = false,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  immediate?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={`block ${className}`}>{children}</span>;
  const trigger = immediate
    ? { animate: { y: '0%', opacity: 1 } }
    : { whileInView: { y: '0%', opacity: 1 }, viewport: { once: true, margin: CINE_MARGIN } };
  return (
    <span className={`block overflow-hidden pb-[0.14em] -mb-[0.14em] ${className}`}>
      <motion.span
        className="block"
        initial={{ y: '108%', opacity: 0 }}
        {...trigger}
        transition={{ duration: CINE_DUR.base + 0.2, delay, ease: CINE_EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/**
 * A photograph arriving like a shot opening: the frame lifts from a letterbox
 * while the picture settles from a slow push-in. With `parallax` it also drifts
 * a little against the scroll. Give it the size (and rounding) you want; the
 * child should fill it (`h-full w-full object-cover`).
 */
export function Unveil({
  children,
  className = '',
  delay = 0,
  parallax = 0,
  immediate = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Percent of the frame the picture drifts across the scroll, e.g. 6. 0 = still. */
  parallax?: number;
  immediate?: boolean;
}) {
  const reduce = useReducedMotion();
  const frame = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: frame, offset: ['start end', 'end start'] });
  const drift = useTransform(scrollYProgress, [0, 1], [`${parallax}%`, `${-parallax}%`]);

  if (reduce) return <div className={`overflow-hidden ${className}`}>{children}</div>;

  const trigger = immediate
    ? { animate: { clipPath: 'inset(0% 0 0% 0)', scale: 1, opacity: 1 } }
    : {
        whileInView: { clipPath: 'inset(0% 0 0% 0)', scale: 1, opacity: 1 },
        viewport: { once: true, margin: CINE_MARGIN },
      };
  return (
    <div ref={frame} className={`overflow-hidden ${className}`}>
      <motion.div className="h-full w-full" style={parallax ? { y: drift, scale: 1 + (parallax * 2) / 100 } : undefined}>
        <motion.div
          className="h-full w-full"
          initial={{ clipPath: 'inset(14% 0 14% 0)', scale: 1.14, opacity: 0 }}
          {...trigger}
          transition={{
            clipPath: { duration: CINE_DUR.slow, delay, ease: CINE_EASE },
            scale: { duration: CINE_DUR.slow + 0.6, delay, ease: CINE_EASE },
            opacity: { duration: CINE_DUR.base * 0.7, delay },
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}

/** Drifts its content against the scroll. Subtle depth for big pieces of type or art. */
export function Drift({
  children,
  from = 24,
  to = -24,
  className,
}: {
  children: ReactNode;
  from?: number;
  to?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [from, to]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

/** Section-level arrival: rises and settles on the site's cinematic curve. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <Focus className={className} delay={delay} y={y} blur={false}>
      {children}
    </Focus>
  );
}
