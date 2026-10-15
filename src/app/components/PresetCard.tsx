import { motion, useReducedMotion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface PresetCardProps {
  name: string;
  price: string;
  image: string;
  collection: string;
  index?: number;
  onOpen?: () => void;
}

export default function PresetCard({
  name,
  price,
  image,
  collection,
  index = 0,
  onOpen,
}: PresetCardProps) {
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

        {price && (
          <span className="absolute bottom-3 right-3 rounded-full bg-foreground px-3 py-1.5 text-[12px] font-semibold text-background shadow-lg">
            {price}
          </span>
        )}
      </div>

      <div className="px-1 pt-3.5">
        <h3 className="line-clamp-2 text-[15px] font-medium leading-snug text-foreground md:text-base">{name}</h3>
        <p className="mt-1 text-[12px] text-muted-foreground transition-colors group-hover:text-foreground">
          Tap to see the look →
        </p>
      </div>
    </motion.article>
  );
}
