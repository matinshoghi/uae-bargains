# Comments Section Revamp — Reddit/Community Style

**Date:** 2026-02-21

## Summary

Revamped the comments section to a Reddit/community-style design with card-based comments, short timestamps, @username format, a three-dot action menu, and a sticky bottom input bar. Reduced comment nesting from 3 levels (depth 0–2) to 2 levels (depth 0–1) and cleaned up all related code.

## Changes

### Created

- **`components/comments/CommentMenu.tsx`** — Client component for the three-dot dropdown menu on each comment. Uses shadcn DropdownMenu. Shows Report for all users, Edit + Delete for the comment author (placeholder toast actions).

### Modified

- **`lib/utils.ts`** — Added `shortTimeAgo()` utility that converts ISO date strings to compact relative timestamps (e.g., "5s", "3m", "2h", "1d", "3mo", "1y").

- **`lib/actions/comments.ts`** — Changed max depth cap from 2 to 1, enforcing single-level reply nesting only.

- **`components/comments/CommentItem.tsx`** — Major UI revamp:
  - Card-style container (`rounded-xl bg-zinc-50/60`) for top-level comments
  - @username format with short timestamps
  - Larger avatars (h-8 w-8) for top-level, smaller (h-6 w-6) for replies
  - Action row: vote buttons + Reply + three-dot menu (pushed right with `ml-auto`)
  - Reply button only shown on depth-0 comments
  - Accepts `currentUserId` prop for author detection
  - Removed all depth-2 logic

- **`components/comments/CommentForm.tsx`** — Dual-mode form:
  - **Sticky mode**: Fixed bottom bar with rounded text input + "Post" button. Positioned above MobileNav on mobile. Logged-out users redirected to /login on focus.
  - **Inline mode**: Existing textarea + submit/cancel for replies.

- **`components/comments/ReplyButton.tsx`** — Updated text styling from `text-xs` to `text-sm font-medium`. Passes `isLoggedIn` to inline CommentForm.

- **`components/comments/CommentList.tsx`** — Added `currentUserId` prop passthrough. Changed spacing from `space-y-1` to `space-y-3`.

- **`components/comments/CommentSection.tsx`** — Changed prop from `isLoggedIn` to `currentUserId`. Removed inline comment form and "Sign in to comment" text. Renders sticky CommentForm. Added `pb-24` padding for sticky bar clearance.

- **`app/deals/[id]/page.tsx`** — Passes `currentUserId={user?.id ?? null}` to CommentSection.

## Comment Layout

```
┌─────────────────────────────────────────┐
│ [Avatar] @username          2h          │
│                                         │
│ Comment content text here...            │
│                                         │
│ ▲ 2 ▼   Reply                     ...  │
│                                         │
│   │ [Avatar] @replier       1h          │
│   │                                     │
│   │ Reply content...                    │
│   │                                     │
│   │ ▲ 1 ▼                         ...  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Add a comment...              [Post]   │
└─────────────────────────────────────────┘  ← sticky bottom bar
```

## Notes

- Edit and Delete actions in the three-dot menu are placeholder (show "Coming soon" toast). Server actions for these need to be implemented separately.
- The sticky comment bar uses `z-40` and sits below MobileNav (`z-50`) on mobile, positioned with `bottom-[calc(3.5rem+env(safe-area-inset-bottom))]`.
- GIF/image attachment buttons from the design reference are not implemented (text-only comments for now).
