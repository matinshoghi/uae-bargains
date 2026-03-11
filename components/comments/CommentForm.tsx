"use client";

import { useActionState, useRef, useState } from "react";
import { createComment } from "@/lib/actions/comments";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { toast } from "sonner";

type FormState = {
  error?: Record<string, string[]>;
} | null | undefined;

export function CommentForm({
  dealId,
  parentId,
  onCancel,
  autoFocus = false,
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
  const { openAuthModal } = useAuthModal();
  const [focused, setFocused] = useState(autoFocus);
  const [state, action, isPending] = useActionState(
    async (_prev: FormState, formData: FormData) => {
      const result = await createComment(formData);
      if (!result?.error) {
        formRef.current?.reset();
        setFocused(false);
        onCancel?.();
        toast.success("Comment added");
      }
      return result as FormState;
    },
    null
  );

  function handleFocus() {
    if (!isLoggedIn) {
      openAuthModal({ message: "Sign in to join the conversation" });
      return;
    }
    setFocused(true);
  }

  const isReply = !!parentId;

  return (
    <form ref={formRef} action={action}>
      <input type="hidden" name="deal_id" value={dealId} />
      {parentId && <input type="hidden" name="parent_id" value={parentId} />}

      <div className="border-[1.5px] border-[#e4e3dd] bg-card transition-colors focus-within:border-foreground">
        <textarea
          name="content"
          placeholder={isReply ? "Write a reply..." : "Share your thoughts on this deal..."}
          rows={focused || isReply ? 3 : 1}
          autoFocus={autoFocus}
          required
          onFocus={handleFocus}
          readOnly={!isLoggedIn}
          className="w-full resize-none border-0 bg-transparent px-3 py-2.5 text-sm leading-relaxed
                     placeholder:text-muted-foreground/50 focus:outline-none"
        />

        {(focused || isReply) && (
          <div className="flex items-center justify-end gap-2 border-t border-[#e4e3dd] px-3 py-2">
            {(onCancel || !isReply) && (
              <button
                type="button"
                onClick={() => {
                  setFocused(false);
                  formRef.current?.reset();
                  onCancel?.();
                }}
                className="px-3 py-1 font-mono-display text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="border-[1.5px] border-foreground bg-primary px-4 py-1 font-display text-[13px] font-semibold text-primary-foreground
                         transition-colors hover:brightness-95 disabled:opacity-50"
            >
              {isPending ? "Posting..." : isReply ? "Reply" : "Post"}
            </button>
          </div>
        )}
      </div>

      {state?.error?.content && (
        <p className="mt-1 text-xs text-red-500">
          {state.error.content[0]}
        </p>
      )}
    </form>
  );
}
