import { Skeleton } from "@/components/ui/skeleton";

export default function DealLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      {/* Category + time */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Title */}
      <Skeleton className="h-8 w-3/4" />

      {/* Image */}
      <Skeleton className="aspect-video w-full rounded-lg" />

      {/* Price */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-12" />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Metadata */}
      <Skeleton className="h-10 w-32" />

      {/* Posted by */}
      <div className="flex items-center gap-2 border-t pt-4">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}
