import type { VercelRequest, VercelResponse } from "@vercel/node";

// Funnel events, saved privately.
//
//   POST /api/event   public, batched from the browser (src/app/lib/track.ts)
//
// Takes a small batch of anonymous events (page seen, look picked, buy tapped,
// checkout opened and so on) and forwards them to the Apps Script project,
// which appends them to a private "Events" tab (docs/apps-script-leads-events.gs).
// An event never carries a name or an email: only a random per-visit id, the
// page, the event name, the look or item involved and the traffic source.
//
// Needs (Vercel env): REQUESTS_SECRET (already set), REQUESTS_WEBHOOK_URL optional.

const DEFAULT_WEBHOOK =
  "https://script.google.com/macros/s/AKfycbxvRs-TgA3tqIMA7tBxvjs5pZ4j52cKyP3gYODzucUM1SU2rQ3OwSNxeqsZDNjRW8gc/exec";

// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u001F\u007F]/g;
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(CONTROL, "").trim().slice(0, max) : "");

// Only these event names are accepted, so the sheet cannot be filled with junk.
const NAMES = new Set([
  "page",
  "cta",
  "look_pick",
  "look_open",
  "pack_click",
  "freelook_view",
  "freelook_submit",
  "buy_click",
  "checkout_view",
  "pay_start",
  "pay_success",
  "brand_click",
  "social_click",
]);

const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 12;
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

  // sendBeacon posts text/plain; parse it ourselves when the body is a string.
  let body: any = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  if (!body || typeof body !== "object" || !Array.isArray(body.events)) {
    return res.status(204).end();
  }

  const forwarded = req.headers["x-forwarded-for"];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded || "").split(",")[0].trim() || "unknown";
  if (limited(ip)) return res.status(204).end();

  const sid = clean(body.sid, 40);
  const region = body.region === "NG" ? "NG" : "ROW";
  const events = body.events
    .slice(0, 25)
    .filter((e: any) => e && NAMES.has(e.name))
    .map((e: any) => ({
      t: Number.isFinite(e.t) ? Math.round(e.t) : Date.now(),
      name: e.name,
      path: clean(e.path, 120),
      item: clean(e.item, 80),
      detail: clean(e.detail, 120),
      source: clean(e.source, 60),
      campaign: clean(e.campaign, 80),
    }));
  if (!sid || events.length === 0) return res.status(204).end();

  const secret = process.env.REQUESTS_SECRET;
  if (!secret) return res.status(204).end();

  const webhook = process.env.REQUESTS_WEBHOOK_URL || DEFAULT_WEBHOOK;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "events", secret, sid, region, events }),
      signal: controller.signal,
    });
  } catch {
    /* tracking must never bother a visitor */
  } finally {
    clearTimeout(timer);
  }
  return res.status(204).end();
}
