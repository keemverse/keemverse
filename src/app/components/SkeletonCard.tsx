export default function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[30px] bg-card border border-border animate-pulse">
      <div className="h-40 md:h-56 bg-muted" />

      <div className="p-5 md:p-6">
        <div className="h-3 w-16 rounded bg-muted mb-4" />

        <div className="h-6 w-3/4 rounded bg-muted mb-3" />

        <div className="h-5 w-20 rounded bg-muted mb-6" />

        <div className="h-11 rounded-full bg-muted" />
      </div>
    </div>
  );
}