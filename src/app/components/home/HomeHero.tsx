import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { Accent, useContent } from '../../lib/siteContent';
import { Focus, MaskLine, Unveil } from '../ui/Cine';
import { TikTokIcon } from '../Icons';
import CountUp from './CountUp';
import { useTikTokFollowers } from '../../lib/useFollowers';
import { track } from '../../lib/track';
import heroPhoto from '../../../imports/trend-territory-modeling-portrait.webp';

// The first screen: who this is. Big title-card headline, one strong portrait in
// an arch, and two small floating cards that point at the rest of the site.

export default function HomeHero() {
  const t = useContent();
  const followers = useTikTokFollowers();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const wordY = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['0%', '-22%']);
  const photoY = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['0%', '10%']);

  return (
    <section ref={ref} className="relative mt-4 grid items-center gap-8 md:mt-14 md:gap-12 lg:grid-cols-12 lg:gap-8">
      {/* A very large, very faint name behind everything, drifting against the scroll. */}
      <motion.span
        aria-hidden="true"
        style={{ y: wordY }}
        className="pointer-events-none absolute -right-2 top-[2%] z-0 select-none font-[family-name:var(--font-display)] text-[38vw] italic leading-none tracking-[-0.04em] text-foreground/[0.045] lg:-right-6 lg:top-[-4%] lg:text-[24rem]"
      >
        Keem
      </motion.span>

      <div className="relative z-10 order-2 lg:order-1 lg:col-span-7">
        <Focus as="p" immediate blur={false} y={10} className="eyebrow text-amber-ink">
          {t('home.eyebrow')}
        </Focus>

        <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2.9rem,11vw,5.2rem)] leading-[0.98] tracking-[-0.03em] text-foreground md:text-[clamp(3.6rem,8.4vw,7.25rem)]">
          <MaskLine immediate delay={0.1}>
            <Accent text={t('home.headline_1')} />
          </MaskLine>
          <MaskLine immediate delay={0.3}>
            <Accent text={t('home.headline_2')} />
          </MaskLine>
        </h1>

        <Focus as="p" immediate delay={0.7} y={14} className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
          {t('home.tagline')}
        </Focus>

        <Focus immediate delay={0.9} y={14} className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/fashion/presets"
            onClick={() => track('cta', { item: 'hero-presets' })}
            className="press inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-7 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            {t('home.hero_cta_1')}
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            to="/gallery"
            onClick={() => track('cta', { item: 'hero-gallery' })}
            className="press inline-flex h-12 items-center rounded-full border border-border px-7 text-sm font-semibold text-foreground transition-colors hover:border-foreground/40"
          >
            {t('home.hero_cta_2')}
          </Link>
        </Focus>

        {followers !== null && (
          <Focus as="p" immediate delay={1.05} y={8} blur={false} className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
            <TikTokIcon className="h-4 w-4 text-foreground" />
            <span>
              <CountUp value={followers} className="font-semibold text-foreground" /> {t('home.proof_label')}
            </span>
          </Focus>
        )}
      </div>

      <div className="relative z-10 order-1 lg:order-2 lg:col-span-5">
        <div className="relative mx-auto w-[58%] max-w-[15rem] md:w-[60%] md:max-w-[20rem] lg:ml-auto lg:mr-0 lg:w-full lg:max-w-[26rem]">
          <motion.div style={{ y: photoY }}>
            <Unveil
              immediate
              parallax={4}
              delay={0.25}
              className="aspect-[3/4] rounded-b-[2rem] rounded-t-[999px] bg-muted shadow-[0_40px_90px_-40px_rgba(29,28,25,0.55)]"
            >
              <img
                src={heroPhoto}
                alt="Keem, seated in a pink and cream striped outfit"
                {...({ fetchpriority: 'high' } as Record<string, string>)}
                decoding="async"
                className="h-full w-full object-cover"
                style={{ objectPosition: '50% 38%' }}
              />
            </Unveil>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
