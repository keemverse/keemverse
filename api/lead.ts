import type { VercelRequest, VercelResponse } from "@vercel/node";

// "Free look" signups, saved privately.
//
//   POST /api/lead   public, from the free-look form on the site
//
// Validates the email, then forwards to the same Apps Script project that
// serves checkout (see docs/apps-script-leads-events.gs). The script saves the
// email to a private "Leads" tab and emails the visitor a one-time download
// link for the free look. Nothing about the person is kept in this repo.
//
// Needs (Vercel env, Production), already set for the custom design form:
//   REQUESTS_SECRET       shared with the Apps Script
//   REQUESTS_WEBHOOK_URL  optional; defaults to the project's /exec URL below

const DEFAULT_WEBHOOK =
  "https://script.google.com/macros/s/AKfycbxvRs-TgA3tqIMA7tBxvjs5pZ4j52cKyP3gYODzucUM1SU2rQ3OwSNxeqsZDNjRW8gc/exec";

// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u001F\u007F]/g;
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(CONTROL, "").trim().slice(0, max) : "");

// Best-effort limit per IP (a speed bump, not a guarantee).
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 4;
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  return recent.length > MAX_PER_WINDOW;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};

  // Honeypot: real visitors never see this field. Bots fill it; we pretend it worked.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return res.status(200).json({ ok: true });
  }

  const email = clean(body.email, 120).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return res.status(400).json({ error: "That email does not look right. Check it and try again." });
  }

  const forwarded = req.headers["x-forwarded-for"];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded || "").split(",")[0].trim() || "unknown";
  if (limited(ip)) {
    return res.status(429).json({ error: "Too many tries from this connection. Please try again later." });
  }

  const secret = process.env.REQUESTS_SECRET;
  if (!secret) {
    return res.status(503).json({ error: "The free look is not switched on yet." });
  }

  const payload = {
    action: "free_look",
    secret,
    email,
    // Explicit, separate consent for marketing email. Never defaults to yes.
    optIn: body.optIn === true,
    source: clean(body.source, 80),
    campaign: clean(body.campaign, 80),
    region: body.region === "NG" ? "NG" : "ROW",
  };

  const webhook = process.env.REQUESTS_WEBHOOK_URL || DEFAULT_WEBHOOK;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const upstream = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const text = await upstream.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
      /* not JSON: the script is not updated yet */
    }
    if (!upstream.ok || !data || data.ok !== true) {
      const notReady = data && data.error === "not_configured";
      return res
        .status(notReady ? 503 : 502)
        .json({ error: notReady ? "The free look is not switched on yet." : "Could not send it right now. Please try again." });
    }
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ error: "Could not send it right now. Please try again." });
  } finally {
    clearTimeout(timer);
  }
}
