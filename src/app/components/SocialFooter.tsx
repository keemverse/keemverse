import React from 'react';
import { Instagram } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { TikTokIcon, PinterestIcon, BehanceIcon } from './Icons';
import logImg from '../../imports/log.png';

export function SocialFooter() {
  const socials = [
    { name: 'TikTok', icon: TikTokIcon, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'Pinterest', icon: PinterestIcon, href: '#' },
    { name: 'Behance', icon: BehanceIcon, href: '#' },
  ];

  return (
    <footer className="mt-24 py-20 px-6 border-t border-stone-200 bg-stone-100/50">
      <div className="max-w-2xl mx-auto flex flex-col items-center text-center gap-10">
        <div>
          <p className="text-xs font-bold tracking-[0.25em] uppercase opacity-40 mb-6">
            Follow Keemverse
          </p>
          <div className="flex gap-4 justify-center">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                aria-label={s.name}
                className="w-14 h-14 rounded-2xl flex items-center justify-center border border-stone-200 bg-white text-stone-800 hover:bg-stone-50 hover:border-stone-300 transition-all"
              >
                <s.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 opacity-40 text-sm">
          <ImageWithFallback
            src={logImg}
            alt="KEEMVERSE"
            className="h-6 w-auto object-contain"
          />
          <p>© {new Date().getFullYear()} KEEMVERSE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
