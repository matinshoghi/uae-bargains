# Slice 3 — Feed + Discovery

> **Goal:** Homepage shows a browsable deal feed with hot/new/top sorting and category filtering.
> **Duration:** Days 5–7
> **Depends on:** Slice 2 (deal creation, detail page)

---

## Overview

This slice turns the homepage into a functional deal feed. Users can browse deals sorted by hot (default), new, or top. They can filter by category. Pagination loads more deals on demand. This is the most visible part of the app — the first thing users see.

---

## 1. Homepage — `app/page.tsx`

**Server Component** that:
1. Reads `searchParams` for sort (`?sort=hot|new|top`) — defaults to `hot`
2. Fetches the first page of deals (20) from Supabase with appropriate ORDER BY
3. Fetches categories (for the CategoryBar, unless already in layout)
4. Renders: `<DealSortTabs>` → `<DealFeed>` with deals data

```typescript
// app/page.tsx
import { createClient } from "@/lib/supabase/server";
import { DealSortTabs } from "@/components/deals/DealSortTabs";
import { DealFeed } from "@/components/deals/DealFeed";
import { fetchDeals } from "@/lib/queries/deals";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort = "hot" } = await searchParams;
  const deals = await fetchDeals({ sort, limit: 20, offset: 0 });

  return (
    <div className="mx-auto max-w-3xl px-4">
      <DealSortTabs activeSort={sort} />
      <DealFeed initialDeals={deals} sort={sort} />
    </div>
  );
}
```

---

## 2. Data Fetching — `lib/queries/deals.ts`

Centralized query functions that both Server Components and Server Actions can use. Keeps data access out of components.

```typescript
import { createClient } from "@/lib/supabase/server";
import { DEALS_PER_PAGE } from "@/lib/constants";

interface FetchDealsOptions {
  sort: string;
  limit?: number;
  offset?: number;
  categorySlug?: string;
}

export async function fetchDeals({
  sort,
  limit = DEALS_PER_PAGE,
  offset = 0,
  categorySlug,
}: FetchDealsOptions) {
  const supabase = await createClient();

  let query = supabase
    .from("deals")
    .select(`
      *,
      profiles!inner(username, display_name, avatar_url),
      categories!inner(label, slug, icon)
    `)
    .eq("status", "active")
    .range(offset, offset + limit - 1);

  // Category filter
  if (categorySlug) {
    query = query.eq("categories.slug", categorySlug);
  }

  // Sorting
  switch (sort) {
    case "new":
      query = query.order("created_at", { ascending: false });
      break;
    case "top":
      // Supabase doesn't support computed ORDER BY, so use hot_score
      // For "top" we'd ideally sort by (upvote_count - downvote_count)
      // Workaround: use an RPC function or just order by upvote_count
      query = query.order("upvote_count", { ascending: false })
                   .order("created_at", { ascending: false });
      break;
    case "hot":
    default:
      query = query.order("hot_score", { ascending: false })
                   .order("created_at", { ascending: false });
      break;
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
```

**Note:** For true "top" sorting by net score `(upvote_count - downvote_count)`, create a Supabase RPC function or a generated column. For MVP, sorting by `upvote_count` is good enough — deals with the most upvotes surface.

---

## 3. Sort Tabs — `components/deals/DealSortTabs.tsx`

**Client Component** — manages sort via URL search params.

```typescript
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SORT_OPTIONS } from "@/lib/constants";

export function DealSortTabs({ activeSort }: { activeSort: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSort(sort: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (sort === "hot") {
      params.delete("sort");
    } else {
      params.set("sort", sort);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-1 border-b border-zinc-100 mb-4">
      {SORT_OPTIONS.map((option) => (
        <button
          key={option}
          onClick={() => handleSort(option)}
          className={/* active vs inactive styles */}
        >
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </button>
      ))}
    </div>
  );
}
```

**Why URL params instead of state?** Server Components can read them, so the initial page render is server-side. Sort state is shareable via URL. Back button works naturally.

---

## 4. Deal Card — `components/deals/DealCard.tsx`

**Server Component** — the most important visual element. Must communicate deal value at a glance.

**Props:** A single deal object (with joined profiles + categories).

**Card anatomy:**

```
┌──────────────────────────────────────────────────┐
│  [Vote]  │  [Thumb]  │  Category · 2h ago        │
│  ▲ 12    │  80×80    │  Deal Title (bold, 2 lines)│
│  ▼       │           │  AED 299  ~~599~~  -50%    │
│          │           │  store.com · 4 comments     │
└──────────────────────────────────────────────────┘
```

**Mobile (stacked):**

