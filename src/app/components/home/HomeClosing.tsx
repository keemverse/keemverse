import { Link } from 'react-router-dom';
import { useContent } from '../../lib/siteContent';
import { socials } from '../../lib/socials';
import { Focus, MaskLine } from '../ui/Cine';
import CountUp from './CountUp';
import { useTikTokFollowers } from '../../lib/useFollowers';

// The last screen: follow along. TikTok is the main door, Instagram the second;
// a quiet line below keeps the contact page one tap away.

export default function HomeClosing() {
  const t = useContent();
  const followers = useTikTokFollowers();
  const tiktok = socials.find((s) => s.name === 'TikTok');
  const insta = socials.find((s) => s.name === 'Instagram');

  return (
    <section className="mt-24 md:mt-36">
      <div className="glass sheen overflow-hidden rounded-3xl px-6 py-14 text-center md:px-12 md:py-20">
        <Focus as="p" blur={false} y={10} className="eyebrow text-amber-ink">
          {t('home.cta_eyebrow')}
        </Focus>
        <h2 className="mx-auto mt-4 max-w-2xl font-[family-name:var(--font-display)] text-[clamp(2.25rem,6.4vw,4.5rem)] leading-[1.02] tracking-[-0.025em]">
          <MaskLine>{t('home.cta_title')}</MaskLine>
        </h2>
        <Focus as="p" delay={0.15} blur={false} y={12} className="mx-auto mt-5 max-w-md text-muted-foreground">
          {t('home.cta_body')}
        </Focus>
        {followers !== null && (
          <Focus as="p" delay={0.22} blur={false} y={10} className="mt-6 text-sm text-muted-foreground">
            <CountUp value={followers} className="font-semibold text-foreground" /> {t('home.cta_proof')}
          </Focus>
        )}
        <Focus delay={0.3} blur={false} y={12} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {tiktok && (
            <a
              href={tiktok.href}
              target="_blank"
              rel="noopener noreferrer"
              className="press inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-7 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              <tiktok.icon className="h-4 w-4" />
              {t('home.cta_primary')}
            </a>
          )}
          {insta && (
            <a
              href={insta.href}
              target="_blank"
              rel="noopener noreferrer"
              className="press inline-flex h-12 items-center gap-2 rounded-full border border-border px-7 text-sm font-semibold text-foreground transition-colors hover:border-foreground/40"
            >
              <insta.icon className="h-4 w-4" />
              {t('home.cta_secondary')}
            </a>
          )}
        </Focus>
        <p className="mt-8 text-sm text-muted-foreground">
          Brand enquiry or a question?{' '}
          <Link to="/contact" className="text-foreground underline underline-offset-4">
            Say hello
          </Link>
        </p>
      </div>
    </section>
  );
}
