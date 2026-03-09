"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Coupon code copied to clipboard!");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Unable to copy. Please copy manually.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copy coupon code ${code}`}
      className="group flex items-center gap-2 rounded-sm border-2 border-dashed border-foreground/30 bg-muted/40 px-3 py-2 font-mono text-sm font-semibold tracking-wide transition-colors hover:border-foreground/60 hover:bg-muted"
    >
      <span>{code}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-600" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
      )}
    </button>
  );
}
