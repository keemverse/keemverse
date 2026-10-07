import { useEffect, useMemo, useState } from "react";
import { parseQuickAdd, type QuickAddItem } from "../lib/quickAdd";
import { AdminNav } from "../components/AdminNav";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

type Product = {
  id: string;
  type: "fashion_find" | "preset" | "design_bundle";
  name: string;
  price: string | null;
  image_url: string | null;
  description: string | null;
  tags: string | null;
  status: "Live" | "Sold Out" | "Hidden";
  featured: boolean;
  // Fashion Find (retail/affiliate) only
  source: string | null;
  category: string | null;
  why_picked: string | null;
  rating: number | null;
  affiliate_link: string | null;
  direct_product_link: string | null;
  // Preset / Design Bundle (digital product) only
  collection: string | null;
  thumbnail: string | null;
  banner: string | null;
  whats_included: string | null;
  installation: string | null;
  compatible_with: string | null;
  display_order: number | null;
  drive_file_id: string | null;
  purchase_link: string | null;
  created_at?: string;
  updated_at?: string;
};

const TYPES: Product["type"][] = ["fashion_find", "preset", "design_bundle"];
const STATUSES: Product["status"][] = ["Live", "Sold Out", "Hidden"];

type SortKey = "manual" | "name" | "price" | "status" | "created_at";
const SORT_LABELS: Record<SortKey, string> = {
  manual: "Site order (position 1 shows first)",
  name: "Name (A–Z)",
  price: "Price (low → high)",
  status: "Status",
  created_at: "Date added (newest first)",
};
const numericPrice = (price: string | null) => {
  const n = parseFloat(String(price ?? "").replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : n;
};
// Alphabetical would put Hidden before Live, which is backwards for what
// anyone actually wants from a "sort by status" — the thing that's
// sellable right now belongs first.
const STATUS_RANK: Record<Product["status"], number> = { Live: 0, "Sold Out": 1, Hidden: 2 };
// The public pages sort by display_order (rows without one go last), but
// the API returns newest-first — so without this the admin list jumped
// back to date order after every "Save order" and never showed what
// visitors actually see. Stable sort, so unordered rows stay newest-first.
const sortBySiteOrder = (list: Product[]) =>
  [...list].sort((a, b) => (a.display_order ?? 999999) - (b.display_order ?? 999999));

const sortProducts = (list: Product[], key: SortKey) => {
  if (key === "manual") return list; // already in site order (see sortBySiteOrder)
  const sorted = [...list];
  if (key === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
  if (key === "price") sorted.sort((a, b) => numericPrice(a.price) - numericPrice(b.price));
  if (key === "status") sorted.sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]);
  if (key === "created_at") sorted.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  return sorted;
};

// Fashion Finds are affiliate-linked retail picks (Temu etc.) — Why I
// Picked It, a rating, and an affiliate link make sense there and nowhere
// else. Presets and Design Bundles are both original digital downloads
// delivered the same way (a Drive file behind the payment-verification
// flow), so they share one field set instead — What's Included,
// Installation, Compatible With, a Drive File Id, none of which a Temu
// find has any use for.
const isDigitalProduct = (type: Product["type"]) => type !== "fashion_find";

const EMPTY_FORM = {
  type: "fashion_find" as Product["type"],
  name: "",
  price: "",
  image_url: "",
  description: "",
  tags: "",
  status: "Live" as Product["status"],
  featured: false,
  source: "",
  category: "",
  why_picked: "",
  rating: "",
  affiliate_link: "",
  direct_product_link: "",
  collection: "",
  thumbnail: "",
  banner: "",
  whats_included: "",
  installation: "",
  compatible_with: "",
  display_order: "",
  drive_file_id: "",
  purchase_link: "",
};

// Every Fashion Find points at one shared Temu storefront on purpose —
// Temu's per-product affiliate flow forces a gift/invite funnel — so the
// real per-product link lives in direct_product_link instead.
const TEMU_STOREFRONT = "https://temu.to/k/enxcis8g6rg";

type FormState = typeof EMPTY_FORM;

const defaultsFor = (type: Product["type"]): FormState =>
  type === "fashion_find"
    ? { ...EMPTY_FORM, type, source: "Temu", affiliate_link: TEMU_STOREFRONT }
    : { ...EMPTY_FORM, type };

const itemToForm = (item: QuickAddItem): FormState => {
  const base = defaultsFor("fashion_find");
  const status = STATUSES.find((s) => s === item.status) ?? base.status;
  return {
    ...base,
    name: item.name,
    price: item.price ?? "",
    category: item.category ?? "",
    rating: item.rating ?? "",
    tags: item.tags ?? "",
    description: item.description ?? "",
    why_picked: item.why_picked ?? "",
    image_url: item.image_url ?? "",
    direct_product_link: item.direct_product_link ?? "",
    source: item.source || base.source,
    affiliate_link: item.affiliate_link || base.affiliate_link,
    status,
  };
};

