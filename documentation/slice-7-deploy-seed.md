# Slice 7 — Deploy + Seed

> **Goal:** Deploy to Vercel, seed real content, run full end-to-end testing.
> **Duration:** Days 13–14
> **Depends on:** Slices 1–6 (all features)

---

## Overview

This is the final slice. The app is feature-complete. This slice focuses on deploying to production, seeding the database with real UAE deals, running comprehensive tests, and preparing for the initial share with friends.

---

## 1. Vercel Deployment

### 1.1 Connect Repository

1. Push code to GitHub (private repo)
2. Go to vercel.com → Import Project → select the repo
3. Framework: Next.js (auto-detected)
4. Root directory: `uae-bargains` (since the Next.js project is nested)

### 1.2 Environment Variables

Set in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | All |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | Production only |

### 1.3 Supabase Auth Configuration

Update Supabase Dashboard → Authentication → URL Configuration:
- **Site URL:** `https://your-domain.vercel.app`
- **Redirect URLs:** Add `https://your-domain.vercel.app/auth/callback`

Update Google OAuth redirect URIs in Google Cloud Console:
- Add `https://your-domain.vercel.app/auth/callback`

### 1.4 Domain (Optional)

If you have a custom domain:
1. Vercel → Settings → Domains → Add domain
2. Update DNS records
3. Update Supabase Site URL and redirect URLs
4. Update Google OAuth redirect URIs

### 1.5 Build Verification

```bash
# Local build test before deploying
npm run build
```

Fix any build errors (type errors, missing imports, etc.) before pushing.

---

## 2. Content Seeding

### 2.1 Strategy

Seed 20–30 real UAE deals across all 5 categories. These must be genuine, currently active deals from real UAE retailers.

### 2.2 Deal Sources

| Category | Retailers to Check |
|----------|-------------------|
| Electronics | Sharaf DG, Jumbo, Virgin Megastore, Amazon.ae, Noon.com |
| Dining | Zomato, Talabat, The Entertainer, Groupon.ae |
| Fashion | Namshi, 6thStreet, Splash, Max Fashion, Brands for Less |
| Groceries | Carrefour, Lulu, Union Coop, Amazon.ae Fresh |
| Travel | Skyscanner UAE, Booking.com, Wego, flydubai |

### 2.3 Seeding Process

1. Create 2–3 test user accounts (your own + test accounts)
2. Log in as each account
3. Use the `/deals/new` form to post real deals — this also validates the posting flow
4. Aim for:
   - 5–6 deals per category
   - Mix of price ranges (some free, some high-discount, some moderate)
   - Include images where possible
   - Set realistic expiry dates
   - Include a few "hot" deals and some mediocre ones (variety)
5. Upvote/downvote deals from different accounts to create realistic vote distributions

### 2.4 Example Seed Deals

```
Electronics:
- "AirPods Pro 2 — AED 699 (was AED 999) at Sharaf DG"
- "Samsung Galaxy S24 FE — AED 1,499 at Amazon.ae"

Dining:
- "Buy 1 Get 1 Free on all pizzas — Pizza Hut UAE this weekend"
- "50% off first Talabat order with code WELCOME50"

Fashion:
- "Namshi Sale — Up to 70% off on selected brands"
- "Brands for Less — Everything under AED 50 event"

Groceries:
- "Carrefour 3-Day Super Sale — up to 50% off"
- "Lulu Hypermarket Weekly Deals — fresh produce offers"

Travel:
- "Flydubai flash sale — Flights from AED 399 return"
- "Booking.com UAE — 15% off stays with code UAESAVE"
```

### 2.5 Seed Comments

Add 2–3 comments per popular deal:
- "Great deal! Picked one up yesterday."
- "Anyone know if this works at the Dubai Mall branch?"
- "Price was AED 50 cheaper at Noon last week"

This creates the illusion of an active community.

---

## 3. Pre-Launch Checklist

### 3.1 Functionality

- [ ] Sign up with Google works on production
- [ ] Sign up with email works on production
- [ ] Sign in / sign out works
- [ ] Post a deal with all fields
- [ ] Post a deal with minimum fields
- [ ] Image upload works
- [ ] Homepage loads with seeded deals
- [ ] Hot/New/Top sorting works
- [ ] Category filtering works
- [ ] Load more pagination works
- [ ] Upvote/downvote on deals works
- [ ] Vote states persist after refresh
- [ ] Post a comment
- [ ] Reply to a comment
- [ ] Vote on comments
- [ ] User profile page loads
- [ ] Settings page: update name, username, avatar
- [ ] Expired deals show correctly
- [ ] All links (deal URLs, user profiles) work

