import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ComingSoonModal } from './ComingSoonModal';

const links = [
  { label: 'Fashion', href: '/fashion' },
  { label: 'Craft', href: '/digital-craft' },
  { label: 'Resources', href: null },
  { label: 'About', href: null },
] as const;

export function NavBar() {
  const navigate = useNavigate();
  const [comingSoon, setComingSoon] = useState<string | null>(null);

  return (
    <nav className="w-full px-5 md:px-8 pt-6 pb-4">
      <ComingSoonModal
        open={!!comingSoon}
        onClose={() => setComingSoon(null)}
        title={comingSoon ? `${comingSoon} — Coming Soon` : 'Coming Soon'}
        description="This page isn't set up yet — check back soon."
      />

      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="tracking-[0.25em] uppercase text-stone-900 text-sm md:text-base"
          style={{ fontFamily: 'Georgia, serif' }}
          aria-label="KEEMVERSE home"
        >
          Keemverse
        </button>

        <div className="flex items-center gap-6 md:gap-8">
          {links.map((link) => (
            <button
              key={link.label}
              onClick={() =>
                link.href ? navigate(link.href) : setComingSoon(link.label)
              }
              className="text-xs md:text-sm font-medium tracking-wide text-stone-600 hover:text-stone-900 transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
