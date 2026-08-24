import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ComingSoonModal } from './ComingSoonModal';

const FASHION = '#D98E2B';
const CRAFT = '#1FA396';

export function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [comingSoon, setComingSoon] = useState<string | null>(null);

  const isFashion =
    location.pathname === '/' || location.pathname.startsWith('/fashion');

  const handleToggle = () => {
    navigate(isFashion ? '/digital-craft' : '/fashion');
  };

  return (
    <nav className="w-full px-5 md:px-8 pt-6 pb-4">
      <ComingSoonModal
        open={!!comingSoon}
        onClose={() => setComingSoon(null)}
        title={comingSoon ? `${comingSoon} — Coming Soon` : 'Coming Soon'}
        description="This page isn't set up yet — check back soon."
      />

      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/')}
          className="tracking-[0.25em] uppercase text-stone-900 text-sm md:text-base shrink-0"
          style={{ fontFamily: 'Georgia, serif' }}
          aria-label="KEEMVERSE home"
        >
          Keemverse
        </button>

        {/* Fashion / Craft toggle */}
        <div className="flex items-center gap-2 md:gap-3">
          <span
            className="text-xs md:text-sm font-medium transition-colors duration-300"
            style={{ color: isFashion ? FASHION : '#a8a29e' }}
          >
            Fashion
          </span>

          <button
            onClick={handleToggle}
            aria-label={isFashion ? 'Switch to Craft' : 'Switch to Fashion'}
            className="relative w-12 h-7 rounded-full border overflow-hidden transition-colors duration-300"
            style={{
              borderColor: isFashion ? `${FASHION}55` : `${CRAFT}55`,
              background: `linear-gradient(to right, ${FASHION}26, ${CRAFT}26)`,
            }}
          >
            <div
              className="absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-all duration-300"
              style={{
                left: isFashion ? '1px' : '23px',
                backgroundColor: isFashion ? FASHION : CRAFT,
              }}
            />
          </button>

          <span
            className="text-xs md:text-sm font-medium transition-colors duration-300"
            style={{ color: !isFashion ? CRAFT : '#a8a29e' }}
          >
            Craft
          </span>
        </div>

        <div className="flex items-center gap-5 md:gap-6 shrink-0">
          <button
            onClick={() => setComingSoon('Resources')}
            className="text-xs md:text-sm font-medium tracking-wide text-stone-600 hover:text-stone-900 transition-colors"
          >
            Resources
          </button>
          <button
            onClick={() => setComingSoon('About')}
            className="text-xs md:text-sm font-medium tracking-wide text-stone-600 hover:text-stone-900 transition-colors"
          >
            About
          </button>
        </div>
      </div>
    </nav>
  );
}
