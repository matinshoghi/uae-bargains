"use client";

import { useOptimistic, useTransition } from "react";
import { voteDeal, voteComment, voteDealAnonymous } from "@/lib/actions/votes";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ALLOW_ANONYMOUS_VOTES,
  ANON_VOTE_MODAL_INTERVAL,
} from "@/lib/constants";

interface VoteButtonProps {
  entityType: "deal" | "comment";
  entityId: string;
  upvoteCount: number;
  downvoteCount: number;
  userVote: 1 | -1 | null;
  isLoggedIn: boolean;
  disabled?: boolean;
  variant?: "horizontal" | "detail" | "inline";
}

interface VoteState {
  upvoteCount: number;
  downvoteCount: number;
  userVote: 1 | -1 | null;
}

// localStorage helpers for anonymous vote tracking
function getAnonVoteCount(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem("anon_vote_count") ?? "0", 10);
}

function incrementAnonVoteCount(): number {
  const count = getAnonVoteCount() + 1;
  localStorage.setItem("anon_vote_count", String(count));
  return count;
}

// ── Arrow Icons (filled) ────────────────────────────────────

function ArrowUp({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4l-8 9h5v7h6v-7h5z" />
    </svg>
  );
}

function ArrowDown({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 20l8-9h-5V4H9v7H4z" />
    </svg>
  );
}

