export const SORT_OPTIONS = ["hot", "new", "top"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const DEALS_PER_PAGE = 20;
