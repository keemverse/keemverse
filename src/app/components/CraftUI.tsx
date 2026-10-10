import type { CSSProperties, ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from './ui/utils';
import { CRAFT, FASHION, accentText } from '../lib/theme';

// Building blocks lifted from the Arena prototype (buttons with a lift and a
// shimmer sweep, tag pills, reveal on scroll). Fonts and colours stay KEEMVERSE's: everything reads from the
// site's theme tokens, so light and dark mode work, and the accent is a prop
// (lime for Digital Craft; another universe can pass its own later).

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

type BtnProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'accent' | 'dark' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit';
  icon?: ReactNode;
  ariaLabel?: string;
  external?: boolean;
  pressed?: boolean;
  /** Accent colour for the primary variant. */
  accent?: string;
};

export function Btn({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  icon,
  ariaLabel,
  external,
  pressed,
  accent,
}: BtnProps) {
  const base =
    'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-semibold tracking-tight transition-all duration-300 will-change-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background';
  const sizes = { sm: 'px-4 py-2 text-[13px]', md: 'px-6 py-3 text-sm', lg: 'px-8 py-4 text-sm' }[size];
  const variants = {
    // Soft Sand at rest (the brand's signature tone), the universe accent on hover
    primary:
      'border border-black/10 bg-[#D8C9B0] text-[#14120F] shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_10px_26px_-16px_rgba(20,18,15,0.45)] hover:-translate-y-0.5 hover:border-transparent hover:bg-[var(--btn-accent)]',
    // solid accent fill, for selected / active states
    accent: 'text-[#14120F] hover:-translate-y-0.5',
    dark: 'bg-foreground text-background hover:-translate-y-0.5 hover:opacity-90 shadow-[0_10px_30px_-16px_rgba(0,0,0,0.6)]',
    outline: 'border border-foreground/20 bg-background/40 text-foreground backdrop-blur hover:-translate-y-0.5 hover:border-foreground/50',
    ghost: 'text-foreground/70 hover:text-foreground px-2 py-1',
  }[variant];
  const style =
    variant === 'accent'
      ? { backgroundColor: accent ?? CRAFT, boxShadow: `0 10px 30px -12px ${accent ?? CRAFT}` }
      : variant === 'primary'
      ? ({ ['--btn-accent' as string]: accent ?? FASHION } as CSSProperties)
      : undefined;

  const inner = (
    <>
      <span className="relative z-10">{children}</span>
      {icon ? <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">{icon}</span> : null}
      {variant !== 'ghost' && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full motion-reduce:hidden"
        />
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        aria-label={ariaLabel}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={cn(base, sizes, variants, className)}
        style={style}
      >
        {inner}
      </a>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={pressed}
      className={cn(base, sizes, variants, className)}
      style={style}
    >
      {inner}
    </button>
  );
}

/** Small uppercase pill, as on the prototype's design cards and badges. */
export function Tag({
  children,
  tone = 'neutral',
  accent = CRAFT,
  className,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'inverse';
  accent?: string;
  className?: string;
}) {
  const base = 'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold tracking-[0.14em] uppercase';
  if (tone === 'accent') {
    return (
      <span className={cn(base, className)} style={{ borderColor: `${accent}99`, color: accentText(accent), backgroundColor: `${accent}26` }}>
        {children}
      </span>
    );
  }
  const tones = {
    neutral: 'border-border bg-card/60 text-muted-foreground',
    inverse: 'border-transparent bg-foreground/85 text-background backdrop-blur',
  }[tone];
  return <span className={cn(base, tones, className)}>{children}</span>;
}

/** Section divider: a label centred between two hairlines. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-14 flex items-center gap-4">
      <div className="h-px flex-1 bg-border" />
      <span className="inline-flex items-center gap-2.5 text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">
        {children}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

/**
 * Infinite-scroll strip of short words on a dark band, after the Arena
 * prototype's marquee. Purely decorative (aria-hidden), so the same facts
 * must also be readable elsewhere on the page.
 */
export function Marquee({ items, className }: { items: string[]; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('dc-marquee relative overflow-hidden rounded-full border border-white/10 bg-[#0F0F11] py-3.5 text-[#F5F2EC]', className)}
    >
      <div className="dc-marquee-track flex w-max items-center will-change-transform">
        {[0, 1, 2, 3].map((dup) => (
          <div key={dup} className="flex items-center">
            {items.map((t) => (
              <span key={t} className="flex items-center gap-7 pr-7 text-[11px] font-semibold uppercase tracking-[0.26em] whitespace-nowrap text-[#F5F2EC]/75 md:text-xs">
                {t}
                <span className="h-1 w-1 rotate-45 bg-[#D8C9B0]/70" />
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0F0F11] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0F0F11] to-transparent" />
    </div>
  );
}
