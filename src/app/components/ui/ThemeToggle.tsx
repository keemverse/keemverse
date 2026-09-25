import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../lib/useTheme';

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

const STARS = [
  { x: 8, y: 7, size: 2.2, delay: 0 },
  { x: 30, y: 5, size: 1.6, delay: 0.1 },
  { x: 20, y: 20, size: 1.4, delay: 0.2 },
];

const SPARK_ANGLES = [0, 60, 120, 180, 240, 300];

/**
 * Sun/moon switch. Track becomes a tiny night sky (stars fade in) when
 * dark is active; thumb morphs between a sun and a crescent+stars glyph.
 * role="switch" + aria-checked so it reads correctly on a screen reader,
 * and it's a plain <button> so Enter/Space work with no extra handling.
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const reducedMotion = useReducedMotion();
  const [burst, setBurst] = useState(0);

  const spring = reducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 500, damping: 30 };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => {
        toggleTheme();
        if (!reducedMotion) setBurst((n) => n + 1);
      }}
      className="relative w-14 h-8 rounded-full shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98E2B] focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #201C3A 0%, #0E0C1C 100%)'
          : 'linear-gradient(135deg, #FBEBC9 0%, #F6DCA0 100%)',
        transition: 'background 0.5s ease',
      }}
    >
      {/* stars, light-mode sun-rays wash */}
      <span className="absolute inset-0 overflow-hidden rounded-full">
        <AnimatePresence>
          {isDark &&
            STARS.map((s, i) => (
              <motion.span
                key={i}
                className="absolute rounded-full bg-[#F2ECDD]"
                style={{ left: s.x, top: s.y, width: s.size, height: s.size }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0.5, 1], scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: reducedMotion ? 0 : 1.6, delay: s.delay, repeat: Infinity, repeatDelay: 1.2 }}
              />
            ))}
        </AnimatePresence>
      </span>

      {/* click sparkle burst */}
      <AnimatePresence>
        {burst > 0 && (
          <motion.span
            key={burst}
            className="absolute inset-0"
            initial="hidden"
            animate="show"
            exit="hidden"
          >
            {SPARK_ANGLES.map((angle) => (
              <motion.span
                key={angle}
                className="absolute rounded-full"
                style={{
                  left: isDark ? 26 : 10,
                  top: 14,
                  width: 3,
                  height: 3,
                  background: isDark ? '#B7ADF0' : '#D98E2B',
                }}
                initial={{ opacity: 1, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  x: Math.cos((angle * Math.PI) / 180) * 16,
                  y: Math.sin((angle * Math.PI) / 180) * 16,
                }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              />
            ))}
          </motion.span>
        )}
      </AnimatePresence>

      {/* thumb */}
      <motion.span
        className="absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
        animate={{ x: isDark ? 24 : 0 }}
        transition={spring}
        style={{ background: isDark ? '#2A2450' : '#FFFFFF' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.svg
              key="moon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
              transition={{ duration: reducedMotion ? 0 : 0.3 }}
            >
              <path
                d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"
                fill="#F2ECDD"
              />
            </motion.svg>
          ) : (
            <motion.svg
              key="sun"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
              transition={{ duration: reducedMotion ? 0 : 0.3 }}
            >
              <circle cx="12" cy="12" r="5" fill="#D98E2B" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <rect
                  key={deg}
                  x="11.2"
                  y="1"
                  width="1.6"
                  height="3.4"
                  rx="0.8"
                  fill="#D98E2B"
                  transform={`rotate(${deg} 12 12)`}
                />
              ))}
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.span>
    </button>
  );
}
