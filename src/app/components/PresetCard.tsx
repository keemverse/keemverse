import { motion } from "motion/react";
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
  return (
    <motion.article
      onClick={onOpen}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="group cursor-pointer"
    >
      {/* Image alone — no card chrome (no border/bg/shadow box), just the
          photo. Matches ProductCard/UniverseShopCard's treatment. */}
      <div className="relative h-52 md:h-72 overflow-hidden rounded-[24px]">
        <div className="absolute inset-0 will-change-transform transition-all duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.07]">
          <ImageWithFallback
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Details — fully isolated from the image, no shared container */}
      <div className="pt-4">
        <p className="text-[11px] uppercase tracking-[0.28em] text-stone-400 font-semibold mb-3">
          {collection}
        </p>

        <h3 className="font-serif text-lg md:text-[26px] leading-tight text-stone-900 line-clamp-2">
          {name}
        </h3>

        <p className="mt-3 text-lg font-semibold text-stone-900">
          {price}
        </p>
      </div>
    </motion.article>
  );
}
