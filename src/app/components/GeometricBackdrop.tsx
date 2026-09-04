/**
 * Site-wide background structure — thin geometric line accents,
 * fixed to the viewport at very low opacity. Reads as "made with
 * intention" (precision/craft) without competing with product
 * photography, which is what's actually meant to sell. Drop one
 * instance near the top of any page's root div.
 */
export function GeometricBackdrop() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* top-right corner bracket */}
      <svg
        className="absolute -top-4 -right-4 w-40 h-40 md:w-56 md:h-56 opacity-[0.06]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <path d="M200 0 L200 90 M200 0 L110 0" stroke="#1D1C19" strokeWidth="1" />
      </svg>

      {/* bottom-left corner bracket */}
      <svg
        className="absolute -bottom-4 -left-4 w-40 h-40 md:w-56 md:h-56 opacity-[0.06]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <path d="M0 200 L0 110 M0 200 L90 200" stroke="#1D1C19" strokeWidth="1" />
      </svg>

      {/* faint diagonal line, upper third */}
      <svg
        className="absolute top-[12%] left-0 w-full h-px opacity-[0.05]"
        preserveAspectRatio="none"
      >
        <line x1="0" y1="0" x2="100%" y2="0" stroke="#1D1C19" strokeWidth="1" strokeDasharray="1 14" />
      </svg>

      {/* faint diagonal line, lower third */}
      <svg
        className="absolute bottom-[16%] left-0 w-full h-px opacity-[0.05]"
        preserveAspectRatio="none"
      >
        <line x1="0" y1="0" x2="100%" y2="0" stroke="#1D1C19" strokeWidth="1" strokeDasharray="1 14" />
      </svg>
    </div>
  );
}
