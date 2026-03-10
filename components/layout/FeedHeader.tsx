const SORT_LABELS: Record<string, string> = {
  hot: "🔥 Hot Deals",
  new: "Newest Deals",
  top: "Popular Deals",
};

const CATEGORY_DISPLAY: Record<string, string> = {
  electronics: "💻 Electronics",
  "computing-software": "🖥️ Computing & Software",
  gaming: "🎮 Gaming",
  fashion: "👗 Fashion",
  "health-beauty": "💊 Health & Beauty",
  "home-living": "🏠 Home & Living",
  groceries: "🛒 Groceries",
  dining: "🍽️ Dining",
  travel: "✈️ Travel",
  "sports-outdoors": "🏋️ Sports & Outdoors",
  entertainment: "🎭 Entertainment",
  education: "📚 Education",
  "kids-family": "👶 Kids & Family",
  automotive: "🚗 Automotive",
  "services-finance": "💰 Services & Finance",
  other: "📦 Other",
};

export function FeedHeader({
  sort,
  category,
}: {
  sort: string;
  category?: string;
}) {
  const currentSort = sort ?? "hot";
  const title = category
    ? CATEGORY_DISPLAY[category] ?? category
    : (SORT_LABELS[currentSort] ?? "Hot Deals");

  return (
    <div className="mb-6">
      <div className="border-b-2 border-foreground pb-3">
        <h1 className="font-heading text-[22px] font-black tracking-tight">
          {title}
        </h1>
      </div>
    </div>
  );
}
