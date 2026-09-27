import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAdminAuth } from "../lib/useAdminAuth";
import {
  deleteLibraryPiece,
  deleteProject,
  listLibraryPieces,
  listProjects,
  saveLibraryPiece,
  saveProject,
  PIECE_CATEGORIES,
  type Layer,
  type LayerProject,
  type LibraryPiece,
  type PieceCategory,
} from "../lib/layerProjectsDb";

// The editing stage is drawn at half the final export resolution so drag/
// resize math stays in comfortable on-screen numbers; EXPORT_SCALE brings
// it back up when rendering the downloaded PNG.
const STAGE_WIDTH = 667;
const STAGE_HEIGHT = 1000;
const EXPORT_SCALE = 2;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Backgrounds are a single fixed picker, not draggable layers — pick one
// and it always sits behind everything on the canvas.
const BACKGROUNDS = [
  { id: "none", label: "None", src: null as string | null },
  { id: "studio-1", label: "Studio 1", src: "/mannequin-backgrounds/studio-bg-1.webp" },
  { id: "studio-2", label: "Studio 2", src: "/mannequin-backgrounds/studio-bg-2.webp" },
];

// Starter pieces from the earlier mannequin build — still on disk, just not
// auto-loaded into every project. One click adds them as an ordinary layer
// that can be dragged/resized/deleted like anything else.
const STARTER_PIECES = [
  { id: "body", name: "Body model", src: "/mannequin-library/body.webp" },
];

// Ghost-mannequin garments shipped with the site itself (bundled assets, not
// per-browser IndexedDB) — always available on every device without needing
// to be manually imported and saved first. Shown alongside the user's own
// saved pieces in the same category sections.
const wardrobeImages = import.meta.glob("../../assets/wardrobe/*.webp", {
  as: "url",
  eager: true,
}) as Record<string, string>;

function wardrobeSrc(filename: string): string {
  const key = Object.keys(wardrobeImages).find((k) => k.endsWith("/" + filename));
  return key ? wardrobeImages[key] : "";
}

type WardrobeVariant = { label: string; file: string };
type WardrobeGroup = { category: PieceCategory; groupName: string; variants: WardrobeVariant[] };

const WARDROBE: WardrobeGroup[] = [
  {
    category: "top",
    groupName: "T-shirt",
    variants: [
      { label: "White", file: "top-tshirt-white.webp" },
      { label: "Black", file: "top-tshirt-black.webp" },
      { label: "Grey", file: "top-tshirt-grey.webp" },
      { label: "Blue", file: "top-tshirt-navy.webp" },
      { label: "Red", file: "top-tshirt-red.webp" },
      { label: "Light Blue", file: "top-tshirt-lightblue.webp" },
      { label: "Beige", file: "top-tshirt-beige.webp" },
      { label: "Green", file: "top-tshirt-green.webp" },
    ],
  },
];

type ResizeAxis = "both" | "x" | "y";

type DragState =
  | { kind: "move"; id: string; startPointerX: number; startPointerY: number; startX: number; startY: number }
  | {
      kind: "resize";
      axis: ResizeAxis;
      id: string;
      startPointerX: number;
      startPointerY: number;
      startWidth: number;
      startHeight: number;
      aspect: number;
    };

