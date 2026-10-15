import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconButton } from './IconButton';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../../lib/useTheme';

export interface BurgerMenuItem {
  label: string;
  action: () => void;
}

interface BurgerMenuProps {
  items: BurgerMenuItem[];
}

/**
 * Shared animated burger button + dropdown, used by every page nav
 * (landing, Fashion, Digital Craft). One menu language site-wide —
 * change the animation or dropdown styling here and it updates
 * everywhere, instead of drifting per page.
 */
export function BurgerMenu({ items }: BurgerMenuProps) {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Close when tapping elsewhere or pressing Escape, like any menu people know.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown, { passive: true });
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapRef}>
      <IconButton
        onClick={() => setOpen((v) => !v)}
        ariaLabel={open ? 'Close menu' : 'Open menu'}
        ariaExpanded={open}
      >
        <motion.span
          className="block w-4 h-[1.5px] bg-stone-700 dark:bg-[#F2ECDD] rounded-full"
          animate={open ? { rotate: 45, y: 6.5 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.span
          className="block w-4 h-[1.5px] bg-stone-700 dark:bg-[#F2ECDD] rounded-full"
          animate={open ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
        <motion.span
          className="block w-4 h-[1.5px] bg-stone-700 dark:bg-[#F2ECDD] rounded-full"
          animate={open ? { rotate: -45, y: -6.5 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
      </IconButton>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-14 z-30 w-52 rounded-2xl bg-card border border-border shadow-xl overflow-hidden"
          >
            {items.map((item, i) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: 0.03 * i, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => {
                  item.action();
                  setOpen(false);
                }}
                className="block w-full text-left px-5 py-3 text-sm text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
              >
                {item.label}
              </motion.button>
            ))}

            <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-border">
              <span className="text-sm text-foreground/80">
                {theme === 'dark' ? 'Dark mode' : 'Light mode'}
              </span>
              <ThemeToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
