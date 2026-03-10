# HalaSaves Homepage Redesign — Product Requirements Document

**Hero Section, Navigation & Above-the-Fold Experience**

---

| Field | Details |
|-------|---------|
| Version | 1.0 |
| Date | March 10, 2026 |
| Author | Matin (Founder) |
| Status | Ready for Implementation |
| Priority | P0 — Ship This Week |
| Reference Mockup | halasaves-v2.jsx (attached) |

---

## 1. Overview

### 1.1 Problem Statement

The current HalaSaves homepage uses a generic Dubai skyline banner hero that fails to communicate what the platform is, what action visitors should take, or why they should participate. There is no call-to-action, no social proof, and the design does not reflect the community-driven, retro identity we want to establish.

### 1.2 Goal

Redesign the above-the-fold experience so that a first-time visitor understands within 3 seconds that HalaSaves is a community-driven deals platform for the UAE, feels compelled to browse and sign up, and can immediately start engaging with deals (voting, commenting, posting).

### 1.3 Key Design Principles

- **Retro, not polished** — sharp corners, monospace metadata, offset box-shadow hovers. We should not look AI-generated or SaaS-generic.
- **Community-first** — the page should feel like an active marketplace, not a brochure. Show live activity signals.
- **Deals are the product** — the hero must be compact. Deals should be visible with minimal scrolling. The homepage IS the deals feed.
- **Mobile-first** — the majority of UAE users will arrive on mobile. Every element must work at 375px width.

### 1.4 Success Metrics

1. Increase sign-up rate from homepage by 2x within 30 days
2. Reduce bounce rate on homepage by 20%
3. Increase votes-per-session by 30%
4. Time-to-first-deal-visible < 2 seconds on 4G connection

---

## 2. Page Structure (Top to Bottom)

The homepage consists of 5 distinct sections stacked vertically. The hero is compact (~300px on desktop) so that deals are visible with minimal scrolling.

| # | Section | Purpose | Approx. Height |
|---|---------|---------|----------------|
| 1 | Navigation Bar | Logo, Coupons link, + Post Deal button. Sticky on scroll. | 52px |
| 2 | Hero Section | Headline, subtext, CTA, social proof stats. Dark background. | ~280px desktop, ~320px mobile |
| 3 | How It Works Strip | 3-step explainer, dismissable by user. Only shown to new/unregistered visitors. | ~60px (0 when dismissed) |
| 4 | Activity Ticker | Live feed of community actions (posts, votes, comments). Green pulse dot. | ~36px |
| 5 | Main Content Area | Sidebar (categories, sort, hide expired, about, share) + Deals Feed. This is the existing page structure. | Remaining viewport |

---

## 3. Section-by-Section Specifications

### 3.1 Navigation Bar

Behaviour: Sticky, remains visible on scroll. White background with 2px solid bottom border (`#1a1a1a`).

#### 3.1.1 Layout

- **Left:** Logo — ✱ halasaves (Archivo 900, 22px, -0.02em tracking)
- **Right:** "Coupons" text link (14px, `#555`, hidden on mobile) → "+ Post Deal" button

#### 3.1.2 + Post Deal Button

- Default: background `#1a1a1a`, text `#c8f547`, 2px solid border `#1a1a1a`
- Hover: background `#c8f547`, text `#1a1a1a` (invert)
- Transition: `0.15s all`

---

### 3.2 Hero Section

The hero is a compact dark (`#1a1a1a`) banner with a 3px solid `#c8f547` bottom border. It must be short enough that deal cards are visible without scrolling on a 900px tall viewport.

#### 3.2.1 Badge

**Content:** "Made with [❤ animated heart] from the [🇦🇪 animated flag]"

Container: Inline-flex, background `rgba(200,245,71,0.12)`, 1px solid border `rgba(200,245,71,0.25)`. DM Mono 12px, `#c8f547`.

**Heart Animation:**

- Replace emoji with inline SVG heart (fill: `#ff3355`)
- Add drop-shadow glow: `0 0 4px rgba(255, 51, 85, 0.5)`
- Animation: Double-beat heartbeat, **1.8s cycle**, infinite, ease-in-out
- Keyframes: `0%: scale(1) → 14%: scale(1.3) → 28%: scale(1) → 42%: scale(1.2) → 56%: scale(1) → 100%: scale(1)`

**Flag Animation:**

