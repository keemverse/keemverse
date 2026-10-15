import { useState } from 'react';
import { Link } from 'react-router-dom';
import BeforeAfter from '../components/ui/BeforeAfter';
import FilterChips from '../components/ui/FilterChips';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';
import SectionDivider from '../components/SectionDivider';
import { Reveal } from '../components/CraftUI';
import { NGN_PER_USD, formatPrice } from '../lib/currency';

// Review page for the UI refresh. Only registered in development and on Vercel
// preview URLs (see App.tsx), so it never ships to the live domain. Everything
// here uses the real components with code-made placeholder images.

const chips = ['All', 'Editorial', 'Portrait', 'Street', 'Travel', 'Moody'];

function Block({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <p className="eyebrow text-amber-ink">{title}</p>
      {note && <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">{note}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function UiKitPage() {
  const [tab, setTab] = useState('All');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-5xl px-5 py-12 md:px-8">
        <p className="eyebrow text-teal-ink">UI refresh review</p>
        <h1 className="mt-3 text-display-xl">Component gallery</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Everything new in the redesign on one page, with placeholder images. This page exists only in development and on
          preview links. It is not part of the live site.
        </p>

        <Block title="Type" note="Satoshi, the brand face from Identity System v4. Fluid sizes scale smoothly between phone and desktop.">
          <div className="space-y-4">
            <p className="text-display-xl">Display XL</p>
            <p className="text-display-lg">Display large heading</p>
            <p className="text-display-md">Display medium heading</p>
            <p className="max-w-prose text-muted-foreground">
              Body copy in Satoshi Regular. Lines stay short and balanced, and headings wrap evenly instead of leaving a lonely
              last word.
            </p>
            <p className="eyebrow text-muted-foreground">Eyebrow label</p>
          </div>
        </Block>

        <Block title="Buttons and press feedback" note="Every tappable thing shrinks slightly on press and shows a clear keyboard focus ring.">
          <div className="flex flex-wrap gap-3">
            <button className="press rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-background">Primary</button>
            <button className="press rounded-full border border-border px-7 py-3.5 text-sm font-semibold">Secondary</button>
            <Link to="/fashion/finds" className="press rounded-full bg-[var(--fashion-display)] px-7 py-3.5 text-sm font-semibold text-[#14120F]">
              Accent
            </Link>
          </div>
        </Block>

        <Block title="Filter chips" note="Replaces the dropdown. Scrolls sideways on a phone; the active chip glides between choices.">
          <FilterChips tabs={chips} activeTab={tab} onChange={setTab} counts={{ Editorial: 4, Portrait: 3, Street: 0, Travel: 2, Moody: 5 }} />
        </Block>

        <Block title="Before / after slider" note="Drag, tap or use the arrow keys. Shown automatically on a preset when it has before_image and after_image set.">
          <div className="max-w-xl">
            <BeforeAfter before="/placeholders/look-before.svg" after="/placeholders/look-after.svg" />
          </div>
        </Block>

        <Block title="Cards, loading and empty states">
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <EmptyState title="Nothing matches that yet" body="Try another word, or browse a different category." />
        </Block>

        <Block title="Section heading">
          <SectionDivider label="Featured presets" meta="4 looks" />
        </Block>

        <Block title="Scroll reveal" note="Elements ease in as they enter the screen. Disabled when the device asks for reduced motion.">
          <div className="grid gap-4 md:grid-cols-3">
            {['One', 'Two', 'Three'].map((t, i) => (
              <Reveal key={t} delay={i * 0.08}>
                <div className="rounded-3xl border border-border bg-card p-8">
                  <p className="text-display-md">{t}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Block>

        <Block title="Prices" note={`Straight conversion at ₦${NGN_PER_USD.toLocaleString()} per dollar: Nigeria sees naira, everywhere else sees dollars.`}>
          <p className="text-lg tabular-nums">
            Nigeria: {formatPrice('₦9,900', 'NG')} &nbsp;·&nbsp; Abroad: {formatPrice('₦9,900', 'ROW')}
          </p>
        </Block>
      </main>
    </div>
  );
}
