import type { DealWithRelations } from "@/lib/types";
import { getDealUrl } from "@/lib/site";
import { BRAND } from "@/lib/brand";
import { stripMarkdown, truncateText } from "@/lib/utils";

export function HomeJsonLd({ deals }: { deals: DealWithRelations[] }) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND.name,
    url: BRAND.url,
    description: BRAND.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BRAND.url}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.name,
    url: BRAND.url,
    logo: BRAND.logo,
    sameAs: [...BRAND.sameAs],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Top deals in UAE",
    description: `Community-voted current deals on ${BRAND.name}`,
    dateModified: new Date().toISOString(),
    numberOfItems: Math.min(deals.length, 10),
    itemListElement: deals.slice(0, 10).map((deal, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: getDealUrl(deal.slug),
      name: deal.title,
      item: {
        "@type": "Product",
        name: deal.title,
        url: getDealUrl(deal.slug),
        description: truncateText(stripMarkdown(deal.description), 200),
        image: deal.image_url || `${BRAND.url}/icon.png`,
        ...(deal.price != null && {
          offers: {
            "@type": "Offer",
            priceCurrency: "AED",
            price: deal.price,
            availability:
              deal.status === "active"
                ? "https://schema.org/InStock"
                : "https://schema.org/Discontinued",
          },
        }),
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
    </>
  );
}
