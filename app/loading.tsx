import { Skeleton } from "@/components/ui/skeleton";

function DealCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-xl border bg-white p-4">
      {/* Vote column */}
      <div className="hidden shrink-0 flex-col items-center gap-2 md:flex">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-6" />
        <Skeleton className="h-4 w-4" />
      </div>

      {/* Thumbnail */}
      <Skeleton className="hidden h-20 w-20 shrink-0 rounded-lg md:block" />

      {/* Content */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
  );
}

export default function HomeLoading() {
  return (
    <>
      {/* Category bar skeleton */}
      <div className="flex gap-2 px-4 py-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>

      {/* Feed skeleton */}
      <div className="mx-auto max-w-3xl space-y-3 px-4 py-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <DealCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
