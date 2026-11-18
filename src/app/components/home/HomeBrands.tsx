import { Link } from 'react-router-dom';
import { useContent } from '../../lib/siteContent';
import { Focus } from '../ui/Cine';
import { track } from '../../lib/track';

// The home page shows only a taste of the brand pitch: the headline, one line,
// and a way in. The proof numbers, the photos, the steps, the packages and the
// booking all live on /brands, for brands who want the detail. Keep this short.

export default function HomeBrands() {
  const t = useContent();

  return (
    <section id="for-brands" className="mt-24 scroll-mt-24 md:mt-36" aria-label="For brands">
      <Focus as="p" blur={false} y={10} className="eyebrow text-amber-ink">
        {t('home.brands_eyebrow')}
      </Focus>
      {/* Focus, not MaskLine: the title wraps to several lines and MaskLine is for single lines. */}
      <Focus blur={false} y={26} delay={0.05}>
        <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-[clamp(2.25rem,6.4vw,4.75rem)] leading-[1.02] tracking-[-0.025em]">
          {t('home.brands_title')}
        </h2>
      </Focus>
      <Focus as="p" blur={false} y={12} delay={0.12} className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
        {t('home.brands_lede')}
      </Focus>

      <Focus blur={false} y={12} delay={0.15} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link
          to="/brands"
          onClick={() => track('cta', { item: 'home-brands-more' })}
          className="press inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-7 text-sm font-semibold text-background transition-opacity hover:opacity-90"
        >
          See how I work with brands <span aria-hidden="true">→</span>
        </Link>
        <p className="text-sm text-muted-foreground">6.9M people reached in the last year.</p>
      </Focus>
    </section>
  );
}
