import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Btn } from './CraftUI';
import type { DesignPack } from '../lib/designs';

/**
 * One downloadable art pack: cover, name, what is inside, file types, price,
 * and a buy button when it has somewhere to be bought.
 */
export function PackTile({ pack, index = 0 }: { pack: DesignPack; index?: number }) {
  const href = pack.purchase_link || undefined;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.08 }}
      className="flex flex-col rounded-2xl border border-border bg-card p-4 ink-edge"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        <ImageWithFallback
          src={pack.thumbnail || pack.image_url}
          alt={`${pack.name} cover`}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="text-base font-bold text-foreground leading-snug">{pack.name}</h3>
        {pack.price && (
          <span className="shrink-0 text-sm text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {pack.price}
          </span>
        )}
      </div>

      {pack.includes && pack.includes.length > 0 && (
        <p className="mt-1.5 text-sm text-muted-foreground leading-snug">{pack.includes.join(' · ')}</p>
      )}

      {pack.formats && pack.formats.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {pack.formats.map((f) => (
            <span key={f} className="rounded-md border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
              {f}
            </span>
          ))}
        </div>
      )}

      {href && (
        <Btn variant="dark" href={href} external={href.startsWith('http')} className="mt-5 w-fit">
          Get this pack
        </Btn>
      )}
    </motion.article>
  );
}
