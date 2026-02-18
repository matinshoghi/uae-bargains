# UAE Bargains — Product Brief for Tech Team

> **Created:** February 17, 2026
> **Purpose:** High-level overview for engineering/design teams

---

## What We're Building

A community-driven deals platform for UAE, enhanced by AI. Think of us as "OzBargain for Middle East" but better.

---

## The Problem We're Solving

UAE residents actively hunt for deals and bargains every day, but existing platforms are:

- **The Entertainer, Cobone, Groupon.ae, Dubai Savers** — all coupon aggregators
- **Retailer-sponsored listings** — not genuine user deals
- **No true community platform** — nothing like "Reddit for UAE bargains" exists
- **Fragmented discovery** — WhatsApp groups scattered across platforms, not searchable

**People in UAE waste hours every day trying to find a deal. The market is saturated with low-quality options.**

---

## Our Solution

A clean, modern platform where UAE residents can:
- Post genuine deals they've found
- Vote on what's valuable
- Discuss with community
- Find deals organized by category, price, and expiration
- See what's hot, new, or trending

### What It's NOT

- Not a coupon aggregator
- Not a retailer listing site
- Not a generic classifieds section
- Not a news feed

---

## Product Overview

**Core Features (MVP — 2 Weeks):**

### Posting Deals
- Title, description, price, original price, link or location
- Photo upload (proof of deal availability)
- Category selection (electronics, dining, fashion, groceries, travel)
- Expiry date with auto-gray-out logic

### Discovery & Organization
- Sort by: Hot, New, Top
- Filter by: Category, price range, location
- Daily deal feeds: "Today's Deals"
- Basic categories (focused on UAE consumer needs)

### Community Features
- Upvote/downvote deals
- Sort by hot, new, top
- Deals organized by day (today's deals, with expiry logic)
- Comments on deals
- Simple user accounts

---

## Tech Stack

- **Frontend:** React + Next.js
- **Backend:** Supabase or Firebase (to be confirmed)
- **Database:** PostgreSQL (for deal relationships)
- **Hosting:** Vercel or similar
- **UI Library:** Tailwind CSS or shadcn/ui

---

## What Makes UAE Bargains Different

### 1. AI-Enhanced Discovery
We're not building a basic scraper. We're using AI to:
- Categorize deals automatically
- Detect duplicates
- Validate pricing
- Extract key information (expiry, store hours)

### 2. Community-First Approach
Every feature starts with: *What would a UAE resident actually want?*
- Real user behavior is our north star — not theoretical assumptions
- We're building for human discovery patterns, not to disrupt them

### 3. UAE-Specific
We're not copying OzBargain. We're designed for:
- UAE currency (AED)
- UAE retailer patterns
- UAE consumer shopping behavior
- Local holidays and sale seasons
- Dubai vs Abu Dhabi vs other emirates

---

## Design Philosophy

**"Clean, clear, and credible"**

- Minimal clutter, maximum clarity
- Fast loading, mobile-first (60-70% of UAE on mobile)
- Clear deal pricing with original price comparison
- Strong visual hierarchy for deal quality
- Trust signals: user history, deal verification badges

---

## Success Metrics (What We're Measuring)

### Weeks 1-2 (Post-Launch)
- Daily active users (DAU/MAU)
- Deals posted per day
- Upvote/downvote ratio
- Average time to first post (onboarding speed)
- User retention (return rate)
- Deal quality score (upvotes/downvotes)

### Weeks 3-4 (Growth Phase)
- Community engagement (comments, discussions)
- Viral coefficient (deals shared outside platform)
- Mobile conversion (app downloads vs web)
- Content expansion (new categories, regions)
- Content quality metrics

---

## Technical Considerations

### Scalability
- Optimized database design for deal queries and filtering
- CDN delivery for fast asset serving across UAE
- Rate limiting to prevent spam while allowing genuine discovery
- Background processing for AI categorization (async, not blocking UI)

### User Experience
- Mobile-first responsive design (60-70% of UAE on mobile)
- Fast onboarding: Post first deal within 60 seconds
- Clear CTAs: "Post Deal" button, not "Join Startup"
- Trust indicators: Verified users, high-reputation badges

### Moderation
- AI-assisted: Flag suspicious deals for human review
- Community moderation: User reports + automated filters
- Geo-fencing: UAE deals only, regional IP blocking

---

## Why This Will Work

### 1. Trust Credibility from Day One
By seeding 20-30 real deals and having ~30 fake users engaging initially, visitors will see an active, vibrant community — not a ghost town.

### 2. Product-Market Fit
We're not building what WE think is cool. We're building what UAE residents have proven they want: a place to share and find real deals.

### 3. Differentiation
OzBargain works in Australia with Australians. We're UAE-specific — different currency, culture, shopping patterns, and retailers. Copy-paste won't work.

---

## Questions for Tech Team

### Product
- What's priority order for features beyond MVP?
- Should we build mobile app immediately or focus on web optimization first?
- Database preference — Supabase vs Firebase vs direct PostgreSQL?

### Design
- Any existing design system or should we start from scratch?
- Mobile-first responsive design requirements?

### Data
- What analytics tools should we integrate from Day 1?
- Do we need moderation dashboard from start?

### Growth
- What's our target DAU/MAU for first month?
- What's our user acquisition cost target per active user?
- What constitutes "traction" enough to raise a seed round?

---

## Our Vision

UAE deserves a deals platform built for UAE residents, by people who understand them.

**Let's build something real.**

---

*Prepared for: Matin & UAE Bargains Team*
*Updated with voting system research: February 17, 2026*
