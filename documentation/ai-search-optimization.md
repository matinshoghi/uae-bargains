# AI Search Optimization
## Goal
Improve HalaSaves’ visibility and usability for AI-assisted search systems without adding speculative markup or brittle code. The focus is on crawl access, machine-readable summaries, structured data that matches visible content, and measurement.
## What has been implemented
### 1. Explicit AI/search crawler rules
Implemented in `app/robots.ts`.

What shipped:
- Added a dedicated rule for these AI/search crawlers:
  - `GPTBot`
  - `OAI-SearchBot`
  - `ClaudeBot`
  - `Claude-SearchBot`
  - `PerplexityBot`
  - `Applebot-Extended`
- Kept the general `*` rule.
- Centralized the disallow list and base URL in shared helpers.

Why:
- This makes crawler intent explicit and reduces the chance that AI/search crawlers are accidentally treated as an afterthought.
### 2. `llms.txt` endpoint
Implemented in `app/llms.txt/route.ts`.

What shipped:
- Added a plain-text summary endpoint with:
  - site overview
  - region and currency
  - category coverage
  - links to the homepage, about page, sitemap, and dynamic deals feed
- Reused `CATEGORY_DESCRIPTIONS` from `lib/constants.ts`.
- Added caching headers for daily freshness.

Why:
- `llms.txt` is best treated as a low-cost experiment, but it is easy to maintain and provides a concise machine-readable overview of the site.
### 3. Dynamic deals feed for AI consumption
Implemented in `app/llms-full.txt/route.ts`.

What shipped:
- Added a dynamic plain-text feed of the top 50 active deals.
- Data comes from Supabase via `createClient()`.
- Output includes:
  - deal title
  - canonical deal URL
  - current price and original price when available
  - discount percentage
  - category
  - merchant hostname
  - promo code
  - location
  - expiry date
  - community votes
  - short plain-text summary
- Reused shared formatting and parsing helpers from `lib/utils.ts`.
- Added hourly cache headers.

Why:
- This creates a stable, current, machine-friendly summary of the most important deals on the site.
### 4. Stronger deal-page structured data
Implemented in `components/seo/DealJsonLd.tsx`.

What shipped:
- Added `datePublished`
- Added `dateModified`
- Added merchant `seller` when a valid merchant URL exists
- Added `aggregateRating` derived from visible community vote totals
- Kept Product + BreadcrumbList structure

Why:
- These fields are directly tied to visible page content and align better with structured-data quality guidance than speculative markup would.
### 5. Homepage `ItemList` structured data
Implemented in `components/seo/HomeJsonLd.tsx` and `app/page.tsx`.

What shipped:
- `HomeJsonLd` now accepts rendered deals as input.
- Added an `ItemList` schema for the top deals already present in the initial homepage HTML.
- Kept existing `WebSite` and `Organization` schema.

Why:
- This gives crawlers and AI systems a structured summary of currently visible deals without marking up hidden or non-rendered content.
### 6. AI referral tracking
Implemented in `components/providers/PostHogProvider.tsx`.

What shipped:
- Detects likely AI referrals from known referrer domains:
  - ChatGPT
  - Perplexity
  - Gemini
  - Grok
  - Copilot
  - Claude
- Also checks `utm_source` where present.
- Captures an `ai_referral` event once per session.
- Stores `first_ai_source` via PostHog registration.

Why:
- This gives us real measurement instead of guessing whether the work is actually producing traction.
### 7. Sitemap update
Implemented in `app/sitemap.ts`.

What shipped:
- Added `llms.txt` to the sitemap output.

Why:
- This improves discoverability of the machine-readable summary endpoint.
## Shared helpers added
Implemented in `lib/site.ts` and `lib/utils.ts`.

What shipped:
- `BASE_URL`
- `AI_BOT_USER_AGENTS`
- `getDealUrl()`
- `getUrlHostname()`
- `truncateText()`

Why:
- Keeps the implementation cleaner and avoids repeating URL, hostname, and formatting logic across routes and schema components.
## What we intentionally did not implement
### FAQ schema on the about page
Not implemented.

Reason:
- The current about page is not written as visible FAQ content.
- This is lower-value than product/list/crawl improvements for the current site.
### `speakable` markup and hidden summaries
Not implemented.

