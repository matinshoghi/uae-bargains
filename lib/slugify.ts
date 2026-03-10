/**
 * Generate a URL-friendly slug from a title string.
 * - Lowercase, hyphens as separators
 * - Strips non-alphanumeric chars (except hyphens)
 * - Collapses consecutive hyphens
 * - Trims to ~80 chars at a word boundary
 */
export function slugify(text: string): string {
  let slug = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric
    .replace(/[\s-]+/g, "-") // spaces/hyphens → single hyphen
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens

  // Trim to ~80 chars at word boundary
  if (slug.length > 80) {
    slug = slug.slice(0, 80);
    const lastHyphen = slug.lastIndexOf("-");
    if (lastHyphen > 40) {
      slug = slug.slice(0, lastHyphen);
    }
  }

  return slug || "deal";
}
