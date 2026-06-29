import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
interface UniverseShopCardProps {
  title: string;
  description: string;
  image: string;
  cta: string;
  href: string;
  tag?: string;
  index?: number;
}

export default function UniverseShopCard({
  title,
  description,
  image,
  cta,
  href,
  tag = "LIVE",
  index = 0,
}: UniverseShopCardProps) {
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="group overflow-hidden rounded-[28px] bg-white border border-stone-200/60 shadow-sm hover:-translate-y-1 hover:shadow-2xl transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
    >
                  <div className="relative h-[340px] overflow-hidden">
                    <div className="absolute inset-0 will-change-transform transition-all duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03] group-hover:-translate-y-1.5">
                    <ImageWithFallback
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-white via-white/60 via-white/55 to-transparent" />
                    </div>
                    <span className="absolute top-4 left-4 rounded-full bg-white/95 text-[11px] tracking-wide font-semibold px-3 py-1 text-stone-900">
                      {tag}
                    </span>
                  </div>

                  <div className="px-8 pb-8 -mt-10 relative z-10 text-center">
                    <h3 className="text-[2rem] font-serif text-stone-900">
                      {title}
                    </h3>

                    

                    <div className="min-h-[72px] flex items-start justify-center">
                      <p className="text-sm leading-7 text-stone-600 max-w-xs mx-auto">
                        {description}
                      </p>
                    </div>

                    <div className="mt-auto pt-8">
                      <span className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-[#ECE5D9] px-7 py-3 text-xs font-semibold tracking-[0.15em] text-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_8px_20px_rgba(0,0,0,.06)] transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-0.5 group-hover:bg-[#E5DDCF]">
                        {cta}
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </span>
                    </div>
                  </div>

            
                  </motion.a>
);
}