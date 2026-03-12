import type { ImageLoaderProps } from "next/image";

const SUPABASE_HOSTNAME = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

function isSupabaseUrl(url: string): boolean {
  try {
    return new URL(url).hostname === SUPABASE_HOSTNAME;
  } catch {
    return false;
  }
}

function wsrvUrl(src: string, width: number, quality: number): string {
  const params = new URLSearchParams({
    url: src,
    w: String(width),
    q: String(quality),
    output: "webp",
    n: "-1",
  });
  return `https://wsrv.nl/?${params.toString()}`;
}

/**
 * Custom next/image loader that proxies Supabase images through wsrv.nl.
 * Local assets (e.g. /logo.svg) pass through unchanged.
 */
export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  if (src.startsWith("/")) return src;
  if (SUPABASE_HOSTNAME && isSupabaseUrl(src)) return wsrvUrl(src, width, quality ?? 80);
  return src;
}

/**
 * Helper for non-next/image components (e.g. raw <img>, shadcn AvatarImage).
 */
export function getOptimizedImageUrl(
  src: string,
  opts: { width?: number; quality?: number } = {},
): string {
  if (!src || src.startsWith("/") || !SUPABASE_HOSTNAME || !isSupabaseUrl(src)) return src;

  const params = new URLSearchParams({ url: src, output: "webp", n: "-1" });
  if (opts.width) params.set("w", String(opts.width));
  if (opts.quality) params.set("q", String(opts.quality));
  return `https://wsrv.nl/?${params.toString()}`;
}
