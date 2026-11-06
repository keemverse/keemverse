import { useEffect, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { useMediaQuery } from '../../lib/useMediaQuery';

/**
 * A round "View" label that trails the pointer while it is over any element
 * marked `data-frame`. Mouse and trackpad only; on touch screens it is not
 * rendered at all.
 */
export default function ViewCursor({ label = 'View' }: { label?: string }) {
  const fine = useMediaQuery('(hover: hover) and (pointer: fine)');
  const reduce = useReducedMotion();
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 420, damping: 34, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 420, damping: 34, mass: 0.6 });
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!fine) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setOn(!!(e.target as Element | null)?.closest?.('[data-frame]'));
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [fine, x, y]);

  if (!fine) return null;
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[70]"
      style={{ x: reduce ? x : sx, y: reduce ? y : sy }}
    >
      <motion.span
        animate={{ scale: on ? 1 : 0.2, opacity: on ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="-ml-10 -mt-10 grid h-20 w-20 place-items-center rounded-full bg-[#F5F2EC] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0F0F11] shadow-xl"
      >
        {label}
      </motion.span>
    </motion.div>
  );
}
