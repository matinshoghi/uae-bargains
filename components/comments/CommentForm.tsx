"use client";

import { useActionState, useRef } from "react";
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
}: {
  dealId: string;
  parentId?: string;
  onCancel?: () => void;
  autoFocus?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
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

  return (
    <form ref={formRef} action={action} className="mb-4">
      <input type="hidden" name="deal_id" value={dealId} />
      {parentId && <input type="hidden" name="parent_id" value={parentId} />}

      <textarea
        name="content"
        placeholder={
          parentId ? "Write a reply..." : "Share your thoughts on this deal..."
        }
        rows={parentId ? 2 : 3}
        autoFocus={autoFocus}
        required
        className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-emerald-500/20
                   focus:border-emerald-500 resize-none"
      />

      {state?.error?.content && (
        <p className="text-xs text-red-500 mt-1">
          {state.error.content[0]}
        </p>
      )}

      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-1.5 text-sm font-medium text-white bg-emerald-600
                     rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Posting..." : parentId ? "Reply" : "Comment"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-1.5 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