### 3.2 Mobile

- [ ] All pages usable at 375px width
- [ ] Bottom nav works on mobile
- [ ] Touch targets adequate (44px minimum)
- [ ] No horizontal overflow on any page
- [ ] Category bar scrolls horizontally
- [ ] Image upload works on mobile (camera/gallery picker)
- [ ] Forms are usable with mobile keyboard

### 3.3 Performance

- [ ] Run Lighthouse on homepage: Performance 90+, Accessibility 95+
- [ ] Run Lighthouse on deal detail page
- [ ] No layout shift from images (all have width/height)
- [ ] First Contentful Paint < 1.5s
- [ ] Check Vercel Analytics after deployment

### 3.4 SEO

- [ ] Homepage has correct `<title>` and `<meta>` tags
- [ ] Deal pages have dynamic OG tags
- [ ] All images have `alt` text
- [ ] No broken links (internal)

### 3.5 Security

- [ ] RLS policies working — test from browser console:
  - Cannot insert deal as another user
  - Cannot delete other users' deals
  - Cannot read other users' votes
- [ ] `.env.local` is gitignored
- [ ] Service role key is NOT exposed to the client
- [ ] No XSS: deal titles/descriptions are safely rendered (React handles this by default)
- [ ] External deal URLs open with `rel="noopener noreferrer"`

---

## 4. Monitoring Setup

### 4.1 Vercel Analytics

Auto-enabled on deployment. Tracks:
- Core Web Vitals
- Page views
- Geographic distribution (useful to see UAE traffic)

### 4.2 Supabase Dashboard

Monitor via Supabase Dashboard:
- Database size and row counts
- Auth user count
- Storage usage
- API request volume

### 4.3 Error Tracking (Post-MVP)

Consider adding Sentry later for production error tracking. Not needed for initial launch.

---

## 5. Launch Plan

### Day 1 Post-Deploy

1. Verify everything works on production URL
2. Seed all 20–30 deals
3. Add comments and votes from test accounts
4. Share link with 3–5 close friends for initial testing
5. Fix any issues they report

### Day 2 Post-Deploy

1. Share with full group of 15–20 friends
2. Frame it as: "I built this — here's where you can share deals you find in UAE"
3. Don't ask people to "join a startup" — just share the link
4. Monitor for:
   - New sign-ups
   - Deals posted by others
   - Votes and comments
   - Any errors or broken flows

### Ongoing

- Check daily: new users, deals posted, engagement
- Fix bugs immediately
- Note feature requests from users
- Prepare for UI revamp once core flow is validated

---

## 6. File Structure — Final

```
uae-bargains/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── globals.css
│   ├── favicon.ico
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── callback/route.ts
│   ├── auth/
│   │   └── callback/route.ts
│   ├── deals/
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       ├── loading.tsx
│   │       └── not-found.tsx
│   ├── category/
│   │   └── [slug]/page.tsx
│   ├── user/
│   │   └── [username]/
│   │       ├── page.tsx
│   │       └── loading.tsx
│   └── settings/
│       └── page.tsx
├── components/
│   ├── ui/                        (shadcn primitives)
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── MobileNav.tsx
│   │   └── CategoryBar.tsx
│   ├── deals/
│   │   ├── DealCard.tsx
│   │   ├── DealCardSkeleton.tsx
│   │   ├── DealDetail.tsx
│   │   ├── DealForm.tsx
│   │   ├── DealFeed.tsx
│   │   ├── DealSortTabs.tsx
│   │   ├── DealPriceBadge.tsx
│   │   ├── DealExpiredBadge.tsx
│   │   └── LoadMoreButton.tsx
│   ├── comments/
│   │   ├── CommentSection.tsx
│   │   ├── CommentList.tsx
│   │   ├── CommentItem.tsx
│   │   ├── CommentForm.tsx
│   │   └── ReplyButton.tsx
│   ├── auth/
│   │   ├── AuthButton.tsx
│   │   ├── LoginForm.tsx
│   │   └── OAuthButton.tsx
│   ├── user/
│   │   ├── UserProfile.tsx
│   │   └── SettingsForm.tsx
│   └── shared/
│       ├── VoteButton.tsx
│       ├── TimeAgo.tsx
│       ├── Avatar.tsx
│       └── EmptyState.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   ├── queries/
│   │   ├── deals.ts
│   │   ├── comments.ts
│   │   └── profiles.ts
│   ├── actions/
│   │   ├── auth.ts
│   │   ├── deals.ts
│   │   ├── votes.ts
│   │   ├── comments.ts
│   │   └── profile.ts
│   ├── validations/
│   │   ├── deal.ts
│   │   └── profile.ts
│   ├── utils.ts
│   └── constants.ts
├── middleware.ts
├── next.config.ts
├── package.json
├── tsconfig.json
└── documentation/
    ├── slice-1-foundation.md
    ├── slice-2-deal-posting.md
    ├── slice-3-feed-discovery.md
    ├── slice-4-voting.md
    ├── slice-5-comments.md
    ├── slice-6-profiles-polish.md
    └── slice-7-deploy-seed.md
```

