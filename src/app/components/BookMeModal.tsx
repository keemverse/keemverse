import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, MessageCircle } from 'lucide-react';
import { Instagram } from 'lucide-react';
import { TikTokIcon } from './Icons';
import { track } from '../lib/track';

interface BookMeModalProps {
  open: boolean;
  onClose: () => void;
  /** What the visitor is booking (e.g. "Brand Collaborations"); personalises the heading. */
  topic?: string;
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

// Same contact details as the Contact page.
const WHATSAPP_NUMBER = '2349167174194';
const EMAIL = 'akeemtajudeen322@gmail.com';

// The four things that tell me whether it is a brand campaign: brand, product,
// budget and deadline. They arrive pre-typed, so a brand only fills in the blanks.
function brief(topic?: string) {
  return [
    `Hi Keem, I'd like to book: ${topic ?? 'an outfit story'}.`,
    '',
    'Brand:',
    'Product / pieces:',
    'Budget:',
    'Deadline:',
  ].join(String.fromCharCode(10));
}

export function BookMeModal({ open, onClose, topic }: BookMeModalProps) {
  const direct = [
    {
      name: 'WhatsApp',
      handle: '+234 916 717 4194',
      url: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(brief(topic))}`,
      Icon: MessageCircle,
      color: '#25D366',
      bg: '#effaf3',
      label: 'Chat',
      note: 'Fastest',
    },
    {
      name: 'Email',
      handle: EMAIL,
      url: `mailto:${EMAIL}?subject=${encodeURIComponent(`Booking: ${topic ?? 'Outfit story'}`)}&body=${encodeURIComponent(brief(topic))}`,
      Icon: Mail,
      color: '#44403c',
      bg: '#f5f5f4',
      label: 'Write',
      note: '',
    },
  ];
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
              className="w-full max-w-sm no-glass bg-card rounded-3xl shadow-2xl p-8 pointer-events-auto max-h-[92vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-bold text-foreground" style={{ fontSize: '1.25rem' }}>
                    {topic ?? 'Book Me'}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    {topic
                      ? 'Tell me the brand, the pieces, your budget and your deadline. WhatsApp is fastest.'
                      : 'Reach out however suits you.'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close" className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Direct: WhatsApp and email, with the brief pre-typed */}
              <div className="flex flex-col gap-3">
                {direct.map((p) => (
                  <a
                    key={p.name}
                    href={p.url}
                    target={p.name === 'Email' ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    onClick={() => track('brand_click', { item: topic ?? 'book', detail: p.name.toLowerCase() })}
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
                      <p className="font-bold text-stone-900 text-sm">
                        {p.name}
                        {p.note && (
                          <span className="ml-2 rounded-full bg-stone-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                            {p.note}
                          </span>
                        )}
                      </p>
                      <p className="text-stone-500 text-xs truncate">{p.handle}</p>
                    </div>
                    <span className="text-xs font-bold text-stone-400 group-hover:text-stone-700 transition-colors shrink-0">
                      {p.label} →
                    </span>
                  </a>
                ))}
              </div>

              <p className="mt-5 mb-3 text-center text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Or find me on</p>

              {/* Social profiles */}
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

              <p className="text-center text-muted-foreground text-xs mt-6">
                Looking forward to connecting.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
