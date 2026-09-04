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
  onOpen?: () => void;
}

export default function UniverseShopCard({
  title,
  description,
  image,
  cta,
  href,
  tag = "LIVE",
  index = 0,
  onOpen,
}: UniverseShopCardProps) {
  const isPending = href === "#";
  const isExternal = href.startsWith("http");

  return (
    <motion.a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      onClick={
        isPending && onOpen
          ? (e) => {
              e.preventDefault();
              onOpen();
            }
          : undefined
      }
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="group block cursor-pointer"
    >
      {/* Image alone — no card chrome (no border/bg/shadow box) around it,
          just the photo with rounded corners */}
      <div className="relative h-[340px] overflow-hidden rounded-[28px] group-hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]">
        <div className="absolute inset-0 will-change-transform transition-all duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]">
          <ImageWithFallback
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
        <span className="absolute top-4 left-4 rounded-full bg-white/95 text-[11px] tracking-wide font-semibold px-3 py-1 text-stone-900">
          {tag}
        </span>
      </div>

      {/* Title, description, CTA — fully isolated from the image, no shared container */}
      <div className="pt-5 px-1 text-center">
        <h3 className="text-[1.6rem] font-serif text-stone-900">
          {title}
        </h3>

        <p className="mt-1.5 text-sm leading-6 text-stone-600 max-w-xs mx-auto">
          {description}
        </p>

        <div className="mt-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-[#ECE5D9] px-7 py-3 text-xs font-semibold tracking-[0.15em] text-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_8px_20px_rgba(0,0,0,.06)] transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-0.5 group-hover:bg-[#E5DDCF]">
            {cta}
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        </div>
      </div>
    </motion.a>
  );
}
