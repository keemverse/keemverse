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
}

/**
 * The site's one neutral CTA pill — beige fill, bordered, inset+drop
 * shadow, lifts on hover. This is the exact recipe behind "enter" on
 * the hero cards and "shop now" on product cards. Renders as an <a>
 * when `href` is given, a <button> when `onClick` is given, or a
 * plain <span> when it's just decorative inside an already-clickable
 * parent (the hero cards work this way).
 */
export function PillButton({
  children,
  href,
  external,
  onClick,
  arrow = true,
  groupHover = false,
  className = '',
}: PillButtonProps) {
  const hoverClasses = groupHover
    ? 'group-hover:-translate-y-0.5 group-hover:bg-[#E5DDCF]'
    : 'hover:-translate-y-0.5 hover:bg-[#E5DDCF]';

  const base = `inline-flex items-center gap-1.5 md:gap-2 rounded-full border border-stone-300 bg-[#ECE5D9] px-4 py-2 md:px-7 md:py-3 text-[11px] md:text-xs font-semibold tracking-[0.15em] text-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_8px_20px_rgba(0,0,0,.06)] transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${hoverClasses} ${className}`;

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
      >
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={`${base} ${groupHover ? '' : 'group/button'}`}>
        {content}
      </button>
    );
  }

  return <span className={base}>{content}</span>;
}