Reason:
- Support is limited and the return on complexity is weak for this type of site.
## Files changed
- `app/robots.ts`
- `app/sitemap.ts`
- `app/llms.txt/route.ts`
- `app/llms-full.txt/route.ts`
- `components/seo/DealJsonLd.tsx`
- `components/seo/HomeJsonLd.tsx`
- `app/page.tsx`
- `components/providers/PostHogProvider.tsx`
- `lib/site.ts`
- `lib/utils.ts`
## Validation completed during implementation
- `npm run build` passed
- `npm run lint` did not pass because of unrelated pre-existing lint issues elsewhere in the repo
## How to test
### 1. Robots output
Open:
- `/robots.txt`

Verify:
- dedicated AI/search crawler rule is present
- general `*` rule is still present
- sitemap points to `/sitemap.xml`
- AI bot names appear exactly as configured
- disallow paths are correct
### 2. Sitemap output
Open:
- `/sitemap.xml`

Verify:
- homepage, static pages, deal pages, and `/llms.txt` are included
- deal URLs are emitted correctly
### 3. `llms.txt`
Open:
- `/llms.txt`

Verify:
- response is plain text
- content is readable and concise
- region, currency, categories, and key URLs are correct
- cache headers exist
### 4. `llms-full.txt`
Open:
- `/llms-full.txt`

Verify:
- response is plain text
- top deals appear in the expected order
- each entry has a valid canonical URL
- prices, merchant names, and summaries look clean
- markdown noise is stripped from descriptions
- cache headers exist

Also test:
- when the query fails, the route returns a plain-text error response instead of crashing
### 5. Deal-page structured data
Test a live deal URL with:
- Google Rich Results Test
- Schema Markup Validator

Verify:
- Product schema is detected
- BreadcrumbList schema is detected
- `datePublished` and `dateModified` are present
- `seller` appears when the deal has an outbound merchant URL
- `aggregateRating` appears only when the deal has vote totals
- the visible page content matches the structured data
### 6. Homepage structured data
Test the homepage with:
- Google Rich Results Test
- Schema Markup Validator

Verify:
- `WebSite` schema is present
- `Organization` schema is present
- `ItemList` schema is present
- the listed deals correspond to deals already visible in the initial page HTML
### 7. PostHog AI referral tracking
Manual browser tests:
1. Open the site with a fake `utm_source`, for example `?utm_source=chatgpt`
2. Confirm a single `ai_referral` event is captured
3. Navigate again in the same session
4. Confirm the event is not duplicated every pageview

PostHog checks:
- event name: `ai_referral`
- properties: `ai_source`, `referrer_url`, `landing_path`
- user property: `first_ai_source`
### 8. Build safety
Run:
- `npm run build`

Why:
- confirms the route handlers, JSON-LD components, and metadata routes compile
## What else we should do next
These are the highest-value next steps.
### 1. Verify CDN/WAF bot allow rules
Robots alone is not enough. If a CDN, firewall, or bot-protection layer blocks these requests, the robots changes will not help.
### 2. Strengthen canonical data consistency
Audit the top deal pages and make sure:
- title
- price
- original price
- discount
- expiry
- merchant
- category

are all consistent across:
- visible HTML
- JSON-LD
- metadata description
- `llms-full.txt`

This consistency matters more than adding more schema types.
### 3. Improve merchant and brand entity signals
The `Organization` schema currently has an empty `sameAs` array. Fill this with real social or brand profiles once available.
### 4. Add better source content for citation
Good follow-up content to add:
- category landing pages with concise summaries
- merchant pages
- “best deals this week” editorial summaries
- short buying guides for recurring UAE shopping intents
### 5. Monitor crawl and referral logs
Track:
- AI crawler hits by bot
- top crawled pages
- blocked bot traffic
- AI referrals by source
- landing pages that convert best
### 6. Revisit the vote-based rating model
The current `aggregateRating` is defensible because it is derived from visible community votes, but it is still worth reviewing whether the rating scale best represents user sentiment.
### 7. Submit and recheck
After deployment:
- submit the updated sitemap in Search Console
- inspect key deal URLs
- re-run Rich Results tests
- check server logs for crawler access over the next 2-4 weeks
## Recommended dashboards
### PostHog
- AI referrals by source
- AI referral trend over time
- top landing pages from AI referrals
- conversion rate of AI-referred visitors
### Infrastructure / logs
- requests by crawler user-agent
- 403/401 responses for AI/search bots
- top crawled deal URLs
- `robots.txt` hits
## Notes
This document intentionally avoids overconfident GEO claims. The strongest current levers are still:
- clean crawl access
- clear and visible structured data
- fresh, well-linked source pages
- stable machine-readable summaries
- measurement
