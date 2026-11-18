import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BurgerMenu } from './ui/BurgerMenu';
import keemverseWordmark from '../../imports/keemverse-wordmark.svg';

// One header for the whole site, the way the home page has always looked: the
// KEEMVERSE wordmark on the left and the round menu button on the right. The
// menu holds the four places to go.
const MENU = [
  { to: '/brands', label: 'For brands' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/fashion/finds', label: 'What I wear' },
  { to: '/contact', label: 'Say hello' },
];

export function SiteHeader() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const items = MENU.map((l) => ({ label: l.label, action: () => navigate(l.to) }));

  return (
    <header
      className={`chrome-top sticky top-0 z-40 w-full border-b px-5 py-3 transition-[background-color,border-color] duration-300 md:px-8 md:py-4 ${
        scrolled ? 'border-border bg-background/85 backdrop-blur' : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
        <Link to="/" aria-label="KEEMVERSE home" className="shrink-0">
          <img src={keemverseWordmark} alt="Keemverse" className="h-[11px] w-auto object-contain md:h-[18px]" />
        </Link>
        <BurgerMenu items={items} />
      </div>
    </header>
  );
}
