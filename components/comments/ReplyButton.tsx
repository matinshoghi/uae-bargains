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
        className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
      >
        Reply
      </Link>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowForm(!showForm)}
        className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
      >
        Reply
      </button>

      {showForm && (
        <div className="mt-2">
          <CommentForm
            dealId={dealId}
            parentId={parentId}
            onCancel={() => setShowForm(false)}
            autoFocus
          />
        </div>
      )}
    </>
  );
}
