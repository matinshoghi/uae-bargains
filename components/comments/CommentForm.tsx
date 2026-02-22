"use client";

import { useActionState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createComment } from "@/lib/actions/comments";
import { toast } from "sonner";

type FormState = {
  error?: Record<string, string[]>;
} | null | undefined;

export function CommentForm({
  dealId,
  parentId,
  onCancel,
  autoFocus = false,
  sticky = false,
  isLoggedIn = true,
}: {
  dealId: string;
  parentId?: string;
  onCancel?: () => void;
  autoFocus?: boolean;
  sticky?: boolean;
  isLoggedIn?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [state, action, isPending] = useActionState(
    async (_prev: FormState, formData: FormData) => {
      const result = await createComment(formData);
      if (!result?.error) {
        formRef.current?.reset();
        onCancel?.();
        toast.success("Comment added");
      }
      return result as FormState;
    },
    null
  );

  function handleAuthGate() {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }

  if (sticky && !parentId) {
    return (
      <div className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 border-t-[1.5px] border-foreground/10 bg-background md:bottom-0">
        <form
          ref={formRef}
          action={action}
          className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3"
        >
          <input type="hidden" name="deal_id" value={dealId} />
          <input
            type="text"
            name="content"
            placeholder="Add a comment..."
            required
            onFocus={handleAuthGate}
            readOnly={!isLoggedIn}
            className="flex-1 rounded-sm border-[1.5px] border-foreground/15 px-4 py-2 text-sm
                       focus:border-accent-neon focus:outline-none focus:ring-2 focus:ring-accent-neon/30"
          />
          <button
            type="submit"
            disabled={isPending || !isLoggedIn}
            className="font-display rounded-sm bg-primary px-4 py-2 text-sm font-semibold uppercase tracking-wide text-primary-foreground
                       transition-colors hover:brightness-95 disabled:opacity-50"
          >
            {isPending ? "..." : "Post"}
          </button>
        </form>

        {state?.error?.content && (
          <p className="mx-auto max-w-3xl px-4 pb-2 text-xs text-red-500">
            {state.error.content[0]}
          </p>
        )}
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} className="mb-4">
      <input type="hidden" name="deal_id" value={dealId} />
      {parentId && <input type="hidden" name="parent_id" value={parentId} />}

      <textarea
        name="content"
        placeholder={parentId ? "Write a reply..." : "Share your thoughts on this deal..."}
        rows={parentId ? 2 : 3}
        autoFocus={autoFocus}
        required
        className="w-full resize-none rounded-sm border-[1.5px] border-foreground/20 px-3 py-2 text-sm
                   focus:border-accent-neon focus:outline-none focus:ring-2 focus:ring-accent-neon/30"
      />

      {state?.error?.content && (
        <p className="mt-1 text-xs text-red-500">
          {state.error.content[0]}
        </p>
      )}

      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="font-display rounded-sm bg-primary px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground
                     transition-colors hover:brightness-95 disabled:opacity-50"
        >
          {isPending ? "Posting..." : parentId ? "Reply" : "Comment"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
