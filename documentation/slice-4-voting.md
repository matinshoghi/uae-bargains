# Slice 4 — Voting System

> **Goal:** Upvote/downvote on deals and comments with optimistic UI and the revocation system foundation.
> **Duration:** Days 7–9
> **Depends on:** Slice 3 (feed with deal cards)

---

## Overview

This slice brings the deal cards and detail page to life with interactive voting. Users can upvote or downvote deals (and later comments in Slice 5). Votes update instantly via optimistic UI and persist to Supabase. The negative vote revocation system is implemented as a background process.

---

## 1. Core Vote Mechanics

### User Interaction Matrix

| Current State | Action | Result |
|---------------|--------|--------|
| No vote | Click upvote | Vote +1 created |
| No vote | Click downvote | Vote -1 created |
| Upvoted | Click upvote | Vote removed (toggle off) |
| Upvoted | Click downvote | Vote changes to -1 |
| Downvoted | Click downvote | Vote removed (toggle off) |
| Downvoted | Click upvote | Vote changes to +1 |
| Not logged in | Click either | Redirect to `/login` |

---

## 2. Server Actions — `lib/actions/votes.ts`

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function voteDeal(dealId: string, voteType: 1 | -1) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be signed in to vote");

  // Check for existing vote
  const { data: existing } = await supabase
    .from("votes")
    .select("id, vote_type")
    .eq("user_id", user.id)
    .eq("deal_id", dealId)
    .maybeSingle();

  if (existing) {
    if (existing.vote_type === voteType) {
      // Toggle off — remove vote
      await supabase.from("votes").delete().eq("id", existing.id);
    } else {
      // Switch vote direction
      await supabase.from("votes").update({ vote_type: voteType }).eq("id", existing.id);
    }
  } else {
    // New vote
    await supabase.from("votes").insert({
      user_id: user.id,
      deal_id: dealId,
      vote_type: voteType,
    });
  }

  revalidatePath("/");
}

export async function voteComment(commentId: string, voteType: 1 | -1) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be signed in to vote");

  const { data: existing } = await supabase
    .from("votes")
    .select("id, vote_type")
    .eq("user_id", user.id)
    .eq("comment_id", commentId)
    .maybeSingle();

  if (existing) {
    if (existing.vote_type === voteType) {
      await supabase.from("votes").delete().eq("id", existing.id);
    } else {
      await supabase.from("votes").update({ vote_type: voteType }).eq("id", existing.id);
    }
  } else {
    await supabase.from("votes").insert({
      user_id: user.id,
      comment_id: commentId,
      vote_type: voteType,
    });
  }
}
```

---

## 3. Shared Vote Button — `components/shared/VoteButton.tsx`

**Client Component** — reusable for both deals and comments.

**Props:**
```typescript
interface VoteButtonProps {
  entityType: "deal" | "comment";
  entityId: string;
  upvoteCount: number;
  downvoteCount: number;
  userVote: 1 | -1 | null; // null = no vote
}
```

**Implementation approach using React 19 `useOptimistic`:**

```typescript
"use client";

import { useOptimistic, useTransition } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { voteDeal, voteComment } from "@/lib/actions/votes";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface VoteState {
  upvoteCount: number;
  downvoteCount: number;
  userVote: 1 | -1 | null;
}

