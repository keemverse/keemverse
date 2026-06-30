import { motion } from "motion/react";
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="group overflow-hidden rounded-[28px] bg-white border border-stone-200/60 shadow-sm hover:shadow-2xl transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
      onClick={onOpen}
    >
      <div className="relative h-40 md:h-56 overflow-hidden">
        <div className="absolute inset-0 will-change-transform transition-all duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]">
          <ImageWithFallback
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-[25%] bg-gradient-to-t from-white via-white/35 to-transparent" />
        </div>

        <span className="absolute top-4 right-4 rounded-full bg-white/95 text-[11px] tracking-wide font-semibold px-3 py-1 text-stone-900">
          {source}
        </span>
      </div>

      <div className="p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-stone-500 mb-2">
          {category}
        </p>

        <h3 className="text-base md:text-lg font-serif text-stone-900 leading-snug line-clamp-2">
          {name}
        </h3>

        <p className="mt-1 text-base md:text-lg font-semibold text-stone-900">
          {price}
        </p>

        <a
          href={affiliateLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e)=>e.stopPropagation()}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-stone-300 bg-[#ECE5D9] px-4 md:px-7 py-2.5 md:py-3 text-[11px] md:text-xs font-semibold tracking-[0.1em] md:tracking-[0.15em] whitespace-nowrap shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_8px_20px_rgba(0,0,0,.06)] transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-0.5 group-hover:bg-[#E5DDCF]"
        >
          {buttonText}
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </a>
      </div>
    </motion.div>
  );
}
