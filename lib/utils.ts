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

export function getUrlHostname(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

export function wrapText(text: string, lineLength = 100): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const words = normalized.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length <= lineLength) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }
    currentLine = word;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
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
    // HTML tags
    .replace(/<[^>]+>/g, "")
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
