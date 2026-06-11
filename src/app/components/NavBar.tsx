import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logImg from '../../imports/log.png';
import profileImg from '../../imports/keem-profile.jpg';
export function NavBar() {
  const location = useLocation();
  const isFashion =
    location.pathname === '/' || location.pathname === '/fashion';

  return (
<div className="flex items-center justify-center gap-3 pt-5 pb-3 px-4">
 <ImageWithFallback
  src={profileImg}
  alt="Keem"
  className="h-11 w-11 rounded-full object-cover border border-white shadow-lg"
/>

      <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-full flex shadow-lg border border-stone-200 relative">
        <div
          className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-stone-900 rounded-full transition-all duration-500"
          style={{ left: isFashion ? '6px' : 'calc(50% + 0px)' }}
        />
<NavLink
  to="/fashion"
  className={({ isActive }) =>
    `relative z-10 px-3 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide ${
      isActive
        ? 'text-white'
        : 'text-stone-500 hover:text-stone-900'
    }`
  }
>
  FASHION
</NavLink>

<NavLink
  to="/digital-craft"
  className={({ isActive }) =>
    `relative z-10 px-3 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide ${
      isActive
        ? 'text-white'
        : 'text-stone-500 hover:text-stone-900'
    }`
  }
>
  DIGITAL CRAFT
</NavLink>
      </div>

      <ImageWithFallback
        src={logImg}
        alt="KEEMVERSE"
        className="h-13 w-auto object-contain opacity-90"
      />
    </div>
  );
}