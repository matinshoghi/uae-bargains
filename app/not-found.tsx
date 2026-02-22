import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="font-display mb-2 text-xl font-bold">Page not found</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/"
        className="font-display rounded-sm bg-primary px-4 py-2 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:brightness-95"
      >
        Back to deals
      </Link>
    </div>
  );
}
