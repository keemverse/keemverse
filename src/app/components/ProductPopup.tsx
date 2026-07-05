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
  rating?: string;
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
  rating,
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
            initial={{opacity:0, scale:.92, y:24}}
            animate={{opacity:1, scale:1, y:0}}
            exit={{opacity:0, scale:.92, y:24}}
            transition={{duration:.55, ease:[0.22,1,0.36,1]}}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-[32px] bg-[#F5F2EA] shadow-2xl">
              <div className="grid lg:grid-cols-2 overflow-y-auto max-h-[92vh] pb-28">
                <div className="relative h-[320px] lg:h-auto lg:aspect-[4/5] overflow-hidden rounded-t-[32px] lg:rounded-l-[32px] lg:rounded-tr-none">
                
<ImageWithFallback
  src={image}
  alt={name}
  className="w-full h-full object-cover"
/>

<div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />

  <button
    onClick={onClose}
    className="absolute top-5 left-5 h-12 w-12 rounded-full bg-white/95 shadow-md flex items-center justify-center text-2xl text-stone-700 hover:bg-white transition"
    aria-label="Close"
  >
    ✕
  </button>

<span
  className="absolute top-5 right-5 rounded-full bg-white/95 backdrop-blur-md px-5 py-2 text-[10px] tracking-[0.25em] uppercase font-bold shadow-lg"
>
  {source}
</span>

<div className="absolute bottom-6 left-6 rounded-full bg-black/70 backdrop-blur-md text-white px-4 py-2 text-[11px] tracking-[0.18em] uppercase">
  ✦ KEEM PICK
</div>
</div>

<div className="p-6 lg:p-12 flex flex-col justify-center">
  <h2 className="text-3xl lg:text-5xl leading-tight font-serif text-stone-900">
    {name}
  </h2>

<div className="mt-3 flex flex-wrap items-center gap-3 text-stone-600">

  <span>{category}</span>

  <span>•</span>

  <span className="rounded-full bg-stone-900 text-white px-4 py-1 text-sm font-semibold">
    {price}
  </span>

  {rating && (
    <>
      <span>•</span>

      <span className="flex items-center gap-1 text-amber-500 font-semibold">
        ★ {rating}
      </span>
    </>
  )}

</div>
  

                  <p className="mt-6 text-[15px] leading-7 lg:text-[16px] lg:leading-8 text-stone-600">{description}</p>


                  {whyPicked && (
                    <>
                      <h3 className="mt-8 text-sm font-semibold tracking-[.15em] uppercase text-stone-500">Why I picked it</h3>
                      <p className="mt-2 text-[15px] leading-7 lg:text-[16px] lg:leading-8 text-stone-600">{whyPicked}</p>
                    </>
                  )}

                  <div className="mt-8 flex flex-wrap gap-2">
                    {tags.map(tag=>(
                      <span key={tag} className="rounded-full bg-white shadow-sm border border-stone-200 px-3 py-1 text-xs text-stone-700">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-[#F5F2EA] p-6">
                <a
  href={affiliateLink}
  target="_blank"
  rel="noreferrer"
  className="group inline-flex w-full justify-center items-center gap-2 rounded-full bg-stone-900 px-7 py-3.5 text-sm font-semibold tracking-[0.12em] text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-black"
>
  SHOP ON {source.toUpperCase()}
  <span className="transition-transform duration-300 group-hover:translate-x-1">
    →
  </span>
</a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
