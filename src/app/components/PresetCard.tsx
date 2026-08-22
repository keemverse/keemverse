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
      whileHover={{
        y: -8,
        scale: 1.015,
      }}
      viewport={{ once: true }}
      transition={{
        duration: 0.45,
        delay: index * 0.08,
      }}
      className="group overflow-hidden rounded-[30px] bg-white border border-stone-200/70 shadow-[0_8px_30px_rgba(0,0,0,.05)] hover:shadow-[0_25px_70px_rgba(0,0,0,.12)] transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <div className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.07]">
          <ImageWithFallback
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-x-0 bottom-0 h-[12%] bg-gradient-to-t from-white/80 to-transparent" />
        </div>
      </div>

      <div className="p-5 md:p-6">
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