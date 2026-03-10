"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ShareButtons } from "@/components/shared/ShareButtons";

const SITE_URL = "https://halasaves.com";
const SHARE_TEXT = "Check out HalaSaves — the best community deals in the UAE!";

const SORT_LABELS: Record<string, string> = {
  hot: "🔥 Hot Deals",
  new: "🆕 Newest",
  top: "⬆️ Top Voted",
};

const FEATURED_CATEGORIES = [
  { slug: "electronics", label: "Electronics", emoji: "💻" },
  { slug: "fashion", label: "Fashion", emoji: "👗" },
  { slug: "groceries", label: "Groceries", emoji: "🛒" },
  { slug: "dining", label: "Dining", emoji: "🍽️" },
  { slug: "travel", label: "Travel", emoji: "✈️" },
  { slug: "home-living", label: "Home & Living", emoji: "🏠" },
  { slug: "gaming", label: "Gaming", emoji: "🎮" },
  { slug: "health-beauty", label: "Health & Beauty", emoji: "💊" },
] as const;

export function HomeSidebar({
  sort,
  category,
  hideExpired,
}: {
  sort: string;
  category?: string;
  hideExpired: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function buildUrl(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) {
        sp.delete(key);
      } else {
        sp.set(key, value);
      }
    }
    if (sp.get("sort") === "hot") sp.delete("sort");
    sp.delete("page");
    const qs = sp.toString();
    return qs ? `/?${qs}` : "/";
  }

  function handleCategory(slug: string | undefined) {
    router.push(buildUrl({ category: slug }));
  }

  function handleSort(newSort: string) {
    router.push(buildUrl({ sort: newSort === "hot" ? undefined : newSort }));
  }

  function handleToggleExpired() {
    router.push(buildUrl({ hide_expired: hideExpired ? undefined : "1" }));
  }

  return (
    <div>
      {/* Categories */}
      <div>
        <h2 className="mb-3 font-mono-display text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Categories
        </h2>

        {/* Desktop: vertical list */}
        <div className="hidden flex-col gap-0.5 lg:flex">
          <button
            onClick={() => handleCategory(undefined)}
            className={`flex w-full items-center gap-2 border-[1.5px] px-2.5 py-[7px] text-left text-[13px] font-medium transition-all duration-100 ${
              !category
                ? "border-foreground bg-foreground font-bold text-primary"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            All
          </button>
          {FEATURED_CATEGORIES.map(({ slug, label, emoji }) => (
            <button
              key={slug}
              onClick={() => handleCategory(slug)}
              className={`flex w-full items-center gap-2 border-[1.5px] px-2.5 py-[7px] text-left text-[13px] font-medium transition-all duration-100 ${
                category === slug
                  ? "border-foreground bg-foreground font-bold text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              <span className="text-sm">{emoji}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Mobile: horizontal pills */}
        <div className="flex flex-wrap gap-1.5 lg:hidden">
          <button
            onClick={() => handleCategory(undefined)}
            className={`flex items-center gap-1.5 border-[1.5px] px-3 py-1.5 text-xs font-semibold transition-colors ${
              !category
                ? "border-foreground bg-foreground text-primary"
                : "border-border text-foreground hover:border-foreground"
            }`}
          >
            All
          </button>
          {FEATURED_CATEGORIES.map(({ slug, label, emoji }) => (
            <button
              key={slug}
              onClick={() => handleCategory(slug)}
              className={`flex items-center gap-1.5 border-[1.5px] px-3 py-1.5 text-xs font-semibold transition-colors ${
                category === slug
                  ? "border-foreground bg-foreground text-primary"
                  : "border-border text-foreground hover:border-foreground"
              }`}
            >
              <span className="text-sm">{emoji}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort & Hide Expired — visible on all screens */}
      <div>
        <div className="my-[18px] h-px bg-[#e4e3dd]" />
        <h2 className="mb-3 font-mono-display text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Sort By
        </h2>
        <select
          value={sort}
          onChange={(e) => handleSort(e.target.value)}
          className="w-full border-[1.5px] border-border bg-background px-2.5 py-2 font-display text-[13px] font-semibold text-foreground"
        >
          {Object.entries(SORT_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <label className="mt-2.5 flex cursor-pointer items-center gap-2 text-[13px] text-muted-foreground select-none">
          <input
            type="checkbox"
            checked={hideExpired}
            onChange={handleToggleExpired}
            className="h-4 w-4 accent-foreground"
          />
          Hide expired deals
        </label>
      </div>

      {/* Desktop-only sections */}
      <div className="hidden lg:block">
        {/* About */}
        <div className="my-[18px] h-px bg-[#e4e3dd]" />
        <h2 className="font-mono-display text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          About HalaSaves
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Your community-driven platform for discovering and sharing the best
          deals across the UAE. Let&apos;s save more, together.
        </p>

        {/* Share */}
        <div className="my-[18px] h-px bg-[#e4e3dd]" />
        <h2 className="font-mono-display text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Share &amp; Spread the Word
        </h2>
        <div className="mt-2.5">
          <ShareButtons url={SITE_URL} title={SHARE_TEXT} />
        </div>
      </div>
    </div>
  );
}
