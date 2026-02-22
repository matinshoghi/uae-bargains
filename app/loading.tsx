import { Skeleton } from "@/components/ui/skeleton";

function DealCardSkeleton() {
  return (
    <div className="flex gap-4 border-b border-foreground/10 py-5">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-20 w-20 shrink-0 rounded-sm" />
    </div>
  );
}

export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Skeleton className="mb-6 h-48 w-full rounded-sm" />
      <div className="flex gap-8">
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-8 w-24 rounded-sm" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <DealCardSkeleton key={i} />
          ))}
        </div>
        <aside className="hidden w-[300px] shrink-0 lg:block">
          <Skeleton className="h-48 w-full rounded-sm" />
        </aside>
      </div>
    </div>
  );
}
