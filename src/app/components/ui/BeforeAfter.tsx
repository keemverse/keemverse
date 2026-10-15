import { useState } from 'react';

interface BeforeAfterProps {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  alt?: string;
  className?: string;
}

/**
 * Drag-to-compare slider: the "before" photo sits on top and is revealed from
 * the left; the divider follows the finger or mouse. A transparent range input
 * covers the whole image, so touch, mouse and keyboard (arrow keys) all work
 * and screen readers announce it as a slider. Both photos must share the same
 * framing.
 */
export default function BeforeAfter({
  before,
  after,
  beforeLabel = 'Before',
  afterLabel = 'After',
  alt = 'Before and after comparison',
  className = '',
}: BeforeAfterProps) {
  const [pos, setPos] = useState(50);

  return (
    <div className={`relative isolate aspect-[4/3] w-full select-none overflow-hidden rounded-2xl bg-muted ${className}`}>
      <img src={after} alt={`${alt}: ${afterLabel}`} className="absolute inset-0 h-full w-full object-cover" draggable={false} />

      <img
        src={before}
        alt={`${alt}: ${beforeLabel}`}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        draggable={false}
      />

      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
        {afterLabel}
      </span>

      <div className="pointer-events-none absolute inset-y-0 w-px bg-white/90 shadow-[0_0_0_1px_rgba(0,0,0,.15)]" style={{ left: `${pos}%` }}>
        <span className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-stone-900 shadow-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
          </svg>
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`Compare ${beforeLabel.toLowerCase()} and ${afterLabel.toLowerCase()}`}
        className="absolute inset-0 z-10 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
