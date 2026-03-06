import type { DealWithRelations } from "@/lib/types";

export function DealJsonLd({ deal }: { deal: DealWithRelations }) {
  const canonicalUrl = `https://halasaves.com/deals/${deal.id}`;
  const categoryLabel = deal.categories?.label ?? "Deals";
  const categorySlug = deal.categories?.slug ?? "other";

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: deal.title,
    description: deal.description.slice(0, 500),
    ...(deal.image_url && { image: deal.image_url }),
    url: canonicalUrl,
    category: categoryLabel,
    offers: {
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
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://halasaves.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryLabel,
        item: `https://halasaves.com/?category=${categorySlug}`,
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
