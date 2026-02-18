# Slice 5 — Comments

> **Goal:** Threaded comments on deal pages with voting.
> **Duration:** Days 9–11
> **Depends on:** Slice 4 (voting system, VoteButton component)

---

## Overview

This slice adds the comments section to deal detail pages. Users can post top-level comments and replies (up to 3 levels deep). Each comment can be upvoted/downvoted using the existing VoteButton from Slice 4. Comments are sorted by newest first at the top level.

---

## 1. Data Flow

```
Deal Detail Page (Server Component)
  → Fetches deal + all comments + user's comment votes
  → Renders DealDetail + CommentSection

CommentSection (Server Component)
  → Organizes comments into tree structure
  → Renders CommentForm (top-level) + CommentList

CommentList (Server Component)
  → Maps over top-level comments
  → Each renders CommentItem with nested children

CommentItem (Server Component)
  → Displays comment content + metadata + VoteButton
  → Renders ReplyButton (Client) + nested CommentList for children

CommentForm (Client Component)
  → Textarea + submit, calls createComment Server Action
```

---

## 2. Server Action — `lib/actions/comments.ts`

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(2000),
  deal_id: z.string().uuid(),
  parent_id: z.string().uuid().nullable().optional(),
});

export async function createComment(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be signed in to comment");

  const parsed = commentSchema.safeParse({
    content: formData.get("content"),
    deal_id: formData.get("deal_id"),
    parent_id: formData.get("parent_id") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { content, deal_id, parent_id } = parsed.data;

  // Calculate depth based on parent
  let depth = 0;
  if (parent_id) {
    const { data: parent } = await supabase
      .from("comments")
      .select("depth")
      .eq("id", parent_id)
      .single();

    depth = parent ? Math.min(parent.depth + 1, 2) : 0;
  }

  const { error } = await supabase.from("comments").insert({
    deal_id,
    user_id: user.id,
    parent_id: parent_id ?? null,
    content,
    depth,
  });

  if (error) {
    return { error: { form: [error.message] } };
  }

  revalidatePath(`/deals/${deal_id}`);
}
```

---

## 3. Comment Query — `lib/queries/comments.ts`

```typescript
import { createClient } from "@/lib/supabase/server";

export async function fetchComments(dealId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("comments")
    .select(`
      *,
      profiles!inner(username, display_name, avatar_url)
    `)
    .eq("deal_id", dealId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
```

### Building the Tree

Transform the flat array into a nested tree in the page component:

```typescript
interface CommentWithChildren extends Comment {
  children: CommentWithChildren[];
}

function buildCommentTree(comments: Comment[]): CommentWithChildren[] {
  const map = new Map<string, CommentWithChildren>();
  const roots: CommentWithChildren[] = [];

  // First pass: create nodes
  for (const comment of comments) {
    map.set(comment.id, { ...comment, children: [] });
  }

  // Second pass: build tree
  for (const comment of comments) {
    const node = map.get(comment.id)!;
    if (comment.parent_id && map.has(comment.parent_id)) {
      map.get(comment.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
```

**Why build the tree in the component, not SQL?** Simpler query, no recursive CTEs needed. The comment count per deal is typically small enough (< 500) that in-memory tree building is fine.

---

## 4. Components

### 4.1 `components/comments/CommentSection.tsx` (Server Component)

Wrapper that fetches comments and renders the form + list.

```typescript
import { fetchComments } from "@/lib/queries/comments";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";

export async function CommentSection({
  dealId,
  userCommentVotes,
  isLoggedIn,
}: {
  dealId: string;
  userCommentVotes: Record<string, number>;
  isLoggedIn: boolean;
}) {
  const comments = await fetchComments(dealId);
  const tree = buildCommentTree(comments);

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">
        {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
      </h2>

      {isLoggedIn ? (
        <CommentForm dealId={dealId} />
      ) : (
        <p className="text-sm text-zinc-500 mb-4">
          <a href="/login" className="text-emerald-600 hover:underline">Sign in</a> to comment
        </p>
      )}

      <CommentList
        comments={tree}
        userCommentVotes={userCommentVotes}
        isLoggedIn={isLoggedIn}
        dealId={dealId}
      />
    </section>
  );
}
```

### 4.2 `components/comments/CommentList.tsx` (Server Component)

Recursively renders comment items.

```typescript
export function CommentList({
  comments,
  userCommentVotes,
  isLoggedIn,
  dealId,
}: {
  comments: CommentWithChildren[];
  userCommentVotes: Record<string, number>;
  isLoggedIn: boolean;
  dealId: string;
}) {
  if (comments.length === 0) return null;

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          userVote={userCommentVotes[comment.id] ?? null}
          isLoggedIn={isLoggedIn}
          dealId={dealId}
        />
      ))}
    </div>
  );
}
```

### 4.3 `components/comments/CommentItem.tsx` (Server Component)

Single comment display with nested children.

**Layout:**

```
┌──────────────────────────────────────────────────┐
│  [Avatar]  username · 2 hours ago                │
│                                                  │
│  Comment text goes here. This can be multiple    │
│  lines of content from the user.                 │
│                                                  │
│  ▲ 5 ▼  ·  Reply                                │
│                                                  │
│    ┌──────────────────────────────────────────┐  │
│    │  [Avatar]  reply_user · 1 hour ago       │  │
│    │  Reply text here                         │  │
│    │  ▲ 2 ▼  ·  Reply                        │  │
│    └──────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

**Nesting:**
- Depth 0: full width
- Depth 1: indented `ml-8` with left border
- Depth 2: indented `ml-8` again (from parent)
- Depth 3+: no further visual indentation — replies at depth 2 are flat-listed

```typescript
import { VoteButton } from "@/components/shared/VoteButton";
import { ReplyButton } from "./ReplyButton";
import { CommentList } from "./CommentList";

export function CommentItem({
  comment,
  userVote,
  isLoggedIn,
  dealId,
}: {
  comment: CommentWithChildren;
  userVote: 1 | -1 | null;
  isLoggedIn: boolean;
  dealId: string;
}) {
  return (
    <div className={cn(
      "py-3",
      comment.depth > 0 && "ml-8 pl-4 border-l-2 border-zinc-100"
    )}>
      {/* Header: avatar + username + time */}
      <div className="flex items-center gap-2 mb-1">
        <Avatar ... />
        <span className="text-sm font-medium">{comment.profiles.display_name}</span>
        <span className="text-xs text-zinc-400">
          <TimeAgo date={comment.created_at} />
        </span>
      </div>

      {/* Content */}
      <p className="text-sm text-zinc-700 whitespace-pre-wrap mb-2">
        {comment.content}
      </p>

      {/* Actions: vote + reply */}
      <div className="flex items-center gap-3">
        <VoteButton
          entityType="comment"
          entityId={comment.id}
          upvoteCount={comment.upvote_count}
          downvoteCount={comment.downvote_count}
          userVote={userVote}
          isLoggedIn={isLoggedIn}
        />
        {comment.depth < 2 && (
          <ReplyButton dealId={dealId} parentId={comment.id} isLoggedIn={isLoggedIn} />
        )}
      </div>

      {/* Nested children */}
      {comment.children.length > 0 && (
        <CommentList
          comments={comment.children}
          userCommentVotes={userCommentVotes}
          isLoggedIn={isLoggedIn}
          dealId={dealId}
        />
      )}
    </div>
  );
}
```

### 4.4 `components/comments/CommentForm.tsx` (Client Component)

Textarea with submit button. Used for both top-level comments and inline replies.

```typescript
"use client";

import { useActionState } from "react";
import { createComment } from "@/lib/actions/comments";
import { useRef } from "react";

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
    async (_prev: any, formData: FormData) => {
      const result = await createComment(formData);
      if (!result?.error) {
        formRef.current?.reset();
        onCancel?.(); // Close reply form
      }
      return result;
    },
    null
  );

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
        className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-emerald-500/20
                   focus:border-emerald-500 resize-none"
      />

      {state?.error?.content && (
        <p className="text-xs text-red-500 mt-1">{state.error.content[0]}</p>
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
          <button type="button" onClick={onCancel} className="px-4 py-1.5 text-sm text-zinc-500">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
```

### 4.5 `components/comments/ReplyButton.tsx` (Client Component)

Toggles inline CommentForm visibility.

```typescript
"use client";

import { useState } from "react";
import { CommentForm } from "./CommentForm";

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
      <a href="/login" className="text-xs text-zinc-400 hover:text-zinc-600">
        Reply
      </a>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowForm(!showForm)}
        className="text-xs text-zinc-400 hover:text-zinc-600"
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
```

---

## 5. Updating the Deal Detail Page

`app/deals/[id]/page.tsx` now includes the CommentSection:

```typescript
export default async function DealPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch deal
  const deal = await fetchDeal(id);
  if (!deal) notFound();

  // Fetch user info + votes
  const { data: { user } } = await supabase.auth.getUser();
  let userDealVote = null;
  let userCommentVotes: Record<string, number> = {};

  if (user) {
    const { data: votes } = await supabase
      .from("votes")
      .select("deal_id, comment_id, vote_type")
      .eq("user_id", user.id);

    if (votes) {
      for (const vote of votes) {
        if (vote.deal_id === id) userDealVote = vote.vote_type;
        if (vote.comment_id) userCommentVotes[vote.comment_id] = vote.vote_type;
      }
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <DealDetail deal={deal} userVote={userDealVote} isLoggedIn={!!user} />

      <div className="mt-8 border-t border-zinc-100 pt-6">
        <CommentSection
          dealId={id}
          userCommentVotes={userCommentVotes}
          isLoggedIn={!!user}
        />
      </div>
    </div>
  );
}
```

---

## 6. File Structure After This Slice

```
lib/
  queries/
    comments.ts                — fetchComments query
  actions/
    comments.ts                — createComment Server Action

components/
  comments/
    CommentSection.tsx         — (Server) Wrapper: fetches + renders
    CommentList.tsx            — (Server) Recursive comment tree
    CommentItem.tsx            — (Server) Single comment display
    CommentForm.tsx            — (Client) Textarea + submit
    ReplyButton.tsx            — (Client) Toggle reply form

app/
  deals/
    [id]/
      page.tsx                 — Updated: now includes CommentSection
```

---

## 7. Design Notes (Revamp-Friendly)

- Comment tree building is a pure function (`buildCommentTree`) — not tied to any UI framework
- `CommentForm` is reused for both top-level and reply — same component, different props
- `CommentItem` renders `VoteButton` from Slice 4 — no vote logic duplicated
- Nesting is controlled by `depth` prop and simple `ml-8` indentation — easy to restyle
- All comment data comes as props — components don't fetch data directly

---

## Test Cases

### T5.1 — Top-Level Comments
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Post a comment | Type text, click "Comment" | Comment appears in list, form clears |
| 2 | Empty comment blocked | Click "Comment" with empty textarea | HTML required validation prevents submit |
| 3 | Long comment | Post 2000 characters | Comment displays correctly with text wrapping |
| 4 | Comment count updates | Post a new comment | Deal's comment count badge increases by 1 |
| 5 | Comment shows user info | Post a comment | Avatar, display name, and "just now" time shown |
| 6 | Comment form while logged out | Visit deal page logged out | "Sign in to comment" link shown instead of form |

### T5.2 — Reply Comments
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Reply button shows form | Click "Reply" on a comment | Inline textarea appears below the comment |
| 2 | Cancel reply | Click "Cancel" on reply form | Form disappears |
| 3 | Post a reply | Type text in reply form, submit | Reply appears nested under parent with `ml-8` indent |
| 4 | Reply to a reply | Reply to a depth-1 comment | Appears at depth 2 with double indent |
| 5 | Max depth reached | View a depth-2 comment | No "Reply" button shown (max depth) |
| 6 | Reply form auto-focuses | Click "Reply" | Textarea is focused, ready to type |
| 7 | Reply while logged out | Click "Reply" on a comment | Redirects to login |

### T5.3 — Comment Tree Structure
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Flat comments | Post 3 top-level comments | All 3 displayed at same level, no indentation |
| 2 | Nested tree | Post comment → reply → reply to reply | Three levels of nesting visible |
| 3 | Multiple replies to same parent | Post 3 replies to one comment | All 3 appear nested under the parent |
| 4 | Comment ordering | Post comments at different times | Top-level sorted by newest first (or oldest — confirm preference) |
| 5 | Deep thread flattening | Reply at depth 2 | Reply appears at depth 2 (max), not depth 3 |

### T5.4 — Comment Voting
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Upvote a comment | Click upvote on any comment | Arrow turns emerald, score +1 |
| 2 | Downvote a comment | Click downvote | Arrow turns red, score -1 |
| 3 | Toggle comment vote off | Click same vote again | Arrow returns to gray, score reverts |
| 4 | Vote state persists | Vote on comment, refresh page | Vote state preserved |
| 5 | Multiple comment votes | Vote on 3 different comments | Each has independent vote state |

### T5.5 — Comment Count Trigger
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Count increments | Post a comment | `deals.comment_count` +1 in database |
| 2 | Count on card | Post comment, go to homepage | Deal card shows updated comment count |
| 3 | Reply counts too | Post a reply | `deals.comment_count` still increments |

### T5.6 — Edge Cases
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | No comments yet | View deal with 0 comments | "0 Comments" heading, just the form |
| 2 | Whitespace-only comment | Enter only spaces | Prevented by `min(1)` after trim |
| 3 | Special characters | Post comment with <, >, &, quotes | Displayed correctly (escaped) |
| 4 | Rapid double submit | Click "Comment" twice quickly | Only one comment created |
