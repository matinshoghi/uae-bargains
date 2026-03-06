# SEO Implementation

## Overview

Full SEO infrastructure for HalaSaves. Every deal page (active and expired) is crawlable, has structured data for rich snippets, and generates branded social preview images.

## What Was Added

### 1. robots.txt (`app/robots.ts`)

Allows all crawlers. Blocks non-content routes from indexing:

- `/admin/`, `/settings/`, `/login`, `/auth/`, `/deals/new`, `*/edit`

Points crawlers to the sitemap at `https://halasaves.com/sitemap.xml`.

### 2. Dynamic Sitemap (`app/sitemap.ts`)

Generates a sitemap with:

- All active and expired deals (removed deals excluded)
- Static pages: `/`, `/about`, `/contact`, `/terms`, `/privacy`
- Deals have `daily` change frequency and `0.8` priority
- Homepage has `hourly` change frequency and `1.0` priority

### 3. Enhanced Deal Page Metadata (`app/deals/[id]/page.tsx`)

- Rich descriptions with price, discount %, and category
- Canonical URLs on every deal page
- Twitter card metadata (`summary_large_image`)
- OpenGraph type set to `article`
- Removed deals get `noindex, nofollow`
- Expired deals stay fully indexed (long-tail traffic value)

### 4. JSON-LD Structured Data

**Deal pages** (`components/seo/DealJsonLd.tsx`):

- `Product` schema with nested `Offer` (price, currency AED, availability, valid through)
- `BreadcrumbList` schema: Home > Category > Deal Title

**Homepage** (`components/seo/HomeJsonLd.tsx`):

- `WebSite` schema with `SearchAction`
- `Organization` schema with name, URL, logo

### 5. Dynamic OG Images

**Deal pages** (`app/deals/[id]/opengraph-image.tsx`):

- 1200x630 branded image generated per deal
- Shows: category badge, deal title, price in green, strikethrough original price, discount %, expired badge if applicable, HalaSaves branding

**Homepage** (`app/opengraph-image.tsx`):

- Static branded image with site name, tagline, and category pills

### 6. Crawlable Pagination (`components/deals/DealFeed.tsx`, `app/page.tsx`)

The "Load More" button is JavaScript-dependent and invisible to crawlers. To fix this:

- Hidden `<nav>` with next/previous page links (`sr-only` class)
- Homepage accepts `?page=N` parameter
- When `?page=N` is present, the server renders N pages worth of deals in the initial HTML
- Crawlers follow these links to discover all deals without needing JavaScript

### 7. Root Layout (`app/layout.tsx`)

- Added `metadataBase: new URL("https://halasaves.com")` for absolute OG image URLs
- Added `alternates.canonical` for homepage

## Post-Deploy Steps

1. Verify site ownership in Google Search Console
2. Submit `https://halasaves.com/sitemap.xml` in Search Console > Sitemaps
3. Request indexing for homepage and key deal pages via URL Inspection tool
4. Optionally set up Bing Webmaster Tools (import from Google Search Console)
5. Update `sameAs` array in `HomeJsonLd.tsx` once social media accounts are created

## Files Summary

| File | Action |
|------|--------|
| `app/robots.ts` | Created |
| `app/sitemap.ts` | Created |
| `components/seo/DealJsonLd.tsx` | Created |
| `components/seo/HomeJsonLd.tsx` | Created |
| `app/deals/[id]/opengraph-image.tsx` | Created |
| `app/opengraph-image.tsx` | Created |
| `app/layout.tsx` | Modified |
| `app/deals/[id]/page.tsx` | Modified |
| `app/page.tsx` | Modified |
| `components/deals/DealFeed.tsx` | Modified |
