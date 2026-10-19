import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'motion/react';

interface BeforeAfterProps {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  alt?: string;
  className?: string;
  /** Tailwind aspect class. Landscape by default; use a portrait one for portrait photos. */
  aspect?: string;
  /** Sweeps the divider across by itself when the slider scrolls into view, until the visitor touches it. */
  autoplay?: boolean;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Drag-to-compare slider: the "before" photo sits on top and is revealed from
 * the left; the divider follows the finger or mouse. A transparent range input
 * covers the whole image, so touch, mouse and keyboard (arrow keys) all work
 * and screen readers announce it as a slider. Both photos must share the same
 * framing.
 *
 * With `autoplay`, the divider sweeps across to reveal the "after" the moment
 * the slider is on screen, settles in the middle, pauses, and repeats. The
 * first touch, drag or key press stops it for good. People who prefer reduced
 * motion get the still slider.
 */
export default function BeforeAfter({
  before,
  after,
  beforeLabel = 'Before',
  afterLabel = 'After',
  alt = 'Before and after comparison',
  className = '',
  aspect = 'aspect-[4/3]',
  autoplay = false,
}: BeforeAfterProps) {
  const reduce = useReducedMotion();
  const play = autoplay && !reduce;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.55 });
  const touched = useRef(false);
  const [pos, setPos] = useState(play ? 100 : 50);
  const [hint, setHint] = useState(true);

  useEffect(() => {
    if (!play || !inView || touched.current) return;
    let stopped = false;
    let controls: { stop: () => void } | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const sweep = (from: number, to: number, duration: number) =>
      new Promise<void>((resolve) => {
        controls = animate(from, to, {
          duration,
          ease: EASE,
          onUpdate: (v) => {
            if (!stopped && !touched.current) setPos(v);
          },
          onComplete: () => resolve(),
        });
      });
    const pause = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, ms);
      });

    (async () => {
      while (!stopped && !touched.current) {
        setPos(100);
        await pause(500);
        if (stopped || touched.current) break;
        await sweep(100, 0, 1.9); // uncover the "after"
        if (stopped || touched.current) break;
        await sweep(0, 50, 0.9); // settle in the middle so both sides show
        await pause(3600);
      }
    })();

    return () => {
      stopped = true;
      controls?.stop();
      if (timer) clearTimeout(timer);
    };
  }, [play, inView]);

  const takeOver = () => {
    touched.current = true;
    setHint(false);
  };

  return (
    <div ref={ref} className={`relative isolate ${aspect} w-full select-none overflow-hidden rounded-2xl bg-muted ${className}`}>
      <img src={after} alt={`${alt}: ${afterLabel}`} className="absolute inset-0 h-full w-full object-cover" draggable={false} />

      <img
        src={before}
        alt={`${alt}: ${beforeLabel}`}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        draggable={false}
      />

      <span
        className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur transition-opacity duration-300"
        style={{ opacity: pos < 14 ? 0 : 1 }}
      >
        {beforeLabel}
      </span>
      <span
        className="pointer-events-none absolute right-3 top-3 rounded-full bg-[var(--fashion-display)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#14120F] transition-opacity duration-300"
        style={{ opacity: pos > 86 ? 0 : 1 }}
      >
        {afterLabel}
      </span>

      <div className="pointer-events-none absolute inset-y-0 w-px bg-white/90 shadow-[0_0_0_1px_rgba(0,0,0,.15)]" style={{ left: `${pos}%` }}>
        <span className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-stone-900 shadow-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
          </svg>
        </span>
      </div>

      {play && hint && (
        <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-white backdrop-blur">
          Drag to compare
        </span>
      )}

      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => {
          takeOver();
          setPos(Number(e.target.value));
        }}
        onPointerDown={takeOver}
        onKeyDown={takeOver}
        aria-label={`Compare ${beforeLabel.toLowerCase()} and ${afterLabel.toLowerCase()}`}
        className="absolute inset-0 z-10 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
