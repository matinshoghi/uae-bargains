"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface PromoCodeBadgeProps {
  code: string;
}

export function PromoCodeBadge({ code }: PromoCodeBadgeProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Promo code saved to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Unable to copy. Please copy manually.");
    }
  }

  if (!code.trim()) return null;

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group relative flex w-full items-center justify-between rounded-sm border-2 border-dashed border-foreground/30 bg-muted/40 px-4 py-3 text-left transition-colors hover:border-foreground/60 hover:bg-muted"
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Promo code
        </span>
        <span className="font-mono text-lg font-semibold tracking-wide">
          {code.trim()}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {copied ? "Saved to clipboard" : "Tap to copy and use at checkout"}
        </span>
      </div>
      <div className="ml-4 flex h-9 w-9 items-center justify-center rounded-full border border-foreground/40 bg-background text-foreground shadow-sm group-hover:border-foreground">
        <Copy className="h-4 w-4" />
      </div>
    </button>
  );
}

