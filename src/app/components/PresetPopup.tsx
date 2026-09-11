import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ImageWithFallback } from "./figma/ImageWithFallback";

// Turns the sheet's raw Price value ("$12", "12000", "₦12,000") into a
// numeric amount + currency Flutterwave can charge directly.
function parseRawPrice(raw: any): { amount: number; currency: "NGN" | "USD" } {
  const str = String(raw ?? "").trim();
  const amount = parseFloat(str.replace(/[^0-9.]/g, "")) || 0;
  const currency = str.startsWith("$") ? "USD" : "NGN";
  return { amount, currency };
}

interface PresetPopupProps {
  open: boolean;
  onClose: () => void;
  name: string;
  price: string;
  rawPrice?: any;
  previewImage: string;
  banner?: string;
  collection: string;
  description?: string;
  whyCreated?: string;
  whatsIncluded?: string;
  installation?: string;
  compatibleWith?: string;
  tags?: string[];
  rating?: string;
  purchaseLink?: string;
}

export default function PresetPopup({
  open,
  onClose,
  name,
  price,
  rawPrice,
  previewImage,
  banner,
  collection,
  description,
  whyCreated,
  whatsIncluded,
  installation,
  compatibleWith,
  tags = [],
  rating,
  purchaseLink,
}: PresetPopupProps) {
  const navigate = useNavigate();
  const { amount, currency } = parseRawPrice(rawPrice);

  const handleBuyNow = () => {
    navigate("/checkout", {
      state: {
        item: { id: name, name, amount, currency },
        image: previewImage,
        collection,
      },
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-[32px] bg-[#F5F2EA] shadow-2xl">

              <div className="max-h-[92vh] overflow-y-auto">

                {/* ---------- Hero Image ---------- */}

                <section className="relative">

                  <div className="relative h-[360px] md:h-[520px] overflow-hidden">
                    <ImageWithFallback
                      src={previewImage}
                      alt={name}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  </div>

                  {/* Close */}

                  <button
                    onClick={onClose}
                    className="absolute top-5 left-5 h-12 w-12 rounded-full bg-white/95 shadow-md flex items-center justify-center text-2xl text-stone-700 hover:bg-white transition"
                    aria-label="Close"
                  >
                    ✕
                  </button>

                  {/* Collection */}

                  <span className="absolute top-5 right-5 rounded-full bg-white/95 backdrop-blur-md px-5 py-2 text-[10px] tracking-[0.25em] uppercase font-bold shadow-lg">
                    {collection}
                  </span>

                  {/* Hero label */}

                  <div className="absolute bottom-6 left-6 rounded-full bg-black/70 backdrop-blur-md text-white px-4 py-2 text-[11px] tracking-[0.18em] uppercase">
                    Lightroom Preset
                  </div>

                </section>

                {/* ---------- Content ---------- */}

                <div className="p-6 md:p-10 lg:p-12">

                  {/* Title */}

                  <div>
                    <p className="text-[11px] uppercase tracking-[0.28em] text-stone-400 font-semibold">
                      {collection}
                    </p>

                    <h2 className="mt-2 text-3xl md:text-5xl leading-tight font-serif text-stone-900">
                      {name}
                    </h2>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-stone-600">

                      <span className="rounded-full bg-stone-900 text-white px-4 py-1 text-sm font-semibold">
                        {price}
                      </span>

                      {rating && (
                        <span className="flex items-center gap-1 text-amber-500 font-semibold">
                          ★ {rating}
                        </span>
                      )}

                    </div>
                  </div>

                  {/* ---------- Banner (tier comparison / look overview) ---------- */}

                  {banner && (
                    <section className="mt-10">

                      <h3 className="text-sm font-semibold tracking-[.15em] uppercase text-stone-500">
                        See all three tiers
                      </h3>

                      <div className="mt-4 relative aspect-video overflow-hidden rounded-2xl">
                        <ImageWithFallback
                          src={banner}
                          alt={`${name} — tier comparison`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                    </section>
                  )}

                  {/* ---------- Description ---------- */}

                  {description && (
                    <section className="mt-10">

                      <h3 className="text-sm font-semibold tracking-[.15em] uppercase text-stone-500">
                        About this preset
                      </h3>

                      <p className="mt-3 text-[15px] leading-7 md:text-[16px] md:leading-8 text-stone-600">
                        {description}
                      </p>

                    </section>
                  )}

                  {/* ---------- Why Created ---------- */}

                  {whyCreated && (
                    <section className="mt-8">

                      <h3 className="text-sm font-semibold tracking-[.15em] uppercase text-stone-500">
                        Why I created it
                      </h3>

                      <p className="mt-3 text-[15px] leading-7 md:text-[16px] md:leading-8 text-stone-600">
                        {whyCreated}
                      </p>

                    </section>
                  )}

                  {/* ---------- Product Information ---------- */}

                  <div className="mt-10 grid md:grid-cols-2 gap-8">

                    {whatsIncluded && (
                      <section>
                        <h3 className="text-sm font-semibold tracking-[.15em] uppercase text-stone-500">
                          What's included
                        </h3>

                        <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-stone-600">
                          {whatsIncluded}
                        </p>
                      </section>
                    )}

                    {installation && (
                      <section>
                        <h3 className="text-sm font-semibold tracking-[.15em] uppercase text-stone-500">
                          Installation
                        </h3>

                        <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-stone-600">
                          {installation}
                        </p>
                      </section>
                    )}

                    {compatibleWith && (
                      <section>
                        <h3 className="text-sm font-semibold tracking-[.15em] uppercase text-stone-500">
                          Compatible with
                        </h3>

                        <p className="mt-3 text-[15px] leading-7 text-stone-600">
                          {compatibleWith}
                        </p>
                      </section>
                    )}

                  </div>

                  {/* ---------- Tags ---------- */}

                  {tags.length > 0 && (
                    <div className="mt-10 flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-white shadow-sm border border-stone-200 px-3 py-1 text-xs text-stone-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                </div>

                {/* ---------- Purchase ---------- */}

                <div className="sticky bottom-0 bg-[#F5F2EA] border-t border-stone-200/70 p-5 md:p-6">

                  <button
                    onClick={handleBuyNow}
                    disabled={amount <= 0}
                    className="group inline-flex w-full justify-center items-center gap-2 rounded-full bg-stone-900 px-7 py-3.5 text-sm font-semibold tracking-[0.12em] text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    BUY NOW — {price}

                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </button>

                  {purchaseLink && (
                    <a
                      href={purchaseLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 block text-center text-xs text-stone-500 hover:text-stone-800 transition-colors underline underline-offset-4"
                    >
                      Having trouble paying? Get it via Gumroad instead
                    </a>
                  )}

                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}