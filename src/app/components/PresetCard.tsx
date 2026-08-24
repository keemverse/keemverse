import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface PresetCardProps {
  name: string;
  price: string;
  image: string;
  rating?: string | number;
  index?: number;
  onOpen?: () => void;
}

export default function PresetCard({
  name,
  price,
  image,
  rating,
  index = 0,
  onOpen,
}: PresetCardProps) {
  return (
    <motion.article
      onClick={onOpen}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group cursor-pointer"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-stone-100">
        <div className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]">
          <ImageWithFallback
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <p className="mt-3 text-sm text-stone-800 line-clamp-2 leading-snug">
        {name}
      </p>

      {rating && (
        <p className="mt-1 text-xs text-stone-500">
          {rating} <span aria-hidden="true">★</span>
        </p>
      )}

      <p className="mt-1 text-sm font-medium text-stone-900">{price}</p>
    </motion.article>
  );
}
