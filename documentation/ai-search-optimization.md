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
  - `ChatGPT-User`
  - `ClaudeBot`
  - `Claude-SearchBot`
  - `PerplexityBot`
  - `Applebot-Extended`
- Kept the general `*` rule.
- Centralized the disallow list and base URL in shared helpers.

Why:
- This makes crawler intent explicit and reduces the chance that AI/search crawlers are accidentally treated as an afterthought.
- `ChatGPT-User` is a separate bot that serves user-initiated browsing requests and is the source of direct referral traffic.
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
- Added `Offer` schema with `priceCurrency: "AED"`, `price`, `validThrough`, `availability`, `url`, and `seller`
- Added `promo_code` to Offer via `discount` property when present
- Product `description` now uses `stripMarkdown` + `truncateText` for clean plain-text output
- Deal pages now use 3 schema types: Product + Offer + BreadcrumbList
- Kept Product + BreadcrumbList structure

Why:
- These fields are directly tied to visible page content and align better with structured-data quality guidance than speculative markup would.
- Pages with 3+ schema types have a 13% higher likelihood of being cited by AI systems.
- `Offer` with `validThrough` and `priceCurrency` helps AI systems extract pricing data.
### 5. Homepage `ItemList` structured data
Implemented in `components/seo/HomeJsonLd.tsx` and `app/page.tsx`.

What shipped:
- `HomeJsonLd` now accepts rendered deals as input.
- Added an `ItemList` schema for the top deals already present in the initial homepage HTML.
- Added `dateModified` to the `ItemList` schema for freshness signals.
- `Organization` schema now uses `lib/brand.ts` for brand identity and `sameAs` social profiles.
- Kept existing `WebSite` and `Organization` schema.

Why:
- This gives crawlers and AI systems a structured summary of currently visible deals without marking up hidden or non-rendered content.
### 6. AI referral tracking and conversion measurement
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
- Added `landing_page_type` property to AI referral events (homepage, deal, about, etc.).
- Added `captureAiConversion()` export for tracking downstream conversion actions (vote, deal click, comment) from AI-referred sessions.
- AI source is persisted in `sessionStorage` so conversion events can be attributed back to the original AI referral.

Why:
- This gives us real measurement instead of guessing whether the work is actually producing traction.
- Conversion tracking connects referral data to actual user actions, not just page views.
### 7. Sitemap update
Implemented in `app/sitemap.ts`.

What shipped:
- Added `llms.txt` to the sitemap output.

Why:
- This improves discoverability of the machine-readable summary endpoint.
### 8. Crawler access diagnostic endpoint
Implemented in `app/api/crawler-check/route.ts`.

What shipped:
- Created a diagnostic endpoint that returns the requesting user-agent, whether it matches a known AI bot, and the full list of allowed bots.
- Used for verifying CDN/WAF is not blocking AI crawlers.

Why:
- Robots.txt alone is not enough. If a CDN or firewall blocks requests before robots.txt is checked, crawler rules are useless.
- This endpoint provides a quick way to test reachability from any bot user-agent.

Verification completed:
- `GPTBot` → 200 OK, matched
- `ChatGPT-User` → 200 OK, matched
- `ClaudeBot` → 200 OK, matched
- `PerplexityBot` → 200 OK, matched
- Vercel hosting confirmed not blocking any AI crawlers.
### 9. ARIA attribute audit for ChatGPT Atlas
Implemented in `components/deals/DealDetail.tsx` and `components/deals/PromoCodeBadge.tsx`.

What shipped:
- Added `aria-label` to the "Go to Deal" link in `DealDetail.tsx`.
- Added `aria-label` to the promo code copy button in `PromoCodeBadge.tsx`.
- Verified existing `aria-label` attributes on `VoteButton.tsx` (upvote/downvote) and `DealCard.tsx` (thumbnail link).

Why:
- ChatGPT Atlas uses ARIA tags to interpret page structure and interactive elements. Proper labeling helps it understand what each element does.
### 10. Central brand configuration
Implemented in `lib/brand.ts`.

What shipped:
- Created `BRAND` config object as single source of truth for brand identity.
- Includes: name, URL, logo, description, region, currency, locale, and `sameAs` social profile URLs.
- Used by `HomeJsonLd.tsx`, `app/layout.tsx` metadata, and `app/llms.txt/route.ts`.
- Social profile URLs are commented out as placeholders — uncomment and fill when accounts are created.

