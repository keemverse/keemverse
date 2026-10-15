import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
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

// Portrait photo, details underneath. The whole picture opens the quick view;
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
        className="card-lift relative aspect-[4/5] cursor-pointer overflow-hidden rounded-3xl bg-muted"
      >
        <ImageWithFallback src={image} alt={name} className="card-img h-full w-full object-cover" />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-stone-900 backdrop-blur">
          {source}
        </span>

        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-stone-900 opacity-0 backdrop-blur transition-all duration-300 group-hover:opacity-100 group-focus-within:opacity-100 max-md:opacity-100">
          Quick view
        </span>
      </div>

      <div className="flex items-start justify-between gap-3 px-1 pt-3.5">
        <div className="min-w-0">
          <p className="eyebrow text-muted-foreground">{category}</p>
          <h3 className="mt-1.5 line-clamp-2 text-[15px] font-medium leading-snug text-foreground md:text-base">{name}</h3>
          {price && <p className="mt-1.5 text-[15px] font-semibold text-amber-ink">{price}</p>}
        </div>

        <a
          href={affiliateLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${buttonText}: ${name} (opens in a new tab)`}
          onClick={(e) => e.stopPropagation()}
          className="press mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-foreground transition-colors duration-300 hover:border-transparent hover:bg-[var(--fashion-display)] hover:text-[#14120F]"
        >
          <ArrowUpRight className="h-[18px] w-[18px]" />
        </a>
      </div>
    </motion.article>
  );
}
