import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Instagram } from 'lucide-react';
import { TikTokIcon } from './Icons';

interface BookMeModalProps {
  open: boolean;
  onClose: () => void;
}

const platforms = [
  {
    name: 'Instagram',
    handle: '@soft_keem',
    url: 'https://www.instagram.com/soft_keem?igsh=MXh3ajFpdzV2emlzdA%3D%3D&utm_source=qr',
    Icon: Instagram,
    color: '#E1306C',
    bg: '#fdf0f5',
    label: 'View Profile',
  },
  {
    name: 'TikTok',
    handle: '@soft_keem',
    url: 'https://www.tiktok.com/@soft_keem',
    Icon: TikTokIcon,
    color: '#010101',
    bg: '#f5f5f5',
    label: 'View Profile',
  },
];

export function BookMeModal({ open, onClose }: BookMeModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center px-5 pointer-events-none"
          >
            <div
              className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-bold text-stone-900" style={{ fontSize: '1.25rem' }}>
                    Book Me
                  </h2>
                  <p className="text-stone-500 text-sm mt-1">
                    Reach out through your preferred platform.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Platform cards */}
              <div className="flex flex-col gap-3">
                {platforms.map((p) => (
                  <a
                    key={p.name}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-2xl border border-stone-100 hover:border-stone-200 transition-all group"
                    style={{ backgroundColor: p.bg }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: p.color }}
                    >
                      <p.Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-stone-900 text-sm">{p.name}</p>
                      <p className="text-stone-500 text-xs">{p.handle}</p>
                    </div>
                    <span className="text-xs font-bold text-stone-400 group-hover:text-stone-700 transition-colors shrink-0">
                      {p.label} →
                    </span>
                  </a>
                ))}
              </div>

              <p className="text-center text-stone-400 text-xs mt-6">
                Looking forward to connecting.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
