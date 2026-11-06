const WORDS = ['Real outfits', 'Presets I made', 'Looks you can reuse', 'Picks I would wear', 'One fashion journey'];

/** A slim dark strip of words that slides past forever (static for reduced motion). */
export default function IdentityMarquee() {
  const group = (
    <ul className="flex shrink-0 items-center" aria-hidden="true">
      {WORDS.map((w) => (
        <li key={w} className="flex items-center whitespace-nowrap">
          <span className="px-6 text-[11px] font-semibold uppercase tracking-[0.22em] md:px-8 md:text-xs">{w}</span>
          <span className="text-[#E9B565]">✦</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="dc-marquee relative mt-16 overflow-hidden rounded-full bg-[#14120F] py-3.5 text-[#F5F2EC] md:mt-24 md:py-4" role="marquee" aria-label={WORDS.join(', ')}>
      <div className="dc-marquee-track flex w-max">
        {group}
        {group}
      </div>
    </div>
  );
}
