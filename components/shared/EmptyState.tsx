import Link from "next/link";
import { PackageOpen } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <PackageOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
      <p className="text-muted-foreground mb-4">No deals found</p>
      <Link
        href="/deals/new"
        className="text-sm font-medium text-emerald-600 hover:underline"
      >
        Be the first to post a deal
      </Link>
    </div>
  );
}
