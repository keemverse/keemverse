import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ProductPopupProps {
  open: boolean;
  onClose: () => void;
  name: string;
  price: string;
  image: string;
  source: string;
  category: string;
  description: string;
  tags: string[];
  whyPicked?: string;
  affiliateLink: string;
}

export default function ProductPopup({
  open,
  onClose,
  name,
  price,
  image,
  source,
  category,
  description,
  tags,
  whyPicked,
  affiliateLink,
}: ProductPopupProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm"
            initial={{opacity:0}}
            animate={{opacity:1}}
            exit={{opacity:0}}
            onClick={onClose}
          />
          <motion.div
            initial={{opacity:0, scale:.96, y:24}}
            animate={{opacity:1, scale:1, y:0}}
            exit={{opacity:0, scale:.96, y:24}}
            transition={{duration:.35, ease:[0.22,1,0.36,1]}}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-[32px] bg-[#F5F2EA] shadow-2xl">
              <div className="overflow-y-auto max-h-[92vh]">
                <div className="relative aspect-[4/5]">
  <ImageWithFallback
    src={image}
    alt={name}
    className="w-full h-full object-cover"
  />

  <button
    onClick={onClose}
    className="absolute top-5 left-5 h-11 w-11 rounded-full bg-white/95 shadow-md flex items-center justify-center text-2xl text-stone-700 hover:bg-white transition"
    aria-label="Close"
  >
    ✕
  </button>

  <span className="absolute top-5 right-5 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold tracking-wide">
    {source}
  </span>
</div>
<div className="p-8">
  <h2 className="text-3xl font-serif text-stone-900">
    {name}
  </h2>

  <div className="mt-2 flex items-center gap-3 text-stone-600">
    <span>{category}</span>
    <span>•</span>
    <span className="font-semibold text-stone-900">
      {price}
    </span>
  </div>

                  <p className="mt-6 leading-8 text-stone-600">{description}</p>

                  {whyPicked && (
                    <>
                      <h3 className="mt-8 text-sm font-semibold tracking-[.15em] uppercase text-stone-500">Why I picked it</h3>
                      <p className="mt-2 leading-8 text-stone-600">{whyPicked}</p>
                    </>
                  )}

                  <div className="mt-8 flex flex-wrap gap-2">
                    {tags.map(tag=>(
                      <span key={tag} className="rounded-full border border-stone-300 px-3 py-1 text-xs text-stone-700">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 border-t border-stone-200 bg-[#F5F2EA] p-6">
                <a href={affiliateLink} target="_blank" rel="noreferrer" className="inline-flex w-full justify-center items-center gap-2 rounded-full border border-stone-300 bg-[#ECE5D9] px-7 py-3 text-sm font-semibold tracking-[0.12em] text-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_8px_20px_rgba(0,0,0,.06)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#E5DDCF]">
                  View on {source} <span>→</span>
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
