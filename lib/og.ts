import { optimizeImage } from "@/lib/images";

/**
 * Extracts a preview image URL from a given page URL.
 * Tries og:image, twitter:image, site-specific patterns, apple-touch-icon.
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
    return parseImage(html, url);
  } catch (e) {
    console.error("[og] failed to extract image from", url, e);
    return null;
  }
}

/**
 * Full image-capture pipeline for a deal URL.
 * 1. Try meta-tag extraction (og:image → twitter:image → etc.)
 * 2. Fallback: website screenshot via thum.io
 *
 * Downloads, optimizes, and uploads the result to Supabase Storage.
 * Returns the public URL or null.
 */
export async function captureImageForDeal(
  dealUrl: string,
  userId: string,
  supabase: { storage: { from: (bucket: string) => { upload: (path: string, body: Buffer, opts: { contentType: string }) => Promise<{ error: Error | null }>; getPublicUrl: (path: string) => { data: { publicUrl: string } } } } }
): Promise<string | null> {
  // Step 1: Try meta-tag extraction (og:image, twitter:image, etc.)
  const imageUrl = await extractOgImage(dealUrl);

  // Build ordered list of image sources to try
  const sources: { url: string; timeout: number }[] = [];

  if (imageUrl) {
    sources.push({ url: imageUrl, timeout: 10_000 });
  }

  // Step 2: thum.io screenshot (slow — needs full page render)
  sources.push({ url: screenshotUrl(dealUrl), timeout: 30_000 });

  // Step 3: Google high-res favicon as last resort
  const domain = safeDomain(dealUrl);
  if (domain) {
    sources.push({
      url: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
      timeout: 5_000,
    });
  }

  for (const source of sources) {
    const result = await downloadAndUpload(source.url, source.timeout, userId, dealUrl, supabase);
    if (result) return result;
  }

  return null;
}

/** Download an image, optimize it, and upload to Supabase Storage. */
async function downloadAndUpload(
  sourceUrl: string,
  timeout: number,
  userId: string,
  dealUrl: string,
  supabase: { storage: { from: (bucket: string) => { upload: (path: string, body: Buffer, opts: { contentType: string }) => Promise<{ error: Error | null }>; getPublicUrl: (path: string) => { data: { publicUrl: string } } } } }
): Promise<string | null> {
  try {
    const imgResponse = await fetch(sourceUrl, {
      signal: AbortSignal.timeout(timeout),
    });
    if (!imgResponse.ok) return null;

    const rawBuffer = await imgResponse.arrayBuffer();
    if (rawBuffer.byteLength < 100) return null; // skip empty/tiny responses

    const optimized = await optimizeImage(rawBuffer);
    const filePath = `${userId}/${crypto.randomUUID()}.${optimized.ext}`;

    const { error: uploadError } = await supabase.storage
      .from("deal-images")
      .upload(filePath, optimized.buffer, { contentType: optimized.contentType });

    if (uploadError) {
      console.error("[og] upload failed for", dealUrl, uploadError);
      return null;
    }

    const { data: publicUrl } = supabase.storage
      .from("deal-images")
      .getPublicUrl(filePath);

    return publicUrl.publicUrl;
  } catch (e) {
    console.error("[og] download failed for", sourceUrl, e);
    return null;
  }
}

/** Generate a thum.io screenshot URL for the given page. */
function screenshotUrl(pageUrl: string): string {
  // noanimate: return a fully-rendered PNG instead of a streaming GIF
  return `https://image.thum.io/get/noanimate/width/1200/crop/630/${pageUrl}`;
}

/** Safely extract the domain from a URL. */
function safeDomain(url: string): string | null {
  try {
    return new URL(url).hostname;
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
 * 5. apple-touch-icon
 */
function parseImage(html: string, pageUrl: string): string | null {
  // 1. Try og:image
  const ogMatch = html.match(
    /<meta[^>]+(?:property=["']og:image["'][^>]+content=["']([^"']+)["']|content=["']([^"']+)["'][^>]+property=["']og:image["'])/i
  );
  if (ogMatch) {
    const url = ogMatch[1] || ogMatch[2];
    if (url && isValidImageUrl(url)) return resolveUrl(url, pageUrl);
  }

  // 2. Try twitter:image
  const twMatch = html.match(
    /<meta[^>]+(?:(?:name|property)=["']twitter:image["'][^>]+content=["']([^"']+)["']|content=["']([^"']+)["'][^>]+(?:name|property)=["']twitter:image["'])/i
  );
  if (twMatch) {
    const url = twMatch[1] || twMatch[2];
    if (url && isValidImageUrl(url)) return resolveUrl(url, pageUrl);
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
    return resolveUrl(linkMatch[1], pageUrl);
  }

  // 5. Try apple-touch-icon (high-res site icon fallback)
  const touchMatch = html.match(
    /<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i
  );
  if (touchMatch?.[1] && isValidImageUrl(touchMatch[1])) {
    return resolveUrl(touchMatch[1], pageUrl);
  }

  return null;
}

function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url, "https://placeholder.invalid");
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

/** Resolve potentially relative URLs against the page origin. */
function resolveUrl(url: string, pageUrl: string): string {
  try {
    return new URL(url, pageUrl).href;
  } catch {
    return url;
  }
}
