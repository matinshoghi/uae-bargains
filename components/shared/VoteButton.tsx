"use client";

import { useOptimistic, useTransition } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
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
  variant?: "horizontal" | "vertical";
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

  if (variant === "vertical") {
    return (
      <div className="flex flex-col items-center gap-px">
        <button
          onClick={(e) => handleVote(e, 1)}
          disabled={disabled || isPending}
          aria-label="Upvote"
          className={cn(
            "p-0.5 text-sm transition-all",
            disabled && "cursor-not-allowed opacity-50",
            optimistic.userVote === 1
              ? "scale-[1.15] text-[#7ab800]"
              : "text-muted-foreground/60 hover:text-foreground"
          )}
        >
          ▲
        </button>
        <span
          className={cn(
            "font-mono-display min-w-[28px] text-center text-base font-medium tabular-nums",
            netScore > 0 && "text-[#7ab800]",
            netScore < 0 && "text-destructive",
            netScore === 0 && "text-foreground"
          )}
        >
          {netScore}
        </span>
        <button
          onClick={(e) => handleVote(e, -1)}
          disabled={disabled || isPending}
          aria-label="Downvote"
          className={cn(
            "p-0.5 text-sm transition-all",
            disabled && "cursor-not-allowed opacity-50",
            optimistic.userVote === -1
              ? "text-destructive"
              : "text-muted-foreground/60 hover:text-foreground"
          )}
        >
          ▼
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-sm border border-foreground">
      <button
        onClick={(e) => handleVote(e, 1)}
        disabled={disabled || isPending}
        aria-label="Upvote"
        className={cn(
          "rounded-sm p-1.5 transition-colors",
          disabled && "cursor-not-allowed opacity-50",
          optimistic.userVote === 1
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <ChevronUp className="h-5 w-5" />
      </button>

      <span
        className={cn(
          "font-display min-w-[2ch] text-center text-sm font-bold tabular-nums",
          netScore > 0 && "text-foreground",
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
          "rounded-sm p-1.5 transition-colors",
          disabled && "cursor-not-allowed opacity-50",
          optimistic.userVote === -1
            ? "bg-destructive/10 text-destructive"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <ChevronDown className="h-5 w-5" />
      </button>
    </div>
  );
}
