import type { StoreRow, CouponRow } from "@/lib/types";
import { BASE_URL } from "@/lib/site";

export function CouponJsonLd({
  store,
  coupons,
}: {
  store: StoreRow;
  coupons: CouponRow[];
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: `${store.name} Coupon Codes & Promo Codes UAE`,
    url: `${BASE_URL}/coupons/${store.slug}`,
    numberOfItems: coupons.length,
    itemListElement: coupons.map((coupon) => ({
      "@type": "Offer",
      name: coupon.title,
      description: coupon.description || coupon.title,
      ...(coupon.code && { discountCode: coupon.code }),
      priceCurrency: "AED",
      ...(coupon.expires_at && { validThrough: coupon.expires_at }),
      url: `${BASE_URL}/go/${store.slug}/${coupon.id}`,
      availability: "https://schema.org/InStock",
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
