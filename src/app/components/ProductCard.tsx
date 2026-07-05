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
  whileHover={{
    y: -8,
    scale: 1.015,
  }}
  viewport={{ once: true }}
  transition={{ duration: 0.45, delay: index * 0.08 }}
  className="group cursor-pointer overflow-hidden rounded-[30px] bg-white border border-stone-200/70 shadow-[0_8px_30px_rgba(0,0,0,.05)] hover:shadow-[0_25px_70px_rgba(0,0,0,.12)] transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
  onClick={onOpen}
>
      <div className="relative h-40 md:h-56 overflow-hidden">
        <div className="absolute inset-0 will-change-transform transition-all duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.07]">
          <ImageWithFallback
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-[25%] bg-gradient-to-t from-white via-white/35 to-transparent" />
        </div>

        <span className="absolute top-4 right-4 rounded-full bg-white/95 backdrop-blur-md px-4 py-2 text-[10px] uppercase tracking-[0.22em] font-bold shadow-lg">
          {source}
        </span>
      </div>

      <div className="p-5 md:p-6">
        <p className="text-[11px] uppercase tracking-[0.28em] text-stone-400 font-semibold mb-3">
          {category}
        </p>

        <h3 className="font-serif text-lg md:text-[26px] leading-tight text-stone-900 line-clamp-2">
          {name}
        </h3>

        <p className="mt-3 text-lg font-semibold text-stone-900">
          {price}
        </p>

        <a
          href={affiliateLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e)=>e.stopPropagation()}
          className="group/button mt-6 inline-flex w-full justify-center items-center gap-2 rounded-full border border-stone-300 bg-[#ECE5D9] px-4 md:px-7 py-2.5 md:py-3 text-[11px] md:text-xs font-semibold tracking-[0.1em] md:tracking-[0.15em] whitespace-nowrap shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_8px_20px_rgba(0,0,0,.06)] transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:bg-[#E5DDCF]"
        >
          {buttonText}
          <span className="transition-transform duration-300 group-hover/button:translate-x-1">
  →
</span>
        </a>
      </div>
    </motion.div>
  );
}
