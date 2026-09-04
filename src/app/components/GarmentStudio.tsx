import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

// Garment silhouette paths + print-area rects. Pure layout data —
// swap/extend garments here, nothing else needs to change.
const SILHOUETTES: Record<
  string,
  { d: string; hood?: string; handle?: string; print: [number, number, number, number] }
> = {
  tee: {
    d: 'M80 24 C80 40 120 40 120 24 C128 32 134 36 142 40 L168 52 L154 94 L136 86 L136 202 C136 206 133 208 129 208 L71 208 C67 208 64 206 64 202 L64 86 L46 94 L32 52 L58 40 C66 36 72 32 80 24 Z',
    print: [68, 78, 64, 82],
  },
  longsleeve: {
    d: 'M80 24 C80 40 120 40 120 24 C128 32 134 36 142 40 L166 58 L172 148 L150 150 L142 84 L136 86 L136 202 C136 206 133 208 129 208 L71 208 C67 208 64 206 64 202 L64 86 L58 84 L50 150 L28 148 L34 58 L58 40 C66 36 72 32 80 24 Z',
    print: [68, 80, 64, 80],
  },
  hoodie: {
    d: 'M78 30 C78 44 122 44 122 30 C130 38 136 42 144 46 L172 64 L178 152 L152 154 L144 88 L144 206 C144 210 141 212 137 212 L63 212 C59 212 56 210 56 206 L56 88 L48 154 L22 152 L28 64 L56 46 C64 42 70 38 78 30 Z',
    hood: 'M68 34 C68 4 132 4 132 34 C132 54 116 64 100 64 C84 64 68 54 68 34 Z',
    print: [62, 96, 76, 84],
  },
  tote: {
    d: 'M44 74 L156 74 L164 210 L36 210 Z',
    handle: 'M74 74 C74 40 126 40 126 74',
    print: [58, 96, 84, 84],
  },
};

const GARMENT_TYPES = [
  { id: 'tee', label: 'Tee' },
  { id: 'longsleeve', label: 'Long sleeve' },
  { id: 'hoodie', label: 'Hoodie' },
  { id: 'tote', label: 'Tote' },
];

const GARMENT_COLORS = [
  { id: 'bone', label: 'Bone', hex: '#EDE9DF', dark: false },
  { id: 'black', label: 'Washed black', hex: '#1A1C1F', dark: true },
  { id: 'sand', label: 'Sand', hex: '#D6C6A8', dark: false },
  { id: 'sage', label: 'Sage', hex: '#8FA187', dark: true },
  { id: 'clay', label: 'Clay', hex: '#B4552F', dark: true },
];

export interface StudioDesign {
  id: string;
  name: string;
  image: string;
}

function GarmentPreview({
  design,
  garment,
  color,
}: {
  design: StudioDesign;
  garment: string;
  color: (typeof GARMENT_COLORS)[number];
}) {
  const s = SILHOUETTES[garment];
  const [px, py, pw, ph] = s.print;
  const clipId = `studio-clip-${garment}`;

  return (
    <div className="relative">
      <svg viewBox="0 0 200 224" className="w-full" role="img" aria-label={`${design.name} previewed on a ${color.label} ${garment}`}>
        <defs>
          <clipPath id={clipId}>
            <rect x={px} y={py} width={pw} height={ph} rx="3" />
          </clipPath>
          <linearGradient id="studio-fabric" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.18" />
          </linearGradient>
        </defs>

        <AnimatePresence mode="wait">
          <motion.g
            key={garment}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {s.hood && <path d={s.hood} fill={color.hex} stroke="#00000022" strokeWidth="1" />}
            <motion.path
              d={s.d}
              animate={{ fill: color.hex }}
              transition={{ duration: 0.4 }}
              stroke={color.dark ? '#ffffff22' : '#00000022'}
              strokeWidth="1"
            />
            {s.handle && (
              <path d={s.handle} fill="none" stroke={color.dark ? '#ffffff30' : '#00000030'} strokeWidth="5" strokeLinecap="round" />
            )}
            <path d={s.d} fill="url(#studio-fabric)" />

            <g clipPath={`url(#${clipId})`}>
              <rect x={px} y={py} width={pw} height={ph} fill={color.dark ? '#00000030' : '#ffffff'} opacity={color.dark ? 0.35 : 0.5} />
              <AnimatePresence mode="wait">
                <motion.image
                  key={design.id}
                  href={design.image}
                  x={px}
                  y={py}
                  width={pw}
                  height={ph}
                  preserveAspectRatio="xMidYMid slice"
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  style={{
                    mixBlendMode: color.dark ? 'normal' : 'multiply',
                    opacity: color.dark ? 0.97 : 0.94,
                  }}
                />
              </AnimatePresence>
            </g>
          </motion.g>
        </AnimatePresence>
      </svg>

      <span className="pointer-events-none absolute right-1 bottom-0 font-mono text-[10px] tracking-[0.14em] text-stone-400 uppercase">
        {Math.round(pw / 5.33)}" × {Math.round(ph / 5.33)}" print area
      </span>
    </div>
  );
}

/**
 * Interactive "try it on a garment" preview — pick a design, garment
 * shape and colour, see it composited live. Ships with real KEEMVERSE
 * artwork as the sample set; swap `designs` for the actual pack once
 * Printable Graphics / Apparel Design Packs are live.
 */
export function GarmentStudio({ designs }: { designs: StudioDesign[] }) {
  const [designId, setDesignId] = useState(designs[0]?.id);
  const [garment, setGarment] = useState('tee');
  const [colorId, setColorId] = useState('bone');

  const design = designs.find((d) => d.id === designId) ?? designs[0];
  const color = GARMENT_COLORS.find((c) => c.id === colorId) ?? GARMENT_COLORS[0];

  if (!design) return null;

  return (
    <div className="rounded-[28px] border border-stone-200/60 bg-white p-6 md:p-10 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-[1fr,1.1fr] gap-8 items-center">
        {/* Preview */}
        <div className="max-w-[260px] mx-auto w-full">
          <GarmentPreview design={design} garment={garment} color={color} />
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-6">
          {designs.length > 1 && (
            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400 mb-3">Design</p>
              <div className="flex flex-wrap gap-2">
                {designs.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDesignId(d.id)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
                      d.id === designId
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400 mb-3">Garment</p>
            <div className="flex flex-wrap gap-2">
              {GARMENT_TYPES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGarment(g.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
                    g.id === garment
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400 mb-3">Color</p>
            <div className="flex flex-wrap gap-3">
              {GARMENT_COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setColorId(c.id)}
                  aria-label={c.label}
                  className={`w-9 h-9 rounded-full border-2 transition-transform ${
                    c.id === colorId ? 'border-stone-900 scale-110' : 'border-stone-200'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
