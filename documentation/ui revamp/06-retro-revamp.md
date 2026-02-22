# 06 — Retro UI Revamp

**Date:** 2026-02-22
**Status:** Complete
**Inspiration:** [hypermondays.com](https://hypermondays.com/)

---

## Overview

Full visual overhaul of the UAE Bargains UI to a light-base retro aesthetic. The goal is to look intentional, editorial, and handcrafted — distinctly not a cookie-cutter AI-generated design.

### Design Direction

- Light cream/off-white base (warm analog feel)
- High contrast borders and black text (editorial/magazine)
- Neon lime accent (#CDFF00) replacing emerald green
- Film grain/noise texture overlays on select sections
- Bold display typography via Space Grotesk
- Sharp corners (2-4px radius) replacing soft rounded corners
- Visible borders replacing soft box shadows

---

## Changes by Phase

### Phase 1: Design System Foundation (2026-02-22)

**Files changed:**
- `app/layout.tsx` — Added Space Grotesk as `--font-display` alongside Plus Jakarta Sans
- `app/globals.css` — Complete overhaul:
  - New color palette: warm off-white background, near-black foreground, neon lime primary
  - Added `--accent-neon` CSS variable
  - Reduced base radius from 0.625rem to 0.25rem (sharp corners)
  - Added `--font-display` theme variable
  - Added `grain-overlay` utility (SVG feTurbulence noise overlay)
  - Added `section-label` utility (uppercase, letter-spaced, display font)
  - Added `font-display` utility class
  - Base layer now applies display font to all h1-h4 elements

### Phase 2: shadcn/ui Base Components (2026-02-22)

**Files changed:**
- `components/ui/button.tsx` — Sharp corners, display font, uppercase tracking, neon lime default, strong outline variant
- `components/ui/badge.tsx` — Sharp corners, display font, uppercase, letter-spacing, visible borders
- `components/ui/input.tsx` — 1.5px borders, neon lime focus ring, sharp corners
- `components/ui/textarea.tsx` — Same treatment as input
- `components/ui/card.tsx` — 1.5px visible borders, no shadow, display font for titles
- `components/ui/select.tsx` — Sharp corners, visible borders, neon lime focus
- `components/ui/skeleton.tsx` — Warm muted tone, sharp corners

### Phase 3: Layout Components (2026-02-22)

**Files changed:**
- `components/layout/NavBar.tsx` — Strong border-bottom, neon lime Post Deal button, solid compact nav (no frosted glass)
- `components/layout/Footer.tsx` — Dark background (foreground color), editorial split layout, grain overlay, arrow-style links, section labels
- `components/layout/MobileNav.tsx` — Neon lime active tab highlight, uppercase labels, sharp corners
- `components/layout/Sidebar.tsx` — Visible border card, section-label headers
- `components/layout/FeedHeader.tsx` — Display font heading, uppercase, retro border dropdown
- `components/layout/ProseLayout.tsx` — Display font heading, semantic border

### Phase 4: Homepage & Deal Components (2026-02-22)

**Files changed:**
- `components/home/HeroBanner.tsx` — Grain overlay, sharp corners, neon lime indicator dots, visible border
- `components/deals/DealCard.tsx` — Display font titles, neon lime price badges, outline category badges, sharp thumbnail corners, visible card borders
- `components/deals/DealFeed.tsx` — Removed divide-y (cards handle own borders)
- `components/deals/DealDetail.tsx` — Display font title, neon lime price highlight, grain overlay on images, retro borders
- `components/deals/DealForm.tsx` — Section-label labels, retro file upload area, neon lime focus states

### Phase 5: Comments System (2026-02-22)

**Files changed:**
- `components/comments/CommentSection.tsx` — Display font heading, uppercase
- `components/comments/CommentItem.tsx` — Card-style borders, display font usernames, neon lime edit focus, retro save/cancel buttons
- `components/comments/CommentForm.tsx` — Neon lime focus rings, retro submit buttons, sharp corners
- `components/comments/ReplyButton.tsx` — Display font, muted-foreground styling
- `components/comments/CommentMenu.tsx` — Retro hover states

### Phase 6: Auth & User Components (2026-02-22)

**Files changed:**
- `components/auth/LoginForm.tsx` — Section-label labels, retro toggle button
- `components/auth/AuthButton.tsx` — Display font sign-in link, sharp avatar corners
- `components/user/SettingsForm.tsx` — Section-label labels
- `components/user/DeleteAccountSection.tsx` — Sharp corners on all elements

### Phase 7: Static & Utility Pages (2026-02-22)

**Files changed:**
- `app/about/page.tsx` — Display font headings, retro step cards with visible borders
- `app/terms/page.tsx` — Display font headings, foreground color refs
- `app/privacy/page.tsx` — Display font headings, foreground color refs
- `app/contact/page.tsx` — Display font heading, retro disclaimer card
- `app/settings/page.tsx` — Display font heading, uppercase
- `app/login/page.tsx` — No changes needed (inherits from Card and LoginForm)
- `app/not-found.tsx` — Retro button styling
- `app/error.tsx` — Retro button styling
- `app/deals/[id]/not-found.tsx` — Retro button styling
- `app/deals/[id]/page.tsx` — Updated border references
- `app/loading.tsx` — Updated skeleton to match new layout
- `components/contact/ContactForm.tsx` — Section-label labels
- `components/shared/VoteButton.tsx` — Primary color upvote, retro styling
- `components/shared/EmptyState.tsx` — Display font link
- `components/shared/UserAvatar.tsx` — Sharp corners, primary color fallback

---

## Design Tokens Summary

| Token | Before | After |
|-------|--------|-------|
| Background | `oklch(1 0 0)` (pure white) | `oklch(0.98 0.005 90)` (warm cream) |
| Foreground | `oklch(0.145 0 0)` | `oklch(0.12 0 0)` (deeper black) |
| Primary | `oklch(0.27 0 0)` (dark gray) | `oklch(0.91 0.20 128)` (neon lime) |
| Primary fg | `oklch(1 0 0)` (white) | `oklch(0.12 0 0)` (black on lime) |
| Border | `oklch(0.922 0 0)` (light gray) | `oklch(0.12 0 0 / 15%)` (visible dark) |
| Ring | `oklch(0.708 0 0)` | `oklch(0.91 0.20 128)` (neon lime) |
| Radius | 0.625rem (10px) | 0.25rem (4px) |
| Display font | None | Space Grotesk |
| Body font | Plus Jakarta Sans | Plus Jakarta Sans (unchanged) |

---

## What Was NOT Changed

- Database schema, migrations, or backend logic
- Supabase queries or server actions
- Core functionality (voting, posting, commenting)
- Mobile-first responsive approach
- Next.js App Router architecture
- Component file structure or naming conventions
- Admin panel components (intentionally excluded from retro styling)
