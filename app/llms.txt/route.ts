import { NextResponse } from "next/server";
import { CATEGORY_DESCRIPTIONS } from "@/lib/constants";
import { BASE_URL } from "@/lib/site";
import { BRAND } from "@/lib/brand";

function getCategoryLine() {
  return Object.entries(CATEGORY_DESCRIPTIONS)
    .filter(([slug]) => slug !== "other")
    .map(([slug, description]) => `- ${slug}: ${description}`)
    .join("\n");
}

export function GET() {
  const content = `# ${BRAND.name}

> ${BRAND.description}

## About

${BRAND.name} is a community deals platform focused on the UAE. Users submit deals, promo codes, discounts, and sale finds, and the community votes and comments to surface the most useful offers.

## Region and pricing

- Region: ${BRAND.region}
- Currency: ${BRAND.currency}
- Focus: current deals, discounts, promo codes, freebies, and limited-time offers

## Categories

${getCategoryLine()}

## Key URLs

- Home: ${BASE_URL}
- About: ${BASE_URL}/about
- Sitemap: ${BASE_URL}/sitemap.xml
- Current deals feed: ${BASE_URL}/llms-full.txt
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
