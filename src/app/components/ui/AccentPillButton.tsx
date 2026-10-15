import { motion } from 'motion/react';
import type { ComponentType } from 'react';
import { onAccent } from '../../lib/theme';

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
 * (finds/presets/graphics/apparel designs). Takes its color from
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
  const isExternal = href.startsWith('http');
  return (
    <motion.a
      href={href}
      title={sub}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, y: -3 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.4, delay }}
      className="group flex flex-row items-center justify-center gap-2 rounded-full border px-4 py-2.5 md:py-3 text-center transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)]"
      style={{
        color: onAccent(accent),
        backgroundColor: accent,
        borderColor: accentDark,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,.35), 0 10px 24px -6px ${accent}99`,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = accentDark)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = accent)}
    >
      <Icon className="w-4 h-4 md:w-[18px] md:h-[18px] shrink-0" />
      <span className="font-serif text-sm md:text-base leading-none whitespace-nowrap">{label}</span>
      <span className="sr-only">{sub}</span>
    </motion.a>
  );
}
