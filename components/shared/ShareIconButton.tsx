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

  function appendUtm(absoluteUrl: string, source: string): string {
    const u = new URL(absoluteUrl);
    u.searchParams.set("utm_source", source);
    u.searchParams.set("utm_medium", "share");
    return u.toString();
  }

  async function handleShare() {
    const shareUrl = appendUtm(getAbsoluteUrl(), "native_share");

    if (navigator.share) {
      try {
        await navigator.share({ title, text: title, url: shareUrl });
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        fallbackCopy();
      }
    } else {
      fallbackCopy();
    }
  }

  function fallbackCopy() {
    const shareUrl = appendUtm(getAbsoluteUrl(), "copy_link");
    navigator.clipboard.writeText(shareUrl);
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
