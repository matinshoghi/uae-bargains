"use client";

import { useState, useTransition } from "react";
import { Flag } from "lucide-react";
import { reportDealExpired } from "@/lib/actions/deals";
import { toast } from "sonner";

interface ReportExpiredButtonProps {
  dealId: string;
  hasReported: boolean;
}

export function ReportExpiredButton({ dealId, hasReported }: ReportExpiredButtonProps) {
  const [reported, setReported] = useState(hasReported);
  const [isPending, startTransition] = useTransition();

  function handleReport() {
    startTransition(async () => {
      const result = await reportDealExpired(dealId);
      if (result.alreadyReported) {
        setReported(true);
        toast.info("You've already reported this deal");
      } else if (result.error) {
        toast.error(result.error);
      } else {
        setReported(true);
        toast.success("Thanks for the report");
      }
    });
  }

  if (reported) {
    return (
      <p className="flex items-center gap-1.5 font-mono-display text-xs text-muted-foreground">
        <Flag className="h-3.5 w-3.5" />
        You reported this deal
      </p>
    );
  }

  return (
    <button
      onClick={handleReport}
      disabled={isPending}
      className="flex items-center gap-1.5 font-mono-display text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
    >
      <Flag className="h-3.5 w-3.5" />
      {isPending ? "Reporting..." : "Deal expired?"}
    </button>
  );
}
