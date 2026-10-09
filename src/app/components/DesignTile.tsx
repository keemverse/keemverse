import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Design } from '../lib/designs';

/**
 * One design in the grid: a big photo, then a quiet caption and price.
 * No card chrome, so the work leads. Links to wherever it can be bought.
 */
export function DesignTile({ design, index = 0 }: { design: Design; index?: number }) {
  const href = design.purchase_link || undefined;
  const external = !!href && href.startsWith('http');

  const inner = (
    <>
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
        <ImageWithFallback
          src={design.thumbnail || design.image_url}
          alt={design.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="text-sm text-foreground/90 leading-snug">{design.name}</h3>
        {design.price && (
          <span className="text-sm text-muted-foreground shrink-0" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {design.price}
          </span>
        )}
      </div>
    </>
  );

  const motionProps = {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.45, delay: (index % 3) * 0.08 },
    className: 'group block',
  };

  return href ? (
    <motion.a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      {...motionProps}
    >
      {inner}
    </motion.a>
  ) : (
    <motion.div {...motionProps}>{inner}</motion.div>
  );
}
