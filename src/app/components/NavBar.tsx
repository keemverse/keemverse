import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ToggleSwitch } from './ui/ToggleSwitch';

import logImg from '../../imports/log.png';
import profileImg from '../../imports/keem-profile.jpg';

export function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isFashion =
  location.pathname === "/" ||
  location.pathname.startsWith("/fashion");

  const handleToggle = () => {
    navigate(isFashion ? '/digital-craft' : '/fashion');
  };

  return (
    <div className="w-full px-4 pt-5 pb-4">
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

        {/* Universe Switch */}
        <ToggleSwitch
          isLeft={isFashion}
          onToggle={handleToggle}
          leftLabel="Fashion"
          rightLabel="Craft"
        />

      </div>
    </div>
  );
}