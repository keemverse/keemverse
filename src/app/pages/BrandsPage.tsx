import { useContent } from '../lib/siteContent';
import { Focus } from '../components/ui/Cine';
import { ProofBand, StoriesRow, StepsList, PacksGrid } from '../components/home/BrandPitchParts';
import BackToTop from '../components/BackToTop';
import { SocialFooter } from '../components/SocialFooter';

// The full brand pitch: where a fashion brand lands after tapping through from
// the home page. Proof first, then the work, then how it runs, then the
// packages (prices stay behind a tap) and the booking.

export default function BrandsPage() {
  const t = useContent();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-5 pb-0 pt-10 md:px-8">
        <header className="max-w-3xl">
          <Focus as="p" immediate blur={false} y={10} className="eyebrow text-amber-ink">
            {t('home.brands_eyebrow')}
          </Focus>
          <Focus immediate blur={false} y={26} delay={0.05}>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(2.4rem,7vw,5.25rem)] leading-[1.02] tracking-[-0.025em]">
              {t('home.brands_title')}
            </h1>
          </Focus>
          <Focus as="p" immediate blur={false} y={12} delay={0.12} className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {t('home.brands_lede')}
          </Focus>
        </header>

        <div className="mt-10">
          <ProofBand />
        </div>

        <div className="mt-16">
          <StoriesRow />
        </div>

        <div className="mt-20">
          <Focus as="p" blur={false} y={10} className="eyebrow text-amber-ink">
            How it works
          </Focus>
          <div className="mt-6">
            <StepsList />
          </div>
        </div>

        <div className="mt-20">
          <Focus as="p" blur={false} y={10} className="eyebrow text-amber-ink">
            Ways to work together
          </Focus>
          <div className="mt-6">
            <PacksGrid />
          </div>
        </div>
      </main>

      <BackToTop />
      <SocialFooter />
    </div>
  );
}
