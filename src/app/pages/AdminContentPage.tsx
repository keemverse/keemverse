import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw, Check, Lock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { AdminNav } from "../components/AdminNav";
import { useAdminAuth } from "../lib/useAdminAuth";
import { Accent, CONTENT_GROUPS, DEFAULTS, type FieldDef } from "../lib/siteContent";

// Admin > Content: every piece of editable site copy in one place, grouped by
// page. Changes go live about 30 seconds after saving. A field left at its
// default is not stored, so "reset" simply puts the shipped wording back.

type Values = Record<string, string>;

export default function AdminContentPage() {
  const { secret, unlocked, checking, error, checkSecret } = useAdminAuth();
  const [secretInput, setSecretInput] = useState("");
  const [saved, setSaved] = useState<Values>({});
  const [values, setValues] = useState<Values>({ ...DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [active, setActive] = useState(CONTENT_GROUPS[0].id);

  useEffect(() => {
    if (!unlocked) return;
    setLoading(true);
    fetch(`/api/content?t=${Date.now()}`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: Values) => {
        const merged = { ...DEFAULTS, ...data };
        setSaved(merged);
        setValues(merged);
      })
      .catch(() => setMessage({ kind: "err", text: "Could not load the current content. Showing the shipped wording." }))
      .finally(() => setLoading(false));
  }, [unlocked]);

  const dirtyKeys = useMemo(() => Object.keys(values).filter((k) => (values[k] ?? "") !== (saved[k] ?? "")), [values, saved]);

  const set = (key: string, v: string) => {
    setMessage(null);
    setValues((p) => ({ ...p, [key]: v }));
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      // Only store what differs from the shipped default.
      const overrides: Values = {};
      for (const [k, v] of Object.entries(values)) {
        const t = (v ?? "").trim();
        if (t && t !== DEFAULTS[k]) overrides[k] = t;
      }
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-secret": secret },
        body: JSON.stringify({ values: overrides }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `Save failed (${res.status})`);
      const next = { ...DEFAULTS, ...overrides };
      setSaved(next);
      setValues(next);
      setMessage({ kind: "ok", text: "Saved. Your changes are live in about 30 seconds." });
    } catch (e: any) {
      setMessage({ kind: "err", text: e.message || "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-5">
        <div className="glass w-full max-w-sm rounded-3xl p-8 space-y-4">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-foreground text-background">
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <p className="eyebrow text-amber-ink">Admin</p>
            <h1 className="mt-1 text-display-md">Site content</h1>
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-5 pb-40 pt-10 md:px-8">
        <AdminNav />

        <header className="mt-8">
          <p className="eyebrow text-amber-ink">Admin</p>
          <h1 className="mt-2 text-display-lg">Site content</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Every headline, supporting line and button label you can change without touching code. Product details, prices
            and photos stay in Products.
          </p>
        </header>

        <div className="mt-8 grid gap-8 md:grid-cols-[13rem_1fr]">
          {/* group switcher: a rail on desktop, scrolling chips on phones */}
          <nav aria-label="Content groups" className="md:sticky md:top-6 md:self-start">
            <ul className="rail md:flex-col md:gap-1">
              {CONTENT_GROUPS.map((g) => {
                const count = g.fields.filter((f) => dirtyKeys.includes(f.key)).length;
                return (
                  <li key={g.id}>
                    <a
                      href={`#${g.id}`}
                      onClick={() => setActive(g.id)}
                      className={`press flex items-center justify-between gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm md:rounded-2xl ${
                        active === g.id ? "bg-foreground text-background" : "glass text-foreground/80 hover:text-foreground"
                      }`}
                    >
                      {g.title}
                      {count > 0 && (
                        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[var(--fashion-display)] px-1.5 text-[11px] font-bold text-[#14120F]">
                          {count}
                        </span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="space-y-6">
            {CONTENT_GROUPS.map((g) => (
              <motion.section
                key={g.id}
                id={g.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45 }}
                className="glass scroll-mt-6 rounded-3xl p-6 md:p-8"
              >
                <h2 className="text-display-md">{g.title}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">{g.description}</p>

                <div className="mt-6 space-y-6">
                  {g.fields.map((f) => (
                    <Field key={f.key} def={f} value={values[f.key] ?? ""} dirty={dirtyKeys.includes(f.key)} loading={loading} onChange={(v) => set(f.key, v)} />
                  ))}
                </div>
              </motion.section>
            ))}
          </div>
        </div>
      </div>

      {/* save bar */}
      <AnimatePresence>
        {(dirtyKeys.length > 0 || message) && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4"
          >
            <div className="glass mx-auto flex max-w-2xl items-center justify-between gap-3 rounded-full py-2.5 pl-6 pr-2.5">
              <p className={`text-sm ${message?.kind === "err" ? "text-destructive" : "text-foreground"}`} aria-live="polite">
                {message ? (
                  <span className="inline-flex items-center gap-2">
                    {message.kind === "ok" && <Check className="h-4 w-4" />}
                    {message.text}
                  </span>
                ) : (
                  `${dirtyKeys.length} unsaved ${dirtyKeys.length === 1 ? "change" : "changes"}`
                )}
              </p>
              <div className="flex shrink-0 items-center gap-2">
                {dirtyKeys.length > 0 && (
                  <button type="button" onClick={() => setValues(saved)} className="press rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                    Discard
                  </button>
                )}
                <button
                  type="button"
                  onClick={save}
                  disabled={saving || dirtyKeys.length === 0}
                  className="press rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background disabled:opacity-40"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  def,
  value,
  dirty,
  loading,
  onChange,
}: {
  def: FieldDef;
  value: string;
  dirty: boolean;
  loading: boolean;
  onChange: (v: string) => void;
}) {
  const isDefault = value.trim() === def.default;
  const common =
    "w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/40 disabled:opacity-60";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={def.key} className="flex items-center gap-2 text-sm font-medium">
          {def.label}
          {dirty && <span aria-label="unsaved" className="h-1.5 w-1.5 rounded-full bg-[var(--fashion-display)]" />}
        </label>
        {!isDefault && (
          <button
            type="button"
            onClick={() => onChange(def.default)}
            className="press inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" /> Reset to default
          </button>
        )}
      </div>

      {def.multiline ? (
        <textarea
          id={def.key}
          rows={def.default.length > 140 ? 4 : 2}
          value={value}
          disabled={loading}
          onChange={(e) => onChange(e.target.value)}
          className={`${common} resize-y leading-relaxed`}
        />
      ) : (
        <input id={def.key} value={value} disabled={loading} onChange={(e) => onChange(e.target.value)} className={common} />
      )}

      <div className="mt-1.5 flex items-start justify-between gap-4 text-xs text-muted-foreground">
        <span>{def.help}</span>
        <span className="tabular-nums">{value.length}</span>
      </div>

      {def.accent && value.trim() && (
        <p className="mt-2 rounded-xl bg-muted/60 px-4 py-3 text-sm leading-relaxed text-foreground">
          <span className="eyebrow mr-2 text-muted-foreground">Preview</span>
          <Accent text={value} />
        </p>
      )}
    </div>
  );
}
