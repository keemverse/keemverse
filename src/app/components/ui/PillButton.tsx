import type { ReactNode, MouseEvent } from 'react';

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
   * render this pill as a solid Fashion-amber or Craft-teal fill
   * instead of the neutral beige default. Omit for the neutral style. */
  accent?: string;
  accentDark?: string;
}

/**
 * The site's CTA pill — neutral beige by default (the exact recipe
 * behind "enter" on the hero cards and "shop now" on product cards),
 * or a solid universe-accent fill when `accent`/`accentDark` are
 * passed. Renders as an <a> when `href` is given, a <button> when
 * `onClick` is given, or a plain <span> when it's just decorative
 * inside an already-clickable parent (the hero cards work this way).
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
}: PillButtonProps) {
  const isAccent = Boolean(accent);

  const translateHover = groupHover ? 'group-hover:-translate-y-0.5' : 'hover:-translate-y-0.5';
  const neutralHover = groupHover ? 'group-hover:bg-[#E5DDCF]' : 'hover:bg-[#E5DDCF]';

  const base = `inline-flex items-center gap-1.5 md:gap-2 rounded-full border px-4 py-2 md:px-7 md:py-3 text-[11px] md:text-xs font-semibold tracking-[0.15em] transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${translateHover} ${
    isAccent
      ? 'text-white border-transparent'
      : `border-stone-300 bg-[#ECE5D9] text-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_8px_20px_rgba(0,0,0,.06)] ${neutralHover}`
  } ${className}`;

  const accentStyle = isAccent
    ? {
        backgroundColor: accent,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,.25), 0 8px 20px -4px ${accent}80`,
      }
    : undefined;

  const accentHoverHandlers = isAccent
    ? {
        onMouseEnter: (e: MouseEvent<HTMLElement>) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = accentDark || accent!;
        },
        onMouseLeave: (e: MouseEvent<HTMLElement>) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = accent!;
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
