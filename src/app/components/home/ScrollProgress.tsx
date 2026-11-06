import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';

/** A hairline across the very top of the screen that fills as the page is read. */
export default function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  if (reduce) return null;
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-[#D98E2B]"
      style={{ scaleX }}
    />
  );
}
