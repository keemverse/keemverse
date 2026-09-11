// Flutterwave Inline checkout — the browser opens their payment modal
// directly using only the PUBLIC key (safe to ship client-side). The
// SECRET key never belongs here or anywhere in this repo — it lives
// server-side, in the Apps Script project, used only to verify a
// transaction after payment (see verifyAndUnlock below).
//
// TEST public key — safe to ship client-side (that's what public keys are
// for). Swap to the LIVE key (FLWPUBK-…) at go-live: Settings → API Keys on
// the Flutterwave dashboard, Live mode.
export const FLUTTERWAVE_PUBLIC_KEY = "FLWPUBK_TEST-fc285646f4cf8c4e749021d0fae37e87-X";

// TODO: same Apps Script Web App already serving getProducts()/getPresets()
// (see lib/products.ts), extended with a doPost handler that verifies a
// transaction server-side (using the SECRET key) and returns the preset's
// real download link only once payment is confirmed. Until that handler
// exists, verifyAndUnlock below will fail safely (no link revealed).
const VERIFY_API_URL =
  "https://script.google.com/macros/s/AKfycbxvRs-TgA3tqIMA7tBxvjs5pZ4j52cKyP3gYODzucUM1SU2rQ3OwSNxeqsZDNjRW8gc/exec";

let scriptLoadPromise: Promise<void> | null = null;

/** Lazy-loads Flutterwave's Inline checkout script (once). */
function loadFlutterwaveScript(): Promise<void> {
  if (typeof window !== "undefined" && (window as any).FlutterwaveCheckout) {
    return Promise.resolve();
  }
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Flutterwave checkout"));
    document.body.appendChild(script);
  });
  return scriptLoadPromise;
}

export interface CheckoutItem {
  /** Stable id for this product — used as the order reference and to
   * look up the real download link server-side after payment. */
  id: string;
  name: string;
  amount: number;
  currency: "NGN" | "USD";
}

export interface PayParams {
  item: CheckoutItem;
  email: string;
  name: string;
  /** Real, explicit opt-in only — never default this to true. Travels
   * as Flutterwave transaction metadata so it's tied to the verified
   * payment record itself, not a client-side value someone could edit
   * after the fact. */
  marketingOptIn: boolean;
  onSuccess: (txRef: string, transactionId: number | string) => void;
  onClose: () => void;
}

/** Generates a reasonably unique transaction reference for this order. */
export function makeTxRef(itemId: string) {
  return `keemverse-${itemId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Opens Flutterwave's Inline payment modal for one item. */
export async function payWithFlutterwave({ item, email, name, marketingOptIn, onSuccess, onClose }: PayParams) {
  await loadFlutterwaveScript();
  const txRef = makeTxRef(item.id);

  (window as any).FlutterwaveCheckout({
    public_key: FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: txRef,
    amount: item.amount,
    currency: item.currency,
    payment_options: "card,ussd,banktransfer",
    customer: { email, name },
    meta: { marketing_opt_in: marketingOptIn ? "yes" : "no" },
    customizations: {
      title: "KEEMVERSE",
      description: item.name,
      logo: "",
    },
    callback: (response: any) => {
      if (response.status === "successful" || response.status === "completed") {
        onSuccess(txRef, response.transaction_id);
      }
    },
    onclose: onClose,
  });
}

export interface VerifyResult {
  ok: boolean;
  downloadUrl?: string;
  error?: string;
}

/**
 * Confirms a transaction actually cleared (server-side, via the Apps
 * Script bridge — never trust the client-side "successful" callback
 * alone, it can be spoofed) and, only if genuinely paid, gets back the
 * real download link for what was bought.
 */
export async function verifyAndUnlock(txRef: string, itemId: string): Promise<VerifyResult> {
  try {
    const response = await fetch(
      `${VERIFY_API_URL}?action=verify&tx_ref=${encodeURIComponent(txRef)}&item_id=${encodeURIComponent(itemId)}`
    );
    if (!response.ok) throw new Error("Verification request failed");
    const data = await response.json();
    if (data.ok && data.downloadUrl) {
      return { ok: true, downloadUrl: data.downloadUrl };
    }
    return { ok: false, error: data.error || "Payment could not be verified." };
  } catch (err) {
    return { ok: false, error: "Could not reach the verification service. Contact support with your transaction reference." };
  }
}

/**
 * Self-serve "lost your download?" — no accounts, just email lookup
 * against the Orders log. Always resolves the same generic message
 * regardless of whether a match was found server-side (so this can't be
 * used to probe whether a given email has ever purchased anything); if a
 * match exists, fresh download link(s) are emailed to that address.
 */
export async function restoreDownload(email: string): Promise<{ message: string }> {
  const fallback = "If that email has a purchase with us, we've sent the download link(s) to it.";
  try {
    const response = await fetch(`${VERIFY_API_URL}?action=restore&email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error("Restore request failed");
    const data = await response.json();
    return { message: data.message || fallback };
  } catch (err) {
    return { message: fallback };
  }
}
