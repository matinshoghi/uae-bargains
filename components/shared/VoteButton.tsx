"use client";

import { useOptimistic, useTransition } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { voteDeal, voteComment } from "@/lib/actions/votes";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface VoteButtonProps {
  entityType: "deal" | "comment";
  entityId: string;
  upvoteCount: number;
  downvoteCount: number;
  userVote: 1 | -1 | null;
  isLoggedIn: boolean;
}

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
}: VoteButtonProps) {
  const router = useRouter();
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
        onClick={(e) => handleVote(e, 1)}
        disabled={isPending}
        aria-label="Upvote"
        className={cn(
          "rounded-sm p-1.5 transition-colors",
          optimistic.userVote === 1
            ? "bg-primary/20 text-primary-foreground"
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
        disabled={isPending}
        aria-label="Downvote"
        className={cn(
          "rounded-sm p-1.5 transition-colors",
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
