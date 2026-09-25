import { useState } from "react";
import { restoreDownload } from "../lib/flutterwave";

/**
 * "Lost your download?" self-serve panel — no accounts, just an email
 * lookup against the Orders log (mirrors the checkout's own email +
 * order-log pattern). Always shows the same generic confirmation
 * regardless of whether a match was found, so it can't be used to check
 * whether a given email has purchased anything.
 */
export default function RestoreDownloadForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === "sending") return;
    setStatus("sending");
    const result = await restoreDownload(email.trim());
    setMessage(result.message);
    setStatus("sent");
  };

  return (
    <div className="max-w-md mx-auto rounded-2xl border border-border bg-card p-6 md:p-8 text-center">
      <h3 className="font-serif text-xl text-foreground mb-2">Already purchased?</h3>
      <p className="text-muted-foreground text-sm mb-5">
        Lost your download link? Enter the email you paid with and we'll send it again.
      </p>

      {status === "sent" ? (
        <p className="text-foreground/80 text-sm">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 rounded-xl border border-border bg-input-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/40 transition-colors"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold tracking-[0.1em] text-background transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {status === "sending" ? "Sending…" : "Send my link"}
          </button>
        </form>
      )}
    </div>
  );
}
