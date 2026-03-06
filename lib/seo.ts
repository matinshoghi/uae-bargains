import type { DealWithRelations } from "@/lib/types";
import { formatPriceShort, getUrlHostname, stripMarkdown } from "@/lib/utils";

/**
 * Build a concise price string for a deal.
 * Used in metadata descriptions, JSON-LD descriptions, and feed entries.
 *
 * Examples:
 *   "AED 199 (was AED 399), 50% off"
 *   "AED 0 (Free)"
 *   "Was AED 399"
 */
export function buildDealPriceText(deal: {
  price: number | null;
  original_price: number | null;
  discount_percentage: number | null;
}): string | null {
  const parts: string[] = [];

  if (deal.price != null) {
    if (deal.price === 0) {
      parts.push("Free");
    } else {
      parts.push(formatPriceShort(deal.price));

      if (deal.original_price != null) {
        parts.push(`(was ${formatPriceShort(deal.original_price)})`);
      }
    }

    if (deal.discount_percentage != null && deal.discount_percentage > 0) {
      parts.push(`${deal.discount_percentage}% off`);
    }
  } else if (deal.original_price != null) {
    parts.push(`Was ${formatPriceShort(deal.original_price)}`);
  }

  return parts.length > 0 ? parts.join(" ") : null;
}

/**
 * Build a metadata description string for a deal page.
 * Consistent across `generateMetadata`, JSON-LD `Product.description`, and feed summaries.
 *
 * Format: "[price] in [category] — [plain-text description]"
 */
export function buildDealMetaDescription(
  deal: DealWithRelations,
  maxLength = 160,
): string {
  const priceText = buildDealPriceText(deal);
  const categoryLabel = deal.categories?.label;

  const parts: string[] = [];
  if (priceText) parts.push(priceText);
  if (categoryLabel) parts.push(`in ${categoryLabel}`);
  const prefix = parts.length > 0 ? `${parts.join(" ")} — ` : "";

  const plainDescription = stripMarkdown(deal.description);
  const remaining = Math.max(0, maxLength - prefix.length);

  if (remaining === 0) {
    return prefix.slice(0, maxLength);
  }

  const body =
    plainDescription.length <= remaining
      ? plainDescription
      : `${plainDescription.slice(0, Math.max(0, remaining - 3)).trimEnd()}...`;

  return `${prefix}${body}`;
}

/**
 * Get the merchant display name from a deal URL.
 * Returns null if the URL is missing or invalid.
 */
export function getDealMerchant(deal: { url: string | null }): string | null {
  return deal.url ? getUrlHostname(deal.url) : null;
}
