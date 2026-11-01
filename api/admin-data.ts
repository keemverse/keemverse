import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isAuthorizedAdmin } from "./_github.js";

// Read-only view of the private sheet tabs, for the admin console.
//
//   GET /api/admin-data?sheet=Orders | Downloads | Custom Requests    admin only
//
// The tabs hold buyers' emails and people's messages, so nothing here is public
// and nothing is stored in this repo. The function asks the same Apps Script
// project that serves checkout (see docs/apps-script-requests.gs), using the
// shared secret REQUESTS_SECRET that the custom-requests form already uses.
// Download tokens are removed by the script before the data leaves the sheet.

const DEFAULT_WEBHOOK =
  "https://script.google.com/macros/s/AKfycbxvRs-TgA3tqIMA7tBxvjs5pZ4j52cKyP3gYODzucUM1SU2rQ3OwSNxeqsZDNjRW8gc/exec";

const SHEETS = ["Orders", "Downloads", "Custom Requests"];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

  const sheet = typeof req.query.sheet === "string" ? req.query.sheet : "";
  if (!SHEETS.includes(sheet)) return res.status(400).json({ error: `sheet must be one of: ${SHEETS.join(", ")}` });

  const secret = process.env.REQUESTS_SECRET;
  if (!secret) return res.status(503).json({ error: "REQUESTS_SECRET is not set in Vercel." });

  const webhook = process.env.REQUESTS_WEBHOOK_URL || DEFAULT_WEBHOOK;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const upstream = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "admin_read", secret, sheet }),
      signal: controller.signal,
    });
    const text = await upstream.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
      /* not JSON: the script has not been updated and redeployed yet */
    }
    if (!data) {
      return res.status(502).json({ error: "The sheet script did not answer. It may need the new version deployed." });
    }
    if (data.ok !== true) {
      return res.status(502).json({ error: data.error === "Unknown request." ? "The sheet script needs the new version deployed." : data.error || "The sheet script refused the request." });
    }
    return res.status(200).json({ sheet, headers: data.headers ?? [], rows: data.rows ?? [], total: data.total ?? 0 });
  } catch {
    return res.status(502).json({ error: "Could not reach the sheet script." });
  } finally {
    clearTimeout(timer);
  }
}
