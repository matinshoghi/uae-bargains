# NavBar Revamp — Two-State Navigation

**Date:** 2026-02-20

## What Changed

Replaced the simple sticky `Header.tsx` with a two-state `NavBar.tsx` component inspired by Nourly's navigation pattern.

### Two navigation states

1. **Initial Nav** — Sticky header at top of page. Solid white background with subtle backdrop blur. Contains logo, "Post Deal" button, and AuthButton. This is what users see on page load.

2. **Compact Nav** — Floating frosted-glass pill that appears after scrolling past 80% of the viewport height. Fixed position, centered horizontally, rendered via `createPortal` to `document.body` to avoid z-index conflicts. Desktop only — mobile uses the existing bottom MobileNav.

### Sort tabs extracted

Sort tabs (Hot / New / Top) were extracted from the header into a standalone `SortBar.tsx` component. They now render between CategoryBar and DealFeed on the homepage and category pages, which is semantically correct — sort controls are page-level UI, not global navigation.

## Files Created

- `components/layout/NavBar.tsx` — Two-state navigation component
- `components/layout/SortBar.tsx` — Sort tab pills (Hot/New/Top)

## Files Modified

- `app/layout.tsx` — Swapped `Header` for `NavBar`, removed Suspense wrapper
- `app/page.tsx` — Added `SortBar` between CategoryBar and DealFeed
- `app/category/[slug]/page.tsx` — Same SortBar addition

## Files Deleted

- `components/layout/Header.tsx` — Superseded by NavBar.tsx

## Technical Details

- **Scroll detection:** Single scroll listener registered once (via `useCallback` + refs) to avoid re-registration on state changes
- **Animation:** CSS transitions via Tailwind (`transition-[transform,opacity] duration-500`) with spring-like easing (`cubic-bezier(0.16,1,0.3,1)`)
- **Frosted glass:** `bg-background/80 backdrop-blur-xl backdrop-saturate-150 border-border/50 rounded-2xl shadow-lg`
- **Mount/unmount:** Compact nav mounts when scrolled past threshold, uses `requestAnimationFrame` for entry animation, `setTimeout` for exit unmount after animation completes
- **No DOM manipulation:** Unlike the Nourly reference, all styles are applied via Tailwind classes — no `element.style.setProperty` calls
