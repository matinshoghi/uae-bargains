# HalaSaves Coupons — Lean MVP Strategy

**Last Updated:** 2026-03-09

---

## Core Objectives

1. **Increase platform value** with verified, curated coupon codes for top UAE retailers
2. **Enable early affiliate revenue** through Amazon.ae Associates, ArabClicks (Noon, Namshi), and Impact Radius
3. **Drive organic growth** with SEO-friendly store pages and structured data (Schema.org Offer)

---

## Strategy Principles

- **Coupons complement deals** — they are a feature of the deals platform, not a standalone product
- **Manual curation over automation** — 10 verified codes beat 500 unverified scraped codes
- **No over-engineering** — no AI extraction, no headless browser verification, no vector embeddings
- **Trust first** — show verification status, success rates, and expiry dates prominently
- **Build for traffic you have** — don't invest in automation until 5,000+ monthly visitors justify it

---

## Google SEO Considerations

**Site Reputation Abuse Policy (May 2024+):** Google penalizes sites hosting third-party white-label coupon content to exploit domain authority. HalaSaves is safe because:
- Coupons are first-party curated content, not third-party feeds
- The site's primary purpose is deals/coupons (topical authority)
- Content has genuine editorial oversight

**Opportunity:** Google's crackdown on parasite SEO removed big publishers (Forbes, CNN, etc.) from coupon SERPs, creating space for topically-focused sites like HalaSaves.

**Best Practices:**
- Index rich store aggregation pages (e.g., `/coupons/amazon-ae`)
- Avoid thin coupon pages with just a code and no context
- Use `Offer` schema with `discountCode`, `validThrough`, `priceCurrency: AED`
- Include FAQ sections for featured snippet eligibility
- Seasonal landing pages (Ramadan, White Friday) — update yearly, don't create new URLs

---

## AI Search Visibility

AI search engines (ChatGPT, Perplexity, Google AI Overviews) surface coupons from well-structured, authoritative sources. To increase citation likelihood:

- Use clear headings, bulleted lists, and Schema.org markup (LLMs are 28-40% more likely to cite structured content)
- Include unique community data: "tested by X users, Y% success rate"
- Front-load answers — put the coupon code and discount in the first sentence
- Keep content fresh with prominent verification dates
- Build brand presence across platforms (Reddit, social media)

Note: Google's "Direct Offers" in AI Mode uses Merchant Center feeds — this is a paid channel, not organic. Focus on organic structured content.

---

## Affiliate Revenue Setup

### Networks to Join

| Network | Covers | Commission | Notes |
|---------|--------|------------|-------|
| Amazon.ae Associates | Amazon.ae | 1-10% (category dependent) | Tag: `halasaves-21`. Luxury beauty 10%, most categories 1-4% |
| ArabClicks | Noon, Namshi, regional retailers | Varies (~$5.55/sale for Noon) | Single dashboard for multiple retailers |
| Impact Radius | Global + regional brands | Varies by merchant | Good for fashion, travel, tech brands |

### Revenue Reality Check

- With <1,000 monthly visitors, expect minimal revenue (AED 0-50/month)
- Focus on engagement and trust-building, not revenue optimization
- Revenue becomes meaningful at 5,000+ monthly visitors
- Deal posts with affiliate links convert better than standalone coupon pages
- Track everything from day 1 (click counts per coupon, which stores convert)

---

## Data Model

### Stores Table
```
id, name, slug (unique), logo_url, website_url,
affiliate_network, affiliate_base_url, description,
is_active, sort_order, created_at, updated_at
```

### Coupons Table
```
id, store_id (FK), code (nullable — some are link-only),
title, description, discount_type (percentage/flat/bogo/free_shipping/other),
discount_value, min_purchase, url, affiliate_url,
expires_at, is_verified, is_featured, click_count,
status (active/expired), created_at, updated_at
```

---

## Implementation Phases

### Phase 1: Foundation (Build Now)
- Stores + coupons tables in Supabase with RLS
- Admin panel to add/edit stores and coupons
- Public store pages at `/coupons/[store-slug]`
- "Copy code" button with clipboard API
- Click tracking via `/go/[store]/[coupon]` redirect
- Affiliate links for Amazon.ae, Noon, Namshi
- JSON-LD structured data (Offer schema)
- Sitemap inclusion for store pages
- Navigation links (header + mobile)

### Phase 2: Community (After 1,000+ Monthly Visitors)
- User-submitted coupons with admin moderation
- "Did this code work?" feedback buttons
- Success rate display on coupon cards
- Expiry alerts and auto-archival (cron job)
- Telegram bot for new high-value codes

### Phase 3: Content (After 5,000+ Monthly Visitors)
- AI-generated descriptions per coupon
- Store comparison pages
- Seasonal landing pages (Ramadan, White Friday, DSF)
- FAQ sections for featured snippet eligibility
- Email digest for subscribed users

---

## User Experience Principles

- **One-click copy** — tap code to copy, instant toast confirmation
- **Clear expiry** — show "Expires in X days" or "No expiry" prominently
- **Trust signals** — "Verified" badge, success rate, click count
- **Fast pages** — server-rendered, no client-side data fetching
- **Mobile-first** — responsive grid, touch-friendly copy buttons

---

## Success Metrics

| Metric | Phase 1 Target |
|--------|---------------|
| Stores listed | 10-20 top UAE retailers |
| Active coupons | 30-50 verified codes |
| Coupon click-through rate | 15%+ |
| Code copy rate | 25%+ |
| Affiliate revenue | Track only (don't optimize yet) |

---

## Priority UAE Retailers (Phase 1)

1. Amazon.ae — largest e-commerce, 1-10% commission
2. Noon — #2 in UAE, ~$5.55/sale via ArabClicks
3. Namshi — fashion leader, via ArabClicks
4. Carrefour UAE — groceries + general
5. Lulu Hypermarket — groceries + household
6. Sharaf DG — electronics
7. Max Fashion — budget fashion
8. Bath & Body Works — beauty
9. Centrepoint — department store
10. SHEIN — fast fashion

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Expired codes damage trust | Manual verification + user feedback buttons |
| Low early traffic | Coupons complement deals, not standalone |
| Thin content penalties | Rich store pages with context, not code-only pages |
| Low commission rates | Focus on high-volume stores (Amazon, Noon) |
| Competitor saturation | Differentiate with community trust signals + deals integration |

---

**Document Status:** Ready for Phase 1 implementation.
