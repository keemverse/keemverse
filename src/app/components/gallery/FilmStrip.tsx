import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';
import type { Frame } from '../../data/gallery';
import { useMediaQuery } from '../../lib/useMediaQuery';
import { useContent } from '../../lib/siteContent';
import { Lightbox } from './Lightbox';
import ViewCursor from './ViewCursor';
import { Focus, MaskLine } from '../ui/Cine';

// The home page's "screening room": a dark band of frames. On a desktop the
// band pins to the screen and the frames slide sideways as you scroll down; on
// a phone (or with reduced motion) it is a swipeable strip. Tapping a frame
// opens the full-screen viewer.

const pad = (n: number) => String(n).padStart(2, '0');

function StripCard({
  frame,
  n,
  progress,
  pinned,
  onOpen,
}: {
  frame: Frame;
  n: number;
  progress: MotionValue<number>;
  pinned: boolean;
  onOpen: () => void;
}) {
  // The picture drifts a little inside its frame as the strip travels, for depth.
  const shift = useTransform(progress, [0, 1], ['-5%', '5%']);
  const wide = frame.ratio > 1;
  return (
    <button
      type="button"
      data-frame
      onClick={onOpen}
      aria-label={`Open ${frame.title}`}
      className="group relative shrink-0 text-left outline-offset-4 focus-visible:outline-2 focus-visible:outline-[#F5F2EC]"
      style={
        pinned
          ? { height: '100%', aspectRatio: String(frame.ratio) }
          : { width: wide ? 'min(86vw, 26rem)' : 'min(66vw, 18rem)', aspectRatio: String(frame.ratio) }
      }
    >
      <span className="spot cine-sheen relative block h-full w-full overflow-hidden rounded-2xl bg-[#1A1A1D]">
        <motion.img
          src={frame.src}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          className="h-full w-full scale-[1.14] object-cover"
          style={{ x: shift, objectPosition: frame.position ?? '50% 50%' }}
        />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
        <span className="absolute left-4 top-3.5 text-[11px] font-medium tracking-[0.2em] tabular-nums text-[#F5F2EC]/85">{pad(n)}</span>
        <span className="absolute inset-x-4 bottom-3.5 flex items-end justify-between gap-3">
          <span className="font-[family-name:var(--font-display)] text-xl leading-tight text-[#F5F2EC] md:text-2xl">{frame.title}</span>
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#F5F2EC]/70">{frame.kind}</span>
        </span>
      </span>
    </button>
  );
}

function EndCard({ pinned }: { pinned: boolean }) {
  return (
    <Link
      to="/gallery"
      className="group press relative grid shrink-0 place-items-center rounded-2xl border border-[#F5F2EC]/20 text-center text-[#F5F2EC] transition-colors hover:border-[#F5F2EC]/60"
      style={pinned ? { height: '100%', width: 'min(24rem, 40vw)' } : { width: 'min(60vw, 14rem)', aspectRatio: '3 / 4' }}
    >
      <span className="px-6">
        <span className="block font-[family-name:var(--font-display)] text-3xl md:text-4xl">All frames</span>
        <span aria-hidden="true" className="mt-3 inline-grid h-12 w-12 place-items-center rounded-full bg-[#F5F2EC] text-lg text-[#0F0F11] transition-transform duration-500 group-hover:translate-x-1">
          →
        </span>
      </span>
    </Link>
  );
}

export default function FilmStrip({ frames }: { frames: Frame[] }) {
  const t = useContent();
  const reduce = useReducedMotion();
  const wide = useMediaQuery('(min-width: 768px)');
  const pinned = wide && !reduce;

  const outer = useRef<HTMLDivElement | null>(null);
  const track = useRef<HTMLDivElement | null>(null);
  const [dist, setDist] = useState(0);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const still = useMotionValue(0.5);

  const { scrollYProgress } = useScroll({ target: outer, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);
  const barScale = useTransform(scrollYProgress, [0, 1], [0.04, 1]);
  const progress = pinned ? scrollYProgress : still;

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (pinned) setActive(Math.min(frames.length - 1, Math.round(v * (frames.length - 1))));
  });

  // How far the strip has to travel: its full width minus one screen.
  useLayoutEffect(() => {
    if (!pinned) return;
    const measure = () => {
      const el = track.current;
      if (el) setDist(Math.max(0, el.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [pinned, frames.length]);

  const header = (
    <div className="mx-auto flex w-full max-w-6xl items-end justify-between gap-6 px-5 md:px-8">
      <div>
        <Focus as="p" blur={false} y={10} className="eyebrow text-[#E9B565]">
          {t('home.frames_eyebrow')}
        </Focus>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(2.25rem,6vw,4.5rem)] leading-none tracking-[-0.02em]">
          <MaskLine>{t('home.frames_title')}</MaskLine>
        </h2>
      </div>
      {pinned && (
        <p className="pb-1 text-[13px] font-medium tracking-[0.2em] tabular-nums text-[#F5F2EC]/70" aria-hidden="true">
          {pad(active + 1)} / {pad(frames.length)}
        </p>
      )}
    </div>
  );

  return (
    <section
      id="frames"
      aria-label="Frames from my shoots"
      className="relative bg-[#0F0F11] text-[#F5F2EC]"
      ref={outer}
      style={pinned ? { height: `calc(100vh + ${dist}px)` } : undefined}
    >
      <ViewCursor />
      {pinned ? (
        <div className="sticky top-0 flex h-screen flex-col justify-center gap-7 overflow-hidden py-10">
          {header}
          <motion.div
            ref={track}
            style={{ x }}
            className="flex h-[min(58vh,36rem)] w-max items-stretch gap-6 pl-[max(2rem,calc((100vw-72rem)/2+2rem))] pr-[max(2rem,calc((100vw-72rem)/2+2rem))]"
          >
            {frames.map((f, i) => (
              <StripCard key={f.id} frame={f} n={i + 1} progress={progress} pinned onOpen={() => setOpen(i)} />
            ))}
            <EndCard pinned />
          </motion.div>
          <div className="mx-auto w-full max-w-6xl px-5 md:px-8" aria-hidden="true">
            <div className="h-px w-full bg-[#F5F2EC]/15">
              <motion.div className="h-px origin-left bg-[#E9B565]" style={{ scaleX: barScale }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="py-14 md:py-20">
          {header}
          <div className="rail mt-8 px-5 pb-2 md:px-8">
            {frames.map((f, i) => (
              <StripCard key={f.id} frame={f} n={i + 1} progress={progress} pinned={false} onOpen={() => setOpen(i)} />
            ))}
            <EndCard pinned={false} />
          </div>
        </div>
      )}

      <Lightbox frames={frames} index={open} onClose={() => setOpen(null)} onChange={setOpen} />
    </section>
  );
}
