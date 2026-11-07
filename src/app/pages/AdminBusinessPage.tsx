import { useCallback, useEffect, useMemo, useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { AdminShell } from "../components/AdminShell";
import { useAdminAuth } from "../lib/useAdminAuth";

// Orders, download links and custom-design requests, read from the private
// sheet tabs through /api/admin-data. Two things can be changed from here:
// switching an order's download links off or on, and a request's status and
// note. Admin login only: the editor login cannot open this page, and the API
// refuses it too.

type Sheet = "Orders" | "Downloads" | "Custom Requests" | "Leads" | "Events";
type Row = Record<string, any>;

const TABS: { id: Sheet; label: string }[] = [
  { id: "Orders", label: "Orders" },
  { id: "Custom Requests", label: "Requests" },
  { id: "Downloads", label: "Download links" },
  { id: "Leads", label: "Free look signups" },
  { id: "Events", label: "Funnel" },
];

function when(v: unknown): string {
  const s = String(v ?? "");
  if (!s) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(s);
  if (!m) return s;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]));
  return d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const asTime = (v: unknown): number => {
  const s = String(v ?? "");
  const iso = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/.exec(s);
  if (iso) return new Date(iso[1]).getTime();
  const uk = /^(\d{1,2})\/(\d{1,2})\/(\d{4})[ ,]*(\d{1,2})?:?(\d{2})?/.exec(s);
  if (uk) return new Date(Number(uk[3]), Number(uk[2]) - 1, Number(uk[1]), Number(uk[4] || 0), Number(uk[5] || 0)).getTime();
  return 0;
};

const STATUSES = ["New", "Replied", "Quoted", "Won", "Closed"];