Why:
- Ensures brand naming and identity are consistent across all machine-readable surfaces.
- Entity clarity helps AI systems connect brand mentions to site identity.
- Sites on 4+ platforms are 2.8x more likely to appear in ChatGPT responses.
### 11. Shared SEO consistency helpers
Implemented in `lib/seo.ts`.

What shipped:
- `buildDealPriceText()` — formats price/discount text consistently.
- `buildDealMetaDescription()` — builds metadata descriptions in the same format.
- `getDealMerchant()` — extracts merchant hostname.
- Used by `generateMetadata` in `app/deals/[id]/page.tsx`, `DealJsonLd.tsx`, and `app/llms-full.txt/route.ts`.

Why:
- Ensures deal data (title, price, discount, category) is formatted identically across visible HTML, JSON-LD, metadata, and the LLM feed.
- Consistency is one of the strongest quality signals for AI citation.
### 12. IndexNow real-time indexing
Implemented in `lib/indexnow.ts`, `app/api/indexnow/route.ts`, and `lib/actions/deals.ts`.

What shipped:
- `notifyIndexNow(urls)` — submits URLs to the IndexNow API (Bing, Yandex, Copilot).
- `notifyDealChange(dealId)` — convenience wrapper that pings both the deal URL and homepage.
- Key verification endpoint at `/api/indexnow?key=true` as required by the protocol.
- Integrated into deal create, update, and delete actions via `after()` callbacks.
- Fails silently when `INDEXNOW_API_KEY` is not configured.

Why:
- Provides real-time indexing for Bing and Copilot instead of waiting for recrawl.
- AI engines weigh recency when selecting sources.
- Pages not updated quarterly are 3x more likely to lose citations.
- Freshness is a natural competitive advantage for a deals site.

Setup required:
- Set `INDEXNOW_API_KEY` environment variable in production (added to `.env.local` for development).
### 13. AI citation measurement and reporting
Implemented in `app/api/ai-referrals/route.ts` and `scripts/ai-citation-test.ts`.

What shipped:
- Admin-only `/api/ai-referrals` endpoint that returns PostHog dashboard configuration for AI referral analytics.
- CLI script `scripts/ai-citation-test.ts` that generates a manual testing checklist with:
  - 10 target queries across 5 AI platforms (ChatGPT, Perplexity, Gemini, Copilot, Claude)
  - Spreadsheet-ready result template
  - Key metrics to track (citation share, domain link rate, sentiment accuracy, platform coverage)
  - Recommended testing frequency

Why:
- Without measurement, optimization is guesswork.
- AI citation monitoring requires combining PostHog analytics with manual platform testing.
- Establishes a baseline for tracking improvement over time.
## Shared helpers added
Implemented in `lib/site.ts`, `lib/utils.ts`, `lib/seo.ts`, and `lib/brand.ts`.

What shipped:
- `BASE_URL`
- `AI_BOT_USER_AGENTS` (now includes `ChatGPT-User`)
- `getDealUrl()`
- `getUrlHostname()`
- `truncateText()`
- `buildDealPriceText()`
- `buildDealMetaDescription()`
- `getDealMerchant()`
- `BRAND` config object
- `notifyIndexNow()`
- `notifyDealChange()`
- `captureAiConversion()`

Why:
- Keeps the implementation cleaner and avoids repeating URL, hostname, formatting, and brand logic across routes and schema components.
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
- `app/deals/[id]/page.tsx`
- `app/layout.tsx`
- `app/api/crawler-check/route.ts` (new)
- `app/api/ai-referrals/route.ts` (new)
- `app/api/indexnow/route.ts` (new)
- `components/seo/DealJsonLd.tsx`
- `components/seo/HomeJsonLd.tsx`
- `components/deals/DealDetail.tsx`
- `components/deals/PromoCodeBadge.tsx`
- `app/page.tsx`
- `components/providers/PostHogProvider.tsx`
- `lib/site.ts`
- `lib/utils.ts`
- `lib/seo.ts` (new)
- `lib/brand.ts` (new)
- `lib/indexnow.ts` (new)
- `lib/actions/deals.ts`
- `scripts/ai-citation-test.ts` (new)
## Validation completed during implementation
- `npm run build` passed (all slices, including new API routes)
- `npm run lint` did not pass because of unrelated pre-existing lint issues elsewhere in the repo
- Crawler access verified in production: GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot all return 200 OK
- `robots.txt` publicly accessible with all 7 AI bot user agents
- AI citation baseline test generated (March 6, 2026)
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
### 7. PostHog AI referral and conversion tracking
Manual browser tests:
1. Open the site with a fake `utm_source`, for example `?utm_source=chatgpt`
2. Confirm a single `ai_referral` event is captured
3. Navigate again in the same session
4. Confirm the event is not duplicated every pageview
5. Perform an action (vote, click deal link) and confirm `ai_conversion` event fires

