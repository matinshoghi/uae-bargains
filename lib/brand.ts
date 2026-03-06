import { BASE_URL } from "@/lib/site";

/**
 * Central brand configuration.
 *
 * Single source of truth for brand identity across JSON-LD schemas,
 * metadata, llms.txt, and other machine-readable surfaces.
 *
 * Update `sameAs` with real profile URLs once social accounts are established.
 */
export const BRAND = {
  name: "HalaSaves",
  url: BASE_URL,
  logo: `${BASE_URL}/icon.png`,
  description:
    "Discover and share the best deals in UAE. Community-driven bargains on electronics, dining, fashion, groceries, and travel.",
  region: "United Arab Emirates",
  currency: "AED",
  locale: "en_AE",

  /**
   * Social / directory profile URLs for Organization.sameAs.
   * Add real URLs here as accounts are created.
   *
   * Platforms to target (sites on 4+ platforms are 2.8x more likely to
   * appear in ChatGPT responses):
   * - X / Twitter
   * - Instagram
   * - Facebook
   * - LinkedIn
   * - Reddit (r/dubai, r/UAE)
   * - TikTok
   * - Google Business Profile
   * - Crunchbase
   */
  sameAs: [
    // "https://x.com/halasaves",
    // "https://www.instagram.com/halasaves",
    // "https://www.facebook.com/halasaves",
    // "https://www.linkedin.com/company/halasaves",
    // "https://www.tiktok.com/@halasaves",
  ] as string[],
} as const;
