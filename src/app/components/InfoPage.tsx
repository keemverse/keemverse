import type { ReactNode } from 'react';
import { SocialFooter } from './SocialFooter';
import { Focus, MaskLine, Unveil } from './ui/Cine';

interface InfoPageProps {
  eyebrow: string;
  title: string;
  /** Optional portrait shown in an arch above the title (used on About). */
  portrait?: { src: string; alt: string; position?: string };
  children: ReactNode;
}

/**
 * Shared layout for simple text/compliance pages (About, Contact,
 * Refund/Privacy/Terms): the same title-card intro as the rest of the site and
 * a single readable prose column. The NavBar comes from ConditionalNavBar in
 * App.tsx so it is not repeated here.
 */
export function InfoPage({ eyebrow, title, portrait, children }: InfoPageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-2xl mx-auto px-5 md:px-8 pt-10 pb-24">
        <section className="text-center mb-14">
          {portrait && (
            <Unveil
              immediate
              className="mx-auto mb-8 aspect-[3/4] w-44 rounded-b-[1.5rem] rounded-t-[999px] bg-muted shadow-[0_30px_70px_-35px_rgba(29,28,25,0.5)] md:w-52"
            >
              <img src={portrait.src} alt={portrait.alt} className="h-full w-full object-cover" style={{ objectPosition: portrait.position ?? '50% 40%' }} />
            </Unveil>
          )}
          <Focus as="p" immediate blur={false} y={10} className="uppercase tracking-[0.35em] text-xs text-muted-foreground mb-4">
            {eyebrow}
          </Focus>
          <h1 className="font-serif text-3xl md:text-5xl text-foreground leading-tight">
            <MaskLine immediate delay={0.1}>{title}</MaskLine>
          </h1>
        </section>

        <Focus immediate delay={0.3} y={16} blur={false} className="prose-content text-muted-foreground leading-relaxed space-y-6">
          {children}
        </Focus>
      </main>

      <SocialFooter />
    </div>
  );
}