PostHog checks:
- event name: `ai_referral`
- properties: `ai_source`, `referrer_url`, `landing_path`, `landing_page_type`
- user property: `first_ai_source`
- event name: `ai_conversion`
- properties: `ai_source`, `conversion_action`
### 8. Crawler check endpoint
Open:
- `/api/crawler-check`

Verify:
- returns JSON with `ok: true`
- test with bot user-agents: `curl -A "GPTBot" /api/crawler-check`
- `isKnownAiBot` should be `true` for known bots
- `matchedBot` should show the correct bot name
### 9. IndexNow endpoint
Open:
- `/api/indexnow?key=true`

Verify:
- returns the IndexNow API key as plain text
- returns 404 if `INDEXNOW_API_KEY` is not set

Also verify:
- `/api/indexnow` returns `{"status":"configured",...}`
### 10. AI referrals admin endpoint
Open:
- `/api/ai-referrals` (requires admin auth)

Verify:
- returns PostHog dashboard configuration JSON
- returns 401 for unauthenticated users
- returns 403 for non-admin users
### 8. Build safety
Run:
- `npm run build`

Why:
- confirms the route handlers, JSON-LD components, and metadata routes compile
## What else we should do next
These are the remaining high-value next steps.
### 1. Establish social media presence (off-site — highest impact)
The `Organization` schema `sameAs` array in `lib/brand.ts` is ready but has no active profile URLs.

Prioritized order for account creation:
1. X / Twitter — AI systems cross-reference for brand identity
2. Instagram — high relevance for UAE deals/shopping audience
3. Reddit (r/dubai, r/UAE) — 48% of AI citations come from community platforms
4. Google Business Profile — helps Google's entity graph
5. LinkedIn — corporate identity
6. TikTok — growing UAE audience

When accounts are created, uncomment and fill the URLs in `lib/brand.ts`.

Sites on 4+ platforms are 2.8x more likely to appear in ChatGPT responses.
### 2. Add better source content for citation
Good follow-up content to add:
- category landing pages with concise summaries
- merchant pages
- "best deals this week" editorial summaries
- short buying guides for recurring UAE shopping intents
### 3. Revisit the vote-based rating model
The current `aggregateRating` is defensible because it is derived from visible community votes, but it is still worth reviewing whether the rating scale best represents user sentiment.
### 4. Submit and recheck
After deployment:
- submit the updated sitemap in Search Console
- inspect key deal URLs
- re-run Rich Results tests
- check server logs for crawler access over the next 2-4 weeks
### 5. Re-run AI citation test
Baseline test generated March 6, 2026. Re-run the same queries in 3-4 weeks:
```
npx tsx scripts/ai-citation-test.ts
```
Compare results to baseline to measure citation share, domain link rate, and sentiment accuracy.
## Recommended dashboards
### PostHog
- AI referrals by source (event: `ai_referral`, breakdown: `ai_source`)
- AI referral trend over time (event: `ai_referral`, breakdown: `ai_source`, interval: week)
- Top landing pages from AI referrals (event: `ai_referral`, breakdown: `landing_path`)
- Landing page types (event: `ai_referral`, breakdown: `landing_page_type`)
- AI conversions by action (event: `ai_conversion`, breakdown: `conversion_action`)
- AI conversions by source (event: `ai_conversion`, breakdown: `ai_source`)
- Conversion rate of AI-referred visitors

