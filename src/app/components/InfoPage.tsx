import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { SocialFooter } from './SocialFooter';

interface InfoPageProps {
  eyebrow: string;
  title: string;
  children: ReactNode;
}

/**
 * Shared layout for simple text/compliance pages (About, Contact,
 * Refund/Privacy/Terms) — same intro treatment as LightroomPresetsPage,
 * a single readable prose column, NavBar comes from ConditionalNavBar
 * in App.tsx so it isn't repeated here.
 */
export function InfoPage({ eyebrow, title, children }: InfoPageProps) {
  return (
    <div className="min-h-screen text-stone-900" style={{ backgroundColor: '#F5F2EA' }}>
      <main className="max-w-2xl mx-auto px-5 md:px-8 pt-10 pb-24">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-14"
        >
          <p className="uppercase tracking-[0.35em] text-xs text-stone-500 mb-4">
            {eyebrow}
          </p>
          <h1 className="font-serif text-3xl md:text-5xl text-stone-900 leading-tight">
            {title}
          </h1>
        </motion.section>

        <div className="prose-content text-stone-600 leading-relaxed space-y-6">
          {children}
        </div>
      </main>

      <SocialFooter />
    </div>
  );
}
