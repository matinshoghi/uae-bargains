"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="font-display mb-2 text-xl font-bold">Something went wrong</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        We hit an unexpected error. Please try again.
      </p>
      <button
        onClick={reset}
        className="font-display rounded-sm bg-primary px-4 py-2 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:brightness-95"
      >
        Try again
      </button>
    </div>
  );
}
