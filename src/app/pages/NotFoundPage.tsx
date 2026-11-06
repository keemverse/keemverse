import { Link } from 'react-router-dom';
import { Focus, MaskLine } from '../components/ui/Cine';
import { SocialFooter } from '../components/SocialFooter';

// Shown for any address the site does not have (for example an old Craft link
// that was typed or bookmarked). Plain, friendly, and one tap from somewhere real.

const WAYS = [
  { to: '/', label: 'Home' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/fashion/presets', label: 'Lightroom presets' },
  { to: '/fashion/finds', label: 'Fashion Finds' },
];

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-2xl px-5 pb-24 pt-16 text-center md:px-8 md:pt-24">
        <Focus as="p" immediate blur={false} y={10} className="eyebrow text-amber-ink">
          Page not found
        </Focus>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2.75rem,10vw,5.5rem)] leading-[1] tracking-[-0.03em]">
          <MaskLine immediate delay={0.1}>That page</MaskLine>
          <MaskLine immediate delay={0.25}>
            is not <em className="text-[color:var(--fashion-display)]">here.</em>
          </MaskLine>
        </h1>
        <Focus as="p" immediate delay={0.5} y={12} className="mx-auto mt-6 max-w-sm text-muted-foreground">
          The link may be old or mistyped. These places are all real:
        </Focus>
        <Focus immediate delay={0.7} y={12} className="mt-8 flex flex-wrap justify-center gap-3">
          {WAYS.map((w, i) => (
            <Link
              key={w.to}
              to={w.to}
              className={`press inline-flex h-11 items-center rounded-full px-6 text-sm font-semibold transition-colors ${
                i === 0 ? 'bg-foreground text-background hover:opacity-90' : 'border border-border text-foreground hover:border-foreground/40'
              }`}
            >
              {w.label}
            </Link>
          ))}
        </Focus>
      </main>
      <SocialFooter />
    </div>
  );
}
