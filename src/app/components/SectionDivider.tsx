interface SectionDividerProps {
  label: string;
}

export default function SectionDivider({
  label,
}: SectionDividerProps) {
  return (
    <div className="flex items-center gap-4 mb-8 mt-16">
      <div className="flex-1 h-px bg-border" />

      <span className="uppercase tracking-[0.3em] text-[10px] text-muted-foreground font-semibold">
        {label}
      </span>

      <div className="flex-1 h-px bg-border" />
    </div>
  );
}