export default function LayerStudioPage() {
  const { unlocked, checking, error, checkSecret } = useAdminAuth();
  const [secretInput, setSecretInput] = useState("");
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [background, setBackground] = useState(BACKGROUNDS[0].id);
  const [projects, setProjects] = useState<LayerProject[]>([]);
  const [projectName, setProjectName] = useState("");
  const [libraryPieces, setLibraryPieces] = useState<LibraryPiece[]>([]);
  const [saveCategory, setSaveCategory] = useState<PieceCategory>("other");
  const [saveGroupName, setSaveGroupName] = useState("");
  const [saveVariantName, setSaveVariantName] = useState("");
  const [exporting, setExporting] = useState(false);
  const dragState = useRef<DragState | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (unlocked) {
      listProjects().then(setProjects);
      listLibraryPieces().then(setLibraryPieces);
    }
  }, [unlocked]);

  const addLayer = (src: string, name: string, width: number, height: number) => {
    const layer: Layer = {
      id: crypto.randomUUID(),
      name,
      src,
      x: (STAGE_WIDTH - width) / 2,
      y: (STAGE_HEIGHT - height) / 2,
      width,
      height,
    };
    setLayers((prev) => [...prev, layer]);
    setSelectedId(layer.id);
  };

  const handleImport = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      const src = await readFileAsDataUrl(file);
      const img = await loadImage(src);
      const maxDim = 260;
      const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
      addLayer(src, file.name, img.naturalWidth * scale, img.naturalHeight * scale);
    }
  };

  const addStarterPiece = async (piece: (typeof STARTER_PIECES)[number]) => {
    const img = await loadImage(piece.src);
    const targetHeight = STAGE_HEIGHT * 0.9;
    const scale = targetHeight / img.naturalHeight;
    addLayer(piece.src, piece.name, img.naturalWidth * scale, img.naturalHeight * scale);
  };

  const addWardrobeVariant = async (groupName: string, variant: WardrobeVariant) => {
    const src = wardrobeSrc(variant.file);
    const img = await loadImage(src);
    const targetHeight = STAGE_HEIGHT * 0.55;
    const scale = targetHeight / img.naturalHeight;
    addLayer(src, `${groupName} (${variant.label})`, img.naturalWidth * scale, img.naturalHeight * scale);
  };

  const saveSelectedToLibrary = async () => {
    const layer = layers.find((l) => l.id === selectedId);
    const groupName = saveGroupName.trim();
    const variantName = saveVariantName.trim() || "Default";
    if (!layer || !groupName) return;
    const piece: LibraryPiece = {
      id: `${saveCategory}:${groupName}:${variantName}`,
      category: saveCategory,
      groupName,
      variantName,
      src: layer.src,
      width: layer.width,
      height: layer.height,
      updatedAt: Date.now(),
    };
    await saveLibraryPiece(piece);
    setLibraryPieces(await listLibraryPieces());
    setSaveGroupName("");
    setSaveVariantName("");
  };

  const addLibraryPiece = (piece: LibraryPiece) => {
    addLayer(piece.src, `${piece.groupName} (${piece.variantName})`, piece.width, piece.height);
  };

  const removeLibraryPiece = async (id: string) => {
    await deleteLibraryPiece(id);
    setLibraryPieces(await listLibraryPieces());
  };

  const onPointerMove = useCallback((e: PointerEvent) => {
    const drag = dragState.current;
    if (!drag) return;
    if (drag.kind === "move") {
      const dx = e.clientX - drag.startPointerX;
      const dy = e.clientY - drag.startPointerY;
      setLayers((prev) =>
        prev.map((l) => (l.id === drag.id ? { ...l, x: drag.startX + dx, y: drag.startY + dy } : l))
      );
    } else {
      const dx = e.clientX - drag.startPointerX;
      const dy = e.clientY - drag.startPointerY;
      let newWidth = drag.startWidth;
      let newHeight = drag.startHeight;
      if (drag.axis === "both") {
        newWidth = Math.max(20, drag.startWidth + dx);
        newHeight = newWidth / drag.aspect;
      } else if (drag.axis === "x") {
        newWidth = Math.max(20, drag.startWidth + dx);
      } else {
        newHeight = Math.max(20, drag.startHeight + dy);
      }
      setLayers((prev) =>
        prev.map((l) => (l.id === drag.id ? { ...l, width: newWidth, height: newHeight } : l))
      );
    }
  }, []);

  const onPointerUp = useCallback(() => {
    dragState.current = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  }, [onPointerMove]);

  const startMove = (e: React.PointerEvent, layer: Layer) => {
    e.stopPropagation();
    setSelectedId(layer.id);
    dragState.current = {
      kind: "move",
      id: layer.id,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startX: layer.x,
      startY: layer.y,
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const startResize = (e: React.PointerEvent, layer: Layer, axis: ResizeAxis) => {
    e.stopPropagation();
    dragState.current = {
      kind: "resize",
      axis,
      id: layer.id,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startWidth: layer.width,
      startHeight: layer.height,
      aspect: layer.width / layer.height,
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const deleteLayer = (id: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
  };

  // index is the layer's position in the `layers` array (end of array = top
  // of the visual stack), so "move up" (toward the viewer) means moving
  // toward the end of the array.
  const moveLayer = (index: number, direction: "up" | "down") => {
    setLayers((prev) => {
      const next = [...prev];
      const targetIndex = direction === "up" ? index + 1 : index - 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const saveCurrentProject = async () => {
    const name = projectName.trim();
    if (!name) return;
    const project: LayerProject = { id: name, layers, updatedAt: Date.now() };
    await saveProject(project);
    setProjects(await listProjects());
    setProjectName("");
  };

  const loadProject = (project: LayerProject) => {
    setLayers(project.layers);
    setSelectedId(null);
  };

  const removeProject = async (id: string) => {
    await deleteProject(id);
    setProjects(await listProjects());
  };

  const downloadPng = async () => {
    setExporting(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = STAGE_WIDTH * EXPORT_SCALE;
      canvas.height = STAGE_HEIGHT * EXPORT_SCALE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const bg = BACKGROUNDS.find((b) => b.id === background);
      if (bg?.src) {
        const bgImg = await loadImage(bg.src);
        const scale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
        const drawW = bgImg.width * scale;
        const drawH = bgImg.height * scale;
        ctx.drawImage(bgImg, (canvas.width - drawW) / 2, (canvas.height - drawH) / 2, drawW, drawH);
      }

      for (const layer of layers) {
        const img = await loadImage(layer.src);
        ctx.drawImage(
          img,
          layer.x * EXPORT_SCALE,
          layer.y * EXPORT_SCALE,
          layer.width * EXPORT_SCALE,
          layer.height * EXPORT_SCALE
        );
      }
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `layer-studio-${Date.now()}.png`;
      a.click();
    } finally {
      setExporting(false);
    }
  };

  const groupedLibrary = useMemo(() => {
    return PIECE_CATEGORIES.map((cat) => {
      const inCategory = libraryPieces.filter(
        (p) => (p.category || "other") === cat.id
      );
      const groups = new Map<string, LibraryPiece[]>();
      for (const piece of inCategory) {
        const key = piece.groupName || piece.id;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(piece);
      }
      return { ...cat, groups: Array.from(groups.entries()) };
    }).filter((cat) => cat.groups.length > 0);
  }, [libraryPieces]);

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-5">
        <div className="w-full max-w-sm space-y-4">
          <h1 className="font-serif text-2xl">Layer Studio</h1>
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

  const activeBackground = BACKGROUNDS.find((b) => b.id === background);
  const selectedLayer = layers.find((l) => l.id === selectedId) || null;
  // Reverse for display so the topmost layer (end of the array) is listed first.
  const layersTopFirst = [...layers].map((l, i) => ({ layer: l, index: i })).reverse();

  return (
    <div className="min-h-screen bg-background text-foreground px-5 md:px-8 py-10">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
        <div className="space-y-6">
          <h1 className="font-serif text-2xl">Layer Studio</h1>

          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleImport(e.target.files)}
            />
            <Button className="w-full" onClick={() => fileInputRef.current?.click()}>
              Import image(s)
            </Button>
          </div>

          <div className="space-y-2">
            <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Background
            </h2>
            <div className="flex flex-wrap gap-2">
              {BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setBackground(bg.id)}
                  title={bg.label}
                  className={`h-14 w-14 rounded-lg border overflow-hidden bg-input-background flex items-center justify-center text-[10px] text-muted-foreground ${
                    background === bg.id ? "border-foreground border-2" : "border-input"
                  }`}
                >
                  {bg.src ? (
                    <img src={bg.src} alt={bg.label} className="w-full h-full object-cover" />
                  ) : (
                    "None"
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Starter pieces
            </h2>
            <div className="flex flex-wrap gap-2">
              {STARTER_PIECES.map((piece) => (
                <button
                  key={piece.id}
                  onClick={() => addStarterPiece(piece)}
                  title={piece.name}
                  className="h-14 w-14 rounded-lg border border-input overflow-hidden bg-input-background"
                >
                  <img src={piece.src} alt={piece.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {PIECE_CATEGORIES.map((cat) => {
            const wardrobeGroups = WARDROBE.filter((g) => g.category === cat.id);
            const savedCat = groupedLibrary.find((c) => c.id === cat.id);
            if (wardrobeGroups.length === 0 && !savedCat) return null;
            return (
              <div key={cat.id} className="space-y-2">
                <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  {cat.label}
                </h2>
                <div className="space-y-2">
                  {wardrobeGroups.map((group) => (
                    <div key={group.groupName}>
                      <p className="text-[11px] text-muted-foreground mb-1">{group.groupName}</p>
                      <div className="flex flex-wrap gap-2">
                        {group.variants.map((variant) => (
                          <button
                            key={variant.label}
                            onClick={() => addWardrobeVariant(group.groupName, variant)}
                            title={`${group.groupName} — ${variant.label}`}
                            className="h-12 w-12 rounded-lg border border-input overflow-hidden bg-input-background"
                          >
                            <img src={wardrobeSrc(variant.file)} alt={variant.label} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {savedCat && (
                  <div className="space-y-2">
                    {savedCat.groups.map(([groupName, variants]) => (
                      <div key={groupName}>
                        <p className="text-[11px] text-muted-foreground mb-1">{groupName}</p>
                        <div className="flex flex-wrap gap-2">
                          {variants.map((piece) => (
                            <div key={piece.id} className="relative group">
                              <button
                                onClick={() => addLibraryPiece(piece)}
                                title={`${piece.groupName} — ${piece.variantName}`}
                                className="h-12 w-12 rounded-lg border border-input overflow-hidden bg-input-background"
                              >
                                <img src={piece.src} alt={piece.variantName} className="w-full h-full object-cover" />
                              </button>
                              <button
                                onClick={() => removeLibraryPiece(piece.id)}
                                title="Remove from library"
                                className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-background border border-input text-[10px] leading-none flex items-center justify-center text-muted-foreground hover:text-destructive"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {selectedLayer && (
            <div className="space-y-2 rounded-lg border border-input p-3">
              <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                Save "{selectedLayer.name}" to library
              </h2>
              <select
                value={saveCategory}
                onChange={(e) => setSaveCategory(e.target.value as PieceCategory)}
                className="w-full h-9 text-sm rounded-md border border-input bg-background px-2"
              >
                {PIECE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <Input
                placeholder="Piece name (e.g. Hoodie)"
                value={saveGroupName}
                onChange={(e) => setSaveGroupName(e.target.value)}
                className="h-9 text-sm"
              />
              <Input
                placeholder="Variant (e.g. Grey) — optional"
                value={saveVariantName}
                onChange={(e) => setSaveVariantName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveSelectedToLibrary()}
                className="h-9 text-sm"
              />
              <Button className="w-full" onClick={saveSelectedToLibrary} disabled={!saveGroupName.trim()}>
                Save piece
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Save project
            </h2>
            <div className="flex gap-2">
              <Input
                placeholder="Project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveCurrentProject()}
                className="h-9 text-sm"
              />
              <Button className="shrink-0" onClick={saveCurrentProject} disabled={!projectName.trim()}>
                Save
              </Button>
            </div>
            {projects.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {projects.map((p) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <button
                      onClick={() => loadProject(p)}
                      className="flex-1 text-left rounded-lg border border-input px-3 py-1.5 text-xs hover:bg-input-background transition-colors"
                    >
                      {p.id}
                    </button>
                    <button
                      onClick={() => removeProject(p.id)}
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

          <Button className="w-full" onClick={downloadPng} disabled={exporting || layers.length === 0}>
            {exporting ? "Preparing…" : "Download PNG"}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center">
            <div
              ref={stageRef}
              onPointerDown={() => setSelectedId(null)}
              className="relative overflow-hidden rounded-2xl border border-input bg-[repeating-conic-gradient(#00000010_0_25%,transparent_0_50%)] bg-cover bg-center"
              style={{
                width: STAGE_WIDTH,
                height: STAGE_HEIGHT,
                backgroundSize: activeBackground?.src ? "cover" : "20px 20px",
                backgroundImage: activeBackground?.src ? `url(${activeBackground.src})` : undefined,
              }}
            >
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  onPointerDown={(e) => startMove(e, layer)}
                  className={`absolute select-none touch-none ${
                    selectedId === layer.id ? "outline outline-2 outline-foreground" : ""
                  }`}
                  style={{ left: layer.x, top: layer.y, width: layer.width, height: layer.height }}
                >
                  <img
                    src={layer.src}
                    alt={layer.name}
                    draggable={false}
                    className="w-full h-full pointer-events-none"
                  />
                  {selectedId === layer.id && (
                    <>
                      {/* Corner handle: uniform scale, aspect locked */}
                      <div
                        onPointerDown={(e) => startResize(e, layer, "both")}
                        title="Resize (keep proportions)"
                        className="absolute -right-2 -bottom-2 h-4 w-4 rounded-full bg-foreground cursor-nwse-resize touch-none"
                      />
                      {/* Right-edge handle: stretch width only */}
                      <div
                        onPointerDown={(e) => startResize(e, layer, "x")}
                        title="Stretch width"
                        className="absolute -right-1.5 top-1/2 -translate-y-1/2 h-6 w-3 rounded-full bg-foreground/70 cursor-ew-resize touch-none"
                      />
                      {/* Bottom-edge handle: stretch height only */}
                      <div
                        onPointerDown={(e) => startResize(e, layer, "y")}
                        title="Stretch height"
                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-3 rounded-full bg-foreground/70 cursor-ns-resize touch-none"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {layers.length > 0 && (
            <div className="max-w-[667px] mx-auto space-y-1.5">
              <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                Layers (top to bottom)
              </h2>
              {layersTopFirst.map(({ layer, index }) => (
                <div
                  key={layer.id}
                  onClick={() => setSelectedId(layer.id)}
                  className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 cursor-pointer ${
                    selectedId === layer.id ? "border-foreground" : "border-input"
                  }`}
                >
                  <img src={layer.src} alt={layer.name} className="h-8 w-8 rounded object-cover border border-input" />
                  <span className="flex-1 text-xs truncate">{layer.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveLayer(index, "up"); }}
                    disabled={index === layers.length - 1}
                    title="Move up"
                    className="text-xs px-1.5 py-0.5 rounded border border-input disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveLayer(index, "down"); }}
                    disabled={index === 0}
                    title="Move down"
                    className="text-xs px-1.5 py-0.5 rounded border border-input disabled:opacity-30"
                  >
                    ▼
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                    title="Delete"
                    className="text-xs px-1.5 py-0.5 rounded border border-input text-muted-foreground hover:text-destructive"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
