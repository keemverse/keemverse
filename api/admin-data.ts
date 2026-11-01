import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isAuthorizedAdmin } from "./_github.js";

// The private sheet tabs, for the admin console.
//
//   GET  /api/admin-data?sheet=Orders | Downloads | Custom Requests    admin only
//   POST /api/admin-data   admin only, two narrow actions:
//          { op: "set_revoked", orderRef, item, revoked }   switch an order's download links off or on
//          { op: "request_update", ref, status?, note? }    change a custom request's status or your note
//
// The tabs hold buyers' emails and people's messages, so nothing here is public
// and nothing is stored in this repo. The function asks the same Apps Script
// project that serves checkout (see docs/apps-script-requests.gs), using the
// shared secret REQUESTS_SECRET that the custom-requests form already uses.
// Download tokens are removed by the script before the data leaves the sheet.

const DEFAULT_WEBHOOK =
  "https://script.google.com/macros/s/AKfycbxvRs-TgA3tqIMA7tBxvjs5pZ4j52cKyP3gYODzucUM1SU2rQ3OwSNxeqsZDNjRW8gc/exec";

const SHEETS = ["Orders", "Downloads", "Custom Requests"];
const REQUEST_STATUSES = ["New", "Replied", "Quoted", "Won", "Closed"];

// Control characters out, newlines and tabs kept (a note can be multi-line).
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(CONTROL, "").trim().slice(0, max) : "");

type ScriptResult = { ok: true; data: any } | { ok: false; status: number; error: string };

async function callScript(payload: Record<string, unknown>): Promise<ScriptResult> {
  const secret = process.env.REQUESTS_SECRET;
  if (!secret) return { ok: false, status: 503, error: "REQUESTS_SECRET is not set in Vercel." };

  const webhook = process.env.REQUESTS_WEBHOOK_URL || DEFAULT_WEBHOOK;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const upstream = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, secret }),
      signal: controller.signal,
    });
    const text = await upstream.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
      /* not JSON: the script has not been updated and redeployed yet */
    }
    if (!data) return { ok: false, status: 502, error: "The sheet script did not answer. It may need the new version deployed." };
    if (data.ok !== true) {
      const msg =
        data.error === "Unknown request." ? "The sheet script needs the new version deployed." : data.error || "The sheet script refused the request.";
      return { ok: false, status: 502, error: msg };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, status: 502, error: "Could not reach the sheet script." };
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === "GET") {
    const sheet = typeof req.query.sheet === "string" ? req.query.sheet : "";
    if (!SHEETS.includes(sheet)) return res.status(400).json({ error: `sheet must be one of: ${SHEETS.join(", ")}` });
    const r = await callScript({ action: "admin_read", sheet });
    if (!r.ok) return res.status(r.status).json({ error: r.error });
    return res.status(200).json({ sheet, headers: r.data.headers ?? [], rows: r.data.rows ?? [], total: r.data.total ?? 0 });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};

  if (body.op === "set_revoked") {
    const orderRef = clean(body.orderRef, 200);
    const item = clean(body.item, 160);
    if (!orderRef || !item || typeof body.revoked !== "boolean") {
      return res.status(400).json({ error: "Needs orderRef, item and revoked (true or false)." });
    }
    const r = await callScript({ action: "admin_write", op: "set_revoked", orderRef, item, revoked: body.revoked });
    if (!r.ok) return res.status(r.status).json({ error: r.error });
    return res.status(200).json({ ok: true, changed: r.data.changed ?? 0, revoked: body.revoked });
  }

  if (body.op === "request_update") {
    const ref = clean(body.ref, 20);
    if (!/^CR-\d{4,}$/.test(ref)) return res.status(400).json({ error: "That is not a request reference." });
    const payload: Record<string, unknown> = { action: "admin_write", op: "request_update", ref };
    if (body.status !== undefined) {
      if (typeof body.status !== "string" || !REQUEST_STATUSES.includes(body.status)) {
        return res.status(400).json({ error: `status must be one of: ${REQUEST_STATUSES.join(", ")}` });
      }
      payload.status = body.status;
    }
    if (body.note !== undefined) {
      if (typeof body.note !== "string") return res.status(400).json({ error: "note must be text." });
      payload.note = clean(body.note, 500);
    }
    if (payload.status === undefined && payload.note === undefined) return res.status(400).json({ error: "Nothing to update." });
    const r = await callScript(payload);
    if (!r.ok) return res.status(r.status).json({ error: r.error });
    return res.status(200).json({ ok: true, ref });
  }

  return res.status(400).json({ error: "Unknown action." });
}
