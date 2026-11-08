import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdminNav } from "../components/AdminNav";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { useAdminAuth } from "../lib/useAdminAuth";
import {
  deleteProject,
  listProjects,
  saveProject,
  PIECE_CATEGORIES,
  type Layer,
  type LayerProject,
  type PieceCategory,
} from "../lib/layerProjectsDb";
import { listPieces, createPiece, deletePiece, type ApiPiece } from "../lib/piecesApi";
import { getLayouts, saveLayout, type LayoutMap } from "../lib/layoutsApi";

// The editing stage's internal coordinate system — all layer x/y/width/
// height and drag/resize math happen in these units, independent of how
// large the stage is actually rendered on screen (see stageScale below).
// EXPORT_SCALE brings it back up when rendering the downloaded PNG.
const STAGE_WIDTH = 667;
const STAGE_HEIGHT = 1000;
const EXPORT_SCALE = 2;

// The stage is capped at this on-screen width (scaled down to fit on
// mobile too) so the workspace doesn't dominate the page — it no longer
// renders at its full native 667px on every device.
const DISPLAY_MAX_WIDTH = 380;

// Two canvases share one library of pieces. A piece remembers its position and
// size separately for each: Solo, Duo-left person and Duo-right person.
type Canvas = "solo" | "duo";
type DuoSide = "left" | "right";
// In Duo each person is drawn smaller and sits left or right of centre.
const DUO_SCALE = 0.6;
const DUO_CENTRE_X = { left: 0.26, right: 0.74 };
const slotOf = (canvas: Canvas, side: DuoSide) => (canvas === "solo" ? "solo" : `duo-${side}`);
// Solo keeps the original key ("top:T-shirt") so positions saved before the
// Duo canvas existed still work; Duo slots get their own prefix.
const layoutKey = (category: string, group: string, slot: string) =>
  !slot || slot === "solo" ? `${category}:${group}` : `${slot}:${category}:${group}`;
// Dock (bottom bar): one tab per kind of piece, like a dress-up app.
type DockTab = "body" | PieceCategory | "bg";
const DOCK_TABS: { id: DockTab; label: string }[] = [
  { id: "body", label: "Body" },
  { id: "top", label: "Tops" },
  { id: "bottom", label: "Bottoms" },
  { id: "footwear", label: "Shoes" },
  { id: "headwear", label: "Hats" },
  { id: "other", label: "Extras" },
  { id: "bg", label: "Backdrop" },
];
type DockItem = {
  key: string;
  label: string;
  src: string;
  category: PieceCategory;
  groupName: string;
  width?: number; // known size (saved pieces); wardrobe and body are measured
  height?: number;
  targetHeight: number; // how tall to draw it when the size is measured
};
// Stacking order when a piece is worn: body at the back, hats on top.
const rankOf = (l: Layer) =>
  l.groupName === "Body model" ? 0
  : l.groupCategory === "footwear" ? 1
  : l.groupCategory === "bottom" ? 2
  : l.groupCategory === "top" ? 3
  : l.groupCategory === "headwear" ? 4
  : 5;
const slotLabel = (slot?: string) =>
  slot === "duo-left" ? "Duo, left person" : slot === "duo-right" ? "Duo, right person" : "Solo";

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
    // Saved pieces now load from raw.githubusercontent.com (cross-origin) —
    // without this, drawing them onto the export canvas taints it and
    // canvas.toDataURL() throws silently, breaking the PNG download.
    // Harmless for same-origin/data-URL sources.
    img.crossOrigin = "anonymous";
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
  {
    id: "body",
    name: "Body model",
    src: "/mannequin-library/body.webp",
    category: "other" as PieceCategory,
    groupName: "Body model",
  },
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

type ResizeAxis = "both" | "right" | "left" | "bottom" | "top";

