"use client";

import { useTransition } from "react";
import Link from "next/link";
import { deleteSeedUser } from "@/lib/actions/seed";
import { UserAvatar } from "@/components/shared/UserAvatar";
import type { SeedUserWithProfile } from "@/lib/queries/seed";

export function SeedUserList({ users }: { users: SeedUserWithProfile[] }) {
  if (users.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No seed users yet. Create one above to get started.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <SeedUserRow key={user.user_id} user={user} />
      ))}
    </div>
  );
}

function SeedUserRow({ user }: { user: SeedUserWithProfile }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Delete seed user @${user.profiles.username}? Their deals and comments will become anonymous.`)) return;
    startTransition(async () => {
      await deleteSeedUser(user.user_id);
    });
  };

  return (
    <div
      className={`flex items-center gap-4 rounded-xl border border-border p-4 transition-opacity ${
        isPending ? "opacity-50" : ""
      }`}
    >
      <UserAvatar
        src={user.profiles.avatar_url}
        name={user.profiles.display_name || user.profiles.username}
        size="md"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {user.profiles.display_name || user.profiles.username}
          </span>
          <span className="text-sm text-muted-foreground">
            @{user.profiles.username}
          </span>
        </div>
        {user.notes && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {user.notes}
          </p>
        )}
        <p className="mt-0.5 text-xs text-muted-foreground">
          Created {new Date(user.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="hidden sm:inline rounded-md bg-accent px-2 py-1 font-mono">
          {user.user_id.slice(0, 8)}...
        </span>

        <Link
          href={`/admin/seed-users/${user.user_id}/edit`}
          title="Edit seed user"
          className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
        </Link>

        <button
          onClick={handleDelete}
          disabled={isPending}
          title="Delete seed user"
          className="rounded-lg border border-red-200 p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-30"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  );
}
