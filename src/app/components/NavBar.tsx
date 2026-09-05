import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { BurgerMenu } from './ui/BurgerMenu';
import { ComingSoonModal } from './ComingSoonModal';

import logImg from '../../imports/log.png';
import profileImg from '../../imports/keem-profile.jpg';

export function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [comingSoon, setComingSoon] = useState<string | null>(null);

  const isFashion =
  location.pathname === "/" ||
  location.pathname.startsWith("/fashion");

  const items = [
    { label: 'Fashion', action: () => navigate('/fashion') },
    { label: 'Craft', action: () => navigate('/digital-craft') },
    { label: 'Resources', action: () => setComingSoon('Resources') },
    { label: 'About', action: () => navigate('/about') },
    { label: 'Contact', action: () => navigate('/contact') },
  ];

  return (
    <div className="w-full px-4 pt-5 pb-4">
      <ComingSoonModal
        open={!!comingSoon}
        onClose={() => setComingSoon(null)}
        title={comingSoon ? `${comingSoon} — Coming Soon` : 'Coming Soon'}
        description="This page isn't set up yet — check back soon."
      />

      <div className="max-w-5xl mx-auto flex items-center justify-between">

        {/* Dynamic Identity — doubles as a Home button back to the landing page */}
       <button
  key={isFashion ? "fashion" : "craft"}
  onClick={() => navigate("/")}
  aria-label="Back to Keemverse home"
  className="w-12 h-12 flex items-center justify-center animate-in fade-in zoom-in duration-300 cursor-pointer"
>
          <ImageWithFallback
            src={isFashion ? profileImg : logImg}
            alt={isFashion ? 'Soft Keem' : 'KEEMVERSE'}
            className={
              isFashion
                ? 'h-10 w-10 rounded-full object-cover border border-white shadow-sm'
                : 'h-10 w-auto object-contain opacity-90'
            }
          />
        </button>

        {/* Menu — replaces the old Fashion/Craft toggle now that the
            landing page is the shared hub for both universes */}
        <BurgerMenu items={items} />

      </div>
    </div>
  );
}
