"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-sm text-muted-foreground mb-4">
        We hit an unexpected error. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
