interface SectionDividerProps {
  label: string;
  /** Optional small text on the right, e.g. "12 looks". */
  meta?: string;
}

// A section heading with a short amber rule, instead of text floating between
// two hairlines.
export default function SectionDivider({ label, meta }: SectionDividerProps) {
  return (
    <div className="mb-7 mt-16 flex items-end justify-between gap-4">
      <div>
        <span aria-hidden="true" className="mb-3 block h-[3px] w-8 rounded-full bg-[var(--fashion-display)]" />
        <h2 className="text-display-md">{label}</h2>
      </div>
      {meta && <span className="pb-1 text-sm tabular-nums text-muted-foreground">{meta}</span>}
    </div>
  );
}