// Only the fields that apply to this type — no point writing
// "why_picked": "" onto a preset row.
const buildPayload = (f: FormState) => {
  const shared = {
    type: f.type,
    name: f.name,
    price: f.price,
    description: f.description,
    tags: f.tags,
    status: f.status,
    featured: f.featured,
  };
  return isDigitalProduct(f.type)
    ? {
        ...shared,
        image_url: f.thumbnail, // keep the site's generic image_url in sync
        collection: f.collection,
        thumbnail: f.thumbnail,
        banner: f.banner,
        whats_included: f.whats_included,
        installation: f.installation,
        compatible_with: f.compatible_with,
        display_order: f.display_order ? Number(f.display_order) : null,
        drive_file_id: f.drive_file_id,
        purchase_link: f.purchase_link || null,
      }
    : {
        ...shared,
        image_url: f.image_url,
        source: f.source,
        category: f.category,
        why_picked: f.why_picked,
        rating: f.rating ? Number(f.rating) : null,
        affiliate_link: f.affiliate_link,
        direct_product_link: f.direct_product_link,
      };
};

// Internal-only tool — gated by a shared secret (same pattern as the
// KEEMVERSE Sheets bridge), not a full auth system. Fine for a single
// primary user; revisit if this ever needs more than one editor.
export default function AdminProductsPage() {
  const [secret, setSecret] = useState(
    () => sessionStorage.getItem("kv_admin_secret") || ""
  );
  const [secretInput, setSecretInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [typeFilter, setTypeFilter] = useState<Product["type"]>("fashion_find");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => defaultsFor("fashion_find"));
  const [quickText, setQuickText] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkMsg, setBulkMsg] = useState("");
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("manual");
  const [orderDirty, setOrderDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const quickItems = useMemo(() => parseQuickAdd(quickText), [quickText]);
  const categoryOptions = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[],
    [products]
  );

  const headers = () => ({
    "Content-Type": "application/json",
    "x-admin-secret": secret,
  });

  // Takes the secret explicitly rather than reading the `secret` state
  // variable — called right after setSecret() during unlock, before that
  // state update has actually landed, so reading `secret` here would send
  // whatever it was *before* this attempt (empty, on the very first try).
  const load = async (type: Product["type"], secretOverride?: string) => {
    const activeSecret = secretOverride ?? secret;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/products?type=${type}&all=1`, {
        headers: { "x-admin-secret": activeSecret },
      });
      if (res.status === 401) {
        setUnlocked(false);
        sessionStorage.removeItem("kv_admin_secret");
        setError("That secret was rejected — try again.");
        return;
      }
      if (!res.ok) throw new Error(await res.text());
      setProducts(sortBySiteOrder(await res.json()));
      setUnlocked(true);
    } catch (e: any) {
      setError(e.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (secret) load(typeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

  const tryUnlock = () => {
    sessionStorage.setItem("kv_admin_secret", secretInput);
    setSecret(secretInput);
    load(typeFilter, secretInput);
  };

  const resetForm = (type: Product["type"] = typeFilter) => {
    setForm(defaultsFor(type));
    setEditingId(null);
    setQuickText("");
    setBulkMsg("");
  };

  // One pasted item fills the form so image/link can be checked before
  // saving; several items are created straight away, one at a time (each
  // is its own commit to data/products.json, so they can't race).
  const fillFromQuick = () => {
    if (quickItems.length !== 1) return;
    setForm(itemToForm(quickItems[0]));
    setQuickText("");
    setBulkMsg("");
  };

  const addAllQuick = async () => {
    setBulkBusy(true);
    setError("");
    let added = 0;
    try {
      for (const item of quickItems) {
        setBulkMsg(`Adding ${added + 1} of ${quickItems.length}…`);
        const res = await fetch("/api/products", {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(buildPayload(itemToForm(item))),
        });
        if (!res.ok) throw new Error(await res.text());
        added++;
      }
      resetForm();
      setFormOpen(false);
      load(typeFilter);
    } catch (e: any) {
      setBulkMsg("");
      setError(`Added ${added} of ${quickItems.length} — stopped at "${quickItems[added]?.name}": ${e.message || "failed"}`);
      load(typeFilter);
    } finally {
      setBulkBusy(false);
    }
  };

  const openNew = () => {
    resetForm();
    setFormOpen(true);
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setFormOpen(true);
    setForm({
      type: p.type,
      name: p.name || "",
      price: p.price || "",
      image_url: p.image_url || "",
      description: p.description || "",
      tags: p.tags || "",
      status: p.status,
      featured: p.featured,
      source: p.source || "",
      category: p.category || "",
      why_picked: p.why_picked || "",
      rating: p.rating?.toString() || "",
      affiliate_link: p.affiliate_link || "",
      direct_product_link: p.direct_product_link || "",
      collection: p.collection || "",
      thumbnail: p.thumbnail || "",
      banner: p.banner || "",
      whats_included: p.whats_included || "",
      installation: p.installation || "",
      compatible_with: p.compatible_with || "",
      display_order: p.display_order?.toString() || "",
      drive_file_id: p.drive_file_id || "",
      purchase_link: p.purchase_link || "",
    });
  };

  const save = async () => {
    setError("");
    const payload = buildPayload(form);

    try {
      const res = await fetch(
        editingId ? `/api/products?id=${editingId}` : "/api/products",
        {
          method: editingId ? "PATCH" : "POST",
          headers: headers(),
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      resetForm();
      setFormOpen(false);
      load(typeFilter);
    } catch (e: any) {
      setError(e.message || "Save failed");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this row?")) return;
    await fetch(`/api/products?id=${id}`, {
      method: "DELETE",
      headers: headers(),
    });
    load(typeFilter);
  };

  // Up/Down buttons rather than drag-and-drop — HTML5 drag is mouse-only
  // and simply never fires on touch, so this is what actually works on
  // mobile as well as desktop. Reordering only applies to the "manual"
  // view — moving rows while sorted by name/price would silently fight
  // whatever that sort just did.
  const moveProduct = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= products.length) return;
    setProducts((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setOrderDirty(true);
  };

  const persistOrder = async (list: Product[]) => {
    setSavingOrder(true);
    setError("");
    try {
      const res = await fetch(`/api/products?reorder=1`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ ids: list.map((p) => p.id) }),
      });
      if (!res.ok) throw new Error(await res.text());
      setOrderDirty(false);
      load(typeFilter);
    } catch (e: any) {
      setError(e.message || "Failed to save order");
    } finally {
      setSavingOrder(false);
    }
  };

  const saveOrder = () => persistOrder(products);

  // The promo shortcut: whatever you're pushing this week goes to position
  // 1 in one click and saves immediately — no arrow-by-arrow shuffling.
  const moveToTop = (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const next = [target, ...products.filter((p) => p.id !== id)];
    setProducts(next);
    persistOrder(next);
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-5">
        <div className="w-full max-w-sm space-y-4">
          <h1 className="font-serif text-2xl">Admin</h1>
          <Input
            type="password"
            placeholder="Admin secret"
            value={secretInput}
            onChange={(e) => setSecretInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && tryUnlock()}
          />
          <Button className="w-full" onClick={tryUnlock}>
            Unlock
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </div>
    );
  }

  const digital = isDigitalProduct(form.type);

  return (
    <div className="min-h-screen bg-background text-foreground px-5 md:px-8 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <AdminNav />
        <h1 className="font-serif text-2xl">Product Catalog</h1>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTypeFilter(t);
                  resetForm(t);
                  setSortKey("manual");
                  setOrderDirty(false);
                }}
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.15em] border ${
                  typeFilter === t ? "bg-foreground text-background" : "border-input"
                }`}
              >
                {t.replace("_", " ")}
              </button>
            ))}
          </div>

          <Button onClick={openNew}>+ Add new item</Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Dialog
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit item" : "New item"} — {form.type.replace("_", " ")}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
          {!editingId && !digital && (
            <div className="rounded-md border border-dashed border-input p-3 space-y-2">
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                Quick add — paste a block
              </p>
              <textarea
                className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm font-mono"
                placeholder={"name: …\nprice: ₦…\ncategory: …\ntags: a, b, c\ndescription: …\nwhy: …\nimage: https://…\nlink: https://…\n---   (separate several items)"}
                rows={4}
                value={quickText}
                onChange={(e) => setQuickText(e.target.value)}
              />
              {quickItems.length > 0 && (
                <ul className="space-y-0.5 text-xs text-muted-foreground">
                  {quickItems.map((q, i) => (
                    <li key={i}>
                      {q.name} — {q.price || "no price"}
                      {!q.image_url && " · no image URL"}
                      {!q.direct_product_link && " · no direct link"}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex items-center gap-2">
                {quickItems.length === 1 && (
                  <Button size="sm" type="button" onClick={fillFromQuick}>
                    Fill form
                  </Button>
                )}
                {quickItems.length > 1 && (
                  <Button size="sm" type="button" onClick={addAllQuick} disabled={bulkBusy}>
                    {bulkBusy ? "Adding…" : `Add ${quickItems.length} items`}
                  </Button>
                )}
                {bulkMsg && <span className="text-xs text-muted-foreground">{bulkMsg}</span>}
              </div>
            </div>
          )}

          <datalist id="category-options">
            {categoryOptions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>

          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Price (e.g. ₦4,586)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />

            {digital ? (
              <>
                <Input placeholder="Collection (e.g. Editorial)" value={form.collection} onChange={(e) => setForm({ ...form, collection: e.target.value })} />
                <Input placeholder="Display order (1, 2, 3…)" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} />
                <Input placeholder="Thumbnail image URL" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} className="col-span-2" />
                <Input placeholder="Banner image URL" value={form.banner} onChange={(e) => setForm({ ...form, banner: e.target.value })} className="col-span-2" />
                <Input placeholder="Drive File Id (delivered file)" value={form.drive_file_id} onChange={(e) => setForm({ ...form, drive_file_id: e.target.value })} className="col-span-2" />
                <Input placeholder="Purchase link (optional, external)" value={form.purchase_link} onChange={(e) => setForm({ ...form, purchase_link: e.target.value })} className="col-span-2" />
              </>
            ) : (
              <>
                <Input placeholder="Source (e.g. Temu)" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
                <Input placeholder="Category" list="category-options" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                <Input placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="col-span-2" />
                <Input placeholder="Affiliate/checkout link" value={form.affiliate_link} onChange={(e) => setForm({ ...form, affiliate_link: e.target.value })} className="col-span-2" />
                <Input placeholder="Direct product link" value={form.direct_product_link} onChange={(e) => setForm({ ...form, direct_product_link: e.target.value })} className="col-span-2" />
                <Input placeholder="Rating" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
              </>
            )}

            <Input placeholder="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="col-span-2" />
            <select
              className="h-9 rounded-md border border-input bg-input-background px-3 text-sm col-span-2"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Product["status"] })}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <textarea
            className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm"
            placeholder="Description"
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {digital ? (
            <>
              <textarea
                className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm"
                placeholder="What's included"
                rows={2}
                value={form.whats_included}
                onChange={(e) => setForm({ ...form, whats_included: e.target.value })}
              />
              <textarea
                className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm"
                placeholder="Installation instructions"
                rows={2}
                value={form.installation}
                onChange={(e) => setForm({ ...form, installation: e.target.value })}
              />
              <Input placeholder="Compatible with" value={form.compatible_with} onChange={(e) => setForm({ ...form, compatible_with: e.target.value })} />
            </>
          ) : (
            <textarea
              className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm"
              placeholder="Why I picked it"
              rows={2}
              value={form.why_picked}
              onChange={(e) => setForm({ ...form, why_picked: e.target.value })}
            />
          )}

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            Featured
          </label>

          <div className="flex gap-2">
            <Button onClick={save}>{editingId ? "Save changes" : "Add product"}</Button>
            <Button
              variant="outline"
              onClick={() => {
                setFormOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
          </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* List controls */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <select
            className="h-9 rounded-md border border-input bg-input-background px-3 text-sm"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
              <option key={k} value={k}>{SORT_LABELS[k]}</option>
            ))}
          </select>

          {sortKey === "manual" && orderDirty && (
            <Button size="sm" onClick={saveOrder} disabled={savingOrder}>
              {savingOrder ? "Saving…" : "Save order"}
            </Button>
          )}
        </div>

        {typeFilter === "fashion_find" && sortKey === "manual" && (
          <p className="text-xs text-muted-foreground">
            Position 1 is the first card in All Finds. Tick "Featured" on an item to also show it in the
            Featured row at the very top of the page.
          </p>
        )}

        {/* List */}
        <div className="space-y-2">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-muted-foreground">No {typeFilter.replace("_", " ")} rows yet.</p>
          ) : (
            sortProducts(products, sortKey).map((p, i) => (
              <div
                key={p.id}
                className="flex flex-col gap-3 border border-input rounded-md px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {sortKey === "manual" && (
                    <span className="w-5 shrink-0 text-right text-xs text-muted-foreground">{i + 1}</span>
                  )}
                  {sortKey === "manual" && (
                    <div className="flex flex-col shrink-0">
                      <button
                        onClick={() => moveProduct(i, -1)}
                        disabled={i === 0}
                        aria-label="Move up"
                        className="text-muted-foreground disabled:opacity-30 leading-none px-1"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveProduct(i, 1)}
                        disabled={i === products.length - 1}
                        aria-label="Move down"
                        className="text-muted-foreground disabled:opacity-30 leading-none px-1"
                      >
                        ▼
                      </button>
                    </div>
                  )}
                  {(p.image_url || p.thumbnail) && (
                    <img src={p.image_url || p.thumbnail || ""} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.status} · {p.price} {p.featured && "· Featured"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 self-end sm:self-auto">
                  {sortKey === "manual" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveToTop(p.id)}
                      disabled={i === 0 || savingOrder}
                    >
                      ↑ Top
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => startEdit(p)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(p.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
