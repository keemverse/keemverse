import type { VercelRequest, VercelResponse } from "@vercel/node";

// Tells the page which country the visitor is in, so prices can show in naira
// for visitors in Nigeria and in US dollars for everyone else.
// Vercel adds the x-vercel-ip-country header at its edge; we read that one
// header and return only the two-letter code. No IP address is read, stored
// or logged here, and nothing is sent to a third party.
//   GET /api/geo  ->  { country: "NG" | "US" | ... | null }
export default function handler(req: VercelRequest, res: VercelResponse) {
  const raw = req.headers["x-vercel-ip-country"];
  const value = String(Array.isArray(raw) ? raw[0] : raw ?? "").toUpperCase();

  res.setHeader("Cache-Control", "private, no-store");
  return res.status(200).json({ country: /^[A-Z]{2}$/.test(value) ? value : null });
}
