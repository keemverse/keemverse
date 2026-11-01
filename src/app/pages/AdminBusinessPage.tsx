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

type Sheet = "Orders" | "Downloads" | "Custom Requests";
type Row = Record<string, any>;

const TABS: { id: Sheet; label: string }[] = [
  { id: "Orders", label: "Orders" },
  { id: "Custom Requests", label: "Requests" },
  { id: "Downloads", label: "Download links" },
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
      description="Orders, custom design requests and download links, from your private sheet. You can switch download links off and update a request's status and note here."
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
        <Input className="w-full max-w-xs sm:ml-auto" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
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
        ) : (
          <Downloads rows={rows} q={query} secret={secret} onChanged={() => void load("Downloads")} />
        )}
      </div>
    </AdminShell>
  );
}
