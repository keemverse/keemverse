import { useCallback, useEffect, useRef, useState } from "react";
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
  type Layer,
  type LayerProject,
  type LibraryPiece,
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

// Starter pieces from the earlier mannequin build — still on disk, just not
// auto-loaded into every project. One click adds them as an ordinary layer
// that can be dragged/resized/deleted like anything else.
const STARTER_PIECES = [
  { id: "body", name: "Body model", src: "/mannequin-library/body.webp", kind: "figure" as const },
  { id: "studio-1", name: "Studio background 1", src: "/mannequin-backgrounds/studio-bg-1.webp", kind: "background" as const },
  { id: "studio-2", name: "Studio background 2", src: "/mannequin-backgrounds/studio-bg-2.webp", kind: "background" as const },
];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

type DragState =
  | { kind: "move"; id: string; startPointerX: number; startPointerY: number; startX: number; startY: number }
  | {
      kind: "resize";
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
  const [projects, setProjects] = useState<LayerProject[]>([]);
  const [projectName, setProjectName] = useState("");
  const [libraryPieces, setLibraryPieces] = useState<LibraryPiece[]>([]);
  const [pieceName, setPieceName] = useState("");
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

  const handleImport = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      const src = await readFileAsDataUrl(file);
      const img = await loadImage(src);
      const maxDim = 260;
      const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
      const width = img.naturalWidth * scale;
      const height = img.naturalHeight * scale;
      const layer: Layer = {
        id: crypto.randomUUID(),
        name: file.name,
        src,
        x: (STAGE_WIDTH - width) / 2,
        y: (STAGE_HEIGHT - height) / 2,
        width,
        height,
      };
      setLayers((prev) => [...prev, layer]);
      setSelectedId(layer.id);
    }
  };

  const addStarterPiece = async (piece: (typeof STARTER_PIECES)[number]) => {
    const img = await loadImage(piece.src);
    if (piece.kind === "background") {
      const layer: Layer = {
        id: crypto.randomUUID(),
        name: piece.name,
        src: piece.src,
        x: 0,
        y: 0,
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT,
      };
      // Backgrounds go behind everything already on the canvas.
      setLayers((prev) => [layer, ...prev]);
      setSelectedId(layer.id);
      return;
    }
    const targetHeight = STAGE_HEIGHT * 0.9;
    const scale = targetHeight / img.naturalHeight;
    const width = img.naturalWidth * scale;
    const height = img.naturalHeight * scale;
    const layer: Layer = {
      id: crypto.randomUUID(),
      name: piece.name,
      src: piece.src,
      x: (STAGE_WIDTH - width) / 2,
      y: (STAGE_HEIGHT - height) / 2,
      width,
      height,
    };
    setLayers((prev) => [...prev, layer]);
    setSelectedId(layer.id);
  };

  const saveSelectedToLibrary = async () => {
    const name = pieceName.trim();
    if (!name || !selectedId) return;
    const layer = layers.find((l) => l.id === selectedId);
    if (!layer) return;
    const piece: LibraryPiece = {
      id: name,
      src: layer.src,
      width: layer.width,
      height: layer.height,
      updatedAt: Date.now(),
    };
    await saveLibraryPiece(piece);
    setLibraryPieces(await listLibraryPieces());
    setPieceName("");
  };

  const addLibraryPiece = (piece: LibraryPiece) => {
    const layer: Layer = {
      id: crypto.randomUUID(),
      name: piece.id,
      src: piece.src,
      x: (STAGE_WIDTH - piece.width) / 2,
      y: (STAGE_HEIGHT - piece.height) / 2,
      width: piece.width,
      height: piece.height,
    };
    setLayers((prev) => [...prev, layer]);
    setSelectedId(layer.id);
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
      const newWidth = Math.max(20, drag.startWidth + dx);
      const newHeight = newWidth / drag.aspect;
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

  const startResize = (e: React.PointerEvent, layer: Layer) => {
    e.stopPropagation();
    dragState.current = {
      kind: "resize",
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

  const deleteSelected = () => {
    if (!selectedId) return;
    setLayers((prev) => prev.filter((l) => l.id !== selectedId));
    setSelectedId(null);
  };

  const bringToFront = () => {
    if (!selectedId) return;
    setLayers((prev) => {
      const layer = prev.find((l) => l.id === selectedId);
      if (!layer) return prev;
      return [...prev.filter((l) => l.id !== selectedId), layer];
    });
  };

  const sendToBack = () => {
    if (!selectedId) return;
    setLayers((prev) => {
      const layer = prev.find((l) => l.id === selectedId);
      if (!layer) return prev;
      return [layer, ...prev.filter((l) => l.id !== selectedId)];
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

  const selectedLayer = layers.find((l) => l.id === selectedId) || null;

  return (
    <div className="min-h-screen bg-background text-foreground px-5 md:px-8 py-10">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
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

          {libraryPieces.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                Your pieces
              </h2>
              <div className="flex flex-wrap gap-2">
                {libraryPieces.map((piece) => (
                  <div key={piece.id} className="relative group">
                    <button
                      onClick={() => addLibraryPiece(piece)}
                      title={piece.id}
                      className="h-14 w-14 rounded-lg border border-input overflow-hidden bg-input-background"
                    >
                      <img src={piece.src} alt={piece.id} className="w-full h-full object-cover" />
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
          )}

          {selectedLayer && (
            <div className="space-y-2">
              <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                Selected: {selectedLayer.name}
              </h2>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={bringToFront}>Bring to front</Button>
                <Button variant="outline" onClick={sendToBack}>Send to back</Button>
                <Button variant="outline" onClick={deleteSelected}>Delete</Button>
              </div>
              <div className="flex gap-2 pt-1">
                <Input
                  placeholder="Save this piece as…"
                  value={pieceName}
                  onChange={(e) => setPieceName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveSelectedToLibrary()}
                  className="h-9 text-sm"
                />
                <Button className="shrink-0" variant="outline" onClick={saveSelectedToLibrary} disabled={!pieceName.trim()}>
                  Save piece
                </Button>
              </div>
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

        <div className="flex justify-center">
          <div
            ref={stageRef}
            onPointerDown={() => setSelectedId(null)}
            className="relative overflow-hidden rounded-2xl border border-input bg-[repeating-conic-gradient(#00000010_0_25%,transparent_0_50%)]"
            style={{
              width: STAGE_WIDTH,
              height: STAGE_HEIGHT,
              backgroundSize: "20px 20px",
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
                  <div
                    onPointerDown={(e) => startResize(e, layer)}
                    className="absolute -right-2 -bottom-2 h-4 w-4 rounded-full bg-foreground cursor-nwse-resize touch-none"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
