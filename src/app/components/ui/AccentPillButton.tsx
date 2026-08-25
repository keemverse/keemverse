import { motion } from 'motion/react';
import type { ComponentType } from 'react';

interface AccentPillButtonProps {
  href: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  sub: string;
  accent: string;
  accentDark: string;
  delay?: number;
}

/**
 * The solid-color circular pill used for universe quick-links
 * (finds/presets/graphics/DTF designs). Takes its color from
 * whichever universe's accent is passed in — never hardcode a hex
 * value at the call site, pull from src/app/lib/theme.ts.
 */
export function AccentPillButton({
  href,
  icon: Icon,
  label,
  sub,
  accent,
  accentDark,
  delay = 0,
}: AccentPillButtonProps) {
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, y: -3 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.4, delay }}
      className="group flex flex-col items-center gap-1 rounded-full border px-3 py-4 md:px-4 md:py-5 text-center text-white transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)]"
      style={{
        backgroundColor: accent,
        borderColor: accentDark,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,.35), 0 10px 24px -6px ${accent}99`,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = accentDark)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = accent)}
    >
      <Icon className="w-5 h-5 mb-1" />
      <span className="font-serif text-sm md:text-lg leading-none">{label}</span>
      <span className="text-[9px] md:text-[10px] uppercase tracking-wider mt-1 text-white/80">
        {sub}
      </span>
    </motion.a>
  );
}
