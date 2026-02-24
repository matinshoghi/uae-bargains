export const SORT_OPTIONS = ["hot", "new", "top"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const DEALS_PER_PAGE = 15;

export const REMOVAL_REASONS = [
  "Spam",
  "Duplicate",
  "Misleading or inaccurate",
  "Expired or unavailable",
  "Inappropriate content",
  "Rule violation",
  "Other",
] as const;