export function VoteButton({
  entityType,
  entityId,
  upvoteCount,
  downvoteCount,
  userVote,
  isLoggedIn,
  disabled = false,
  variant = "horizontal",
}: VoteButtonProps) {
  const { openAuthModal } = useAuthModal();
  const [isPending, startTransition] = useTransition();

  const [optimistic, setOptimistic] = useOptimistic<VoteState, 1 | -1>(
    { upvoteCount, downvoteCount, userVote },
    (state, newVote) => {
      const wasUpvoted = state.userVote === 1;
      const wasDownvoted = state.userVote === -1;

      if (newVote === 1) {
        if (wasUpvoted) {
          return { ...state, upvoteCount: state.upvoteCount - 1, userVote: null };
        }
        return {
          upvoteCount: state.upvoteCount + 1,
          downvoteCount: wasDownvoted ? state.downvoteCount - 1 : state.downvoteCount,
          userVote: 1 as const,
        };
      } else {
        if (wasDownvoted) {
          return { ...state, downvoteCount: state.downvoteCount - 1, userVote: null };
        }
        return {
          downvoteCount: state.downvoteCount + 1,
          upvoteCount: wasUpvoted ? state.upvoteCount - 1 : state.upvoteCount,
          userVote: -1 as const,
        };
      }
    }
  );

  function handleVote(e: React.MouseEvent, voteType: 1 | -1) {
    e.preventDefault();
    e.stopPropagation();

    // Comment votes always require auth
    if (!isLoggedIn && entityType === "comment") {
      openAuthModal({ message: "Sign in to vote on comments" });
      return;
    }

    // Deal votes: allow anonymous if feature flag is on
    if (!isLoggedIn && entityType === "deal") {
      if (!ALLOW_ANONYMOUS_VOTES) {
        openAuthModal({ message: "Sign in to vote on this deal" });
        return;
      }

      startTransition(async () => {
        setOptimistic(voteType);
        const result = await voteDealAnonymous(entityId, voteType);

        if (result.rateLimited) {
          toast.error("Daily vote limit reached. Sign up for unlimited votes!", {
            action: {
              label: "Sign Up",
              onClick: () => openAuthModal({ message: "Create an account for unlimited voting" }),
            },
          });
          return;
        }

        // No nudge on toggle-off — the user is removing their vote
        if (result.action === "removed") return;

        // Nudge: show modal every Nth vote, otherwise toast
        const count = incrementAnonVoteCount();
        if (count % ANON_VOTE_MODAL_INTERVAL === 0) {
          openAuthModal({ message: "You're on a roll! Sign up to save your votes and unlock all features." });
        } else {
          toast("Vote saved!", {
            description: "Sign up to keep your votes forever.",
            action: {
              label: "Sign Up",
              onClick: () => openAuthModal(),
            },
          });
        }
      });
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
  const voteState = optimistic.userVote === 1 ? "up" : optimistic.userVote === -1 ? "down" : null;

  // ── Inline variant (comments) ──────────────────────────────

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => handleVote(e, 1)}
          disabled={disabled || isPending}
          aria-label="Upvote"
          className={cn(
            "p-1 font-mono-display text-xs transition-colors",
            disabled && "cursor-not-allowed opacity-50",
            optimistic.userVote === 1
              ? "font-bold text-[#7ab800]"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          ▲
        </button>
        <span
          className={cn(
            "min-w-[1.5ch] text-center font-mono-display text-xs font-medium tabular-nums",
            netScore > 0 && "text-[#7ab800]",
            netScore < 0 && "text-destructive",
            netScore === 0 && "text-muted-foreground"
          )}
        >
          {netScore}
        </span>
        <button
          onClick={(e) => handleVote(e, -1)}
          disabled={disabled || isPending}
          aria-label="Downvote"
          className={cn(
            "p-1 font-mono-display text-xs transition-colors",
            disabled && "cursor-not-allowed opacity-50",
            optimistic.userVote === -1
              ? "font-bold text-destructive"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          ▼
        </button>
      </div>
    );
  }

  // ── Pill variants (horizontal = list card, detail = detail page) ──

  const isDetail = variant === "detail";
  const btnSize = isDetail ? "h-[46px] w-[46px]" : "h-[34px] w-[34px]";
  const arrowSize = isDetail ? 18 : 13;
  const scoreFontSize = isDetail ? "text-xl" : "text-[15px]";
  const scoreMinWidth = isDetail ? "min-w-[56px]" : "min-w-[38px]";
  const scoreHeight = isDetail ? "h-[46px]" : "h-[34px]";
  const borderWidth = isDetail ? "border-2" : "border-[1.5px]";
  const dividerWidth = isDetail ? "border-r-[1.5px]" : "border-r";
  const dividerWidthLeft = isDetail ? "border-l-[1.5px]" : "border-l";
  const labelSize = isDetail ? "text-[10px]" : "text-[9px]";
  const gap = isDetail ? "gap-[5px]" : "gap-[3px]";

  const borderColor =
    voteState === "up" ? "border-[#a3e635]" :
    voteState === "down" ? "border-[#ef4444]" :
    "border-[#d4d4d4]";

  const upDividerColor = voteState === "up" ? "border-r-[#84cc16]" : "border-r-[#e5e5e5]";
  const downDividerColor = voteState === "down" ? "border-l-[#fca5a5]" : "border-l-[#e5e5e5]";

  return (
    <div className={cn("flex flex-col items-center", gap)}>
      <div
        className={cn(
          "flex items-center overflow-hidden bg-white transition-[border-color] duration-150 ease-in-out",
          borderWidth,
          borderColor
        )}
      >
        {/* Up arrow */}
        <button
          onClick={(e) => handleVote(e, 1)}
          disabled={disabled || isPending}
          title="Good deal — vote up"
          aria-label="Upvote"
          className={cn(
            "flex items-center justify-center cursor-pointer border-none transition-all duration-[120ms] ease-in-out",
            btnSize,
            dividerWidth,
            upDividerColor,
            disabled && "cursor-not-allowed opacity-50",
            voteState === "up"
              ? "bg-[#a3e635] text-[#1a1a1a]"
              : "bg-transparent text-[#a3a3a3] hover:bg-[#f5f5f5] hover:text-[#525252]"
          )}
        >
          <ArrowUp size={arrowSize} />
        </button>

        {/* Score */}
        <div
          className={cn(
            "flex items-center justify-center px-1 font-mono-display font-bold select-none tabular-nums transition-colors duration-150 ease-in-out",
            scoreMinWidth,
            scoreHeight,
            scoreFontSize,
            voteState === "up" ? "text-[#365314]" :
            voteState === "down" ? "text-[#b91c1c]" :
            "text-[#1a1a1a]"
          )}
        >
          {netScore}
        </div>

        {/* Down arrow */}
        <button
          onClick={(e) => handleVote(e, -1)}
          disabled={disabled || isPending}
          title="Bad deal — vote down"
          aria-label="Downvote"
          className={cn(
            "flex items-center justify-center cursor-pointer border-none transition-all duration-[120ms] ease-in-out",
            btnSize,
            dividerWidthLeft,
            downDividerColor,
            disabled && "cursor-not-allowed opacity-50",
            voteState === "down"
              ? "bg-[#fecaca] text-[#b91c1c]"
              : "bg-transparent text-[#a3a3a3] hover:bg-[#f5f5f5] hover:text-[#525252]"
          )}
        >
          <ArrowDown size={arrowSize} />
        </button>
      </div>

      {/* VOTES label */}
      <span
        className={cn(
          "font-mono-display font-bold uppercase tracking-[0.12em] text-[#a3a3a3]",
          labelSize
        )}
      >
        votes
      </span>
    </div>
  );
}
