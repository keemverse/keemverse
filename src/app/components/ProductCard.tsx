import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { PillButton } from "./ui/PillButton";

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
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="group cursor-pointer"
      onClick={onOpen}
    >
      {/* Image alone — no card chrome (no border/bg/shadow box), just the photo */}
      <div className="relative h-52 md:h-72 overflow-hidden rounded-[24px]">
        <div className="absolute inset-0 will-change-transform transition-all duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.07]">
          <ImageWithFallback
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>

        <span className="absolute top-2 right-2 rounded-full bg-white/95 backdrop-blur-md px-1 py-0.5 text-[7px] uppercase tracking-[0.22em] font-bold shadow-lg">
          {source}
        </span>
      </div>

      {/* Details — fully isolated from the image, no shared container */}
      <div className="pt-4">
        <p className="text-[11px] uppercase tracking-[0.28em] text-stone-400 font-semibold mb-3">
          {category}
        </p>

        <h3 className="font-serif text-lg md:text-[26px] leading-tight text-stone-900 line-clamp-2">
          {name}
        </h3>

        <p className="mt-3 text-lg font-semibold text-stone-900">
          {price}
        </p>

        <PillButton
          href={affiliateLink}
          external
          onClick={(e) => e.stopPropagation()}
          className="mt-6 w-full justify-center whitespace-nowrap"
        >
          {buttonText}
        </PillButton>
      </div>
    </motion.div>
  );
}
