import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { BurgerMenu } from './ui/BurgerMenu';

import profileImg from '../../imports/keem-profile.jpg';

export function NavBar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const items = [
    { label: 'Gallery', action: () => navigate('/gallery') },
    { label: 'Fashion Finds', action: () => navigate('/fashion/finds') },
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
      <div className="max-w-5xl mx-auto flex items-center justify-between">

        {/* Dynamic Identity — doubles as a Home button back to the landing page */}
       <button
  onClick={() => navigate("/")}
  aria-label="Back to Keemverse home"
  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center animate-in fade-in zoom-in duration-300 cursor-pointer"
>
          <ImageWithFallback
            src={profileImg}
            alt="Soft Keem"
            className="h-10 w-10 rounded-full object-cover border border-white shadow-sm"
          />
        </button>

        {/* Menu: the whole site in one place */}
        <BurgerMenu items={items} />

      </div>
    </div>
  );
}