**Total components:** ~25
**Total files (non-UI):** ~20
**Estimated lines of code:** 2,500–3,500 (excluding generated types and shadcn)

---

## Test Cases

### T7.1 — Production Deployment
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Build succeeds | Run `npm run build` locally | No errors, build completes |
| 2 | Vercel deploy succeeds | Push to main branch | Vercel auto-deploys, green checkmark |
| 3 | Production URL loads | Visit deployed URL | Homepage loads with no errors |
| 4 | HTTPS works | Check browser padlock | Valid SSL certificate |
| 5 | Environment variables work | Trigger any Supabase operation | No "missing env" errors |

### T7.2 — Production Auth
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Google OAuth on production | Sign in with Google on production URL | Completes successfully, profile created |
| 2 | Email signup on production | Sign up with email | Confirmation email received, can verify |
| 3 | Session persists on production | Sign in, close browser, reopen | Still logged in |
| 4 | Redirect URLs correct | Complete OAuth flow | Redirected to production URL (not localhost) |

### T7.3 — Content Seeding
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | 20+ deals seeded | Count deals in database | At least 20 real UAE deals |
| 2 | All categories covered | Check category distribution | Each category has 3+ deals |
| 3 | Deals have images | Browse feed | Most deals show thumbnails |
| 4 | Deals have varied votes | Browse feed | Vote counts vary (some 0, some 5-15) |
| 5 | Comments seeded | Open a popular deal | At least 2-3 comments present |
| 6 | Expired deal exists | Check feed | At least 1 expired deal visible (dimmed) |

### T7.4 — End-to-End User Journey
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | New user journey | Sign up → browse feed → upvote deal → open deal → comment → post own deal | All steps complete without errors |
| 2 | Anonymous browsing | Visit site without signing in | Can browse deals, see comments. Voting/posting prompts login. |
| 3 | Mobile full journey | Complete test #1 on mobile device | All steps work on mobile |
| 4 | Share a deal URL | Copy deal URL, open in incognito | Deal page loads with OG preview |

### T7.5 — Performance (Production)
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Lighthouse homepage | Run Lighthouse on production homepage | Performance 90+, Accessibility 95+ |
| 2 | Lighthouse deal page | Run Lighthouse on a deal detail page | Performance 85+, Accessibility 95+ |
| 3 | Mobile performance | Run Lighthouse mobile audit | Performance 85+, no mobile-specific issues |
| 4 | Time to interactive | Measure on 4G throttled connection | < 3 seconds |
| 5 | Image optimization | Check network tab for images | Served as WebP/AVIF via Next.js Image |

### T7.6 — Security (Production)
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | RLS: can't spoof user_id | Try inserting deal with different user_id via API | Blocked by RLS |
| 2 | RLS: can't delete other's deal | Try deleting another user's deal | Blocked by RLS |
| 3 | RLS: can't read other's votes | Query votes table for other users | Empty result |
| 4 | No env leak | Check browser source/network | Service role key not exposed |
| 5 | External links safe | Click "Go to Deal" on any deal | Opens with `rel="noopener noreferrer"` |
| 6 | XSS: script in title | Create deal with `<script>alert(1)</script>` in title | Rendered as text, not executed |

### T7.7 — Cross-Browser
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Chrome | Full user journey | Works correctly |
| 2 | Safari | Full user journey | Works correctly |
| 3 | Firefox | Full user journey | Works correctly |
| 4 | Mobile Safari (iOS) | Full user journey on iPhone | Works correctly |
| 5 | Chrome Mobile (Android) | Full user journey on Android | Works correctly |
