import React, { useEffect, useState } from 'react';
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isFashion =
  location.pathname === "/" ||
  location.pathname.startsWith("/fashion");

  const items = [
    { label: 'Fashion', action: () => navigate('/fashion') },
    { label: 'Fashion Finds', action: () => navigate('/fashion/finds') },
    { label: 'Lightroom Presets', action: () => navigate('/fashion/presets') },
    { label: 'Craft', action: () => navigate('/digital-craft') },
    { label: 'Resources', action: () => setComingSoon('Resources') },
    { label: 'About', action: () => navigate('/about') },
    { label: 'Contact', action: () => navigate('/contact') },
  ];

  return (
    <div
      className={`chrome-top sticky top-0 z-40 w-full px-4 py-2 md:py-3 transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300 border-b ${
        scrolled
          ? 'glass-bar shadow-[0_8px_24px_-20px_rgba(20,18,15,.35)]'
          : 'bg-transparent border-transparent'
      }`}
    >
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
  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center animate-in fade-in zoom-in duration-300 cursor-pointer"
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
