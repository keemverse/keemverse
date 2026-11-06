import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FRAMES, FRAME_KINDS, type Frame } from '../data/gallery';
import { Focus, MaskLine } from '../components/ui/Cine';
import FilterChips from '../components/ui/FilterChips';
import { Lightbox } from '../components/gallery/Lightbox';
import ViewCursor from '../components/gallery/ViewCursor';
import BackToTop from '../components/BackToTop';
import { SocialFooter } from '../components/SocialFooter';

// Every frame, laid out like a contact sheet: a staggered column wall that
// reflows by shoot type. Tap a frame for the full-screen viewer.

export default function GalleryPage() {
  const [kind, setKind] = useState<string>('All');
  const [open, setOpen] = useState<number | null>(null);

  const shown = useMemo<Frame[]>(() => (kind === 'All' ? FRAMES : FRAMES.filter((f) => f.kind === kind)), [kind]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { All: FRAMES.length };
    for (const f of FRAMES) c[f.kind] = (c[f.kind] ?? 0) + 1;
    return c;
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ViewCursor />
      <main className="mx-auto max-w-6xl px-5 pb-0 pt-10 md:px-8">
        <section className="mx-auto mb-10 max-w-2xl text-center">
          <Focus as="p" immediate blur={false} y={10} className="eyebrow text-amber-ink">
            From my shoots
          </Focus>
          <h1 className="mt-3 text-display-lg">
            <MaskLine immediate delay={0.1}>Frames</MaskLine>
          </h1>
          <Focus as="p" immediate delay={0.4} y={12} className="mx-auto mt-4 max-w-md text-muted-foreground">
            Outfits I wore, places I walked, and the looks I edited them into.
          </Focus>
        </section>

        <FilterChips tabs={[...FRAME_KINDS]} activeTab={kind} onChange={setKind} counts={counts} label="Filter frames by type" className="mb-8" />

        <div key={kind} className="columns-2 gap-3 md:columns-3 md:gap-5">
          {shown.map((f, i) => (
            <Focus key={f.id} blur={false} y={30} delay={(i % 3) * 0.08} className="mb-3 break-inside-avoid md:mb-5">
              <button
                type="button"
                data-frame
                onClick={() => setOpen(i)}
                aria-label={`Open ${f.title}`}
                className="group spot cine-sheen relative block w-full overflow-hidden rounded-2xl bg-muted text-left outline-offset-4"
                style={{ aspectRatio: String(f.ratio) }}
              >
                <img
                  src={f.src}
                  alt={`${f.title}: ${f.note}`}
                  loading={i < 3 ? 'eager' : 'lazy'}
                  decoding="async"
                  draggable={false}
                  className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  style={{ objectPosition: f.position ?? '50% 50%' }}
                />
                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-90 transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100" />
                <span className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 text-white md:translate-y-2 md:opacity-0 md:transition-all md:duration-500 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                  <span className="font-[family-name:var(--font-display)] text-lg leading-tight">{f.title}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75">{f.kind}</span>
                </span>
              </button>
            </Focus>
          ))}
        </div>

        <Focus className="mx-auto mt-16 max-w-md text-center md:mt-24">
          <p className="text-display-md">Want the look?</p>
          <p className="mt-3 text-muted-foreground">Every look here is a Lightroom preset you can use on your own photos.</p>
          <Link
            to="/fashion/presets"
            className="press mt-6 inline-flex rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background"
          >
            See the presets
          </Link>
        </Focus>
      </main>

      <Lightbox frames={shown} index={open} onClose={() => setOpen(null)} onChange={setOpen} />
      <BackToTop />
      <SocialFooter />
    </div>
  );
}
