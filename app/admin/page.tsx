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

        <Link
          href="/admin/seed-users"
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
                d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
              />
            </svg>
            <h3 className="font-semibold">Seed Users</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Create and manage seed accounts to populate the platform.
          </p>
        </Link>

        <Link
          href="/admin/seed-actions"
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
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
              />
            </svg>
            <h3 className="font-semibold">Seed Actions</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Post deals, upvote, and comment as seed users.
          </p>
        </Link>

        <Link
          href="/admin/featured"
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
                d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9"
              />
            </svg>
            <h3 className="font-semibold">Featured Deals</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Pin deals to the top of the Hot feed regardless of score.
          </p>
        </Link>
      </div>
    </div>
  );
}
