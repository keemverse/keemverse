import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Frame } from '../../data/gallery';

/**
 * Full-screen viewer for the gallery. Arrow keys and swipe move between
 * frames, Escape or a tap on the dark area closes it, and the page behind
 * stays put (scroll is locked while it is open).
 */
export function Lightbox({
  frames,
  index,
  onClose,
  onChange,
}: {
  frames: Frame[];
  index: number | null;
  onClose: () => void;
  onChange: (next: number) => void;
}) {
  const open = index !== null && frames.length > 0;
  const total = frames.length;

  useEffect(() => {
    if (!open || index === null) return;
    const go = (d: number) => onChange((index + d + total) % total);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    // Warm the neighbours so the next frame never waits on a download.
    [1, -1].forEach((d) => {
      const img = new Image();
      img.src = frames[(index + d + total) % total].src;
    });
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, index, total, frames, onChange, onClose]);

  const frame = index !== null ? frames[index] : null;

  return (
    <AnimatePresence>
      {open && frame && index !== null && (
        <motion.div
          key="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${frame.title}, photo ${index + 1} of ${total}`}
          className="fixed inset-0 z-[80] flex flex-col bg-[#0A0A0B]/95 text-[#F5F2EC] backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          onClick={onClose}
        >
          <div className="flex items-center justify-between px-5 pt-4 md:px-8" onClick={(e) => e.stopPropagation()}>
            <p className="text-[12px] font-medium uppercase tracking-[0.2em] tabular-nums text-[#F5F2EC]/70">
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </p>
            <button
              type="button"
              autoFocus
              onClick={onClose}
              aria-label="Close"
              className="press grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 py-3 md:px-20">
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={frame.id}
                src={frame.src}
                alt={`${frame.title}: ${frame.note}`}
                draggable={false}
                onClick={(e) => e.stopPropagation()}
                className="max-h-full max-w-full cursor-grab rounded-xl object-contain shadow-2xl active:cursor-grabbing"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.985 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                drag={total > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.5}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -70) onChange((index + 1) % total);
                  else if (info.offset.x > 70) onChange((index - 1 + total) % total);
                }}
              />
            </AnimatePresence>

            {total > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange((index - 1 + total) % total);
                  }}
                  className="press absolute left-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20 md:grid"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange((index + 1) % total);
                  }}
                  className="press absolute right-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20 md:grid"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          <div
            className="mx-auto flex w-full max-w-3xl flex-col items-center gap-1 px-5 pb-6 text-center md:pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-display-md font-[family-name:var(--font-display)]">{frame.title}</h2>
            <p className="text-sm text-[#F5F2EC]/70">{frame.note}</p>
            {frame.href && (
              <Link
                to={frame.href}
                onClick={onClose}
                className="press mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#F5F2EC] px-5 py-2.5 text-sm font-semibold text-[#0F0F11]"
              >
                See the look <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
