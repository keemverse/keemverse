import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAdminAuth } from "../lib/useAdminAuth";
import { recolorSvg } from "../lib/recolorSvg";
import manifest from "../../assets/mannequin/garments/manifest.json";

// Raw SVG source for the body + every path-based garment, keyed by their
// path relative to this glob's root. Vite resolves these at build time —
// dropping a new garment SVG in this folder and adding it to manifest.json
// is enough for it to show up here, no code change needed.
const garmentSvgs = import.meta.glob("../../assets/mannequin/garments/*.svg", {
  as: "raw",
  eager: true,
}) as Record<string, string>;
const bodySvg = import.meta.glob("../../assets/mannequin/*.svg", {
  as: "raw",
  eager: true,
}) as Record<string, string>;

// Raster garments (photorealistic renders — see manifest.json's
// _rasterComment) are plain image assets, resolved to their built URL
// rather than raw source.
const garmentRasters = import.meta.glob("../../assets/mannequin/garments-raster/*.webp", {
  as: "url",
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

// The vectorizer's first path in every export is a full-canvas background
// fill (with the figure's own outline cut out as a hole) — needed for a
// standalone preview, but it paints an opaque white card over whatever
// backdrop the Studio page is showing. Strip it so the body is transparent
// everywhere except the actual figure.
function stripBackgroundPath(inner: string): string {
  return inner.replace(/<path[^>]*\/>/, "");
}

function resolveRaw(map: Record<string, string>, filename: string): string {
  const key = Object.keys(map).find((k) => k.endsWith("/" + filename));
  return key ? map[key] : "";
}

type GarmentSlot = string;

type SvgGarment = {
  file: string;
  slot: string;
  baseColor: string;
  transform: { scale: number; tx: number; ty: number };
};

type RasterGarment = {
  slot: string;
  canvasWidth: number;
  canvasHeight: number;
  rect: { x: number; y: number; width: number; height: number };
  defaultColor: string;
  colors: Record<string, string>;
};

const BACKGROUNDS = [
  { id: "none", label: "None", src: null },
  { id: "studio-1", label: "Studio 1", src: "/mannequin-backgrounds/studio-bg-1.webp" },
  { id: "studio-2", label: "Studio 2", src: "/mannequin-backgrounds/studio-bg-2.webp" },
];

const PRESETS_STORAGE_KEY = "keemverse-mannequin-presets";

type OutfitPreset = {
  name: string;
  selected: Record<string, string | null>;
  colors: Record<string, string>;
  rasterColors: Record<string, string>;
  background: string;
};

function loadPresets(): OutfitPreset[] {
  try {
    const raw = localStorage.getItem(PRESETS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePresetsToStorage(presets: OutfitPreset[]) {
  try {
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
  } catch {
    // localStorage unavailable (private window, quota, etc.) — saving silently no-ops
  }
}

// Loads an <img> from a URL and resolves once it's ready to draw to canvas.
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default function MannequinStudioPage() {
  const { unlocked, checking, error, checkSecret } = useAdminAuth();
  const [secretInput, setSecretInput] = useState("");
  // selected[slot] holds a garment id, which may belong to either the SVG
  // set (manifest.garments) or the raster set (manifest.rasterGarments) —
  // ids are unique across both, so a single map works for either kind.
  const [selected, setSelected] = useState<Record<GarmentSlot, string | null>>({});
  const [colors, setColors] = useState<Record<string, string>>({});
  const [rasterColors, setRasterColors] = useState<Record<string, string>>({});
  const [background, setBackground] = useState(BACKGROUNDS[1].id);
  const [presets, setPresets] = useState<OutfitPreset[]>([]);
  const [presetName, setPresetName] = useState("");
  const [exporting, setExporting] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setPresets(loadPresets());
  }, []);

  const saveCurrentAsPreset = () => {
    const name = presetName.trim();
    if (!name) return;
    const next = [
      ...presets.filter((p) => p.name !== name),
      { name, selected, colors, rasterColors, background },
    ];
    setPresets(next);
    savePresetsToStorage(next);
    setPresetName("");
  };

  const loadPreset = (preset: OutfitPreset) => {
    setSelected(preset.selected);
    setColors(preset.colors);
    setRasterColors(preset.rasterColors);
    setBackground(preset.background);
  };

  const deletePreset = (name: string) => {
    const next = presets.filter((p) => p.name !== name);
    setPresets(next);
    savePresetsToStorage(next);
  };

  const downloadPng = async () => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    setExporting(true);
    try {
      const EXPORT_W = manifest.body.canvasWidth * 2;
      const EXPORT_H = manifest.body.canvasHeight * 2;

      const clone = svgEl.cloneNode(true) as SVGSVGElement;
      clone.setAttribute("width", String(EXPORT_W));
      clone.setAttribute("height", String(EXPORT_H));
      clone.removeAttribute("style"); // drop the on-screen drop-shadow filter for the export
      const svgString = new XMLSerializer().serializeToString(clone);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);

      const canvas = document.createElement("canvas");
      canvas.width = EXPORT_W;
      canvas.height = EXPORT_H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const bg = BACKGROUNDS.find((b) => b.id === background);
      if (bg?.src) {
        const bgImg = await loadImage(bg.src);
        const scale = Math.max(EXPORT_W / bgImg.width, EXPORT_H / bgImg.height);
        const drawW = bgImg.width * scale;
        const drawH = bgImg.height * scale;
        ctx.drawImage(bgImg, (EXPORT_W - drawW) / 2, (EXPORT_H - drawH) / 2, drawW, drawH);
      } else {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--input-background") || "#e9e5dd";
        ctx.fillRect(0, 0, EXPORT_W, EXPORT_H);
      }

      const svgImg = await loadImage(svgUrl);
      ctx.drawImage(svgImg, 0, 0, EXPORT_W, EXPORT_H);
      URL.revokeObjectURL(svgUrl);

      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `mannequin-${Date.now()}.png`;
      a.click();
    } finally {
      setExporting(false);
    }
  };

  const bodyInner = useMemo(
    () => stripBackgroundPath(innerPaths(resolveRaw(bodySvg, manifest.body.file.replace("../", "")))),
    []
  );

  const garmentEntries = Object.entries(manifest.garments as Record<string, SvgGarment>);
  const rasterEntries = Object.entries((manifest as any).rasterGarments as Record<string, RasterGarment>);

  const slots = useMemo(() => {
    const s = new Set<string>();
    garmentEntries.forEach(([, g]) => s.add(g.slot));
    rasterEntries.forEach(([, g]) => s.add(g.slot));
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
          {slots.map((slot) => {
            const activeId = selected[slot];
            const activeSvgGarment = activeId
              ? (manifest.garments as Record<string, SvgGarment>)[activeId]
              : null;
            const activeRasterGarment = activeId
              ? ((manifest as any).rasterGarments as Record<string, RasterGarment>)[activeId]
              : null;
            return (
              <div key={slot} className="space-y-2">
                <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  {slot}
                </h2>
                <div className="flex flex-wrap items-center gap-2">
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
                  {rasterEntries
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
                  {activeSvgGarment && (
                    <input
                      type="color"
                      title="Recolor"
                      value={colors[slot] || activeSvgGarment.baseColor}
                      onChange={(e) =>
                        setColors((prev) => ({ ...prev, [slot]: e.target.value }))
                      }
                      className="h-8 w-8 rounded-full border border-input p-0 cursor-pointer bg-transparent"
                    />
                  )}
                </div>
                {activeRasterGarment && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {Object.keys(activeRasterGarment.colors).map((colorKey) => (
                      <button
                        key={colorKey}
                        title={colorKey}
                        onClick={() =>
                          setRasterColors((prev) => ({ ...prev, [activeId as string]: colorKey }))
                        }
                        className={`h-6 w-6 rounded-full border-2 ${
                          (rasterColors[activeId as string] || activeRasterGarment.defaultColor) === colorKey
                            ? "border-foreground"
                            : "border-input"
                        }`}
                        style={{ backgroundColor: RASTER_SWATCH_COLORS[colorKey] || "#999" }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="space-y-2">
            <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Background
            </h2>
            <div className="flex flex-wrap gap-2">
              {BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setBackground(bg.id)}
                  className={`rounded-full px-3 py-1.5 text-xs border ${
                    background === bg.id
                      ? "bg-foreground text-background"
                      : "border-input"
                  }`}
                >
                  {bg.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Save look
            </h2>
            <div className="flex gap-2">
              <Input
                placeholder="Name this look"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveCurrentAsPreset()}
                className="h-9 text-sm"
              />
              <Button className="shrink-0" onClick={saveCurrentAsPreset} disabled={!presetName.trim()}>
                Save
              </Button>
            </div>
            {presets.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {presets.map((p) => (
                  <div key={p.name} className="flex items-center gap-2">
                    <button
                      onClick={() => loadPreset(p)}
                      className="flex-1 text-left rounded-lg border border-input px-3 py-1.5 text-xs hover:bg-input-background transition-colors"
                    >
                      {p.name}
                    </button>
                    <button
                      onClick={() => deletePreset(p.name)}
                      title="Delete"
                      className="text-xs text-muted-foreground hover:text-destructive px-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button className="w-full" onClick={downloadPng} disabled={exporting}>
            {exporting ? "Preparing…" : "Download PNG"}
          </Button>
        </div>

        <div
          className="flex justify-center rounded-2xl p-6 bg-cover bg-center"
          style={{
            backgroundColor: "var(--input-background)",
            backgroundImage: (() => {
              const bg = BACKGROUNDS.find((b) => b.id === background);
              return bg?.src ? `url(${bg.src})` : undefined;
            })(),
          }}
        >
          <svg
            ref={svgRef}
            viewBox={`0 0 ${manifest.body.canvasWidth} ${manifest.body.canvasHeight}`}
            className="w-full max-w-sm"
            style={{ filter: "drop-shadow(0 18px 14px rgba(0,0,0,0.35))" }}
          >
            <g dangerouslySetInnerHTML={{ __html: bodyInner }} />
            {garmentEntries.map(([id, g]) => {
              if (selected[g.slot] !== id) return null;
              const raw = resolveRaw(garmentSvgs, g.file);
              const paths = innerPaths(raw);
              const chosenColor = colors[g.slot];
              const recolored =
                chosenColor && chosenColor.toLowerCase() !== g.baseColor.toLowerCase()
                  ? recolorSvg(paths, chosenColor)
                  : paths;
              return (
                <g
                  key={id}
                  transform={`translate(${g.transform.tx},${g.transform.ty}) scale(${g.transform.scale})`}
                  dangerouslySetInnerHTML={{ __html: recolored }}
                />
              );
            })}
            {rasterEntries.map(([id, g]) => {
              if (selected[g.slot] !== id) return null;
              const colorKey = rasterColors[id] || g.defaultColor;
              const filename = g.colors[colorKey];
              const href = resolveRaw(garmentRasters, filename);
              return (
                <image
                  key={id}
                  href={href}
                  x={g.rect.x}
                  y={g.rect.y}
                  width={g.rect.width}
                  height={g.rect.height}
                />
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

const RASTER_SWATCH_COLORS: Record<string, string> = {
  navy: "#1f3a5f",
  white: "#f2f2f2",
  black: "#161616",
  grey: "#8a8a8a",
  red: "#8f1f1f",
};
