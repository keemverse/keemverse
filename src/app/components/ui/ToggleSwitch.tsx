interface ToggleSwitchProps {
  /** true = sits on the left side, false = right side */
  isLeft: boolean;
  onToggle: () => void;
  leftLabel: string;
  rightLabel: string;
}

/**
 * The universe-switch toggle used in NavBar. Track/thumb styling
 * lives here once — change the gradient or add per-universe color
 * later and every page using this component updates together.
 */
export function ToggleSwitch({ isLeft, onToggle, leftLabel, rightLabel }: ToggleSwitchProps) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`text-sm sm:text-base font-medium transition-colors duration-300 ${
          isLeft ? 'text-stone-900' : 'text-stone-400'
        }`}
      >
        {leftLabel}
      </span>

      <button
        onClick={onToggle}
        aria-label={`Switch to ${isLeft ? rightLabel : leftLabel}`}
        className="relative w-12 h-7 rounded-full border border-[#d8d0c8] bg-gradient-to-b from-[#f4efe9] to-[#ddd3c8] shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_2px_6px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden"
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-gradient-to-b from-[#b8ada2] to-[#8f857b] shadow-[0_1px_3px_rgba(0,0,0,0.18)] transition-all duration-300"
          style={{ left: isLeft ? '1px' : '23px' }}
        />
      </button>

      <span
        className={`text-sm sm:text-base font-medium transition-colors duration-300 ${
          !isLeft ? 'text-stone-900' : 'text-stone-400'
        }`}
      >
        {rightLabel}
      </span>
    </div>
  );
}
