import type { ReactNode } from 'react';

interface IconButtonProps {
  children: ReactNode;
  onClick?: () => void;
  ariaLabel: string;
  ariaExpanded?: boolean;
  className?: string;
}

/**
 * The circular bordered/gradient shell used for icon-only buttons
 * (currently the landing page's burger menu). Same gradient/border
 * recipe as the universe-page toggle, so any new icon button matches
 * that visual language automatically.
 */
export function IconButton({
  children,
  onClick,
  ariaLabel,
  ariaExpanded,
  className = '',
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      className={`relative w-11 h-11 rounded-full border border-[#d8d0c8] bg-gradient-to-b from-[#f4efe9] to-[#ddd3c8] shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_2px_6px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center gap-[5px] ${className}`}
    >
      {children}
    </button>
  );
}
