import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Type, Layers, ArrowUpRight, Lock, Plus, Link2, Eye } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { AdminShell } from "../components/AdminShell";
import { useAdminAuth } from "../lib/useAdminAuth";

type Row = { type: string; status: string; updated_at?: string; created_at?: string; featured?: boolean };

const TOOLS = [
  { to: "/admin/products", label: "Products", description: "Fashion Finds, presets and design items: prices, photos, order, status.", icon: ShoppingBag, editor: true },
  { to: "/admin/content", label: "Site content", description: "Headlines, supporting lines, button labels and Temu links on every page.", icon: Type, editor: false },
  { to: "/admin/studio", label: "Studio", description: "Import images, drag and resize, save or export.", icon: Layers, editor: false },
];

// Splits "how long ago" into a big value and a small unit line for the tile.
function ageParts(iso?: string): [string, string] {
  if (!iso) return ["—", "no changes yet"];
  const sec = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 90) return ["now", "just updated"];
  if (sec < 3600) return [String(Math.round(sec / 60)), "min ago"];
  if (sec < 86400) return [String(Math.round(sec / 3600)), "hours ago"];
  const d = Math.round(sec / 86400);
  return [String(d), d === 1 ? "day ago" : "days ago"];
}

function Stat({ label, value, sub, loading }: { label: string; value: string; sub: string; loading: boolean }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="eyebrow text-muted-foreground">{label}</p>
      {loading ? (
        <div className="skeleton-shimmer mt-3 h-9 w-16 rounded-lg" />
      ) : (
        <p className="mt-2 text-4xl font-medium tabular-nums tracking-tight">{value}</p>
      )}
      <p className="mt-1 text-sm text-muted-foreground">{loading ? " " : sub}</p>
    </div>
  );
}

export default function AdminHomePage() {
  const { secret, unlocked, checking, error, role, checkSecret } = useAdminAuth({ allowEditor: true });
  const [secretInput, setSecretInput] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!unlocked) return;
    setLoadingStats(true);
    fetch("/api/products?all=1", { headers: { "x-admin-secret": secret } })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch(() => setRows([]))
      .finally(() => setLoadingStats(false));
  }, [unlocked, secret]);

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-5">
        <div className="glass w-full max-w-sm rounded-3xl p-8 space-y-4">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-foreground text-background">
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <p className="eyebrow text-amber-ink">KEEMVERSE</p>
            <h1 className="mt-1 text-display-md">Admin console</h1>
          </div>
          <Input
            type="password"
            placeholder="Admin secret"
            value={secretInput}
            onChange={(e) => setSecretInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && checkSecret(secretInput)}
          />
          <Button className="w-full" onClick={() => checkSecret(secretInput)} disabled={checking}>
            {checking ? "Checking…" : "Unlock"}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </div>
    );
  }

  const isEditor = role === "editor";
  const count = (type: string, status?: string) => rows.filter((r) => r.type === type && (!status || r.status === status)).length;
  const lastChange = rows
    .map((r) => r.updated_at || r.created_at || "")
    .filter(Boolean)
    .sort()
    .pop();
  const designTypes = ["design", "design_pack", "design_bundle"];
  const designTotal = rows.filter((r) => designTypes.includes(r.type)).length;
  const designLive = rows.filter((r) => designTypes.includes(r.type) && r.status === "Live").length;
  const tools = isEditor ? TOOLS.filter((t) => t.editor) : TOOLS;

  return (
    <AdminShell
      role={role}
      eyebrow="Overview"
      title="Admin console"
      description={isEditor ? "You can change product status, price and order." : "Everything you can change on the site, in one place."}
    >
      <section aria-label="At a glance" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Fashion finds" value={String(count("fashion_find", "Live"))} sub={`live of ${count("fashion_find")}`} loading={loadingStats} />
        <Stat label="Presets" value={String(count("preset", "Live"))} sub={`live of ${count("preset")}`} loading={loadingStats} />
        <Stat label="Design items" value={String(designLive)} sub={`live of ${designTotal}`} loading={loadingStats} />
        <Stat label="Last change" value={ageParts(lastChange)[0]} sub={ageParts(lastChange)[1]} loading={loadingStats} />
      </section>

      {!isEditor && (
        <section aria-label="Shortcuts" className="mt-8">
          <p className="eyebrow text-muted-foreground">Shortcuts</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/admin/products" className="press glass inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium">
              <Plus className="h-4 w-4" /> Add a find
            </Link>
            <Link to="/admin/content#home" className="press glass inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium">
              <Type className="h-4 w-4" /> Edit home text
            </Link>
            <Link to="/admin/content#temu" className="press glass inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium">
              <Link2 className="h-4 w-4" /> Temu links
            </Link>
            <a href="/" target="_blank" rel="noopener noreferrer" className="press glass inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium">
              <Eye className="h-4 w-4" /> View live site
            </a>
          </div>
        </section>
      )}

      <section aria-label="Tools" className="mt-10">
        <p className="eyebrow text-muted-foreground">Tools</p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {tools.map((tool) => (
            <Link key={tool.to} to={tool.to} className="card-lift glass group flex flex-col rounded-3xl p-6">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-foreground text-background">
                <tool.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-6 flex items-center justify-between text-xl font-medium">
                {tool.label}
                <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