```
┌──────────────────────────────────────┐
│  Category · 2h ago                   │
│  Deal Title (bold, 2 lines max)      │
│  ┌────────────────────────────────┐  │
│  │  Image (full width, 16:9)      │  │
│  └────────────────────────────────┘  │
│  AED 299  ~~599~~  -50%             │
│  ▲ 12  ▼  ·  4 comments             │
└──────────────────────────────────────┘
```

**Key rendering rules:**
- Title: max 2 lines, truncated with `line-clamp-2`
- Image: show placeholder icon if no image
- Price: only show if price exists. Show "Free" if price is 0.
- Discount: only show if both price and original_price exist
- Expired: full card gets `opacity-60` + "Expired" badge
- Vote buttons: render as static display in this slice (interactive in Slice 4)
- Entire card is a link to `/deals/[id]`

**Styling:**
```
Card: bg-white rounded-xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow
      p-4, flex gap-4 (desktop), flex-col (mobile)
```

---

## 5. Deal Feed — `components/deals/DealFeed.tsx`

**Two parts:**

### Server wrapper: `DealFeed.tsx`
- Receives `initialDeals` from the page
- Renders the list of `<DealCard />` components
- Renders `<LoadMoreButton />` at the bottom

### Client part: `components/deals/LoadMoreButton.tsx`
- Shows "Load more deals" button
- On click: calls a Server Action to fetch the next page
- Appends results to a client-side state array
- Hides itself when fewer than 20 results return (no more pages)

```typescript
"use client";

import { useState, useTransition } from "react";
import { fetchMoreDeals } from "@/lib/actions/deals";
import { DealCard } from "./DealCard";

export function LoadMoreButton({
  sort,
  categorySlug,
  initialOffset,
}: {
  sort: string;
  categorySlug?: string;
  initialOffset: number;
}) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [offset, setOffset] = useState(initialOffset);
  const [hasMore, setHasMore] = useState(true);
  const [isPending, startTransition] = useTransition();

  function loadMore() {
    startTransition(async () => {
      const newDeals = await fetchMoreDeals({ sort, offset, categorySlug });
      setDeals((prev) => [...prev, ...newDeals]);
      setOffset((prev) => prev + newDeals.length);
      if (newDeals.length < 20) setHasMore(false);
    });
  }

  return (
    <>
      {deals.map((deal) => (
        <DealCard key={deal.id} deal={deal} />
      ))}
      {hasMore && (
        <button onClick={loadMore} disabled={isPending}>
          {isPending ? "Loading..." : "Load more deals"}
        </button>
      )}
    </>
  );
}
```

**Why "Load More" instead of infinite scroll?** Simpler, more accessible, no intersection observer needed. Users have control. Easy to swap to infinite scroll later if desired.

---

## 6. Category Page — `app/category/[slug]/page.tsx`

**Server Component** — same as homepage but filtered by category.

```typescript
export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { slug } = await params;
  const { sort = "hot" } = await searchParams;
  const deals = await fetchDeals({ sort, limit: 20, offset: 0, categorySlug: slug });

  return (
    <div className="mx-auto max-w-3xl px-4">
      <h1 className="text-2xl font-bold mb-4">{/* Category label */}</h1>
      <DealSortTabs activeSort={sort} />
      <DealFeed initialDeals={deals} sort={sort} categorySlug={slug} />
    </div>
  );
}
```

Reuses `DealSortTabs`, `DealFeed`, `DealCard` — same components, just filtered.

---

## 7. Server Action for Pagination — `lib/actions/deals.ts` (addition)

```typescript
"use server";

import { fetchDeals } from "@/lib/queries/deals";

export async function fetchMoreDeals({
  sort,
  offset,
  categorySlug,
}: {
  sort: string;
  offset: number;
  categorySlug?: string;
}) {
  return fetchDeals({ sort, offset, categorySlug });
}
```

---

## 8. Empty State — `components/shared/EmptyState.tsx`

**Server Component** shown when the feed has zero deals.

```typescript
export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-zinc-500 mb-4">No deals found</p>
      <a href="/deals/new" className="text-emerald-600 font-medium hover:underline">
        Be the first to post a deal
      </a>
    </div>
  );
}
```

---

## 9. Hot Score Cron Job

The hot score calculation trigger (from Slice 1 SQL) handles score updates on each vote. But time decay means scores change even without votes. Set up a cron:

**Supabase Dashboard → Database → Extensions → Enable `pg_cron`**

```sql
-- Recalculate all active deal hot scores every 15 minutes
SELECT cron.schedule(
  'recalculate-hot-scores',
  '*/15 * * * *',
  $$
  UPDATE deals
  SET hot_score = calculate_hot_score(upvote_count, downvote_count, created_at)
  WHERE status = 'active'
  $$
);
```

---

## 10. File Structure After This Slice

