import { Link } from 'react-router-dom';
import { Focus } from '../ui/Cine';
import { StoriesRow } from './BrandPitchParts';

// A short look at the work on the home page: four frames from four shoots, and a
// way into the full gallery.
export default function HomeWork() {
  return (
    <section className="mt-24 md:mt-36" aria-label="Gallery">
      <div className="flex items-end justify-between gap-6">
        <div>
          <Focus as="p" blur={false} y={10} className="eyebrow text-amber-ink">
            Gallery
          </Focus>
          <Focus blur={false} y={22} delay={0.05}>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(2rem,5.4vw,3.75rem)] leading-[1.04] tracking-[-0.02em]">
              A few of my stories.
            </h2>
          </Focus>
        </div>
        <Link
          to="/gallery"
          className="press hidden min-h-11 shrink-0 items-center text-sm font-semibold text-foreground underline decoration-border underline-offset-[6px] transition-colors hover:decoration-foreground sm:inline-flex"
        >
          See the full gallery →
        </Link>
      </div>

      <div className="mt-8">
        <StoriesRow bare />
      </div>

      <Link
        to="/gallery"
        className="press mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-foreground underline decoration-border underline-offset-[6px] sm:hidden"
      >
        See the full gallery →
      </Link>
    </section>
  );
}
