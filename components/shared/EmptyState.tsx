import Link from "next/link";
import { PackageOpen } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <PackageOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
      <p className="mb-4 text-muted-foreground">No deals found</p>
      <Link
        href="/deals/new"
        className="font-display text-sm font-semibold text-foreground underline underline-offset-4 hover:text-muted-foreground"
      >
        Be the first to post a deal
      </Link>
    </div>
  );
}
