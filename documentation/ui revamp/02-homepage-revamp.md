# Homepage Revamp — Product Hunt-Style Layout

**Date:** 2026-02-21

## Summary

Revamped the homepage from a single-column layout with category filter pills and tab-style sort links to a two-column Product Hunt-inspired layout with a deal feed on the left and sidebar on the right.

## Changes

### Removed
- **CategoryBar** (`components/layout/CategoryBar.tsx`) — server component fetching categories from Supabase
- **CategoryBarClient** (`components/layout/CategoryBarClient.tsx`) — scrollable pill row for filtering by category
- **CategoryList** (`components/layout/CategoryList.tsx`) — hardcoded category grid used in MobileNav sheet
- **SortBar** (`components/layout/SortBar.tsx`) — horizontal tab-style sort links (hot/new/top)
- **Category route** (`app/category/[slug]/page.tsx`) — dedicated category browsing page
- Category sheet trigger from MobileNav (simplified to 3 items: Home, Post, Settings)

> **Note:** Categories are still stored in the database and used during deal creation. Only the browsing/filtering UI was removed.

### Created
- **FeedHeader** (`components/layout/FeedHeader.tsx`) — displays dynamic heading ("Hot Deals", "Newest Deals", "Top Deals") with a dropdown menu to switch sort mode
- **Sidebar** (`components/layout/Sidebar.tsx`) — right-side panel with "About UAE Bargains" description and share buttons (WhatsApp, Facebook, Copy Link, Native Share)

### Modified
- **Homepage** (`app/page.tsx`) — two-column flex layout; sidebar shows above feed on mobile (`lg:hidden`), sticky right column on desktop (`lg:block`)
- **DealCard** (`components/deals/DealCard.tsx`) — Product Hunt-style: content left + thumbnail right, description snippet, meta row with votes/comments/time/poster/category pill (with Lucide icon per category), divider-separated instead of bordered cards
- **DealFeed** (`components/deals/DealFeed.tsx`) — changed from `space-y-3` to `divide-y` for clean divider separation
- **MobileNav** (`components/layout/MobileNav.tsx`) — removed Categories sheet trigger, simplified to Home/Post/Settings
- **DealDetail** (`components/deals/DealDetail.tsx`) — category label changed from link to plain text (category route removed)

## Layout

```
Desktop (lg+):
┌──────────────────────────────────────────────┐
│ NavBar                                       │
├─────────────────────────┬────────────────────┤
│ FeedHeader (H1 + sort)  │ About UAE Bargains │
│ ────────────────────    │ ──────────────     │
│ Deal 1                  │ Share buttons      │
│ ──────                  │                    │
│ Deal 2                  │                    │
│ ──────                  │                    │
│ Deal 3                  │                    │
│ ...                     │                    │
└─────────────────────────┴────────────────────┘

Mobile:
┌──────────────┐
│ NavBar       │
├──────────────┤
│ About + Share│ ← Sidebar content
├──────────────┤
│ FeedHeader   │
│ ──────────── │
│ Deal 1       │
│ ──────       │
│ Deal 2       │
│ ...          │
├──────────────┤
│ Home Post Set│ ← MobileNav
└──────────────┘
```