export function VoteButton({
  entityType,
  entityId,
  upvoteCount,
  downvoteCount,
  userVote,
  isLoggedIn,
}: VoteButtonProps & { isLoggedIn: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [optimistic, setOptimistic] = useOptimistic<VoteState, 1 | -1>(
    { upvoteCount, downvoteCount, userVote },
    (state, newVote) => {
      const wasUpvoted = state.userVote === 1;
      const wasDownvoted = state.userVote === -1;

      if (newVote === 1) {
        if (wasUpvoted) {
          // Toggle off upvote
          return { ...state, upvoteCount: state.upvoteCount - 1, userVote: null };
        }
        return {
          upvoteCount: state.upvoteCount + 1,
          downvoteCount: wasDownvoted ? state.downvoteCount - 1 : state.downvoteCount,
          userVote: 1,
        };
      } else {
        if (wasDownvoted) {
          // Toggle off downvote
          return { ...state, downvoteCount: state.downvoteCount - 1, userVote: null };
        }
        return {
          downvoteCount: state.downvoteCount + 1,
          upvoteCount: wasUpvoted ? state.upvoteCount - 1 : state.upvoteCount,
          userVote: -1,
        };
      }
    }
  );

  function handleVote(voteType: 1 | -1) {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    startTransition(async () => {
      setOptimistic(voteType);
      if (entityType === "deal") {
        await voteDeal(entityId, voteType);
      } else {
        await voteComment(entityId, voteType);
      }
    });
  }

  const netScore = optimistic.upvoteCount - optimistic.downvoteCount;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleVote(1)}
        disabled={isPending}
        aria-label="Upvote"
        className={cn(
          "p-1.5 rounded-md transition-colors",
          optimistic.userVote === 1
            ? "text-emerald-600 bg-emerald-50"
            : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50"
        )}
      >
        <ChevronUp className="h-5 w-5" />
      </button>

      <span className={cn(
        "text-sm font-semibold min-w-[2ch] text-center tabular-nums",
        netScore > 0 && "text-emerald-600",
        netScore < 0 && "text-red-500",
        netScore === 0 && "text-zinc-400"
      )}>
        {netScore}
      </span>

      <button
        onClick={() => handleVote(-1)}
        disabled={isPending}
        aria-label="Downvote"
        className={cn(
          "p-1.5 rounded-md transition-colors",
          optimistic.userVote === -1
            ? "text-red-500 bg-red-50"
            : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50"
        )}
      >
        <ChevronDown className="h-5 w-5" />
      </button>
    </div>
  );
}
```

**Visual states:**
- Default: `text-zinc-400` (gray arrows)
- Upvoted: upvote arrow `text-emerald-600 bg-emerald-50`, score `text-emerald-600`
- Downvoted: downvote arrow `text-red-500 bg-red-50`, score `text-red-500`
- Pending: buttons disabled, no visual change (optimistic state already updated)

---

## 4. Fetching User Votes

To show the correct initial state (upvoted/downvoted/none), we need to fetch the current user's votes.

### On the Homepage/Feed

For the feed, fetch all the user's deal votes in a single query, then map them to each card:

```typescript
// In the page Server Component
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

let userVotes: Record<string, number> = {};
if (user) {
  const { data: votes } = await supabase
    .from("votes")
    .select("deal_id, vote_type")
    .eq("user_id", user.id)
    .not("deal_id", "is", null);

  if (votes) {
    userVotes = Object.fromEntries(
      votes.map((v) => [v.deal_id, v.vote_type])
    );
  }
}

// Pass to DealCard
<DealCard deal={deal} userVote={userVotes[deal.id] ?? null} isLoggedIn={!!user} />
```

### On the Deal Detail Page

Fetch votes for the deal AND all its comments in one go:

```typescript
// Fetch deal votes + comment votes for current user
const { data: votes } = await supabase
  .from("votes")
  .select("deal_id, comment_id, vote_type")
  .eq("user_id", user.id)
  .or(`deal_id.eq.${dealId},comment_id.not.is.null`);
```

---

## 5. Integrating Vote Button into Deal Card

Update `DealCard.tsx` from Slice 3 to include the interactive `VoteButton`:

```typescript
// components/deals/DealCard.tsx (updated)
import { VoteButton } from "@/components/shared/VoteButton";