- Uses the 🇦🇪 emoji at 16px
- Animation: Gentle pop-and-tilt, **3s cycle**, infinite, ease-in-out
- Keyframes: `0%/100%: scale(1) rotate(0) → 25%: scale(1.2) rotate(3deg) → 50%: scale(1) rotate(0) → 75%: scale(1.15) rotate(-2deg)`

#### 3.2.2 Headline

**Copy:** "Don't overpay. **Your neighbours** found it cheaper."

Typography: Archivo Black 900, 36px, -0.03em letter-spacing, white text. "Your neighbours" rendered in `#c8f547` with special animated treatment.

**Headline Entrance Animation:**

- On page load: Entire headline slides up (`translateY 24px → 0`), fades in (`opacity 0 → 1`), and tightens (`letter-spacing 0.02em → -0.03em`, `scale 0.97 → 1`)
- Duration: 0.8s, `cubic-bezier(0.22, 1, 0.36, 1)`, delay 0.15s

**Persistent Shimmer on "Your neighbours":**

- Technique: CSS `background-clip: text` with a gradient that includes a lighter highlight band (`#f0ffaa`) sweeping across
- Gradient: `linear-gradient(90deg, #c8f547 0%, #c8f547 35%, #f0ffaa 50%, #c8f547 65%, #c8f547 100%)`, `background-size: 300% 100%`
- Animation: 3s ease-in-out infinite loop, starts after 1.2s delay. Background-position moves from `100%` to `-100%`.

**Persistent Glow Pulse behind "Your neighbours":**

- Technique: CSS `::after` pseudo-element containing the same text, positioned absolutely behind the main text
- Filter: `blur(16px)`, color: `#c8f547`
- Animation: 3s ease-in-out infinite, starts after 1.5s. Opacity pulses from `0` to `0.4` and back.

#### 3.2.3 Subtext

**Copy:** "Post deals, vote on the best ones, and never pay full price in the UAE again. Built by locals, for locals."

Typography: 15px, color `rgba(255,255,255,0.55)`, max-width 520px centered. Fades in 0.5s after 0.7s delay.

#### 3.2.4 Call-to-Action

**Single CTA button:** "Join the Community →"

- Default: background `#c8f547`, text `#1a1a1a`, 2px solid border `#c8f547`, font-weight 700
- Hover: background `#d8ff6a`, border `#d8ff6a`
- Action: Opens sign-up modal / navigates to registration page
- Entrance: Fades in 0.5s after 0.85s delay

#### 3.2.5 Stats Bar

Three stats displayed horizontally, separated by a 1px top border `rgba(255,255,255,0.08)`. Fades in after 0.95s.

| Stat | Label | Source |
|------|-------|--------|
| 127 | deals shared | Live count from database |
| 842 | votes cast | Live count from database |
| 54 | comments | Live count from database |

Typography: Numbers in DM Mono 500, 20px, `#c8f547`. Labels in DM Mono 11px, `rgba(255,255,255,0.35)`. These should be fetched from the database and displayed as live counts, not hardcoded.

---

### 3.3 How It Works Strip

A slim horizontal strip that educates first-time visitors. Dismissable via an × button in the top-right corner.

#### 3.3.1 Visibility Logic

- **Show to:** Unregistered visitors and logged-in users who have not previously dismissed it
- **Persist dismissal:** Store in localStorage (key: `halasaves_how_dismissed`) or user preferences if logged in
- **When dismissed:** Section collapses to 0 height with no layout shift

#### 3.3.2 Content (3 Steps)

| Step | Title | Description |
|------|-------|-------------|
| 1 | Spot a deal | Found something good? Share it with the community. |
| 2 | Vote on it | Upvote the bangers, downvote the duds. |
| 3 | Everyone saves | Best deals rise to the top. Never overpay. |

Layout: Steps are connected by → arrows on desktop. On mobile, arrows are hidden and steps stack vertically.

---

### 3.4 Activity Ticker

A slim bar that cycles through recent community actions to signal that the platform is alive and active.

#### 3.4.1 Position

Between the How It Works strip and the main content area. Full-width, centered content. Background `#fafaf6`, 1px solid bottom border `#e4e3dd`.

#### 3.4.2 Content

- Green pulsing dot (7px, `#7ab800`, 2s pulse animation cycling opacity `1 → 0.3 → 1`)
- Text: Cycles through recent activity messages every 3 seconds with a 250ms fade transition
- Typography: DM Mono 12px, `#777`

