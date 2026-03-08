import type { DealWithRelations } from "@/lib/types";
import { BASE_URL, getDealUrl } from "@/lib/site";
import { getUrlHostname, stripMarkdown, truncateText } from "@/lib/utils";

export function DealJsonLd({ deal }: { deal: DealWithRelations }) {
  const canonicalUrl = getDealUrl(deal.id);
  const categoryLabel = deal.categories?.label ?? "Deals";
  const categorySlug = deal.categories?.slug ?? "other";
  const merchantName = deal.url ? getUrlHostname(deal.url) : null;
  const totalVotes = deal.upvote_count + deal.downvote_count;
  const ratingValue = totalVotes > 0
    ? Math.round((deal.upvote_count / totalVotes) * 5 * 10) / 10
    : null;
  const offerSchema = {
    "@type": "Offer",
    priceCurrency: "AED",
    ...(deal.price != null && { price: deal.price }),
    availability:
      deal.status === "active"
        ? "https://schema.org/InStock"
        : "https://schema.org/Discontinued",
    ...(deal.url && { url: deal.url }),
    ...(deal.expires_at && { validThrough: deal.expires_at }),
    ...(deal.expires_at && { priceValidUntil: deal.expires_at.split("T")[0] }),
    ...(merchantName && {
      seller: {
        "@type": "Organization",
        name: merchantName,
      },
    }),
    ...(deal.promo_code && { discount: deal.promo_code }),
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: deal.title,
    description: truncateText(stripMarkdown(deal.description), 500),
    image: deal.image_url || `${BASE_URL}/icon.png`,
    url: canonicalUrl,
    category: categoryLabel,
    datePublished: deal.created_at,
    dateModified: deal.updated_at,
    offers: offerSchema,
    ...(ratingValue != null && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue,
        bestRating: 5,
        worstRating: 0,
        ratingCount: totalVotes,
        reviewCount: totalVotes,
      },
    }),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryLabel,
        item: `${BASE_URL}/?category=${categorySlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: deal.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
