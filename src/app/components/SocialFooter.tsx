import { Link } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { socials } from '../lib/socials';
import logImg from '../../imports/log.png';

// One quiet footer: who this is, four places to go, where to follow, and the
// small print.
const links = [
  { to: '/brands', label: 'For brands' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/fashion/finds', label: 'What I wear' },
  { to: '/contact', label: 'Say hello' },
];

export function SocialFooter() {
  // Pending socials (href '#') stay out of the footer until they are real,
  // so there are no dead icons.
  const liveSocials = socials.filter((s) => s.href !== '#');

  return (
    <footer className="mt-24 border-t border-border px-5 pb-10 pt-12 md:mt-32 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <ImageWithFallback src={logImg} alt="KEEMVERSE" className="h-9 w-auto object-contain" />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Keem's fashion world: outfit stories for brands and people everywhere.
            </p>
          </div>

          <nav aria-label="Site" className="flex flex-wrap gap-x-8 gap-y-1 text-sm">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="inline-flex min-h-11 items-center text-muted-foreground transition-colors hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </nav>

          <div>
            <div className="flex gap-3">
              {liveSocials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                >
                  <s.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">@soft_keem</p>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} KEEMVERSE</p>
          <p className="flex gap-5">
            <Link to="/privacy-policy" className="inline-flex min-h-11 items-center hover:text-foreground">
              Privacy
            </Link>
            <Link to="/terms" className="inline-flex min-h-11 items-center hover:text-foreground">
              Terms
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
