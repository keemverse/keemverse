import type { ReactNode, MouseEvent } from 'react';
import { onAccent, accentText, SAND } from '../../lib/theme';

interface PillButtonProps {
  children: ReactNode;
  href?: string;
  external?: boolean;
  onClick?: (e: MouseEvent) => void;
  arrow?: boolean;
  /** Set true when this sits inside a parent element with a `group`
   * class (e.g. the whole card is the real link) — hover then reacts
   * to hovering the card, not just the button itself. */
  groupHover?: boolean;
  className?: string;
  /** Pass a universe's accent + accentDark (from lib/theme.ts) to
   * render this pill in Soft Sand that fills with the universe accent on hover
   * instead of the neutral beige default. Omit for the neutral style. */
  accent?: string;
  accentDark?: string;
  /** With `accent`: render a quiet accent-outlined pill (transparent
   * fill, accent text/border) that fills solid on hover, instead of
   * the loud solid-fill default. Use for secondary actions that
   * shouldn't compete with the page's one real CTA. */
  ghost?: boolean;
}

/**
 * The site's CTA pill — neutral beige by default (the exact recipe
 * behind "enter" on the hero cards and "shop now" on product cards),
 * a solid universe-accent fill when `accent`/`accentDark` are passed,
 * or a quiet accent-outlined pill when `ghost` is added on top.
 * Renders as an <a> when `href` is given, a <button> when `onClick`
 * is given, or a plain <span> when it's just decorative inside an
 * already-clickable parent (the hero cards work this way).
 */
export function PillButton({
  children,
  href,
  external,
  onClick,
  arrow = true,
  groupHover = false,
  className = '',
  accent,
  accentDark,
  ghost = false,
}: PillButtonProps) {
  const isAccent = Boolean(accent);
  const isGhost = isAccent && ghost;

  const translateHover = groupHover ? 'group-hover:-translate-y-0.5' : 'hover:-translate-y-0.5';
  const neutralHover = groupHover ? 'group-hover:brightness-95' : 'hover:brightness-95';

  const base = `inline-flex items-center gap-1.5 md:gap-2 rounded-full border px-4 py-2 md:px-7 md:py-3 text-[11px] md:text-xs font-semibold tracking-[0.15em] transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${translateHover} ${
    isGhost
      ? 'bg-transparent'
      : isAccent
      ? 'border-transparent'
      : `border-border bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_8px_20px_rgba(0,0,0,.06)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_8px_20px_rgba(0,0,0,.3)] ${neutralHover}`
  } ${className}`;

  const accentStyle = isGhost
    ? { borderColor: accent, color: accentText(accent!) }
    : isAccent
    ? {
        // Soft Sand at rest; the universe accent fills in on hover
        backgroundColor: SAND,
        color: '#14120F',
        borderColor: 'rgba(20,18,15,.10)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.45), 0 8px 20px -10px rgba(20,18,15,.4)',
      }
    : undefined;

  const accentHoverHandlers = isGhost
    ? {
        onMouseEnter: (e: MouseEvent<HTMLElement>) => {
          const el = e.currentTarget as HTMLElement;
          el.style.backgroundColor = accent!;
          el.style.color = onAccent(accent!);
        },
        onMouseLeave: (e: MouseEvent<HTMLElement>) => {
          const el = e.currentTarget as HTMLElement;
          el.style.backgroundColor = 'transparent';
          el.style.color = accentText(accent!);
        },
      }
    : isAccent
    ? {
        onMouseEnter: (e: MouseEvent<HTMLElement>) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = accent!;
        },
        onMouseLeave: (e: MouseEvent<HTMLElement>) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = SAND;
        },
      }
    : {};

  const content = (
    <>
      {children}
      {arrow && (
        <span
          className={
            groupHover
              ? 'transition-transform group-hover:translate-x-1'
              : 'transition-transform group-hover/button:translate-x-1'
          }
        >
          →
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        onClick={onClick}
        className={`${base} ${groupHover ? '' : 'group/button'}`}
        style={accentStyle}
        {...accentHoverHandlers}
      >
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${base} ${groupHover ? '' : 'group/button'}`}
        style={accentStyle}
        {...accentHoverHandlers}
      >
        {content}
      </button>
    );
  }

  return (
    <span className={base} style={accentStyle} {...accentHoverHandlers}>
      {content}
    </span>
  );
}
