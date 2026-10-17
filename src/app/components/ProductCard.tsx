import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Eye } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ProductCardProps {
  name: string;
  price: string;
  image: string;
  source: string;
  category: string;
  buttonText: string;
  affiliateLink: string;
  index?: number;
  onOpen?: () => void;
}

// Square (1:1) photo, details underneath. The whole picture opens the quick view;
// the round arrow goes straight to the shop. Everything is a real button or
// link, so it works by keyboard and screen reader too.
export default function ProductCard({
  name,
  price,
  image,
  source,
  category,
  buttonText,
  affiliateLink,
  index = 0,
  onOpen,
}: ProductCardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: (index % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen?.();
          }
        }}
        className="card-lift relative aspect-square cursor-pointer overflow-hidden rounded-2xl bg-muted"
      >
        <ImageWithFallback src={image} alt={name} className="card-img h-full w-full object-cover" />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-stone-900 backdrop-blur">
          {source}
        </span>

      </div>

      <div className="px-1 pt-3.5">
        <p className="eyebrow text-muted-foreground">{category}</p>
        <h3 className="mt-1.5 line-clamp-2 text-[15px] font-medium leading-snug text-foreground md:text-base">{name}</h3>

        <div className="mt-2 flex items-center justify-between gap-2">
          {price ? <p className="text-[15px] font-semibold text-amber-ink">{price}</p> : <span />}

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label={`Quick view: ${name}`}
              onClick={(e) => {
                e.stopPropagation();
                onOpen?.();
              }}
              className="press grid h-9 w-9 place-items-center rounded-full border border-border text-foreground transition-colors duration-300 hover:bg-foreground hover:text-background"
            >
              <Eye className="h-[17px] w-[17px]" />
            </button>

            <a
              href={affiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${buttonText}: ${name} (opens in a new tab)`}
              onClick={(e) => e.stopPropagation()}
              className="press grid h-9 w-9 place-items-center rounded-full border border-border text-foreground transition-colors duration-300 hover:border-transparent hover:bg-[var(--fashion-display)] hover:text-[#14120F]"
            >
              <ArrowUpRight className="h-[17px] w-[17px]" />
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
