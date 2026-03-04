import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return `AED ${amount.toFixed(2)}`;
}

export function formatPriceShort(amount: number): string {
  return `AED ${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
}

export function shortTimeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return `${Math.max(seconds, 0)}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(days / 365)}y`;
}

/** Strip markdown syntax for plain-text previews (e.g. feed cards). */
export function stripMarkdown(md: string): string {
  return md
    // fenced code blocks – strip ``` markers but keep content
    .replace(/```/g, "")
    // blockquotes
    .replace(/^>\s?/gm, "")
    // horizontal rules
    .replace(/^(?:-{3,}|\*{3,}|_{3,})\s*$/gm, "")
    .replace(/[*_~`]+/g, "")          // bold, italic, strikethrough, code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [text](url) → text
    .replace(/^#{1,6}\s+/gm, "")      // headings
    .replace(/^[-*+]\s+/gm, "")       // unordered list markers
    .replace(/^\d+\.\s+/gm, "")       // ordered list markers
    .replace(/\n{2,}/g, " ")          // collapse multiple newlines
    .trim();
}
