import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BASE_URL, getDealUrl } from "@/lib/site";
import { formatPriceShort, getUrlHostname, stripMarkdown, wrapText } from "@/lib/utils";

const DEAL_LIMIT = 50;

export async function GET() {
  const supabase = await createClient();
  const { data: deals, error } = await supabase
    .from("deals")
    .select(`
      id,
      title,
      description,
      price,
      original_price,
      discount_percentage,
      url,
      promo_code,
      location,
      expires_at,
      upvote_count,
      downvote_count,
      hot_score,
      categories:category_id (label)
    `)
    .eq("status", "active")
    .order("is_featured", { ascending: false })
    .order("hot_score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(DEAL_LIMIT);

  if (error) {
    return new NextResponse("Unable to load deals feed.", {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const lines = [
    "# HalaSaves current top deals",
    "",
    `> Source: ${BASE_URL}`,
    `> Last updated: ${new Date().toISOString()}`,
    "> Currency: AED",
    "",
  ];

  for (const deal of deals ?? []) {
    const description = stripMarkdown(deal.description);
    const summaryLines = wrapText(description, 96);
    const merchant = deal.url ? getUrlHostname(deal.url) : null;
    const detailUrl = getDealUrl(deal.id);

    lines.push(`## ${deal.title}`);
    lines.push(`- URL: ${detailUrl}`);

    if (deal.price != null) {
      let priceLine = `- Price: ${formatPriceShort(deal.price)}`;
      if (deal.original_price != null) {
        priceLine += ` (was ${formatPriceShort(deal.original_price)})`;
      }
      if (deal.discount_percentage != null && deal.discount_percentage > 0) {
        priceLine += `, ${deal.discount_percentage}% off`;
      }
      lines.push(priceLine);
    } else if (deal.original_price != null) {
      lines.push(`- Original price: ${formatPriceShort(deal.original_price)}`);
    }

    if (deal.categories?.label) {
      lines.push(`- Category: ${deal.categories.label}`);
    }
    if (merchant) {
      lines.push(`- Merchant: ${merchant}`);
    }
    if (deal.promo_code) {
      lines.push(`- Promo code: ${deal.promo_code}`);
    }
    if (deal.location) {
      lines.push(`- Location: ${deal.location}`);
    }
    if (deal.expires_at) {
      lines.push(`- Expires: ${deal.expires_at.split("T")[0]}`);
    }

    lines.push(`- Community votes: +${deal.upvote_count} / -${deal.downvote_count}`);
    if (summaryLines.length > 0) {
      lines.push("- Summary:");
      lines.push(...summaryLines.map((line) => `  ${line}`));
    }
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
