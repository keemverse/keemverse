import { useEffect, useId, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface FilterChipsProps {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
  /** Optional count shown on each chip, e.g. { Tech: 4 }. Chips with 0 are dimmed. */
  counts?: Record<string, number>;
  label?: string;
  className?: string;
}

/**
 * A scrollable row of category chips. Replaces the small dropdown: every
 * category is visible at a glance, one tap changes it, and the active chip
 * glides between choices. The row scrolls sideways on a phone and keeps the
 * active chip in view.
 */
export default function FilterChips({
  tabs,
  activeTab,
  onChange,
  counts,
  label = 'Filter by category',
  className = '',
}: FilterChipsProps) {
  const id = useId();
  const reduce = useReducedMotion();
  const activeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  }, [activeTab, reduce]);

  return (
    <div className={`relative ${className}`}>
      <div
        role="tablist"
        aria-label={label}
        className="rail -mx-5 px-5 md:mx-0 md:px-0 md:flex-wrap md:justify-center gap-2 py-1 [mask-image:linear-gradient(to_right,transparent,#000_20px,#000_calc(100%-20px),transparent)] md:[mask-image:none]"
      >
        {tabs.map((tab) => {
          const active = tab === activeTab;
          const count = counts && tab !== 'All' ? counts[tab] ?? 0 : undefined;
          const empty = count === 0;
          return (
            <button
              key={tab}
              ref={active ? activeRef : undefined}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => onChange(tab)}
              className={`press relative shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium whitespace-nowrap transition-colors duration-300 ${
                active
                  ? 'border-transparent text-background'
                  : 'border-border bg-card/60 text-foreground/75 hover:border-foreground/30 hover:text-foreground'
              } ${empty ? 'opacity-45' : ''}`}
            >
              {active && (
                <motion.span
                  layoutId={`chip-${id}`}
                  className="absolute inset-0 rounded-full bg-foreground"
                  transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10">
                {tab}
                {typeof count === 'number' && count > 0 && (
                  <span className={`ml-1.5 text-[11px] tabular-nums ${active ? 'opacity-70' : 'text-muted-foreground'}`}>{count}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
