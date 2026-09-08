import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { SocialFooter } from "../components/SocialFooter";
import { payWithFlutterwave, type CheckoutItem } from "../lib/flutterwave";

interface CheckoutState {
  item: CheckoutItem;
  image?: string;
  collection?: string;
}

const formatAmount = (amount: number, currency: "NGN" | "USD") =>
  currency === "USD" ? `$${amount.toLocaleString()}` : `₦${amount.toLocaleString()}`;

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as CheckoutState | null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [status, setStatus] = useState<"idle" | "paying">("idle");
  const [error, setError] = useState<string | null>(null);

  if (!state?.item) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6" style={{ backgroundColor: "#F5F2EA" }}>
        <div>
          <p className="font-serif text-2xl text-stone-900 mb-3">Nothing to check out</p>
          <p className="text-stone-500 mb-6">Head back and pick something from the presets shop.</p>
          <button
            onClick={() => navigate("/fashion/presets")}
            className="rounded-full bg-stone-900 px-6 py-3 text-sm uppercase tracking-[0.18em] text-white hover:bg-black transition"
          >
            Back to Presets
          </button>
        </div>
      </div>
    );
  }

  const { item, image, collection } = state;
  const canPay = name.trim().length > 0 && /\S+@\S+\.\S+/.test(email);

  const handlePay = async () => {
    setError(null);
    setStatus("paying");
    try {
      await payWithFlutterwave({
        item,
        email,
        name,
        marketingOptIn,
        onSuccess: (txRef, transactionId) => {
          navigate("/checkout/success", { state: { txRef, transactionId, item } });
        },
        onClose: () => {
          setStatus("idle");
        },
      });
    } catch (err) {
      setError("Couldn't open the payment window. Please try again.");
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen text-stone-900" style={{ backgroundColor: "#F5F2EA" }}>
      <main className="max-w-lg mx-auto px-5 md:px-8 pt-10 pb-24">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-10"
        >
          <p className="uppercase tracking-[0.35em] text-xs text-stone-500 mb-4">Checkout</p>
          <h1 className="font-serif text-3xl md:text-4xl text-stone-900 leading-tight">
            Almost there
          </h1>
        </motion.section>

        {/* Order summary */}
        <div className="flex items-center gap-4 rounded-2xl border border-stone-200/60 bg-white p-5 mb-6">
          {image && (
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
              <ImageWithFallback src={image} alt={item.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {collection && (
              <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400 font-semibold mb-0.5">
                {collection}
              </p>
            )}
            <p className="font-serif text-lg text-stone-900 truncate">{item.name}</p>
          </div>
          <p className="text-lg font-semibold text-stone-900 whitespace-nowrap">
            {formatAmount(item.amount, item.currency)}
          </p>
        </div>

        {/* Buyer details */}
        <div className="rounded-2xl border border-stone-200/60 bg-white p-6 md:p-8 flex flex-col gap-4">
          <div>
            <label className="text-xs text-stone-500 mb-1.5 block">Your name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-400 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-stone-500 mb-1.5 block">
              Email (your download link goes here)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-400 transition-colors"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={marketingOptIn}
              onChange={(e) => setMarketingOptIn(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-400"
            />
            <span className="text-sm text-stone-600 leading-relaxed">
              Keep me updated on new drops and promotions
            </span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={handlePay}
            disabled={!canPay || status === "paying"}
            className={`mt-2 inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold tracking-[0.12em] text-white transition-all ${
              canPay && status !== "paying"
                ? "bg-stone-900 hover:bg-black hover:-translate-y-0.5"
                : "bg-stone-300 cursor-not-allowed"
            }`}
          >
            {status === "paying" ? "Opening payment…" : `Pay ${formatAmount(item.amount, item.currency)} with Flutterwave`}
          </button>

          <p className="text-xs text-stone-400 text-center">
            Secure checkout via Flutterwave. Your card details never touch our servers.
          </p>
        </div>
      </main>

      <SocialFooter />
    </div>
  );
}
