interface SectionDividerProps {
  label: string;
}

export default function SectionDivider({
  label,
}: SectionDividerProps) {
  return (
    <div className="flex items-center gap-4 mb-8 mt-16">
      <div className="flex-1 h-px bg-stone-300" />

      <span className="uppercase tracking-[0.3em] text-[10px] text-stone-400 font-semibold">
        {label}
      </span>

      <div className="flex-1 h-px bg-stone-300" />
    </div>
  );
}