export function DealCard({
  deal,
  userVote,
  isLoggedIn,
}: {
  deal: Deal;
  userVote: 1 | -1 | null;
  isLoggedIn: boolean;
}) {
  return (
    <div className="...card styles...">
      <VoteButton
        entityType="deal"
        entityId={deal.id}
        upvoteCount={deal.upvote_count}
        downvoteCount={deal.downvote_count}
        userVote={userVote}
        isLoggedIn={isLoggedIn}
      />
      {/* ...rest of card content... */}
    </div>
  );
}
```

**Important:** The card itself remains a Server Component. The VoteButton is a Client Component rendered inside it. This is the React Server Component composition pattern — Server Components can render Client Components as children.

---

## 6. Negative Vote Revocation System

### 6.1 Philosophy

The revocation system prevents drive-by downvoting. If a deal receives enough community defense (upvoted comments supporting it), downvotes lose their weight.

### 6.2 MVP Implementation

**Simple approach:** a database function that calculates a `revocation_factor` for each deal. This factor reduces the effective weight of downvotes.

```sql
-- Add revocation factor column to deals
ALTER TABLE deals ADD COLUMN revocation_factor FLOAT DEFAULT 1.0;

-- Function to recalculate revocation factor
CREATE OR REPLACE FUNCTION recalculate_revocation_factor(p_deal_id UUID)
RETURNS VOID AS $$
DECLARE
  dissenting_count INTEGER;
BEGIN
  -- Count "dissenting" comments: comments with 3+ upvotes
  -- (community-validated feedback that supports the deal)
  SELECT COUNT(*) INTO dissenting_count
  FROM comments
  WHERE deal_id = p_deal_id AND upvote_count >= 3;

  -- Factor decreases from 1.0 toward 0 as dissenting comments grow
  -- At 9+ dissenting comments, factor reaches 0 (downvotes fully revoked)
  UPDATE deals
  SET revocation_factor = GREATEST(0.0, 1.0 - (dissenting_count::FLOAT / 9.0))
  WHERE id = p_deal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 6.3 When to Recalculate

- **On comment vote change:** When a comment's upvote_count crosses the 3+ threshold
- **Via cron:** Every 15 minutes alongside hot score recalculation

```sql
-- Add to the existing cron job
SELECT cron.schedule(
  'recalculate-revocation',
  '*/15 * * * *',
  $$
  SELECT recalculate_revocation_factor(id) FROM deals WHERE status = 'active' AND downvote_count > 0
  $$
);
```

### 6.4 Display Logic

The net score displayed to users accounts for revocation:

```typescript
// Effective score calculation
function getEffectiveScore(deal: Deal): number {
  const effectiveDownvotes = Math.round(deal.downvote_count * deal.revocation_factor);
  return deal.upvote_count - effectiveDownvotes;
}
```

For MVP, show the effective score as the main number. Don't show the raw counts or revocation status — keep it simple for users.

### 6.5 5x Comments Rule

If a single user has made 5+ comments on a deal and also downvoted it, their downvote is marked as revoked:

```sql
-- Trigger: after comment insert, check if commenter should have downvote revoked
CREATE OR REPLACE FUNCTION check_commenter_vote_revocation()
RETURNS TRIGGER AS $$
DECLARE
  comment_count INTEGER;
BEGIN
  -- Count comments by this user on this deal
  SELECT COUNT(*) INTO comment_count
  FROM comments
  WHERE deal_id = NEW.deal_id AND user_id = NEW.user_id;

  -- If 5+ comments, revoke their downvote on this deal
  IF comment_count >= 5 THEN
    UPDATE votes
    SET is_revoked = TRUE
    WHERE deal_id = NEW.deal_id
      AND user_id = NEW.user_id
      AND vote_type = -1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_check_revocation
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION check_commenter_vote_revocation();
```

---

## 7. File Structure After This Slice

```
lib/
  actions/
    votes.ts                   — voteDeal, voteComment Server Actions

components/
  shared/
    VoteButton.tsx             — (Client) Reusable vote UI with optimistic updates
```

Updates to existing files:
- `components/deals/DealCard.tsx` — now includes VoteButton
- `app/page.tsx` — now fetches user votes and passes to cards
- `app/deals/[id]/page.tsx` — now fetches user votes
- `app/category/[slug]/page.tsx` — now fetches user votes

