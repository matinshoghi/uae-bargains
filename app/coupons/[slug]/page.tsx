import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { fetchStoreBySlug, fetchCouponsByStore } from "@/lib/queries/coupons";
import { CouponGrid } from "@/components/coupons/CouponGrid";
import { CouponJsonLd } from "@/components/seo/CouponJsonLd";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const store = await fetchStoreBySlug(slug);
  if (!store) return {};

  const month = new Date().toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return {
    title: `Best ${store.name} Coupon Codes UAE ${month} | HalaSaves`,
    description: `${store.name} coupon codes and promo codes for ${month}. Verified discounts for UAE shoppers. Copy a code and save on your next order.`,
  };
}

export default async function StoreCouponsPage({ params }: Props) {
  const { slug } = await params;
  const store = await fetchStoreBySlug(slug);
  if (!store) notFound();

  const coupons = await fetchCouponsByStore(store.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <CouponJsonLd store={store} coupons={coupons} />

      <Link
        href="/coupons"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        All Stores
      </Link>

      <div className="mt-4 flex items-center gap-4">
        {store.logo_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={store.logo_url}
            alt={store.name}
            className="h-14 w-14 rounded-xl object-contain"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-xl font-bold text-muted-foreground">
            {store.name.charAt(0)}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            {store.name} Coupon Codes
          </h1>
          {store.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {store.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <CouponGrid coupons={coupons} storeSlug={store.slug} />
      </div>
    </div>
  );
}
