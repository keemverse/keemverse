import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';

interface ComingSoonModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function ComingSoonModal({
  open,
  onClose,
  title = 'Coming Soon',
  description = "This is still in the works — check back soon.",
}: ComingSoonModalProps) {
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
              className="w-full max-w-sm bg-card rounded-3xl shadow-2xl p-8 pointer-events-auto text-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-5 bg-muted">
                <Sparkles className="w-6 h-6 text-foreground" />
              </div>

              <h2 className="font-bold text-foreground" style={{ fontSize: '1.25rem' }}>
                {title}
              </h2>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                {description}
              </p>

              <button
                onClick={onClose}
                className="mt-7 inline-flex items-center justify-center px-7 py-3 rounded-full bg-foreground text-background text-xs font-semibold tracking-[0.15em] uppercase hover:opacity-90 transition-opacity"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
