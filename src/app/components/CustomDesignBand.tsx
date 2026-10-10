import { CustomDesignForm } from './CustomDesignForm';
import { Reveal, Tag } from './CraftUI';
import { SAND, CRAFT, FASHION } from '../lib/theme';

// The "Custom design" path as a dark ink band with a light form card on it,
// after the Arena prototype's "Request as a service" section. Colours come
// from the brand palette (Deep Black ground, Soft Ivory text, Soft Sand glow,
// Warm Beige texture); the lime accent appears only on the tag and the form's buttons.
// The form sits in `.force-light` so it stays a light card in dark mode too.
// Nothing here promises a price or a turnaround time.

const STEPS = [
  { n: '01', title: 'Send a short note', copy: 'Tell me what it is for and what you have in mind. A sentence or two is enough.' },
  { n: '02', title: 'I read it and reply', copy: "I'll answer you personally on WhatsApp." },
  { n: '03', title: 'We agree it first', copy: 'We settle what you are getting before I start designing.' },
];

const KINDS = ['Clothing designs', 'Illustrations', 'Logos', 'Something else'];

export function CustomDesignBand() {
  return (
    <div className="relative isolate overflow-hidden rounded-[2rem] border border-white/5 bg-[#0F0F11] px-5 py-12 text-[#F5F2EC] sm:px-10 sm:py-16 lg:px-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 blueprint text-[#A18C6B] opacity-[0.12] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-16 -z-10 h-[440px] w-[440px] rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${SAND}33, transparent 65%)` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-20 -z-10 h-[460px] w-[460px] rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${CRAFT}2e, transparent 65%)` }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 dotgrid text-white/[0.07] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_38%)]" />

      <div className="grid items-start gap-12 lg:grid-cols-[1fr_minmax(0,540px)] lg:gap-16">
        <div>
          <Reveal>
            <Tag tone="accent" accent={FASHION} className="!text-[#E5A34C]">Custom design</Tag>
            <h3
              className="mt-5 max-w-[14ch] text-[#F5F2EC]"
              style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', lineHeight: 1.02, letterSpacing: '-0.02em' }}
            >
              Made for you, not off a shelf.
            </h3>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[#F5F2EC]/65">
              Tell me what you want and I'll design it, for you, your band, your shop or your brand.
            </p>
          </Reveal>

          <div className="mt-10 space-y-3.5">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={0.08 * i}>
                <div className="sheen flex gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
                  <div className="flex flex-col items-center">
                    <span
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold text-[#14120F]"
                      style={{ backgroundColor: FASHION, fontVariantNumeric: 'tabular-nums' }}
                    >
                      {s.n}
                    </span>
                    <span aria-hidden="true" className="mt-2 w-px flex-1 bg-white/15" />
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-base font-bold text-[#F5F2EC]">{s.title}</h4>
                    <p className="mt-1 max-w-sm text-sm leading-relaxed text-[#F5F2EC]/60">{s.copy}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-wrap gap-2">
              {KINDS.map((k) => (
                <span
                  key={k}
                  className="rounded-full border border-[#F5F2EC]/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#F5F2EC]/60"
                >
                  {k}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="force-light">
            <CustomDesignForm />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
