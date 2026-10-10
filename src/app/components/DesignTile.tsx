import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Btn, Tag } from './CraftUI';
import { CRAFT_DARK } from '../lib/theme';
import type { Design } from '../lib/designs';

// "$29" -> small raised symbol and a large figure, as on the prototype's
// cards. Anything that does not start with a symbol is shown as is.
function Price({ value }: { value: string }) {
  const m = value.match(/^([^\d\s]+)\s*(.*)$/);
  return (
    <span className="shrink-0 text-lg font-extrabold leading-none text-amber-ink sm:text-xl" style={{ fontVariantNumeric: 'tabular-nums' }}>
      {m ? (
        <>
          <span className="mr-0.5 align-top text-[11px] font-medium text-muted-foreground">{m[1]}</span>
          {m[2]}
        </>
      ) : (
        value
      )}
    </span>
  );
}

/**
 * One design card, after the Arena v1 library: square art with a tag and a
 * code on top, a hover line, name and price, collection, palette dots, and a
 * "Try it on" button that loads the design into the studio panel beside the
 * grid. Optional fields (tag, code, collection, swatches, blurb) only show
 * when the design has them, so nothing is ever made up.
 */
export function DesignTile({
  design,
  index = 0,
  selected = false,
  onSelect,
}: {
  design: Design;
  index?: number;
  selected?: boolean;
  onSelect?: (id: string) => void;
}) {
  const href = design.purchase_link || undefined;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: (index % 2) * 0.08 }}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ink-edge"
      style={selected ? { borderColor: CRAFT_DARK, boxShadow: `0 0 0 1px ${CRAFT_DARK}` } : { borderColor: 'var(--border)' }}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={() => onSelect?.(design.id)}
        className="relative block aspect-square w-full overflow-hidden bg-muted text-left"
      >
        <ImageWithFallback
          src={design.thumbnail || design.image_url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.05]"
        />
        {(design.tag || design.code) && (
          <span className="absolute inset-x-2 top-2 flex items-start justify-between gap-2 sm:inset-x-3 sm:top-3">
            {design.tag ? <Tag tone="inverse" className="px-2 py-0.5 text-[9px] sm:px-2.5 sm:py-1 sm:text-[10px]">{design.tag}</Tag> : <span />}
            {design.code && (
              <span className="hidden rounded-full bg-background/90 px-2.5 py-1 text-[10px] tracking-[0.12em] uppercase text-foreground backdrop-blur sm:inline-block">
                {design.code}
              </span>
            )}
          </span>
        )}
        {design.blurb && (
          <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/90 to-black/60 p-4 text-[13px] leading-snug text-white/90 transition-transform duration-500 ease-out group-hover:translate-y-0">
            {design.blurb}
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] leading-tight text-foreground sm:text-[17px]" style={{ fontFamily: 'Georgia, serif' }}>
            {design.name}
          </h3>
          {design.price && <Price value={design.price} />}
        </div>

        {design.collection && (
          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{design.collection}</p>
        )}

        {design.swatches && design.swatches.length > 0 && (
          <div className="mt-3 flex gap-1.5" aria-hidden="true">
            {design.swatches.map((c) => (
              <span key={c} className="h-3.5 w-3.5 rounded-full ring-1 ring-foreground/15" style={{ backgroundColor: c }} />
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center gap-2 sm:mt-4">
          <Btn
            variant={selected ? 'accent' : 'outline'}
            size="sm"
            pressed={selected}
            ariaLabel={`Try ${design.name} on a garment`}
            onClick={() => onSelect?.(design.id)}
            className="flex-1"
            icon={selected ? undefined : <span aria-hidden="true">+</span>}
          >
            {selected ? 'Showing in studio' : 'Try it on'}
          </Btn>
          {href && (
            <Btn variant="outline" size="sm" href={href} external className="hidden sm:inline-flex">
              Buy
            </Btn>
          )}
        </div>
      </div>
    </motion.article>
  );
}