type DragState =
  | { kind: "move"; id: string; startPointerX: number; startPointerY: number; startX: number; startY: number }
  | {
      kind: "resize";
      axis: ResizeAxis;
      id: string;
      startPointerX: number;
      startPointerY: number;
      startX: number;
      startY: number;
      startWidth: number;
      startHeight: number;
      aspect: number;
    };

export default function LayerStudioPage() {
  const { secret, unlocked, checking, error, checkSecret } = useAdminAuth();
  const [secretInput, setSecretInput] = useState("");
  const [canvas, setCanvas] = useState<Canvas>("solo");
  const [duoSide, setDuoSide] = useState<DuoSide>("left");
  const [sets, setSets] = useState<{ solo: Layer[]; duo: Layer[] }>({ solo: [], duo: [] });
  const [dockTab, setDockTab] = useState<DockTab>("top");
  const [autoRemember, setAutoRemember] = useState(true);
  const [rememberNote, setRememberNote] = useState("");
  const canvasRef = useRef<Canvas>("solo");
  canvasRef.current = canvas;
  const layers = sets[canvas];
  // Always writes to the canvas currently on screen, and stays the same
  // function between renders so the drag handlers below never go stale.
  const setLayers = useCallback((update: Layer[] | ((prev: Layer[]) => Layer[])) => {
    setSets((prev) => {
      const key = canvasRef.current;
      const next = typeof update === "function" ? update(prev[key]) : update;
      return { ...prev, [key]: next };
    });
  }, []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [background, setBackground] = useState(BACKGROUNDS[0].id);
  const [projects, setProjects] = useState<LayerProject[]>([]);
  const [projectName, setProjectName] = useState("");
  const [libraryPieces, setLibraryPieces] = useState<ApiPiece[]>([]);
  const [layoutDefaults, setLayoutDefaults] = useState<LayoutMap>({});
  const [savingLayout, setSavingLayout] = useState(false);
  const [saveCategory, setSaveCategory] = useState<PieceCategory>("other");
  const [saveGroupName, setSaveGroupName] = useState("");
  const [saveVariantName, setSaveVariantName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveToLibraryOpen, setSaveToLibraryOpen] = useState(false);
  const [saveProjectOpen, setSaveProjectOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [stageScale, setStageScale] = useState(1);
  const dragState = useRef<DragState | null>(null);
  const stageScaleRef = useRef(1);
  const stageRef = useRef<HTMLDivElement>(null);
  const stageWrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setsRef = useRef(sets);
  setsRef.current = sets;
  const secretRef = useRef(secret);
  secretRef.current = secret;
  const layoutDefaultsRef = useRef<LayoutMap>({});
  layoutDefaultsRef.current = layoutDefaults;
  const autoRememberRef = useRef(autoRemember);
  autoRememberRef.current = autoRemember;
  const rememberTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const rememberLayerRef = useRef<(layer: Layer) => Promise<void>>(async () => {});

  useEffect(() => {
    if (unlocked) {
      listProjects().then(setProjects);
      listPieces(secret).then(setLibraryPieces).catch(() => {});
      getLayouts(secret).then(setLayoutDefaults).catch(() => {});
    }
  }, [unlocked, secret]);

  // Scales the stage down to fit its wrapper (capped at DISPLAY_MAX_WIDTH)
  // so it's never wider than the viewport, on desktop or mobile. The
  // internal STAGE_WIDTH/HEIGHT coordinate system layers are positioned in
  // never changes — only how large that coordinate system renders on screen.
  useEffect(() => {
    if (!unlocked) return;
    const updateScale = () => {
      const w = stageWrapperRef.current?.clientWidth;
      if (!w) return;
      const scale = Math.min(1, w / STAGE_WIDTH);
      stageScaleRef.current = scale;
      setStageScale(scale);
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [unlocked]);

  const addLayer = (
    src: string,
    name: string,
    width: number,
    height: number,
    group?: { category: PieceCategory; groupName: string },
    replaceId?: string
  ) => {
    const slot = slotOf(canvas, duoSide);
    let x = (STAGE_WIDTH - width) / 2;
    let y = (STAGE_HEIGHT - height) / 2;
    if (group) {
      const remembered = layoutDefaults[layoutKey(group.category, group.groupName, slot)];
      if (remembered) {
        x = remembered.x;
        y = remembered.y;
        width = remembered.width;
        height = remembered.height;
      } else if (slot !== "solo") {
        // First time this piece goes on the Duo canvas: start from its Solo
        // position, shrunk around the stage centre and moved over to this
        // person. Every piece gets the same shrink, so a garment still lines
        // up with its body. One nudge and it is remembered from then on.
        const solo = layoutDefaults[layoutKey(group.category, group.groupName, "solo")];
        const personX = STAGE_WIDTH * DUO_CENTRE_X[duoSide];
        if (solo) {
          x = personX + (solo.x - STAGE_WIDTH / 2) * DUO_SCALE;
          y = STAGE_HEIGHT / 2 + (solo.y - STAGE_HEIGHT / 2) * DUO_SCALE;
          width = solo.width * DUO_SCALE;
          height = solo.height * DUO_SCALE;
        } else {
          x = personX - width / 2;
        }
      }
    }
    const layer: Layer = {
      id: crypto.randomUUID(),
      name,
      src,
      x,
      y,
      width,
      height,
      groupCategory: group?.category,
      groupName: group?.groupName,
      slot,
    };
    setLayers((prev) => {
      // Wearing something in place of what is already worn keeps its spot in
      // the stack; a new piece goes in front of everything that should sit
      // behind it (body, then shoes, bottoms, tops, hats).
      if (replaceId && prev.some((l) => l.id === replaceId)) {
        return prev.map((l) => (l.id === replaceId ? layer : l));
      }
      let at = 0;
      prev.forEach((l, i) => {
        if (rankOf(l) <= rankOf(layer)) at = i + 1;
      });
      return [...prev.slice(0, at), layer, ...prev.slice(at)];
    });
    setSelectedId(layer.id);
  };

  // What the person on the current canvas slot is wearing in a category.
  // One top, one bottom, one pair of shoes, one hat; extras are one per piece.
  const wornFor = (category: PieceCategory, groupName: string) => {
    const slot = slotOf(canvas, duoSide);
    return layers.find(
      (l) =>
        (l.slot || "solo") === slot &&
        l.groupCategory === category &&
        (category !== "other" || l.groupName === groupName)
    );
  };

  const wearItem = async (item: DockItem) => {
    const worn = wornFor(item.category, item.groupName);
    if (worn && worn.src === item.src) {
      deleteLayer(worn.id); // tap again to take it off
      return;
    }
    let width = item.width;
    let height = item.height;
    if (!width || !height) {
      const img = await loadImage(item.src);
      const scale = (STAGE_HEIGHT * item.targetHeight) / img.naturalHeight;
      width = img.naturalWidth * scale;
      height = img.naturalHeight * scale;
    }
    addLayer(item.src, item.label, width, height, { category: item.category, groupName: item.groupName }, worn?.id);
  };

  const takeOff = (category: PieceCategory) => {
    const slot = slotOf(canvas, duoSide);
    const ids = layers
      .filter((l) => (l.slot || "solo") === slot && l.groupCategory === category && l.groupName !== "Body model")
      .map((l) => l.id);
    setLayers((prev) => prev.filter((l) => !ids.includes(l.id)));
    setSelectedId(null);
  };

  // Saves a piece's position for the canvas slot it sits in. Skips the save
  // when nothing changed, so a plain click never rewrites anything.
  const rememberLayer = async (layer: Layer) => {
    if (!layer.groupCategory || !layer.groupName) return;
    const key = layoutKey(layer.groupCategory, layer.groupName, layer.slot || "solo");
    const next = {
      x: Math.round(layer.x),
      y: Math.round(layer.y),
      width: Math.round(layer.width),
      height: Math.round(layer.height),
    };
    const before = layoutDefaultsRef.current[key];
    if (before && before.x === next.x && before.y === next.y && before.width === next.width && before.height === next.height) {
      return;
    }
    setSavingLayout(true);
    try {
      const updated = await saveLayout(secretRef.current, key, next);
      setLayoutDefaults(updated);
      setRememberNote(`Remembered "${layer.groupName}" for ${slotLabel(layer.slot)}`);
    } catch {
      setRememberNote("Could not save that position. Try again.");
    } finally {
      setSavingLayout(false);
    }
  };
  rememberLayerRef.current = rememberLayer;

  const rememberSelectedPosition = async () => {
    const layer = layers.find((l) => l.id === selectedId);
    if (layer) await rememberLayer(layer);
  };

  // After a drag or resize ends, wait a moment (so a run of small nudges is
  // one save) and remember the piece's final position, if it really moved.
  const scheduleRemember = useCallback((id: string, from: { x: number; y: number; w?: number; h?: number }) => {
    clearTimeout(rememberTimers.current[id]);
    rememberTimers.current[id] = setTimeout(() => {
      const layer = [...setsRef.current.solo, ...setsRef.current.duo].find((l) => l.id === id);
      if (!layer) return;
      const moved =
        Math.round(layer.x) !== Math.round(from.x) ||
        Math.round(layer.y) !== Math.round(from.y) ||
        (from.w !== undefined && Math.round(layer.width) !== Math.round(from.w)) ||
        (from.h !== undefined && Math.round(layer.height) !== Math.round(from.h));
      if (moved) void rememberLayerRef.current(layer);
    }, 1200);
  }, []);

  // Swaps a layer's image in place — keeps its exact position/size, just
  // changes which variant (color/style) it points to.
  const replaceLayerImage = (layerId: string, src: string, name: string) => {
    setLayers((prev) => prev.map((l) => (l.id === layerId ? { ...l, src, name } : l)));
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
    addLayer(
      piece.src,
      piece.name,
      img.naturalWidth * scale,
      img.naturalHeight * scale,
      { category: piece.category, groupName: piece.groupName }
    );
  };

  const addWardrobeVariant = async (category: PieceCategory, groupName: string, variant: WardrobeVariant) => {
    const src = wardrobeSrc(variant.file);
    const img = await loadImage(src);
    const targetHeight = STAGE_HEIGHT * 0.55;
    const scale = targetHeight / img.naturalHeight;
    addLayer(
      src,
      `${groupName} (${variant.label})`,
      img.naturalWidth * scale,
      img.naturalHeight * scale,
      { category, groupName }
    );
  };

  const saveSelectedToLibrary = async () => {
    const layer = layers.find((l) => l.id === selectedId);
    const groupName = saveGroupName.trim();
    const variantName = saveVariantName.trim() || "Default";
    if (!layer || !groupName) return;
    // The layer's src may already be a plain URL (wardrobe/starter pieces)
    // rather than a data URL (fresh imports) — the API only accepts data
    // URLs to upload, so convert via canvas if needed.
    let imageDataUrl = layer.src;
    if (!imageDataUrl.startsWith("data:")) {
      const img = await loadImage(layer.src);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      imageDataUrl = canvas.toDataURL("image/png");
    }
    setSaving(true);
    try {
      await createPiece(secret, {
        category: saveCategory,
        groupName,
        variantName,
        imageDataUrl,
        width: layer.width,
        height: layer.height,
      });
      setLibraryPieces(await listPieces(secret));
      setSaveGroupName("");
      setSaveVariantName("");
      setSaveToLibraryOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const addLibraryPiece = (piece: ApiPiece) => {
    addLayer(
      piece.imageUrl,
      `${piece.groupName} (${piece.variantName})`,
      piece.width,
      piece.height,
      { category: piece.category || "other", groupName: piece.groupName || piece.id }
    );
  };

  const removeLibraryPiece = async (id: string) => {
    await deletePiece(secret, id);
    setLibraryPieces(await listPieces(secret));
  };

  const onPointerMove = useCallback((e: PointerEvent) => {
    const drag = dragState.current;
    if (!drag) return;
    // Pointer coordinates are real screen pixels, but the stage may be
    // rendered smaller than its native STAGE_WIDTH/HEIGHT (see stageScale)
    // — divide deltas back into stage units so drag/resize stay 1:1 with
    // the cursor regardless of display size.
    const scale = stageScaleRef.current || 1;
    if (drag.kind === "move") {
      const dx = (e.clientX - drag.startPointerX) / scale;
      const dy = (e.clientY - drag.startPointerY) / scale;
      setLayers((prev) =>
        prev.map((l) => (l.id === drag.id ? { ...l, x: drag.startX + dx, y: drag.startY + dy } : l))
      );
    } else {
      const dx = (e.clientX - drag.startPointerX) / scale;
      const dy = (e.clientY - drag.startPointerY) / scale;
      let newWidth = drag.startWidth;
      let newHeight = drag.startHeight;
      let newX = drag.startX;
      let newY = drag.startY;
      if (drag.axis === "both") {
        newWidth = Math.max(20, drag.startWidth + dx);
        newHeight = newWidth / drag.aspect;
      } else if (drag.axis === "right") {
        newWidth = Math.max(20, drag.startWidth + dx);
      } else if (drag.axis === "left") {
        // Left edge moves with the cursor; right edge stays fixed, so x
        // shifts by the same amount the width shrinks/grows.
        newWidth = Math.max(20, drag.startWidth - dx);
        newX = drag.startX + (drag.startWidth - newWidth);
      } else if (drag.axis === "bottom") {
        newHeight = Math.max(20, drag.startHeight + dy);
      } else {
        // "top": bottom edge stays fixed.
        newHeight = Math.max(20, drag.startHeight - dy);
        newY = drag.startY + (drag.startHeight - newHeight);
      }
      setLayers((prev) =>
        prev.map((l) => (l.id === drag.id ? { ...l, x: newX, y: newY, width: newWidth, height: newHeight } : l))
      );
    }
  }, []);

  const onPointerUp = useCallback(() => {
    const finished = dragState.current;
    dragState.current = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    if (finished && autoRememberRef.current) {
      scheduleRemember(
        finished.id,
        finished.kind === "resize"
          ? { x: finished.startX, y: finished.startY, w: finished.startWidth, h: finished.startHeight }
          : { x: finished.startX, y: finished.startY }
      );
    }
  }, [onPointerMove, scheduleRemember]);

  const startMove = (e: React.PointerEvent, layer: Layer) => {
    e.stopPropagation();
    setSelectedId(layer.id);
    if (layer.locked) return;
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
    if (layer.locked) return;
    dragState.current = {
      kind: "resize",
      axis,
      id: layer.id,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startX: layer.x,
      startY: layer.y,
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

  const toggleLock = (id: string) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l)));
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
    const project: LayerProject = { id: name, layers: sets.solo, duoLayers: sets.duo, updatedAt: Date.now() };
    await saveProject(project);
    setProjects(await listProjects());
    setProjectName("");
    setSaveProjectOpen(false);
  };

  const loadProject = (project: LayerProject) => {
    const duo = project.duoLayers ?? [];
    setSets({ solo: project.layers, duo });
    setCanvas(project.layers.length === 0 && duo.length > 0 ? "duo" : "solo");
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
      a.download = `layer-studio-${canvas}-${Date.now()}.png`;
      a.click();
    } catch (err) {
      console.error("PNG export failed:", err);
      alert("Download failed — one of the images couldn't be exported. Try again, or let me know if it keeps happening.");
    } finally {
      setExporting(false);
    }
  };

  const groupedLibrary = useMemo(() => {
    return PIECE_CATEGORIES.map((cat) => {
      const inCategory = libraryPieces.filter(
        (p) => (p.category || "other") === cat.id
      );
      const groups = new Map<string, ApiPiece[]>();
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

  // Tiles for the open dock tab.
  const dockItems: DockItem[] = [];
  if (dockTab === "body") {
    for (const sp of STARTER_PIECES) {
      dockItems.push({ key: sp.id, label: sp.name, src: sp.src, category: sp.category, groupName: sp.groupName, targetHeight: 0.9 });
    }
  } else if (dockTab !== "bg") {
    for (const g of WARDROBE.filter((w) => w.category === dockTab)) {
      for (const v of g.variants) {
        dockItems.push({
          key: `w:${g.groupName}:${v.label}`,
          label: `${g.groupName} (${v.label})`,
          src: wardrobeSrc(v.file),
          category: g.category,
          groupName: g.groupName,
          targetHeight: 0.55,
        });
      }
    }
    for (const lp of libraryPieces.filter((x) => (x.category || "other") === dockTab && x.groupName !== "Body model")) {
      dockItems.push({
        key: `l:${lp.id}`,
        label: `${lp.groupName} (${lp.variantName})`,
        src: lp.imageUrl,
        category: lp.category || "other",
        groupName: lp.groupName || lp.id,
        width: lp.width,
        height: lp.height,
        targetHeight: 0.55,
      });
    }
  }
  const wearingSlot = slotOf(canvas, duoSide);
  const isWorn = (item: DockItem) => layers.some((l) => (l.slot || "solo") === wearingSlot && l.src === item.src);
  const tileCls = (on: boolean) =>
    `relative h-16 w-16 shrink-0 snap-start rounded-2xl border-2 overflow-hidden bg-input-background transition-colors ${
      on ? "border-foreground" : "border-transparent"
    }`;

  return (
    <div className="min-h-screen bg-background text-foreground px-4 md:px-8 pt-6 pb-0">
      <div className="max-w-xl mx-auto mb-4">
        <AdminNav />
      </div>
      <div className="max-w-xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-serif text-2xl">Layer Studio</h1>
          <div className="grid grid-cols-2 gap-1 rounded-full border border-input p-1 w-40" role="tablist" aria-label="Canvas">
            {(["solo", "duo"] as Canvas[]).map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={canvas === c}
                onClick={() => {
                  setCanvas(c);
                  setSelectedId(null);
                }}
                className={`h-8 rounded-full text-sm font-medium transition-colors ${
                  canvas === c ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {c === "solo" ? "Solo" : "Duo"}
              </button>
            ))}
          </div>
        </div>

          <div className="flex justify-center">
            <div
              ref={stageWrapperRef}
              className="w-full"
              style={{
                maxWidth: DISPLAY_MAX_WIDTH,
                height: STAGE_HEIGHT * stageScale,
                overflow: "hidden",
              }}
            >
              <div
                ref={stageRef}
                onPointerDown={() => setSelectedId(null)}
                className="relative overflow-hidden rounded-2xl border border-input bg-[repeating-conic-gradient(#00000010_0_25%,transparent_0_50%)] bg-cover bg-center origin-top-left"
                style={{
                  width: STAGE_WIDTH,
                  height: STAGE_HEIGHT,
                  transform: `scale(${stageScale})`,
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
                  {selectedId === layer.id && layer.locked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/40 rounded pointer-events-none">
                      <span className="text-xs bg-background/90 border border-input rounded-full px-2 py-0.5">🔒 Locked</span>
                    </div>
                  )}
                  {selectedId === layer.id && !layer.locked && (
                    <>
                      {/* Corner handle: uniform scale, aspect locked */}
                      <div
                        onPointerDown={(e) => startResize(e, layer, "both")}
                        title="Resize (keep proportions)"
                        className="absolute -right-2 -bottom-2 h-4 w-4 rounded-full bg-foreground cursor-nwse-resize touch-none"
                      />
                      {/* Right-edge handle: stretch width, left edge fixed */}
                      <div
                        onPointerDown={(e) => startResize(e, layer, "right")}
                        title="Stretch width (right)"
                        className="absolute -right-1.5 top-1/2 -translate-y-1/2 h-6 w-3 rounded-full bg-foreground/70 cursor-ew-resize touch-none"
                      />
                      {/* Left-edge handle: stretch width, right edge fixed */}
                      <div
                        onPointerDown={(e) => startResize(e, layer, "left")}
                        title="Stretch width (left)"
                        className="absolute -left-1.5 top-1/2 -translate-y-1/2 h-6 w-3 rounded-full bg-foreground/70 cursor-ew-resize touch-none"
                      />
                      {/* Bottom-edge handle: stretch height, top edge fixed */}
                      <div
                        onPointerDown={(e) => startResize(e, layer, "bottom")}
                        title="Stretch height (bottom)"
                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-3 rounded-full bg-foreground/70 cursor-ns-resize touch-none"
                      />
                      {/* Top-edge handle: stretch height, bottom edge fixed */}
                      <div
                        onPointerDown={(e) => startResize(e, layer, "top")}
                        title="Stretch height (top)"
                        className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-3 rounded-full bg-foreground/70 cursor-ns-resize touch-none"
                      />
                    </>
                  )}
                </div>
              ))}
              </div>
            </div>
          </div>

        <p className="text-center text-[11px] text-muted-foreground" role="status">
          {rememberNote || "Tap a piece below to wear it. Tap it on the canvas to move or resize."}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => setSaveProjectOpen(true)}>
            Save look
          </Button>
          <Button onClick={downloadPng} disabled={exporting || layers.length === 0}>
            {exporting ? "Preparing…" : "Download PNG"}
          </Button>
        </div>

        <details className="rounded-2xl border border-input px-4 py-3 group">
          <summary className="text-xs uppercase tracking-[0.15em] text-muted-foreground cursor-pointer select-none list-none flex items-center gap-1.5">
            <span className="inline-block transition-transform group-open:rotate-90">▶</span>
            Layers and tools
          </summary>
          <div className="space-y-5 pt-4">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoRemember}
                onChange={(e) => setAutoRemember(e.target.checked)}
                className="h-3.5 w-3.5 accent-[color:var(--foreground)]"
              />
              Remember positions automatically
            </label>
            {!autoRemember && selectedLayer?.groupCategory && selectedLayer.groupName && (
              <Button
                className="w-full h-auto min-h-9 py-2 whitespace-normal text-center leading-snug"
                variant="outline"
                onClick={rememberSelectedPosition}
                disabled={savingLayout}
              >
                {savingLayout ? "Remembering…" : `Remember "${selectedLayer.groupName}" (${slotLabel(selectedLayer.slot)})`}
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleImport(e.target.files)}
            />
            <Button className="w-full" variant="outline" onClick={() => fileInputRef.current?.click()}>
              Import image(s)
            </Button>
            {selectedLayer && (
              <Button
                className="w-full h-auto min-h-9 py-2 whitespace-normal text-center leading-snug"
                variant="outline"
                onClick={() => setSaveToLibraryOpen(true)}
              >
                Save "{selectedLayer.name}" to library
              </Button>
            )}
          {layers.length > 0 && (
            <div className="space-y-1.5">
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
                  {layer.slot && layer.slot !== "solo" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-input text-muted-foreground">
                      {layer.slot === "duo-left" ? "L" : "R"}
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLock(layer.id); }}
                    title={layer.locked ? "Unlock" : "Lock position"}
                    className={`text-xs px-1.5 py-0.5 rounded border border-input ${layer.locked ? "bg-foreground text-background" : ""}`}
                  >
                    {layer.locked ? "🔒" : "🔓"}
                  </button>
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
            {libraryPieces.length > 0 && (
              <div className="space-y-1.5">
                <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Saved pieces</h2>
                {libraryPieces.map((piece) => (
                  <div key={piece.id} className="flex items-center gap-2 text-xs">
                    <img src={piece.imageUrl} alt="" className="h-8 w-8 rounded object-cover border border-input" />
                    <span className="flex-1 truncate">{piece.groupName} ({piece.variantName})</span>
                    <button
                      onClick={() => removeLibraryPiece(piece.id)}
                      title="Remove from library"
                      className="px-1.5 py-0.5 rounded border border-input text-muted-foreground hover:text-destructive"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            {projects.length > 0 && (
              <div className="space-y-1.5">
                <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Saved looks</h2>
                {projects.map((pr) => (
                  <div key={pr.id} className="flex items-center gap-2">
                    <button
                      onClick={() => loadProject(pr)}
                      className="flex-1 text-left rounded-lg border border-input px-3 py-1.5 text-xs hover:bg-input-background transition-colors"
                    >
                      {pr.id}
                    </button>
                    <button
                      onClick={() => removeProject(pr.id)}
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
        </details>

        {/* The dock: stays at the bottom of the screen, like a dress-up app. */}
        <div className="sticky bottom-0 z-20 -mx-4 md:mx-0 md:rounded-t-3xl border-t border-input bg-background/90 backdrop-blur px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] space-y-2.5">
          {canvas === "duo" && (
            <div className="grid grid-cols-2 gap-1 text-xs">
              {(["left", "right"] as DuoSide[]).map((side) => (
                <button
                  key={side}
                  onClick={() => setDuoSide(side)}
                  className={`h-8 rounded-full border transition-colors ${
                    duoSide === side ? "border-foreground bg-foreground text-background font-semibold" : "border-input text-muted-foreground"
                  }`}
                >
                  Dressing the {side} person
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 overflow-x-auto snap-x pb-1 -mx-1 px-1" aria-label="Pieces">
            {dockTab === "bg" ? (
              BACKGROUNDS.map((bg) => (
                <button key={bg.id} onClick={() => setBackground(bg.id)} title={bg.label} className={tileCls(background === bg.id)}>
                  {bg.src ? <img src={bg.src} alt={bg.label} className="w-full h-full object-cover" /> : <span className="text-[11px] text-muted-foreground">None</span>}
                </button>
              ))
            ) : (
              <>
                {dockTab !== "body" && dockTab !== "other" && (
                  <button
                    onClick={() => takeOff(dockTab as PieceCategory)}
                    title="Take off"
                    className={`${tileCls(false)} flex items-center justify-center text-lg text-muted-foreground`}
                  >
                    ✕
                  </button>
                )}
                {dockItems.map((item) => (
                  <button key={item.key} onClick={() => wearItem(item)} title={item.label} className={tileCls(isWorn(item))}>
                    <img src={item.src} alt={item.label} className="w-full h-full object-cover" draggable={false} />
                  </button>
                ))}
                {dockItems.length === 0 && (
                  <p className="self-center text-xs text-muted-foreground px-2">
                    Nothing here yet. Import an image, then use "Save to library" under Layers and tools.
                  </p>
                )}
              </>
            )}
          </div>

          <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="Piece type">
            {DOCK_TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={dockTab === t.id}
                onClick={() => setDockTab(t.id)}
                className={`h-9 shrink-0 rounded-full px-3.5 text-xs font-medium transition-colors ${
                  dockTab === t.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={saveToLibraryOpen} onOpenChange={setSaveToLibraryOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Save "{selectedLayer?.name}" to library</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
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
            <Button className="w-full" onClick={saveSelectedToLibrary} disabled={!saveGroupName.trim() || saving}>
              {saving ? "Saving…" : "Save piece"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={saveProjectOpen} onOpenChange={setSaveProjectOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Save project</DialogTitle>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
