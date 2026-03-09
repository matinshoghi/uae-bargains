"use client";

import { useTransition } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { submitCouponFeedback } from "@/lib/actions/coupons";

export function CouponFeedback({
  couponId,
  successCount,
  failCount,
  userFeedback,
}: {
  couponId: string;
  successCount: number;
  failCount: number;
  userFeedback: boolean | null;
}) {
  const [isPending, startTransition] = useTransition();
  const totalVotes = successCount + failCount;
  const successRate =
    totalVotes >= 3 ? Math.round((successCount / totalVotes) * 100) : null;

  function handleFeedback(worked: boolean) {
    startTransition(async () => {
      await submitCouponFeedback(couponId, worked);
    });
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground">Did this work?</span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleFeedback(true)}
          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors disabled:opacity-50 ${
            userFeedback === true
              ? "bg-green-100 text-green-700"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
          title="Yes, it worked"
        >
          <ThumbsUp className="h-3 w-3" />
          {successCount > 0 && <span>{successCount}</span>}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleFeedback(false)}
          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors disabled:opacity-50 ${
            userFeedback === false
              ? "bg-red-100 text-red-700"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
          title="No, it didn't work"
        >
          <ThumbsDown className="h-3 w-3" />
          {failCount > 0 && <span>{failCount}</span>}
        </button>
      </div>
      {successRate !== null && (
        <span className="text-xs text-muted-foreground">
          {successRate}% success
        </span>
      )}
    </div>
  );
}
