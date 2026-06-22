import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';

import logImg from '../../imports/log.png';
import profileImg from '../../imports/keem-profile.jpg';

export function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isFashion =
    location.pathname === '/' || location.pathname === '/fashion';

  const handleToggle = () => {
    navigate(isFashion ? '/digital-craft' : '/fashion');
  };

  return (
    <div className="w-full px-4 pt-5 pb-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">

        {/* Dynamic Identity */}
        <div
          key={isFashion ? 'fashion' : 'craft'}
          className="w-12 h-12 flex items-center justify-center animate-in fade-in zoom-in duration-300"
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
        </div>

        {/* Universe Switch */}
        <div className="flex items-center gap-3">

          <span
            className={`text-sm sm:text-base font-medium transition-colors duration-300 ${
              isFashion
                ? 'text-stone-900'
                : 'text-stone-400'
            }`}
          >
            Fashion
          </span>

<button
  onClick={handleToggle}
  className="
    relative
    w-12
    h-7
    rounded-full
    border
    border-[#d8d0c8]
    bg-gradient-to-b
    from-[#f4efe9]
    to-[#ddd3c8]
    shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_2px_6px_rgba(0,0,0,0.08)]
    transition-all
    duration-300
    overflow-hidden
  "
>
  <div
    className={`
      absolute
      top-1/2
      -translate-y-1/2
      h-5
      w-5
      rounded-full
      bg-gradient-to-b
      from-[#b8ada2]
      to-[#8f857b]
      shadow-[0_1px_3px_rgba(0,0,0,0.18)]
      transition-all
      duration-300
      ${isFashion ? 'left-[1px]' : 'left-[23px]'}
    `}
  />
</button>

          <span
            className={`text-sm sm:text-base font-medium transition-colors duration-300 ${
              !isFashion
                ? 'text-stone-900'
                : 'text-stone-400'
            }`}
          >
            Craft
          </span>

        </div>

      </div>
    </div>
  );
}