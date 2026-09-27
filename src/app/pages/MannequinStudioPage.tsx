import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import manifest from "../../assets/mannequin/garments/manifest.json";

// Raw SVG source for the body + every garment, keyed by their path relative
// to this glob's root. Vite resolves these at build time — dropping a new
// garment SVG in this folder and adding it to manifest.json is enough for
// it to show up here, no code change needed.
const garmentSvgs = import.meta.glob("../../assets/mannequin/garments/*.svg", {
  as: "raw",
  eager: true,
}) as Record<string, string>;
const bodySvg = import.meta.glob("../../assets/mannequin/*.svg", {
  as: "raw",
  eager: true,
}) as Record<string, string>;

// Strips the outer <svg>/<defs> wrapper down to just the inner <path>
// elements, so multiple SVGs' content can be layered inside one shared
// <svg> root without nesting (nested <svg> would need its own viewBox/
// coordinate space, which is exactly what we're manually aligning here).
function innerPaths(svgSource: string): string {
  const match = svgSource.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  return match ? match[1] : svgSource;
}

function resolveRaw(map: Record<string, string>, filename: string): string {
  const key = Object.keys(map).find((k) => k.endsWith("/" + filename));
  return key ? map[key] : "";
}

type GarmentSlot = string;

export default function MannequinStudioPage() {
  const [secret, setSecret] = useState(
    () => sessionStorage.getItem("kv_admin_secret") || ""
  );
  const [secretInput, setSecretInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Record<GarmentSlot, string | null>>({});

  const checkSecret = async (value: string) => {
    setChecking(true);
    setError("");
    try {
      const res = await fetch("/api/products?type=fashion_find&all=1", {
        headers: { "x-admin-secret": value },
      });
      if (res.status === 401) {
        setError("That secret was rejected — try again.");
        setUnlocked(false);
        return;
      }
      sessionStorage.setItem("kv_admin_secret", value);
      setSecret(value);
      setUnlocked(true);
    } catch (e: any) {
      setError(e.message || "Could not verify secret");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (secret) checkSecret(secret);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bodyInner = useMemo(() => innerPaths(resolveRaw(bodySvg, manifest.body.file.replace("../", ""))), []);

  const garmentEntries = Object.entries(manifest.garments as Record<
    string,
    { file: string; slot: string; transform: { scale: number; tx: number; ty: number } }
  >);

  const slots = useMemo(() => {
    const s = new Set<string>();
    garmentEntries.forEach(([, g]) => s.add(g.slot));
    return Array.from(s);
  }, []);

  const toggleGarment = (slot: string, id: string) => {
    setSelected((prev) => ({
      ...prev,
      [slot]: prev[slot] === id ? null : id,
    }));
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-5">
        <div className="w-full max-w-sm space-y-4">
          <h1 className="font-serif text-2xl">Mannequin Studio</h1>
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
    <div className="min-h-screen bg-background text-foreground px-5 md:px-8 py-10">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
        <div className="space-y-6">
          <h1 className="font-serif text-2xl">Mannequin Studio</h1>
          {slots.map((slot) => (
            <div key={slot} className="space-y-2">
              <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                {slot}
              </h2>
              <div className="flex flex-wrap gap-2">
                {garmentEntries
                  .filter(([, g]) => g.slot === slot)
                  .map(([id]) => (
                    <button
                      key={id}
                      onClick={() => toggleGarment(slot, id)}
                      className={`rounded-full px-3 py-1.5 text-xs border ${
                        selected[slot] === id
                          ? "bg-foreground text-background"
                          : "border-input"
                      }`}
                    >
                      {id.replace(/^(top|bottom|footwear|headwear)-/, "").replace(/-/g, " ")}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center bg-input-background rounded-2xl p-6">
          <svg
            viewBox={`0 0 ${manifest.body.canvasWidth} ${manifest.body.canvasHeight}`}
            className="w-full max-w-sm"
          >
            <g dangerouslySetInnerHTML={{ __html: bodyInner }} />
            {garmentEntries.map(([id, g]) => {
              if (selected[g.slot] !== id) return null;
              const raw = resolveRaw(garmentSvgs, g.file);
              return (
                <g
                  key={id}
                  transform={`translate(${g.transform.tx},${g.transform.ty}) scale(${g.transform.scale})`}
                  dangerouslySetInnerHTML={{ __html: innerPaths(raw) }}
                />
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