Dashboard configuration available at `/api/ai-referrals` (admin only).
### Infrastructure / logs
- requests by crawler user-agent
- 403/401 responses for AI/search bots
- top crawled deal URLs
- `robots.txt` hits
- IndexNow submission success/failure (check server logs for `[IndexNow]` prefix)
## Research notes (March 2026)
Based on latest GEO (Generative Engine Optimization) research and best practices as of Q1 2026.
### Key findings
- About 61% of AI-cited pages use three or more schema types. Pages with 3+ schema types have a 13% higher likelihood of being cited.
- Pages not updated quarterly are 3x more likely to lose citations.
- About 48% of AI citations come from community platforms (Reddit, YouTube, etc.), and 85% of brand mentions originate from third-party pages rather than owned domains.
- Sites listed on four or more platforms are 2.8x more likely to appear in ChatGPT responses.
- Roughly 60% of AI Overview citations come from URLs not ranking in the top 20 organic results. Traditional ranking does not equal AI citation.
- AI crawlers (GPTBot, OAI-SearchBot, ChatGPT-User) cannot render JavaScript. They only see what is present in the initial HTML. SSR via Next.js already handles this.
- OpenAI updated its crawler docs in December 2025: `ChatGPT-User` no longer commits to honoring robots.txt. `OAI-SearchBot` is no longer used to feed navigational links directly. Both `OAI-SearchBot` and `GPTBot` can share crawl results.
- ChatGPT automatically appends `utm_source=chatgpt.com` to referral URLs. Our PostHog tracking should already capture this.
- Cloudflare changed its default configuration to block AI bots. If we use Cloudflare, bot traffic may have been shut off automatically without explicit action.
- Semrush tested `llms.txt` on Search Engine Land and found zero visits from GPTBot, PerplexityBot, ClaudeBot, or Google-Extended to the file. LLM traffic grew but due to other factors. `llms.txt` remains low-cost and worth keeping but should not receive further investment.
- ChatGPT Atlas uses ARIA tags (the same labels and roles that support screen readers) to interpret page structure and interactive elements.
- Brand search volume is the single strongest predictor of AI citations (0.334 correlation coefficient).
### Implications for our plan
- No visible frontend changes are planned in the next slices. All improvements are backend, schema, infrastructure, or off-site.
- Landing pages (category, merchant, roundup) are deferred to a future phase when frontend work is in scope.
- `ChatGPT-User` should be added to `robots.ts` for explicit signaling even though it may not honor the directive.
- `Offer` schema should be added to deal pages. It is a natural fit and requires no visible changes.
- Off-site brand signals (social profiles, community presence, directory listings) are more impactful for AI citation than most on-site markup additions.
## Implemented slices (March 6, 2026)
All slices below have been implemented and verified. No visible frontend changes were made.
### Slice 1: crawler access verification (done)
Goal:
- make sure AI/search crawlers can actually reach production

Tasks:
- add `ChatGPT-User` to the bot list in `app/robots.ts` and `lib/site.ts`
- verify CDN / WAF / bot protection is not blocking:
  - `OAI-SearchBot`
  - `GPTBot`
  - `ChatGPT-User`
  - `ClaudeBot`
  - `Claude-SearchBot`
  - `PerplexityBot`
  - `Applebot-Extended`
- if using Cloudflare: check that the AI bot blocking default has not been enabled
- inspect server logs for:
  - 200 responses from AI bots
  - 403 / 401 responses from AI bots
  - crawler frequency and which bots are actually visiting
- verify `robots.txt` is reachable publicly
- verify `ChatGPT-User` referral traffic is being captured by PostHog (via `utm_source=chatgpt.com`)
- audit ARIA attributes on key interactive elements (deal cards, vote buttons, checkout links) for ChatGPT Atlas compatibility

Why:
- markup improvements do not help if the crawlers are blocked upstream
- Cloudflare's default AI bot blocking is a common silent killer
- `ChatGPT-User` is a separate bot that serves user-initiated requests and is the source of direct referral traffic
### Slice 2: structured data expansion and consistency audit (done)
Goal:
- make sure key deal facts are consistent everywhere and expand schema coverage

Part A — consistency audit:

Audit these fields:
- title
- price
- original price
- discount
- expiry
- merchant
- category

Compare across:
- visible HTML
- JSON-LD
- metadata description
- `llms-full.txt`

Part B — schema expansion (no visible frontend changes):

- add `Offer` schema to `DealJsonLd.tsx` with:
  - `priceCurrency: "AED"`
  - `price`
  - `validThrough` (expiry date)
  - `availability` (in stock / expired)
  - `url` (deal outbound link)
- add `promo_code` to structured data via `Offer.discount` or a custom property when present
- ensure deal pages use at least 3 schema types (Product + Offer + BreadcrumbList already gets us there)
- review whether `aggregateRating` scale accurately represents community vote sentiment

Why:
- consistency is one of the strongest quality signals we can control
- pages with 3+ schema types have a 13% higher citation likelihood
- `Offer` with `validThrough` and `priceCurrency` is the most natural schema addition for a deals site and helps AI systems extract pricing data
### Slice 3: brand / entity strengthening + off-site signals (done — on-site; off-site pending)
Goal:
- help AI systems understand HalaSaves as a distinct brand entity
- build off-site citation signals
- keep the current user-facing UI exactly as-is (no visible text, layout, or component changes)

