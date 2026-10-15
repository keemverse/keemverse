// Matches the real cards (portrait photo, then two lines), with a slow sheen.
export default function SkeletonCard() {
  return (
    <div aria-hidden="true">
      <div className="skeleton-shimmer aspect-[4/5] rounded-3xl" />
      <div className="px-1 pt-3.5">
        <div className="skeleton-shimmer h-2.5 w-16 rounded-full" />
        <div className="skeleton-shimmer mt-3 h-4 w-3/4 rounded-full" />
        <div className="skeleton-shimmer mt-2.5 h-4 w-16 rounded-full" />
      </div>
    </div>
  );
}
