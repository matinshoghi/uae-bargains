import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Manage your site content from here.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/banners"
          className="group rounded-xl border border-border p-6 transition-colors hover:border-foreground/20 hover:bg-accent"
        >
          <div className="flex items-center gap-3">
            <svg
              className="h-5 w-5 text-muted-foreground group-hover:text-foreground"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 0 0 1.5-1.5V5.25a1.5 1.5 0 0 0-1.5-1.5H3.75a1.5 1.5 0 0 0-1.5 1.5v14.25a1.5 1.5 0 0 0 0 1.5Z"
              />
            </svg>
            <h3 className="font-semibold">Hero Banners</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload and manage homepage hero banners for desktop and mobile.
          </p>
        </Link>
      </div>
    </div>
  );
}