#### 3.4.3 Data Source

Feed should pull from the last 10 actions from the database in real-time or near-real-time. Action types to include: deal posted, deal upvoted, comment added, new user joined. Format: `"{username} {action}"` e.g. "sarah_dxb posted a new deal".

---

### 3.5 Main Content Area

Two-column layout: fixed sidebar (220px) on the left, deal feed on the right. On mobile, sidebar collapses to horizontal pill-style category filters above the feed.

#### 3.5.1 Sidebar

Sticky (`top: 52px`, matching nav height). Background `#fafaf6`. Contains the following sections in order:

**Categories**

Buttons for: All, Electronics, Fashion, Groceries, Dining, Travel, Home & Living, Gaming, Health & Beauty. Active category gets black background with lime text. On mobile these render as horizontal scrollable pills.

**Sort By**

Dropdown select with options: Hot Deals (default), Newest, Top Voted.

**Hide Expired Deals**

Checkbox (unchecked by default). When checked, filters out deals where the expiry date has passed. Accent color: `#1a1a1a`.

**About HalaSaves**

Static text: "Your community-driven platform for discovering and sharing the best deals across the UAE. Let's save more, together."

**Share & Spread the Word**

Four share icons: WhatsApp, Facebook, Copy Link, Generic Share. Each is a 34px square button with 1.5px border.

*On mobile (< 768px): Only the category pills are shown. Sort, About, and Share sections are hidden.*

#### 3.5.2 Deal Cards

Each deal card is a horizontal flex container with a vote column on the left and deal content on the right.

- **Vote Column:** Up arrow, vote count (DM Mono 16px bold), down arrow. Upvoted state: green (`#7ab800`) with `scale(1.15)`. Downvoted state: red (`#e44`).
- **Tags Row:** Category tag (grey bg), popularity tag (`#c8f547` bg if popular), Staff Pick tag (black bg, lime text), Hot tag (red bg, white text). All in DM Mono 11px.
- **Title:** Archivo 17px 700. Color `#1a1a1a`, hover color `#5a8500`.
- **Description:** 13px `#888`, 2-line clamp with ellipsis overflow.
- **Footer:** Price badge (`#c8f547` bg, DM Mono 13px bold), comment count, time ago, posted by username.

**Card Hover Effect:**

On hover: border changes to `#c8f547`, card translates -1px up and -1px left, and a `3px 3px 0` box-shadow in `#c8f547` appears (retro offset effect). Transition: `0.15s all`.

---

## 4. Typography System

All fonts loaded via Google Fonts.

Import URL: `fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&family=Archivo:wght@400;500;600;700;800;900`

| Font | Use | Weights | Notes |
|------|-----|---------|-------|
| **Archivo** | Logo, headlines, deal titles | 700, 900 | The "personality" font. Tight tracking (-0.02em to -0.03em) |
| **Space Grotesk** | Body text, buttons, UI | 400, 500, 600, 700 | Primary UI font. Clean but not generic. |
| **DM Mono** | Tags, metadata, stats, timestamps | 400, 500 | Gives retro/technical feel. Used for all secondary info. |

---

## 5. Color System

| Name | Hex | Usage |
|------|-----|-------|
| **Black** | `#1A1A1A` | Primary text, nav border, hero background, dark buttons |
| **Lime** | `#C8F547` | Primary accent — CTA buttons, price badges, active category, hover borders, headline accent, hero border |
| **Lime Hover** | `#D8FF6A` | Lighter lime for button hover states |
| **Green** | `#7AB800` | Upvote active state, ticker dot, deal title hover |
| **Red** | `#FF4444` | Hot tag background, downvote active state |
| **Page Background** | `#F5F4F0` | Main page background (warm off-white) |
| **Sidebar BG** | `#FAFAF6` | Sidebar and ticker bar background |
| **Border** | `#E4E3DD` | Card borders, dividers, sidebar border |
| **Muted Text** | `#888888` | Deal descriptions, secondary text |
| **Faint Text** | `#AAAAAA` | Timestamps, metadata, deal footer |

---

## 6. Animation Specifications

