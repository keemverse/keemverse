import { useState } from 'react';
import { BookMeModal } from '../BookMeModal';
import { useContent } from '../../lib/siteContent';
import { Focus } from '../ui/Cine';
import { track } from '../../lib/track';

// A quiet door for brands: the two ways of working together, each opening the
// same booking note used on the Fashion page. Inbound only: nothing here asks
// Akeem to chase anyone, and the wording is the same as "Work with me".

const OFFERS = [
  { title: 'Brand Collaborations', line: 'Authentic content, creative direction on set and promotion for brands that fit.' },
  { title: 'Brand Modeling', line: 'Fashion, lifestyle and creative campaigns that suit the look.' },
];

export default function HomeBrands() {
  const t = useContent();
  const [topic, setTopic] = useState<string | null>(null);

  return (
    <section className="mt-24 md:mt-36" aria-label="For brands">
      <Focus as="p" blur={false} y={10} className="eyebrow text-amber-ink">
        {t('home.brands_eyebrow')}
      </Focus>
      <Focus blur={false} y={14} delay={0.05}>
        <h2 className="mt-3 max-w-xl text-display-lg">{t('home.brands_title')}</h2>
      </Focus>

      <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-6">
        {OFFERS.map((o, i) => (
          <Focus key={o.title} blur={false} y={22} delay={0.1 + i * 0.08}>
            <div className="glass flex h-full flex-col justify-between rounded-3xl p-6 md:p-8">
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-2xl leading-tight md:text-3xl">{o.title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">{o.line}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  track('brand_click', { item: o.title });
                  setTopic(o.title);
                }}
                className="press mt-8 inline-flex h-11 w-fit items-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background transition-opacity hover:opacity-90"
              >
                Book me <span aria-hidden="true">↗</span>
              </button>
            </div>
          </Focus>
        ))}
      </div>

      <BookMeModal open={topic !== null} topic={topic ?? undefined} onClose={() => setTopic(null)} />
    </section>
  );
}
