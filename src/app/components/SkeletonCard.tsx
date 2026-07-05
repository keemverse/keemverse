export default function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[30px] bg-white border border-stone-200/70 animate-pulse">
      <div className="h-40 md:h-56 bg-stone-200" />

      <div className="p-5 md:p-6">
        <div className="h-3 w-16 rounded bg-stone-200 mb-4" />

        <div className="h-6 w-3/4 rounded bg-stone-200 mb-3" />

        <div className="h-5 w-20 rounded bg-stone-200 mb-6" />

        <div className="h-11 rounded-full bg-stone-200" />
      </div>
    </div>
  );
}