async function send(secret: string, body: Record<string, unknown>): Promise<string | null> {
  try {
    const res = await fetch("/api/admin-data", {
      method: "POST",
      headers: { "x-admin-secret": secret, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const out = await res.json().catch(() => ({}));
    return res.ok ? null : out.error || `Could not save (${res.status})`;
  } catch (e: any) {
    return e.message || "Could not save";
  }
}

const money = (n: number, cur: string) => (cur === "USD" ? `$${n.toLocaleString()}` : `₦${n.toLocaleString()}`);
const yes = (v: unknown) => /^(yes|true)$/i.test(String(v ?? "").trim());

function Chip({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "good" | "warn" | "bad" }) {
  const cls =
    tone === "good"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
      : tone === "warn"
        ? "bg-amber-500/15 text-amber-800 dark:text-amber-300"
        : tone === "bad"
          ? "bg-red-500/15 text-red-700 dark:text-red-300"
          : "bg-muted text-foreground/75";
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${cls}`}>{children}</span>;
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="eyebrow text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-medium tabular-nums tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}

/* ------------------------------ Orders ------------------------------ */

function Orders({ rows, q }: { rows: Row[]; q: string }) {
  const sorted = useMemo(() => [...rows].sort((a, b) => asTime(b["Timestamp"]) - asTime(a["Timestamp"])), [rows]);
  const shown = sorted.filter((r) => !q || JSON.stringify(r).toLowerCase().includes(q));
  const paid = rows.filter((r) => String(r["Status"]) === "Paid");
  const sums: Record<string, number> = {};
  for (const r of paid) sums[String(r["Currency"] || "NGN")] = (sums[String(r["Currency"] || "NGN")] || 0) + Number(r["Amount"] || 0);
  const optIns = paid.filter((r) => yes(r["Marketing Opt-in"])).length;
  const revenue = Object.entries(sums).map(([c, n]) => money(n, c)).join("  ·  ") || "—";

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Paid orders" value={String(paid.length)} sub={rows.length !== paid.length ? `${rows.length} rows in total` : undefined} />
        <Stat label="Taken" value={revenue} sub="paid orders, by currency" />
        <Stat label="Said yes to updates" value={String(optIns)} sub="ticked the checkout box" />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Buyer</th>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Updates</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r, i) => (
              <tr key={i} className="border-t border-border align-top">
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{when(r["Timestamp"])}</td>
                <td className="px-4 py-3">{r["Email"]}</td>
                <td className="px-4 py-3">{String(r["Preset"] || "").replace(": Lightroom Preset", "")}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{money(Number(r["Amount"] || 0), String(r["Currency"] || "NGN"))}</td>
                <td className="px-4 py-3">
                  <Chip tone={String(r["Status"]) === "Paid" ? "good" : "warn"}>{String(r["Status"] || "")}</Chip>
                </td>
                <td className="px-4 py-3">{yes(r["Marketing Opt-in"]) ? <Chip tone="good">Yes</Chip> : <span className="text-muted-foreground">No</span>}</td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  {rows.length === 0 ? "No orders yet. The first one will show up here." : "Nothing matches that search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ------------------------------ Requests ------------------------------ */

const waLink = (contact: string) => {
  const digits = contact.replace(/[^0-9]/g, "");
  return digits.length >= 8 && !/@/.test(contact) ? `https://wa.me/${digits}` : "";
};

function Requests({ rows, q, secret, onChanged }: { rows: Row[]; q: string; secret: string; onChanged: () => void }) {
  const [status, setStatus] = useState("All");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");
  const [saved, setSaved] = useState("");
  const [err, setErr] = useState("");

  const save = async (ref: string, patch: { status?: string; note?: string }) => {
    setBusy(ref);
    setErr("");
    const problem = await send(secret, { op: "request_update", ref, ...patch });
    setBusy("");
    if (problem) return setErr(`${ref}: ${problem}`);
    setSaved(ref);
    setTimeout(() => setSaved((x) => (x === ref ? "" : x)), 2000);
    onChanged();
  };
  const sorted = useMemo(() => [...rows].sort((a, b) => asTime(b["Timestamp"]) - asTime(a["Timestamp"])), [rows]);
  const statuses = ["All", ...Array.from(new Set(rows.map((r) => String(r["Status"] || "New"))))];
  const shown = sorted.filter((r) => (status === "All" || String(r["Status"] || "New") === status) && (!q || JSON.stringify(r).toLowerCase().includes(q)));
  const open = rows.filter((r) => ["New"].includes(String(r["Status"] || "New"))).length;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Waiting for a reply" value={String(open)} sub='status "New"' />
        <Stat label="All requests" value={String(rows.length)} />
        <Stat label="Won" value={String(rows.filter((r) => String(r["Status"]) === "Won").length)} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`press rounded-full px-3.5 py-1.5 text-[12px] font-medium ${status === s ? "bg-foreground text-background" : "glass text-foreground/80"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {err && <p className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">{err}</p>}

      <ul className="mt-5 space-y-4">
        {shown.map((r, i) => {
          const contact = String(r["Contact"] || "");
          const ref = String(r["Ref"] || "");
          const wa = waLink(contact);
          const st = String(r["Status"] || "New");
          return (
            <li key={i} className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="font-mono text-xs text-muted-foreground">{String(r["Ref"] || "")}</span>
                <Chip tone={st === "New" ? "warn" : st === "Won" ? "good" : "muted"}>{st}</Chip>
                <span className="text-xs text-muted-foreground">{when(r["Timestamp"])}</span>
              </div>
              <p className="mt-2 text-lg font-medium">{String(r["Name"] || "")}</p>
              <p className="mt-1 text-sm">
                {wa ? (
                  <a className="underline underline-offset-4" href={wa} target="_blank" rel="noopener noreferrer">
                    {contact} · open WhatsApp ↗
                  </a>
                ) : /@/.test(contact) ? (
                  <a className="underline underline-offset-4" href={`mailto:${contact}`}>
                    {contact}
                  </a>
                ) : (
                  contact
                )}
              </p>
              <p className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {r["For"] && <Chip>{String(r["For"])}</Chip>}
                {r["Garment"] && <Chip>{String(r["Garment"])}</Chip>}
                {r["Needed by"] && <Chip>Needed by {String(r["Needed by"])}</Chip>}
              </p>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-foreground/85">{String(r["What they want"] || "")}</p>
              {r["Examples"] && <p className="mt-2 break-words text-sm text-muted-foreground">Examples: {String(r["Examples"])}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                <label className="text-xs text-muted-foreground" htmlFor={`st-${ref}`}>
                  Status
                </label>
                <select
                  id={`st-${ref}`}
                  className="h-9 rounded-md border border-input bg-input-background px-3 text-sm"
                  value={st}
                  disabled={busy === ref}
                  onChange={(e) => void save(ref, { status: e.target.value })}
                >
                  {STATUSES.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
                {saved === ref && <span className="text-xs text-emerald-600 dark:text-emerald-400">Saved ✓</span>}
              </div>
              <textarea
                aria-label={`Your note for ${ref}`}
                className="mt-3 w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm"
                rows={2}
                maxLength={500}
                placeholder="Your note (only you see this)"
                value={notes[ref] ?? String(r["Notes (yours)"] || "")}
                onChange={(e) => setNotes((n) => ({ ...n, [ref]: e.target.value }))}
              />
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                disabled={busy === ref || notes[ref] === undefined || notes[ref] === String(r["Notes (yours)"] || "")}
                onClick={() => void save(ref, { note: notes[ref] })}
              >
                {busy === ref ? "Saving…" : "Save note"}
              </Button>
            </li>
          );
        })}
        {shown.length === 0 && (
          <li className="rounded-2xl border border-border px-4 py-10 text-center text-muted-foreground">
            {rows.length === 0 ? "No requests yet." : "Nothing matches."}
          </li>
        )}
      </ul>
    </>
  );
}

/* ------------------------------ Downloads ------------------------------ */

function Downloads({ rows, q, secret, onChanged }: { rows: Row[]; q: string; secret: string; onChanged: () => void }) {
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  const setRevoked = async (r: Row, revoked: boolean) => {
    const key = `${r["Order Ref"]}|${r["Item"]}`;
    setBusy(key);
    setErr("");
    const problem = await send(secret, { op: "set_revoked", orderRef: String(r["Order Ref"] || ""), item: String(r["Item"] || ""), revoked });
    setBusy("");
    setConfirm("");
    if (problem) return setErr(problem);
    onChanged();
  };

  const sorted = useMemo(() => [...rows].sort((a, b) => asTime(b["Issued"]) - asTime(a["Issued"])), [rows]);
  const shown = sorted.filter((r) => !q || JSON.stringify(r).toLowerCase().includes(q));
  const now = Date.now();
  const used = rows.reduce((n, r) => n + Number(r["Downloads"] || 0), 0);
  const revoked = rows.filter((r) => yes(r["Revoked"])).length;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Links issued" value={String(rows.length)} />
        <Stat label="Downloads so far" value={String(used)} />
        <Stat label="Switched off" value={String(revoked)} sub="revoked links" />
      </div>
      {err && <p className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">{err}</p>}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Issued</th>
              <th className="px-4 py-3 font-medium">Buyer</th>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Used</th>
              <th className="px-4 py-3 font-medium">State</th>
              <th className="px-4 py-3 text-right font-medium">Links</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r, i) => {
              const exp = asTime(r["Expires"]);
              const max = Number(r["Max Downloads"] || 0);
              const cnt = Number(r["Downloads"] || 0);
              const state = yes(r["Revoked"]) ? ["Revoked", "bad"] : exp && exp < now ? ["Expired", "warn"] : max && cnt >= max ? ["Limit reached", "warn"] : ["Active", "good"];
              return (
                <tr key={i} className="border-t border-border align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{when(r["Issued"])}</td>
                  <td className="px-4 py-3">{r["Buyer Email"]}</td>
                  <td className="px-4 py-3">{String(r["Item"] || "").replace(": Lightroom Preset", "")}</td>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums">
                    {cnt} / {max || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Chip tone={state[1] as any}>{state[0]}</Chip>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {(() => {
                      const key = `${r["Order Ref"]}|${r["Item"]}`;
                      const isRevoked = yes(r["Revoked"]);
                      if (busy === key) return <span className="text-xs text-muted-foreground">Saving…</span>;
                      if (isRevoked) {
                        return (
                          <Button size="sm" variant="outline" onClick={() => void setRevoked(r, false)}>
                            Switch back on
                          </Button>
                        );
                      }
                      if (confirm === key) {
                        return (
                          <span className="inline-flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Stop all links for this order?</span>
                            <Button size="sm" variant="destructive" onClick={() => void setRevoked(r, true)}>
                              Yes, switch off
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setConfirm("")}>
                              No
                            </Button>
                          </span>
                        );
                      }
                      return (
                        <Button size="sm" variant="outline" onClick={() => setConfirm(key)}>
                          Switch off
                        </Button>
                      );
                    })()}
                  </td>
                </tr>
              );
            })}
            {shown.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  {rows.length === 0 ? "No links issued yet." : "Nothing matches that search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Links expire after 72 hours or 3 downloads. A buyer can ask for new ones on the Presets page. “Switch off” stops every link for that order and also stops new ones being issued for it; “Switch back on” undoes it.</p>
    </>
  );
}

/* ------------------------------ Page ------------------------------ */

/* ------------------------------ Leads ------------------------------ */

function Leads({ rows, q }: { rows: Row[]; q: string }) {
  const [copied, setCopied] = useState(false);
  const sorted = useMemo(() => [...rows].sort((a, b) => asTime(b["Timestamp"]) - asTime(a["Timestamp"])), [rows]);
  const shown = sorted.filter((r) => !q || [r["Email"], r["Item"], r["Source"], r["Campaign"]].join(" ").toLowerCase().includes(q));
  const optIns = rows.filter((r) => yes(r["Marketing Opt-in"]));
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const lastWeek = rows.filter((r) => asTime(r["Timestamp"]) >= weekAgo).length;

  const copyEmails = async () => {
    const list = Array.from(new Set(optIns.map((r) => String(r["Email"] || "").trim()).filter(Boolean))).join(", ");
    try {
      await navigator.clipboard.writeText(list);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copy these emails:", list);
    }
  };

  if (rows.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">
        No free look signups yet. They appear here once the free look is switched on (Admin, Content, Home page) and the Apps Script is updated.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Signups" value={String(rows.length)} sub="asked for the free look" />
        <Stat label="Said yes to updates" value={String(optIns.length)} sub="ticked the optional box" />
        <Stat label="Last 7 days" value={String(lastWeek)} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Only message people who ticked the updates box.</p>
        <Button variant="outline" onClick={copyEmails} disabled={optIns.length === 0}>
          {copied ? "Copied" : `Copy ${optIns.length} opted-in emails`}
        </Button>
      </div>
      <div className="glass overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-[12px] uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Look</th>
              <th className="px-4 py-3">Updates</th>
              <th className="px-4 py-3">Came from</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r, i) => (
              <tr key={i} className="border-t border-border/60">
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{when(r["Timestamp"])}</td>
                <td className="px-4 py-3">{r["Email"]}</td>
                <td className="px-4 py-3">{r["Item"]}</td>
                <td className="px-4 py-3">{yes(r["Marketing Opt-in"]) ? <Chip tone="good">Yes</Chip> : <Chip>No</Chip>}</td>
                <td className="px-4 py-3 text-muted-foreground">{[r["Source"], r["Campaign"]].filter(Boolean).join(" / ") || "direct"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------ Funnel ------------------------------ */

const DAY = 24 * 3600 * 1000;

function Funnel({ rows }: { rows: Row[] }) {
  const [days, setDays] = useState(7);
  const cutoff = days === 0 ? 0 : Date.now() - days * DAY;
  const inRange = useMemo(() => rows.filter((r) => asTime(r["Timestamp"]) >= cutoff), [rows, cutoff]);

  // One visitor = one random per-visit id, so each step counts people, not clicks.
  const sessions = (test: (r: Row) => boolean) => new Set(inRange.filter(test).map((r) => String(r["Session"]))).size;
  const ev = (name: string) => (r: Row) => r["Event"] === name;
  const path = (r: Row) => String(r["Path"] || "");

  const steps = [
    { label: "Visited the site", n: sessions(ev("page")) },
    { label: "Looked at presets (picker, reveal or a preset page)", n: sessions((r) => ["look_pick", "look_open"].includes(String(r["Event"])) || (r["Event"] === "page" && path(r).startsWith("/fashion/presets"))) },
    { label: "Opened a look's page", n: sessions((r) => r["Event"] === "look_open" || (r["Event"] === "page" && /^\/fashion\/presets\/.+/.test(path(r)))) },
    { label: "Tapped Buy", n: sessions(ev("buy_click")) },
    { label: "Opened checkout", n: sessions(ev("checkout_view")) },
    { label: "Started payment", n: sessions(ev("pay_start")) },
    { label: "Paid", n: sessions(ev("pay_success")) },
  ];
  const top = Math.max(1, steps[0].n);
  const freeSeen = sessions(ev("freelook_view"));
  const freeSent = sessions(ev("freelook_submit"));

  const bySource = useMemo(() => {
    const map = new Map<string, { visits: Set<string>; buys: Set<string>; paid: Set<string> }>();
    // A visit keeps the source it arrived with, so look it up from any of its events.
    const sourceOf = new Map<string, string>();
    for (const r of inRange) if (r["Source"] && !sourceOf.has(String(r["Session"]))) sourceOf.set(String(r["Session"]), String(r["Source"]));
    for (const r of inRange) {
      const sid = String(r["Session"]);
      const src = sourceOf.get(sid) || "direct";
      if (!map.has(src)) map.set(src, { visits: new Set(), buys: new Set(), paid: new Set() });
      const g = map.get(src)!;
      if (r["Event"] === "page") g.visits.add(sid);
      if (r["Event"] === "buy_click") g.buys.add(sid);
      if (r["Event"] === "pay_success") g.paid.add(sid);
    }
    return [...map.entries()].map(([src, g]) => ({ src, visits: g.visits.size, buys: g.buys.size, paid: g.paid.size })).sort((a, b) => b.visits - a.visits);
  }, [inRange]);

  const byLook = useMemo(() => {
    const map = new Map<string, { picks: number; opens: number; buys: number }>();
    for (const r of inRange) {
      const item = String(r["Item"] || "");
      if (!item || !["look_pick", "look_open", "buy_click"].includes(String(r["Event"]))) continue;
      if (!map.has(item)) map.set(item, { picks: 0, opens: 0, buys: 0 });
      const g = map.get(item)!;
      if (r["Event"] === "look_pick") g.picks++;
      if (r["Event"] === "look_open") g.opens++;
      if (r["Event"] === "buy_click") g.buys++;
    }
    return [...map.entries()].map(([item, g]) => ({ item, ...g })).sort((a, b) => b.picks + b.opens + b.buys - (a.picks + a.opens + a.buys));
  }, [inRange]);

  if (rows.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">
        No visits recorded yet. Counting starts once the site with tracking is live on keemverse.com and the Apps Script has the new handlers.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {[
          { d: 7, l: "Last 7 days" },
          { d: 30, l: "Last 30 days" },
          { d: 0, l: "Everything" },
        ].map((o) => (
          <button
            key={o.d}
            onClick={() => setDays(o.d)}
            className={`press rounded-full px-4 py-2 text-sm font-medium ${days === o.d ? "bg-foreground text-background" : "glass text-foreground/80"}`}
          >
            {o.l}
          </button>
        ))}
        <p className="text-sm text-muted-foreground sm:ml-auto">People, not clicks. Anonymous: no names or emails.</p>
      </div>

      <div className="glass rounded-2xl p-5 md:p-6">
        <ol className="space-y-4">
          {steps.map((st, i) => {
            const prev = i === 0 ? null : steps[i - 1].n;
            const stepPct = prev && prev > 0 ? Math.round((st.n / prev) * 100) : null;
            return (
              <li key={st.label}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span>{st.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    <strong className="text-foreground">{st.n}</strong>
                    {stepPct !== null && <span> · {stepPct}% of the step before</span>}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-[color:var(--fashion-display)]" style={{ width: `${Math.max(2, Math.round((st.n / top) * 100))}%` }} />
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Saw the free look form" value={String(freeSeen)} />
        <Stat label="Asked for it" value={String(freeSent)} sub={freeSeen ? `${Math.round((freeSent / freeSeen) * 100)}% of those who saw it` : undefined} />
        <Stat label="Visit to paid" value={steps[0].n ? `${((steps[6].n / steps[0].n) * 100).toFixed(1)}%` : "0%"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass overflow-x-auto rounded-2xl">
          <p className="eyebrow px-4 pt-4 text-muted-foreground">Where visitors came from</p>
          <table className="mt-2 w-full min-w-[320px] text-left text-sm">
            <thead className="text-[12px] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Source</th>
                <th className="px-4 py-2 text-right">Visits</th>
                <th className="px-4 py-2 text-right">Tapped Buy</th>
                <th className="px-4 py-2 text-right">Paid</th>
              </tr>
            </thead>
            <tbody>
              {bySource.map((g) => (
                <tr key={g.src} className="border-t border-border/60">
                  <td className="px-4 py-2.5">{g.src}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{g.visits}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{g.buys}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{g.paid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="glass overflow-x-auto rounded-2xl">
          <p className="eyebrow px-4 pt-4 text-muted-foreground">Which looks get attention</p>
          <table className="mt-2 w-full min-w-[320px] text-left text-sm">
            <thead className="text-[12px] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Look</th>
                <th className="px-4 py-2 text-right">Picked</th>
                <th className="px-4 py-2 text-right">Opened</th>
                <th className="px-4 py-2 text-right">Buy taps</th>
              </tr>
            </thead>
            <tbody>
              {byLook.length === 0 ? (
                <tr>
                  <td className="px-4 py-3 text-muted-foreground" colSpan={4}>
                    Nothing yet in this range.
                  </td>
                </tr>
              ) : (
                byLook.map((g) => (
                  <tr key={g.item} className="border-t border-border/60">
                    <td className="px-4 py-2.5">{g.item}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{g.picks}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{g.opens}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{g.buys}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminBusinessPage() {
  const { secret, unlocked, checking, error, checkSecret } = useAdminAuth();
  const [secretInput, setSecretInput] = useState("");
  const [tab, setTab] = useState<Sheet>("Orders");
  const [data, setData] = useState<Record<string, Row[]>>({});
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState("");
  const [q, setQ] = useState("");

  const load = useCallback(
    async (sheet: Sheet) => {
      setLoading(true);
      setProblem("");
      try {
        const res = await fetch(`/api/admin-data?sheet=${encodeURIComponent(sheet)}`, { headers: { "x-admin-secret": secret } });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || `Could not load (${res.status})`);
        setData((d) => ({ ...d, [sheet]: Array.isArray(body.rows) ? body.rows : [] }));
      } catch (e: any) {
        setProblem(e.message || "Could not load");
      } finally {
        setLoading(false);
      }
    },
    [secret]
  );

  useEffect(() => {
    if (unlocked) void load(tab);
  }, [unlocked, tab, load]);

  if (!unlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
        <div className="glass w-full max-w-sm rounded-3xl p-8 text-center">
          <Lock className="mx-auto h-6 w-6 text-muted-foreground" />
          <h1 className="mt-4 font-serif text-2xl">Business</h1>
          <p className="mt-2 text-sm text-muted-foreground">Orders and requests are private. Enter the admin secret.</p>
          <form
            className="mt-6 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              void checkSecret(secretInput);
            }}
          >
            <Input type="password" placeholder="Admin secret" value={secretInput} onChange={(e) => setSecretInput(e.target.value)} />
            <Button type="submit" className="w-full" disabled={checking || !secretInput}>
              {checking ? "Checking…" : "Unlock"}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </form>
        </div>
      </div>
    );
  }

  const rows = data[tab] ?? [];
  const query = q.trim().toLowerCase();

  return (
    <AdminShell
      role="admin"
      eyebrow="Admin"
      title="Business"
      description="Orders, requests, download links, free look signups and the visit funnel, from your private sheet. You can switch download links off and update a request's status and note here."
      actions={
        <Button variant="outline" onClick={() => load(tab)} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </Button>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              setQ("");
            }}
            className={`press rounded-full px-4 py-2 text-sm font-medium ${tab === t.id ? "bg-foreground text-background" : "glass text-foreground/80"}`}
          >
            {t.label}
          </button>
        ))}
        {tab !== "Events" && (
          <Input className="w-full max-w-xs sm:ml-auto" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        )}
      </div>

      <div className="mt-6">
        {problem ? (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-5 py-4 text-sm">
            <p className="font-medium">Couldn't load {tab.toLowerCase()}.</p>
            <p className="mt-1 text-muted-foreground">{problem}</p>
          </div>
        ) : loading && !data[tab] ? (
          <div className="space-y-3" aria-hidden="true">
            <div className="skeleton-shimmer h-24 rounded-2xl" />
            <div className="skeleton-shimmer h-48 rounded-2xl" />
          </div>
        ) : tab === "Orders" ? (
          <Orders rows={rows} q={query} />
        ) : tab === "Custom Requests" ? (
          <Requests rows={rows} q={query} secret={secret} onChanged={() => void load("Custom Requests")} />
        ) : tab === "Leads" ? (
          <Leads rows={rows} q={query} />
        ) : tab === "Events" ? (
          <Funnel rows={rows} />
        ) : (
          <Downloads rows={rows} q={query} secret={secret} onChanged={() => void load("Downloads")} />
        )}
      </div>
    </AdminShell>
  );
}
