import Link from "next/link";

export default function DealNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <h2 className="text-xl font-semibold mb-2">Deal not found</h2>
      <p className="text-sm text-muted-foreground mb-4">
        This deal doesn&apos;t exist or may have been removed.
      </p>
      <Link
        href="/"
        className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
      >
        Browse deals
      </Link>
    </div>
  );
}
