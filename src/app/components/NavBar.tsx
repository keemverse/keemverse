import React from 'react';
import { NavLink, useLocation } from 'react-router';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logImg from '../../imports/log.png';

export function NavBar() {
  const location = useLocation();
  const isFashion = location.pathname === '/fashion' || location.pathname === '/';

  return (
    <div className="flex items-center justify-center gap-5 pt-5 pb-3">
      {/* Logo */}
      <ImageWithFallback
        src={logImg}
        alt="KEEMVERSE"
        className="h-7 w-auto object-contain opacity-70"
      />

      {/* Pill switcher */}
      <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-full flex shadow-lg border border-stone-200 relative">
        {/* Sliding background */}
        <div
          className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-stone-900 rounded-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
          style={{ left: isFashion ? '6px' : 'calc(50% + 0px)' }}
        />

        <NavLink
          to="/fashion"
          className={({ isActive }) =>
            `relative z-10 px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-colors duration-300 ${
              isActive || isFashion && location.pathname === '/fashion'
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
            `relative z-10 px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-colors duration-300 ${
              isActive ? 'text-white' : 'text-stone-500 hover:text-stone-900'
            }`
          }
        >
          DIGITAL CRAFT
        </NavLink>
      </div>
    </div>
  );
}
