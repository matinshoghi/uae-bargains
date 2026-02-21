/**
 * Extracts a preview image URL from a given page URL.
 * Tries og:image, twitter:image, then site-specific patterns (e.g. Amazon).
 * Returns null if unreachable or no image found. Never throws.
 */
export async function extractOgImage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "identity",
      },
      redirect: "follow",
    });

    if (!response.ok) return null;

    const html = await response.text();
    return parseImage(html);
  } catch {
    return null;
  }
}

/**
 * Parses an image URL from raw HTML using a fallback chain:
 * 1. og:image meta tag
 * 2. twitter:image meta tag
 * 3. Amazon product image (data-a-dynamic-image on #landingImage)
 * 4. link[rel="image_src"]
 */
function parseImage(html: string): string | null {
  // 1. Try og:image
  const ogMatch = html.match(
    /<meta[^>]+(?:property=["']og:image["'][^>]+content=["']([^"']+)["']|content=["']([^"']+)["'][^>]+property=["']og:image["'])/i
  );
  if (ogMatch) {
    const url = ogMatch[1] || ogMatch[2];
    if (url && isValidImageUrl(url)) return url;
  }

  // 2. Try twitter:image
  const twMatch = html.match(
    /<meta[^>]+(?:(?:name|property)=["']twitter:image["'][^>]+content=["']([^"']+)["']|content=["']([^"']+)["'][^>]+(?:name|property)=["']twitter:image["'])/i
  );
  if (twMatch) {
    const url = twMatch[1] || twMatch[2];
    if (url && isValidImageUrl(url)) return url;
  }

  // 3. Try Amazon product image (landingImage with data-a-dynamic-image)
  const amazonMatch = html.match(
    /id=["']landingImage["'][^>]+data-a-dynamic-image=["'][{]&quot;(https:\/\/[^&]+)&quot;/i
  );
  if (amazonMatch?.[1] && isValidImageUrl(amazonMatch[1])) {
    return amazonMatch[1];
  }

  // 4. Try link[rel="image_src"]
  const linkMatch = html.match(
    /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i
  );
  if (linkMatch?.[1] && isValidImageUrl(linkMatch[1])) {
    return linkMatch[1];
  }

  return null;
}

function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}
