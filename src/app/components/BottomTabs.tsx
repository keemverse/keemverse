import { Link, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ShoppingBag, Camera, Palette, Mail } from 'lucide-react';

// Phone-only tab bar in the thumb zone: the four places people actually go.
// It is hidden on desktop, in the admin tools and during checkout (where the
// page already has a single clear path). A spacer keeps page content and the
// footer clear of it.

const TABS = [
  { label: 'Finds', href: '/fashion/finds', icon: ShoppingBag },
  { label: 'Presets', href: '/fashion/presets', icon: Camera },
  { label: 'Craft', href: '/digital-craft', icon: Palette },
  { label: 'Contact', href: '/contact', icon: Mail },
];

const HIDDEN_ON = ['/admin', '/checkout'];

export default function BottomTabs() {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();

  if (pathname === '/' || HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <>
      <div aria-hidden="true" className="h-[calc(3.5rem+env(safe-area-inset-bottom))] md:hidden" />

      <nav
        aria-label="Main"
        className="chrome-bottom glass-bar fixed inset-x-0 bottom-0 z-40 border-b-0 border-t border-border/70 pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="mx-auto grid max-w-md grid-cols-4">
          {TABS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <li key={href}>
                <Link
                  to={href}
                  aria-current={active ? 'page' : undefined}
                  className="press relative flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium"
                >
                  {active && (
                    <motion.span
                      layoutId="bottom-tab-pill"
                      className="absolute top-1.5 h-7 w-14 rounded-full bg-foreground/10"
                      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <Icon className={`relative h-[18px] w-[18px] ${active ? 'text-foreground' : 'text-muted-foreground'}`} />
                  <span className={`relative ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
