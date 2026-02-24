"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareIconButtonProps {
  url: string;
  title: string;
  className?: string;
}

export function ShareIconButton({ url, title, className }: ShareIconButtonProps) {
  function getAbsoluteUrl() {
    if (url.startsWith("http")) return url;
    if (typeof window === "undefined") return url;
    return window.location.origin + url;
  }

  async function handleShare() {
    const absoluteUrl = getAbsoluteUrl();

    if (navigator.share) {
      try {
        await navigator.share({ title, text: title, url: absoluteUrl });
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        fallbackCopy(absoluteUrl);
      }
    } else {
      fallbackCopy(absoluteUrl);
    }
  }

  function fallbackCopy(absoluteUrl: string) {
    navigator.clipboard.writeText(absoluteUrl);
    toast.success("Link copied to clipboard!");
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Share deal"
      className={className}
    >
      <Share2 className="h-3.5 w-3.5" />
    </button>
  );
}
