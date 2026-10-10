import { Link } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { socials } from '../lib/socials';
import logImg from '../../imports/log.png';

const explore = [
  { to: '/fashion', label: 'Fashion' },
  { to: '/fashion/finds', label: 'Fashion Finds' },
  { to: '/fashion/presets', label: 'Lightroom Presets' },
  { to: '/digital-craft', label: 'Digital Craft' },
];

const help = [
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/refund-policy', label: 'Refund & Delivery' },
  { to: '/privacy-policy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms' },
];

function FooterLinks({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-foreground/70 mb-4">{title}</h2>
      <ul className="flex flex-col gap-3">
        {links.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SocialFooter() {
  // Pending socials (href '#') stay out of the footer until they are real,
  // so there are no dead icons.
  const liveSocials = socials.filter((s) => s.href !== '#');

  return (
    <footer className="mt-24 border-t border-border px-6 pt-14 pb-10">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-x-10">
          <div className="col-span-2 md:col-span-1">
            <ImageWithFallback
              src={logImg}
              alt="KEEMVERSE"
              className="h-9 w-auto object-contain"
            />
            <p
              className="mt-5 text-xs tracking-[0.2em] uppercase text-muted-foreground"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Create · Build · Inspire
            </p>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
              Fashion finds, presets, and original art and apparel.
            </p>
          </div>

          <FooterLinks title="Explore" links={explore} />
          <FooterLinks title="Help" links={help} />

          <div className="col-span-2 md:col-span-1">
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-foreground/70 mb-4">
              Follow
            </h2>
            <div className="flex gap-3">
              {liveSocials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="w-11 h-11 rounded-xl flex items-center justify-center border border-border bg-card text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
                >
                  <s.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">@soft_keem</p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} KEEMVERSE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
