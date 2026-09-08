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
      className="group flex flex-col h-full cursor-pointer"
    >
      {/* Image alone — no card chrome (no border/bg/shadow box) around it,
          just the photo with rounded corners. Shorter on mobile now that
          two cards sit side by side instead of one full-width card. */}
      <div className="relative h-[190px] md:h-[340px] overflow-hidden rounded-2xl md:rounded-[28px] group-hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]">
        <div className="absolute inset-0 will-change-transform transition-all duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]">
          <ImageWithFallback
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
        <span className="absolute top-2 left-2 md:top-4 md:left-4 rounded-full bg-white/95 text-[9px] md:text-[11px] tracking-wide font-semibold px-2 py-0.5 md:px-3 md:py-1 text-stone-900">
          {tag}
        </span>
      </div>

      {/* Title, description, CTA — fully isolated from the image, no shared
          container. flex-1 + the CTA's mt-auto keeps the button pinned to
          the same height across a row regardless of description length. */}
      <div className="flex flex-col flex-1 pt-3 md:pt-5 px-1 text-center">
        <h3 className="text-lg md:text-[1.6rem] font-serif text-stone-900">
          {title}
        </h3>

        <p className="mt-1 md:mt-1.5 text-xs md:text-sm leading-relaxed md:leading-6 text-stone-600 max-w-xs mx-auto">
          {description}
        </p>

        <div className="mt-auto pt-3 md:pt-5">
          <span className="inline-flex items-center gap-1 md:gap-2 rounded-full border border-stone-300 bg-[#ECE5D9] px-4 py-2 md:px-7 md:py-3 text-[10px] md:text-xs font-semibold tracking-[0.1em] md:tracking-[0.15em] text-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_8px_20px_rgba(0,0,0,.06)] transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-0.5 group-hover:bg-[#E5DDCF]">
            {cta}
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        </div>
      </div>
    </motion.a>
  );
}
