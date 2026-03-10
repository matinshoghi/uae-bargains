import type { Metadata } from "next";
import { fetchActiveStores } from "@/lib/queries/coupons";
import { StoreGrid } from "@/components/coupons/StoreGrid";
import { BASE_URL } from "@/lib/site";
import { BRAND } from "@/lib/brand";

const title = "Coupon Codes & Promo Codes UAE | HalaSaves";
const description =
  "Browse verified coupon codes and promo codes for top UAE retailers including Amazon.ae, Noon, Namshi, and more. Save money on your next purchase.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${BASE_URL}/coupons`,
    siteName: BRAND.name,
    locale: BRAND.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default async function CouponsPage() {
  const stores = await fetchActiveStores();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: `${BASE_URL}/coupons`,
    isPartOf: {
      "@type": "WebSite",
      name: BRAND.name,
      url: BASE_URL,
    },
    numberOfItems: stores.length,
    hasPart: stores.map((store) => ({
      "@type": "WebPage",
      name: `${store.name} Coupon Codes`,
      url: `${BASE_URL}/coupons/${store.slug}`,
    })),
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-6 border-b-2 border-foreground pb-3">
        <h1 className="font-heading text-[22px] font-black tracking-tight sm:text-3xl">
          Coupon Codes &amp; Promo Codes UAE
        </h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Verified coupon codes for your favourite UAE stores. Tap a store to see
        all active codes.
      </p>

      <div className="mt-8">
        <StoreGrid stores={stores} />
      </div>
    </div>
  );
}