```
lib/
  queries/
    deals.ts                   — fetchDeals query function
  actions/
    deals.ts                   — createDeal + fetchMoreDeals

components/
  deals/
    DealCard.tsx               — (Server) Feed card
    DealFeed.tsx               — (Server) Deal list
    DealSortTabs.tsx           — (Client) Hot/New/Top tabs
    LoadMoreButton.tsx         — (Client) Pagination
    DealForm.tsx               — (Client) from Slice 2
    DealDetail.tsx             — (Server) from Slice 2
    DealPriceBadge.tsx         — (Server) from Slice 2
    DealExpiredBadge.tsx       — (Server) from Slice 2
  shared/
    EmptyState.tsx             — (Server) No deals placeholder
    TimeAgo.tsx                — (Server) Relative time display

app/
  page.tsx                     — Homepage (deal feed)
  loading.tsx                  — Homepage skeleton
  category/
    [slug]/
      page.tsx                 — Category-filtered feed
```

---

## 11. Design Notes (Revamp-Friendly)

- `DealCard` takes a typed deal object as a prop — it doesn't fetch data or know about Supabase
- Sort logic lives in `lib/queries/deals.ts`, not in components — easy to swap out the data source
- `DealSortTabs` uses URL params, so sorting is decoupled from component state — works with any rendering strategy
- `LoadMoreButton` is a separate client component — the rest of the feed is server-rendered
- All layout is Tailwind utility classes on semantic elements — no CSS modules or styled-components to migrate later

---

## Test Cases

### T3.1 — Homepage Feed
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Feed loads | Navigate to `/` | List of deal cards displayed |
| 2 | Default sort is hot | Navigate to `/` (no query params) | "Hot" tab is active, deals ordered by hot_score |
| 3 | New sort | Click "New" tab | URL changes to `?sort=new`, deals ordered newest first |
| 4 | Top sort | Click "Top" tab | URL changes to `?sort=top`, deals ordered by highest upvotes |
| 5 | Sort persists on refresh | Set `?sort=new`, refresh page | "New" tab still active, correct order |
| 6 | Empty feed | Delete all deals from database | EmptyState shown with "Be the first to post" link |
| 7 | Feed shows correct data | Check any card against database | Title, price, category, username all match |

### T3.2 — Deal Card Display
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Card with all fields | Create deal with all fields | Image, title, price, original price, discount, category, time ago all shown |
| 2 | Card without image | Create deal without image | Placeholder icon shown instead of thumbnail |
| 3 | Card without price | Create deal without price | No price section on card |
| 4 | Free deal card | Create deal with price = 0 | "Free" badge shown |
| 5 | Expired deal card | Create deal with past expiry | Card is dimmed (opacity-60), "Expired" badge visible |
| 6 | Long title truncation | Create deal with 120-char title | Title truncated at 2 lines with ellipsis |
| 7 | Card links to detail | Click any card | Navigates to `/deals/[id]` |

### T3.3 — Pagination
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Load more appears | Feed has 21+ deals | "Load more deals" button visible after first 20 |
| 2 | Load more works | Click "Load more" | 20 more deals appended below |
| 3 | No more deals | Click load more until all loaded | Button disappears when fewer than 20 returned |
| 4 | Loading state | Click load more | Button shows "Loading..." while fetching |
| 5 | Load more fewer than 20 | Database has 25 deals total | First page shows 20, load more shows 5, button hides |

### T3.4 — Category Filtering
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Category page loads | Click "Electronics" in CategoryBar | Navigates to `/category/electronics`, shows only electronics deals |
| 2 | Empty category | Navigate to a category with no deals | EmptyState shown |
| 3 | Sort within category | On category page, click "New" | URL: `/category/electronics?sort=new`, correct order within category |
| 4 | "All" returns to home | Click "All" in CategoryBar | Navigates to `/`, shows all deals |
| 5 | Category label shown | Navigate to any category page | Page heading shows category label (e.g., "Electronics") |

### T3.5 — Hot Score
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | New deal has low hot score | Create a deal with no votes | hot_score is 0 or near 0 |
| 2 | Upvoted deal rises | Upvote a recent deal (after Slice 4) | hot_score increases, deal moves up in hot feed |
| 3 | Old deal decays | Wait or simulate time passing | Older deals have lower hot_score than newer ones with same votes |
| 4 | Cron recalculates | Check after 15-minute cron runs | hot_scores updated for all active deals |

### T3.6 — Responsive Design
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Desktop layout | View at 1024px+ | Cards show horizontal layout (thumbnail left, content right) |
| 2 | Mobile layout | View at 375px | Cards stack vertically (title, image, price, meta) |
| 3 | Category bar scrolls | View on mobile with all categories | Horizontal scroll works smoothly |
| 4 | Sort tabs mobile | View at 375px | Tabs are tappable with adequate touch targets |
