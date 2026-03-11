export const SORT_OPTIONS = ["hot", "new", "top"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const DEALS_PER_PAGE = 15;
export const EXPIRED_DEAL_INTERVAL = 4; // 1 expired per 3 active in feed
export const ALLOW_ANONYMOUS_VOTES = true;
export const ANON_VOTE_MODAL_INTERVAL = 5;
export const ANON_VOTE_DAILY_LIMIT = 30;

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  electronics: "Phones, TVs, headphones, smart home, gadgets",
  "computing-software": "PCs, laptops, software, apps, VPNs, digital tools",
  gaming: "Consoles, video games, gaming accessories",
  fashion: "Clothing, shoes, bags, watches, jewelry",
  "health-beauty": "Skincare, makeup, wellness, pharmacy, supplements",
  "home-living": "Furniture, appliances, home decor, kitchen",
  groceries: "Supermarket deals, food & beverages",
  dining: "Restaurants, cafes, food delivery apps",
  travel: "Flights, hotels, tours, car rental",
  "sports-outdoors": "Gym, fitness gear, outdoor activities",
  entertainment: "Streaming services, cinema, events, books, music",
  education: "Online courses, tutorials, certifications",
  "kids-family": "Toys, baby products, kids clothing",
  automotive: "Cars, fuel, accessories, maintenance",
  "services-finance": "Insurance, telecom, banking, utilities, contracts",
  other: "Anything that doesn't fit the categories above",
};

export const REMOVAL_REASONS = [
  "Spam",
  "Duplicate",
  "Misleading or inaccurate",
  "Expired or unavailable",
  "Inappropriate content",
  "Rule violation",
  "Other",
] as const;
