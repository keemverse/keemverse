import type { VercelRequest, VercelResponse } from "@vercel/node";

// Custom design requests, saved privately.
//
//   POST /api/requests   public, from the custom design form
//
// This function validates the request and forwards it to the same Apps Script
// project that already serves checkout (see docs/apps-script-requests.gs),
// which appends it to a private "Custom Requests" tab and emails the owner.
// It is deliberately NOT stored in this repo or in data/*.json: the repo is
// public, and these messages contain people's names and contact details.
//
// Needs (Vercel env, Production):
//   REQUESTS_SECRET       shared with the Apps Script (Script Property of the same name)
//   REQUESTS_WEBHOOK_URL  optional; defaults to the project's /exec URL below

const DEFAULT_WEBHOOK =
  "https://script.google.com/macros/s/AKfycbxvRs-TgA3tqIMA7tBxvjs5pZ4j52cKyP3gYODzucUM1SU2rQ3OwSNxeqsZDNjRW8gc/exec";

const PROJECTS = ["Clothing design", "Illustration or art print", "Logo", "Something else"];
const GARMENTS = ["T-shirt", "Hoodie", "Long sleeve", "Tote", "Not sure yet"];

// Control characters out, newlines and tabs kept (the brief is multi-line).
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(CONTROL, "").trim().slice(0, max) : "";

// Best-effort limit per IP. Serverless instances come and go, so this is a
// speed bump against a script hammering the form, not a hard guarantee.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
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

  // Honeypot: a field real visitors never see. Bots fill it; we pretend success.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return res.status(200).json({ ok: true, ref: "CR-0000" });
  }

  const fields = {
    name: clean(body.name, 80),
    contact: clean(body.contact, 120),
    project: clean(body.project, 40),
    garment: clean(body.garment, 40),
    deadline: clean(body.deadline, 80),
    brief: clean(body.brief, 2000),
    refs: clean(body.refs, 500),
  };

  const problems: Record<string, string> = {};
  if (fields.name.length < 2) problems.name = "Tell me who to reply to.";
  if (fields.contact.length < 5) problems.contact = "An email or WhatsApp number so I can reply.";
  if (!PROJECTS.includes(fields.project)) problems.project = "Pick the closest option.";
  if (fields.garment && !GARMENTS.includes(fields.garment)) problems.garment = "Unknown garment.";
  if (fields.brief.length < 20) problems.brief = "A sentence or two is plenty (20 characters minimum).";
  if (Object.keys(problems).length > 0) {
    return res.status(400).json({ error: "Please check the form.", fields: problems });
  }

  const forwarded = req.headers["x-forwarded-for"];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded || "").split(",")[0].trim() || "unknown";
  if (limited(ip)) {
    return res.status(429).json({ error: "Too many requests from this connection. Please try again later." });
  }

  const secret = process.env.REQUESTS_SECRET;
  if (!secret) {
    return res.status(503).json({ error: "Saving requests is not set up yet." });
  }

  const webhook = process.env.REQUESTS_WEBHOOK_URL || DEFAULT_WEBHOOK;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const upstream = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "custom_request", secret, ...fields }),
      signal: controller.signal,
    });
    const text = await upstream.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
      /* not JSON: the script is not updated or errored */
    }
    if (!upstream.ok || !data || data.ok !== true) {
      return res.status(502).json({ error: "Could not save the request right now." });
    }
    return res.status(200).json({ ok: true, ref: typeof data.ref === "string" ? data.ref : undefined });
  } catch {
    return res.status(502).json({ error: "Could not save the request right now." });
  } finally {
    clearTimeout(timer);
  }
}
