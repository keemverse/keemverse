import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { FASHION, FASHION_DARK } from "../lib/theme";

interface TemuScrollBannerProps {
  products: any[];
  formatPrice: (price: any) => string;
  onSelect: (product: any) => void;
  storefrontUrl: string;
}

/**
 * Scroll strip of Temu finds — Temu is the only live platform right
 * now, so this puts the full run of picks in front of people without
 * making them scroll the whole grid. Auto-scrolls on its own, but the
 * track is a real native-scroll container underneath — anyone who
 * wants to skim faster can drag/swipe it themselves, which pauses the
 * automatic scroll until they let go.
 */
export default function TemuScrollBanner({
  products,
  formatPrice,
  onSelect,
  storefrontUrl,
}: TemuScrollBannerProps) {
  const temuProducts = products.filter(
    (p) => String(p.Source || "").toLowerCase() === "temu"
  );

  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // How many copies of the list to render back-to-back. The native
  // max scroll position is capped at (scrollWidth - clientWidth), so
  // if the viewport is wider than one full copy of the list, 2 copies
  // isn't enough headroom — the browser clamps scrollLeft before the
  // wrap point is ever reached and the strip just stops. Measure the
  // real content and pick enough copies to guarantee the wrap point
  // is always reachable, regardless of product count or screen width.
  const [repeat, setRepeat] = useState(3);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || temuProducts.length === 0) return;
    const oneSetWidth = track.scrollWidth / repeat;
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= oneSetWidth && repeat < 10) {
      setRepeat((r) => r + 2);
    }
  }, [repeat, temuProducts.length]);

  // Auto-scroll loop — nudges scrollLeft forward continuously, and
  // wraps back a full set-width once it's scrolled past one copy of
  // the (repeated) product list, so the loop reads as endless. Created
  // once (empty deps) and reads pausedRef each tick, rather than
  // tearing the interval down and rebuilding it on every pause/resume.
  useEffect(() => {
    if (temuProducts.length === 0) return;
    const id = setInterval(() => {
      const track = trackRef.current;
      if (!track || pausedRef.current) return;
      const oneSetWidth = track.scrollWidth / repeat;
      track.scrollLeft += 1.2;
      if (track.scrollLeft >= oneSetWidth) {
        track.scrollLeft -= oneSetWidth;
      }
    }, 16);
    return () => clearInterval(id);
  }, [temuProducts.length, repeat]);

  const pauseForInteraction = () => {
    setPaused(true);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  };

  const resumeAfterDelay = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPaused(false), 1500);
  };

  if (temuProducts.length === 0) return null;

  const track = Array.from({ length: repeat }).flatMap(() => temuProducts);

  return (
    <section className="mb-16">
      <p className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400 text-center mb-5">
        Temu Finds
      </p>

      <div className="relative">
        {/* Edge fades so the track doesn't hard-cut at the container edge */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 z-10 bg-gradient-to-r from-[#F5F2EA] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 z-10 bg-gradient-to-l from-[#F5F2EA] to-transparent" />

        <div
          ref={trackRef}
          onPointerDown={pauseForInteraction}
          onPointerUp={resumeAfterDelay}
          onPointerLeave={resumeAfterDelay}
          onTouchStart={pauseForInteraction}
          onTouchEnd={resumeAfterDelay}
          className="flex gap-4 overflow-x-auto no-scrollbar"
          style={{ scrollBehavior: "auto" }}
        >
          {track.map((product, i) => (
            <button
              key={`${product["Product Name"]}-${i}`}
              onClick={() => onSelect(product)}
              className="w-36 md:w-44 flex-shrink-0 text-left"
            >
              <div className="relative h-36 md:h-44 overflow-hidden rounded-[18px]">
                <ImageWithFallback
                  src={product["Image URL"]}
                  alt={product["Product Name"]}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 right-2 rounded-full bg-white/95 backdrop-blur-md px-1.5 py-0.5 text-[7px] uppercase tracking-[0.22em] font-bold shadow-lg">
                  Temu
                </span>
              </div>
              <p className="mt-2 text-xs text-stone-700 leading-snug line-clamp-2">
                {product["Product Name"]}
              </p>
              <p className="text-xs font-semibold text-stone-900 mt-0.5">
                {formatPrice(product.Price)}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <a
          href={storefrontUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group/button inline-flex items-center gap-1.5 md:gap-2 rounded-full px-4 py-2 md:px-7 md:py-3 text-[11px] md:text-xs font-semibold tracking-[0.15em] text-white shadow-[0_10px_24px_-6px_rgba(217,142,43,.5)] transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 whitespace-nowrap"
          style={{ backgroundColor: FASHION }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = FASHION_DARK)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = FASHION)}
        >
          View All Temu Finds
          <span className="transition-transform group-hover/button:translate-x-1">→</span>
        </a>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
