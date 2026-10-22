import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import BeforeAfter from "./ui/BeforeAfter";
import { useContent } from "../lib/siteContent";

const plainName = (name: unknown) => String(name || "").replace(": Lightroom Preset", "");

/**
 * The ad hook at the top of the presets page. Every preset that has both a
 * before and an after photo gets its turn: the divider sweeps across, the
 * look settles and holds for a moment, then the card pops over to the next
 * look. Touching the slider freezes the rotation so the visitor can compare in
 * peace; the chips under the card jump to any look. With reduced motion there
 * is no auto-rotation, only the chips.
 */
export default function PresetReveal({ looks, onOpen }: { looks: any[]; onOpen: (preset: any) => void }) {
  const t = useContent();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [frozen, setFrozen] = useState(false);

  // Warm every photo up front so the pop between looks never waits on a download.
  useEffect(() => {
    looks.forEach((look) => {
      [look.before_image, look.after_image].forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    });
  }, [looks]);

  if (looks.length === 0) return null;
  const many = looks.length > 1;
  const look = looks[Math.min(index, looks.length - 1)];
  const tags = String(look.tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 3);

  const advance = many && !frozen && !reduce ? () => setIndex((n) => (n + 1) % looks.length) : undefined;

  return (
    <motion.section
      aria-label="Before and after"
      initial={{ opacity: 0, y: 28, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 130, damping: 17, delay: 0.2 }}
      className="mx-auto mb-14 grid max-w-4xl items-center gap-8 md:mb-16 md:grid-cols-2 md:gap-12"
    >
      <div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={look.id}
            initial={{ opacity: 0, scale: 0.9, y: 22, rotate: -1.5 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ type: "spring", stiffness: 160, damping: 18 }}
          >
            <BeforeAfter
              autoplay
              aspect="aspect-[3/4]"
              className="mx-auto max-w-[22rem] shadow-2xl md:max-w-none"
              before={look.before_image}
              after={look.after_image}
              alt={plainName(look.name)}
              onCycle={advance}
              onTakeOver={() => setFrozen(true)}
            />
          </motion.div>
        </AnimatePresence>

        {many && (
          <div className="mt-4 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Choose a look">
            {looks.map((l, i) => {
              const active = i === index;
              return (
                <button
                  key={l.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setIndex(i);
                    setFrozen(false);
                  }}
                  className={`press rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                    active ? "bg-foreground text-background" : "glass text-foreground/80 hover:text-foreground"
                  }`}
                >
                  {plainName(l.name)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="text-center md:text-left">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={look.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-[2.75rem]"
          >
            <p className="eyebrow text-amber-ink">{plainName(look.name)}</p>
            {tags.length > 0 && (
              <p className="mt-2 text-[13px] capitalize text-muted-foreground">{tags.join("  ·  ")}</p>
            )}
          </motion.div>
        </AnimatePresence>

        <h2 className="mt-3 text-display-md">{t("presets.hookTitle")}</h2>
        <button
          type="button"
          onClick={() => onOpen(look)}
          className="press mt-6 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background"
        >
          {t("presets.hookCta")}
        </button>
      </div>
    </motion.section>
  );
}
