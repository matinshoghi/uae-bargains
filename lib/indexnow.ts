import { BASE_URL } from "@/lib/site";

const INDEXNOW_KEY = process.env.INDEXNOW_API_KEY;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

/**
 * Submit URLs to IndexNow for real-time indexing by Bing, Yandex, and other
 * participating search engines.
 *
 * Requires the `INDEXNOW_API_KEY` environment variable.
 * The key must also be served at `/{key}.txt` — see `app/api/indexnow/route.ts`.
 *
 * Fails silently in development or when the key is not configured.
 * Logs errors to console but never throws.
 */
export async function notifyIndexNow(urls: string[]): Promise<void> {
  if (!INDEXNOW_KEY || urls.length === 0) return;

  // IndexNow accepts up to 10,000 URLs per request
  const batch = urls.slice(0, 10_000);

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: new URL(BASE_URL).hostname,
        key: INDEXNOW_KEY,
        keyLocation: `${BASE_URL}/api/indexnow?key=true`,
        urlList: batch,
      }),
    });

    if (!response.ok) {
      console.error(
        `[IndexNow] Submission failed: ${response.status} ${response.statusText}`,
      );
    }
  } catch (error) {
    console.error("[IndexNow] Submission error:", error);
  }
}

/**
 * Convenience wrapper to notify IndexNow about a single deal URL.
 * Also pings the homepage since the deal feed may have changed.
 */
export async function notifyDealChange(dealSlug: string): Promise<void> {
  await notifyIndexNow([
    `${BASE_URL}/deals/${dealSlug}`,
    BASE_URL,
  ]);
}
