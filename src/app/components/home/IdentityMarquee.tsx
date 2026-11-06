const WORDS = ['Real outfits', 'Presets I made', 'Pieces I picked', 'Frames from my shoots'];

/**
 * A quiet editorial ticker: serif italic words between two hairlines, faded at
 * both edges, sliding slowly (static for reduced motion).
 */
export default function IdentityMarquee() {
  const group = (
    <ul className="flex shrink-0 items-center" aria-hidden="true">
      {WORDS.map((w) => (
        <li key={w} className="flex items-center whitespace-nowrap">
          <span className="px-7 font-[family-name:var(--font-display)] text-[1.6rem] italic leading-none tracking-[-0.01em] text-foreground/75 md:px-10 md:text-4xl">
            {w}
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--fashion-display)]" />
        </li>
      ))}
    </ul>
  );
  return (
    <div
      className="dc-marquee relative mt-16 overflow-hidden border-y border-border py-6 md:mt-24 md:py-8 [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]"
      role="marquee"
      aria-label={WORDS.join(', ')}
    >
      <div className="dc-marquee-track flex w-max">
        {group}
        {group}
      </div>
    </div>
  );
}
