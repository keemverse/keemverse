import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { SocialFooter } from "../components/SocialFooter";
import { verifyAndUnlock, type CheckoutItem } from "../lib/flutterwave";

interface SuccessState {
  txRef: string;
  transactionId: number | string;
  item: CheckoutItem;
}

export default function CheckoutSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as SuccessState | null;

  const [status, setStatus] = useState<"verifying" | "unlocked" | "failed">("verifying");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state?.txRef) return;
    verifyAndUnlock(state.txRef, state.item.id).then((result) => {
      if (result.ok && result.downloadUrl) {
        setDownloadUrl(result.downloadUrl);
        setStatus("unlocked");
      } else {
        setError(result.error || "Payment could not be verified.");
        setStatus("failed");
      }
    });
  }, [state]);

  if (!state?.txRef) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6" style={{ backgroundColor: "#F5F2EA" }}>
        <div>
          <p className="font-serif text-2xl text-stone-900 mb-3">No order to show</p>
          <button
            onClick={() => navigate("/fashion/presets")}
            className="mt-4 rounded-full bg-stone-900 px-6 py-3 text-sm uppercase tracking-[0.18em] text-white hover:bg-black transition"
          >
            Back to Presets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-stone-900" style={{ backgroundColor: "#F5F2EA" }}>
      <main className="max-w-lg mx-auto px-5 md:px-8 pt-16 pb-24 text-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          {status === "verifying" && (
            <>
              <p className="uppercase tracking-[0.35em] text-xs text-stone-500 mb-4">One moment</p>
              <h1 className="font-serif text-3xl text-stone-900 mb-3">Confirming your payment…</h1>
              <p className="text-stone-500">This only takes a few seconds.</p>
            </>
          )}

          {status === "unlocked" && (
            <>
              <p className="uppercase tracking-[0.35em] text-xs text-stone-500 mb-4">You're in</p>
              <h1 className="font-serif text-3xl text-stone-900 mb-3">Payment confirmed</h1>
              <p className="text-stone-600 mb-8">
                {state.item.name} is ready. A copy of this link has also been sent to your email.
              </p>
              <a
                href={downloadUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-8 py-3.5 text-sm font-semibold tracking-[0.12em] text-white hover:bg-black hover:-translate-y-0.5 transition-all"
              >
                DOWNLOAD NOW →
              </a>
            </>
          )}

          {status === "failed" && (
            <>
              <p className="uppercase tracking-[0.35em] text-xs text-stone-500 mb-4">Hold on</p>
              <h1 className="font-serif text-3xl text-stone-900 mb-3">We couldn't confirm that yet</h1>
              <p className="text-stone-600 mb-2">{error}</p>
              <p className="text-stone-500 text-sm mb-8">
                Reference: <span className="font-mono">{state.txRef}</span> — save this and contact
                support if this doesn't resolve shortly.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-8 py-3.5 text-sm font-semibold tracking-[0.12em] text-white hover:bg-black hover:-translate-y-0.5 transition-all"
              >
                CONTACT SUPPORT
              </a>
            </>
          )}
        </motion.div>
      </main>

      <SocialFooter />
    </div>
  );
}
