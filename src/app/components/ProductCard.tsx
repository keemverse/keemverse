import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ProductCardProps {
  name: string;
  price: string;
  image: string;
  rating?: string | number;
  affiliateLink: string;
  index?: number;
  onOpen?: () => void;
}

export default function ProductCard({
  name,
  price,
  image,
  rating,
  affiliateLink,
  index = 0,
  onOpen,
}: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group cursor-pointer"
      onClick={onOpen}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-stone-100">
        <div className="absolute inset-0 will-change-transform transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]">
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

      <a
        href={affiliateLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="mt-3 inline-flex w-full justify-center items-center gap-2 rounded-full border border-stone-300 bg-[#ECE5D9] px-4 py-2 text-[11px] font-semibold tracking-[0.1em] text-stone-900 transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:bg-[#E5DDCF]"
      >
        SHOP NOW
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </a>
    </motion.div>
  );
}