---

## 8. Design Notes (Revamp-Friendly)

- `VoteButton` is fully self-contained — takes primitive props, no Supabase dependency
- Vote logic (optimistic state transitions) is inside the component — easy to test and restyle
- Server Actions are thin — validation + Supabase call + revalidate. No business logic beyond the toggle.
- The revocation factor is a database concern — the UI just reads `revocation_factor` and computes a display score. No complex client-side revocation logic.
- Color tokens (`emerald-600`, `red-500`, `zinc-400`) can be changed in one place during revamp

---

## Test Cases

### T4.1 — Upvote Mechanics
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Upvote a deal | Click upvote arrow on any deal | Arrow turns emerald, score increases by 1 |
| 2 | Toggle upvote off | Click upvote again on same deal | Arrow returns to gray, score decreases by 1 |
| 3 | Switch upvote to downvote | Upvote a deal, then click downvote | Upvote arrow gray, downvote arrow red, score decreases by 2 |
| 4 | Optimistic update | Click upvote | Score updates instantly (before server response) |
| 5 | Persistence | Upvote, refresh page | Vote state persists — arrow still emerald |

### T4.2 — Downvote Mechanics
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Downvote a deal | Click downvote arrow | Arrow turns red, score decreases by 1 |
| 2 | Toggle downvote off | Click downvote again | Arrow returns to gray, score increases by 1 |
| 3 | Switch downvote to upvote | Downvote, then click upvote | Score increases by 2, upvote arrow emerald |

### T4.3 — Auth Gate
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Vote while logged out | Click upvote/downvote without being signed in | Redirected to `/login` |
| 2 | Vote after login | Sign in, return to deal, upvote | Vote registers correctly |
| 3 | Different users, same deal | User A upvotes, User B downvotes | Each user's vote is independent, counts reflect both |

### T4.4 — Vote Count Triggers
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Insert upvote | Upvote a deal | `deals.upvote_count` incremented by 1 in database |
| 2 | Insert downvote | Downvote a deal | `deals.downvote_count` incremented by 1 in database |
| 3 | Delete vote | Toggle off a vote | Corresponding count decremented by 1 |
| 4 | Update vote | Switch from up to down | upvote_count -1, downvote_count +1 in one operation |
| 5 | Hot score updated | Upvote a deal | `deals.hot_score` recalculated (check value changed) |

### T4.5 — Feed Vote Display
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | User votes visible in feed | Upvote deal A and downvote deal B, visit homepage | Deal A shows emerald upvote, deal B shows red downvote |
| 2 | No votes for logged-out | Visit homepage logged out | All vote buttons gray, no active states |
| 3 | Score colors | Deal with net positive, zero, and negative | Positive: emerald, zero: gray, negative: red |

### T4.6 — Duplicate Vote Prevention
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Double upvote | Rapidly click upvote twice | Only one vote recorded in database |
| 2 | Cross-tab consistency | Upvote in tab A, check tab B | Tab B shows the vote after refresh |

### T4.7 — Revocation System
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Revocation factor default | New deal with no comments | `revocation_factor` is 1.0 |
| 2 | Factor decreases | Deal has 5 comments with 3+ upvotes each | `revocation_factor` is ~0.44 |
| 3 | Full revocation | Deal has 9+ qualifying comments | `revocation_factor` is 0.0 |
| 4 | 5x comments rule | User makes 5 comments on deal they downvoted | Their downvote `is_revoked` becomes TRUE |
| 5 | Effective score display | Deal: 10 up, 5 down, factor 0.5 | Displayed score: 10 - (5 * 0.5) = 8 |

### T4.8 — Comment Voting (prepared for Slice 5)
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | voteComment action exists | Import and call with valid params | No error, vote created in database |
| 2 | Comment vote toggle | Call twice with same params | Vote created then removed |
