"use client";

import { useState } from "react";
import { CommentForm } from "./CommentForm";
import Link from "next/link";

export function ReplyButton({
  dealId,
  parentId,
  isLoggedIn,
}: {
  dealId: string;
  parentId: string;
  isLoggedIn: boolean;
}) {
  const [showForm, setShowForm] = useState(false);

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className="font-display text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Reply
      </Link>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowForm(!showForm)}
        className="font-display text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Reply
      </button>

      {showForm && (
        <div className="mt-2">
          <CommentForm
            dealId={dealId}
            parentId={parentId}
            isLoggedIn={isLoggedIn}
            onCancel={() => setShowForm(false)}
            autoFocus
          />
        </div>
      )}
    </>
  );
}
