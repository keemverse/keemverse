import React, { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ComingSoonModal } from './ComingSoonModal';
import { socials } from '../lib/socials';
import logImg from '../../imports/log.png';

export function SocialFooter() {
  const [comingSoon, setComingSoon] = useState<string | null>(null);

  return (
    <footer className="mt-24 py-20 px-6">
      <ComingSoonModal
        open={!!comingSoon}
        onClose={() => setComingSoon(null)}
        title={comingSoon ? `${comingSoon} — Coming Soon` : 'Coming Soon'}
        description="This link isn't set up yet — check back soon."
      />

      <div className="max-w-2xl mx-auto flex flex-col items-center text-center gap-10">
        <p
          className="text-sm md:text-base tracking-[0.2em] uppercase text-stone-500"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Create · Build · Inspire
        </p>

        <div>
          <div className="flex gap-4 justify-center">
            {socials.map((s) => {
              const isPending = s.href === '#';
              return (
                <a
                  key={s.name}
                  href={s.href}
                  target={!isPending ? '_blank' : undefined}
                  rel={!isPending ? 'noopener noreferrer' : undefined}
                  onClick={
                    isPending
                      ? (e) => {
                          e.preventDefault();
                          setComingSoon(s.name);
                        }
                      : undefined
                  }
                  aria-label={s.name}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center border border-stone-200 bg-white text-stone-800 hover:bg-stone-50 hover:border-stone-300 transition-all"
                >
                  <s.icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-stone-400">
          <a href="/about" className="hover:text-stone-700 transition-colors">About</a>
          <a href="/contact" className="hover:text-stone-700 transition-colors">Contact</a>
          <a href="/refund-policy" className="hover:text-stone-700 transition-colors">Refund Policy</a>
          <a href="/privacy-policy" className="hover:text-stone-700 transition-colors">Privacy Policy</a>
          <a href="/terms" className="hover:text-stone-700 transition-colors">Terms</a>
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
