import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Profile header skeleton */}
      <div className="mb-8 flex flex-col items-center">
        <Skeleton className="mb-3 h-16 w-16 rounded-full" />
        <Skeleton className="mb-2 h-6 w-40" />
        <Skeleton className="h-4 w-52" />
        <div className="mt-4 flex gap-8">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>

      {/* Deals skeleton */}
      <Skeleton className="mb-4 h-6 w-28" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4 rounded-xl border bg-white p-4">
            <Skeleton className="hidden h-20 w-20 shrink-0 rounded-lg md:block" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
