"use client";

import { useActionState, useRef, useEffect } from "react";
import { commentAsSeedUser, type SeedFormState } from "@/lib/actions/seed";
import type { SeedUserWithProfile } from "@/lib/queries/seed";

export function SeedCommentForm({ users }: { users: SeedUserWithProfile[] }) {
  const [state, action, isPending] = useActionState<SeedFormState, FormData>(
    commentAsSeedUser,
    null
  );

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="comment_user_id" className="block text-sm font-medium">
            Comment as <span className="text-red-500">*</span>
          </label>
          <select
            id="comment_user_id"
            name="user_id"
            required
            className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
          >
            <option value="">Select a seed user...</option>
            {users.map((u) => (
              <option key={u.user_id} value={u.user_id}>
                @{u.profiles.username}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="comment_deal_id" className="block text-sm font-medium">
            Deal ID or URL <span className="text-red-500">*</span>
          </label>
          <input
            id="comment_deal_id"
            name="deal_id"
            type="text"
            required
            placeholder="Paste deal URL or UUID"
            className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="comment_content" className="block text-sm font-medium">
          Comment <span className="text-red-500">*</span>
        </label>
        <textarea
          id="comment_content"
          name="content"
          required
          rows={3}
          placeholder="Write a comment..."
          className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none resize-y"
        />
      </div>

      <div>
        <label htmlFor="comment_parent_id" className="block text-sm font-medium">
          Parent Comment ID{" "}
          <span className="text-muted-foreground">(optional, for replies)</span>
        </label>
        <input
          id="comment_parent_id"
          name="parent_id"
          type="text"
          placeholder="Leave empty for top-level comment"
          className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      {state?.success && (
        <p className="text-sm text-green-600">Comment posted successfully.</p>
      )}

      <button
        type="submit"
        disabled={isPending || users.length === 0}
        className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Posting..." : "Post Comment"}
      </button>
    </form>
  );
}