| Animation | Duration | Trigger | Details |
|-----------|----------|---------|---------|
| Badge fadeUp | 0.4s, 0.05s delay | Page load | `translateY(10px) → 0`, `opacity 0 → 1` |
| Headline entrance | 0.8s, 0.15s delay | Page load | `translateY(24px) + scale(0.97) → 0 + scale(1)`, letter-spacing tightens |
| Shimmer sweep | 3s, 1.2s delay | Continuous | Gradient `background-position 100% → -100%` on "Your neighbours" |
| Glow pulse | 3s, 1.5s delay | Continuous | `::after` pseudo-element `opacity 0 → 0.4 → 0`, `blur(16px)` |
| Heart beat | 1.8s | Continuous | Double-beat scale pattern (`1 → 1.3 → 1 → 1.2 → 1`) |
| Flag pop | 3s | Continuous | scale + rotate tilt pattern |
| Subtext fadeUp | 0.5s, 0.7s delay | Page load | `translateY(10px) → 0`, `opacity 0 → 1` |
| CTA fadeUp | 0.5s, 0.85s delay | Page load | Same as subtext |
| Stats fadeUp | 0.5s, 0.95s delay | Page load | Same as subtext |
| Ticker pulse | 2s | Continuous | Green dot `opacity 1 → 0.3 → 1` |
| Ticker text cycle | 3s interval | Continuous | Fade out (250ms) → swap text → fade in |
| Deal card hover | 0.15s | Mouse hover | Border → `#c8f547`, `translate(-1px, -1px)`, `box-shadow 3px 3px 0 #c8f547` |

All entrance animations use CSS only (no JS animation libraries needed). Use `animation-fill-mode: forwards` for one-shot animations, and `cubic-bezier(0.22, 1, 0.36, 1)` for entrance easing.

---

## 7. Responsive Behaviour

| Breakpoint | Changes |
|------------|---------|
| **> 768px (Desktop)** | Full layout: sticky sidebar (220px) + feed. Nav shows all items. Hero headline at 36px. How It Works in horizontal row with arrows. |
| **≤ 768px (Tablet/Mobile)** | Sidebar collapses: categories become horizontal scrollable pills, Sort/About/Share hidden. Nav hides "Coupons" link. Hero headline 26px. Hero padding reduces. How It Works stacks vertically, arrows hidden. Deal cards reduce padding. |
| **≤ 420px (Small Mobile)** | Hero headline 22px. Stats wrap if needed. CTA button goes full-width. Vote box narrower (36px). Deal footer wraps. Ticker text 11px. |

---

## 8. Implementation Notes

### 8.1 Reference Mockup

A fully working React component (`halasaves-v2.jsx`) is attached alongside this PRD. It contains the exact CSS, animations, and layout described in this document. Engineers should use it as the source of truth for pixel-level details, animation keyframes, and interaction states. The mockup uses inline styles and a `<style>` block for portability — these should be adapted to the project's existing CSS architecture (CSS modules, Tailwind, styled-components, etc.).

### 8.2 What Stays the Same

- Deal card data model, voting API, comment system — no backend changes needed for the feed
- Category filtering and sort logic (already implemented)
- Authentication and deal posting flows
- Existing deal detail pages and navigation routes

### 8.3 New Backend Requirements

- **Stats API endpoint:** `GET /api/stats` → returns `{ dealsCount, votesCount, commentsCount }`. Can be cached with 5-minute TTL.
- **Activity feed endpoint:** `GET /api/activity?limit=10` → returns last 10 community actions with type, username, and deal title. Can be polled every 30s or use WebSocket.
- **How It Works dismissal:** Store in localStorage for anonymous users. For logged-in users, store in user preferences table.

### 8.4 Performance Considerations

- All animations are CSS-only. No JS animation libraries required.
- Google Fonts: Use `display=swap` in the import for fast initial render.
- Stats and activity feed should not block initial page render. Load async and populate after hydration.
- SVG heart is inline (not an image request). Total additional asset load: 0 bytes.
- Hero CSS animations use `transform` and `opacity` only (GPU-composited, no layout thrashing).

### 8.5 Accessibility

- All interactive elements must be keyboard-focusable
- Vote buttons need `aria-label` (e.g. "Upvote this deal", "Downvote this deal")
- Activity ticker should have `aria-live="polite"` for screen readers
- Dismiss button on How It Works needs `aria-label="Dismiss how it works"`
- Respect `prefers-reduced-motion`: disable shimmer, glow, heartbeat, and flag animations for users who prefer reduced motion