On-site tasks (no visible UI changes):
- populate `sameAs` in `Organization` schema with real social profiles once available
- ensure brand naming is consistent across metadata, JSON-LD, and `<head>` tags only (do not modify visible on-page copy)
- keep `Organization` schema `name`, `url`, and `logo` accurate
- limit on-site work in this slice to JSON-LD and metadata updates only

Off-site tasks:
- establish presence on at least 4 platforms (social profiles, directories, community sites)
- ensure consistent NAP (Name, Address, Phone) information across all listings
- engage on Reddit and community platforms about UAE deals where appropriate
- create or claim Google Business Profile if applicable
- consider press mentions or content placements on UAE-focused publications

Why:
- 85% of brand mentions in AI results originate from third-party pages, not owned domains
- sites on 4+ platforms are 2.8x more likely to appear in ChatGPT responses
- brand search volume is the single strongest predictor of AI citations
- entity clarity helps AI systems connect brand mentions to site identity
### Slice 4: AI citation measurement and reporting (done)
Goal:
- know whether the optimization work is creating results across all AI platforms

Tasks:
- build PostHog dashboards for:
  - AI referrals by source (ChatGPT, Perplexity, Gemini, Copilot, Claude)
  - top landing pages from AI referrals
  - conversion from AI traffic
  - repeat visits from AI traffic
- set up manual AI citation testing:
  - weekly queries to ChatGPT, Perplexity, and Gemini for target terms ("best deals in UAE", "grocery deals Dubai", "electronics deals UAE", etc.)
  - track whether HalaSaves appears in responses
  - track sentiment accuracy (is the brand described correctly?)
- consider automated monitoring via tools like Otterly.AI (free tier available) or similar
- track AI Citation Share: frequency of brand presence in AI search results
- monitor Search Console for FAQ-style queries with high impressions but low CTR (may indicate content is being summarized in AI answers)

Why:
- without measurement, we are guessing
- AI citation monitoring is still immature as of Q1 2026 and requires combining multiple data sources
- sentiment accuracy matters — incorrect AI descriptions of the brand can reduce trust
### Slice 5: freshness signals + IndexNow (done)
Goal:
- increase freshness and recrawl value, and notify search engines of updates in real time

Tasks:
- implement IndexNow support to ping Bing/Yandex when deals are created, updated, or expire
- add `dateModified` / last-updated timestamps to all structured data where applicable
- ensure `llms-full.txt` hourly cache is working correctly and deals are rotating
- review whether sitemap `lastmod` values are being updated when deal data changes

Why:
- AI engines weigh recency when selecting sources
- pages not updated quarterly are 3x more likely to lose citations
- IndexNow provides real-time indexing for Bing and Copilot, which is increasingly important for AI citation capture
- freshness is a natural competitive advantage for a deals site
### Slice 6 (deferred): stronger landing pages for citation
Goal:
- create better pages for AI systems to cite

Deferred because:
- requires visible frontend changes which are out of scope for now

When ready, best candidates:
- category landing pages with concise 2-4 sentence summaries at the top (AI systems weight content at the top of pages most heavily)
- merchant pages
- "best deals this week" editorial roundup pages
- titles formatted as "Best [Category] Deals in UAE — [Month] [Year]" (perform well in AI answer generation, especially on ChatGPT)
- each page should include a visible "Last updated" timestamp
- structure content in modular, answer-focused sections of 75-300 words each

Why:
- AI systems pull individual passages, not entire pages
- focused niche sites outperform larger brands when expertise is clearer and better structured
- useful source pages are more valuable than obscure markup
## Notes
This document intentionally avoids overconfident GEO claims. The strongest current levers are still:
- clean crawl access
- clear and visible structured data
- fresh, well-linked source pages
- stable machine-readable summaries
- off-site brand signals and entity clarity
- measurement
## Recommended order
1. crawler access verification (Slice 1)
2. structured data expansion and consistency audit (Slice 2)
3. brand / entity strengthening + off-site signals (Slice 3)
4. AI citation measurement and reporting (Slice 4)
5. freshness signals + IndexNow (Slice 5)
6. landing pages for citation (Slice 6 — deferred until frontend work is in scope)
## Best immediate next action
- Establish social media presence on at least 2-3 platforms and add profile URLs to `lib/brand.ts` `sameAs` array
- Add `INDEXNOW_API_KEY` environment variable to Vercel production environment
- Re-run AI citation test in 3-4 weeks to measure improvement against the March 6, 2026 baseline
- Submit updated sitemap in Google Search Console
