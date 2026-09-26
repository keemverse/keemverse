import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

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
};

const TYPES: Product["type"][] = ["fashion_find", "preset", "design_bundle"];
const STATUSES: Product["status"][] = ["Live", "Sold Out", "Hidden"];

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
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

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
      setProducts(await res.json());
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
    setForm({ ...EMPTY_FORM, type });
    setEditingId(null);
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
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
    // Only send the fields that apply to this type — no point writing
    // "why_picked": "" onto a preset row.
    const digital = isDigitalProduct(form.type);
    const shared = {
      type: form.type,
      name: form.name,
      price: form.price,
      description: form.description,
      tags: form.tags,
      status: form.status,
      featured: form.featured,
    };
    const payload = digital
      ? {
          ...shared,
          image_url: form.thumbnail, // keep the site's generic image_url in sync
          collection: form.collection,
          thumbnail: form.thumbnail,
          banner: form.banner,
          whats_included: form.whats_included,
          installation: form.installation,
          compatible_with: form.compatible_with,
          display_order: form.display_order ? Number(form.display_order) : null,
          drive_file_id: form.drive_file_id,
          purchase_link: form.purchase_link || null,
        }
      : {
          ...shared,
          image_url: form.image_url,
          source: form.source,
          category: form.category,
          why_picked: form.why_picked,
          rating: form.rating ? Number(form.rating) : null,
          affiliate_link: form.affiliate_link,
          direct_product_link: form.direct_product_link,
        };

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
        <h1 className="font-serif text-2xl">Product Catalog</h1>

        <div className="flex gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTypeFilter(t);
                resetForm(t);
              }}
              className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.15em] border ${
                typeFilter === t ? "bg-foreground text-background" : "border-input"
              }`}
            >
              {t.replace("_", " ")}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Form */}
        <div className="border border-input rounded-lg p-5 space-y-3">
          <h2 className="text-sm uppercase tracking-[0.15em] text-muted-foreground">
            {editingId ? "Edit item" : "New item"} — {form.type.replace("_", " ")}
          </h2>

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
                <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
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
            {editingId && (
              <Button variant="outline" onClick={() => resetForm()}>
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="space-y-2">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-muted-foreground">No {typeFilter.replace("_", " ")} rows yet.</p>
          ) : (
            products.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between border border-input rounded-md px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
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
                <div className="flex gap-2 shrink-0">
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
