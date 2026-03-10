import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { fetchStoreBySlug, fetchCouponsByStore, fetchExpiredCouponsByStore } from "@/lib/queries/coupons";
import { getCouponFeedbackMap } from "@/lib/actions/coupons";
import { CouponGrid } from "@/components/coupons/CouponGrid";
import { CouponCard } from "@/components/coupons/CouponCard";
import { CouponJsonLd } from "@/components/seo/CouponJsonLd";
import { BASE_URL } from "@/lib/site";
import { BRAND } from "@/lib/brand";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const store = await fetchStoreBySlug(slug);
  if (!store) return {};

  const month = new Date().toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const title = `Best ${store.name} Coupon Codes UAE ${month} | HalaSaves`;
  const description = `${store.name} coupon codes and promo codes for ${month}. Verified discounts for UAE shoppers. Copy a code and save on your next order.`;
  const url = `${BASE_URL}/coupons/${store.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: BRAND.name,
      locale: BRAND.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function StoreCouponsPage({ params }: Props) {
  const { slug } = await params;
  const store = await fetchStoreBySlug(slug);
  if (!store) notFound();

  const [coupons, expiredCoupons, feedbackMap] = await Promise.all([
    fetchCouponsByStore(store.id),
    fetchExpiredCouponsByStore(store.id),
    getCouponFeedbackMap(),
  ]);

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
            className="h-14 w-14 rounded-sm object-contain"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-muted text-xl font-bold text-muted-foreground">
            {store.name.charAt(0)}
          </div>
        )}
        <div>
          <h1 className="font-heading text-2xl font-black tracking-tight sm:text-3xl">
            {store.name} Coupon Codes
          </h1>
          {store.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {store.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 border-t-2 border-foreground pt-4">
        <div className="flex items-center justify-between">
          <h2 className="font-mono-display text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {coupons.length} {coupons.length === 1 ? "coupon" : "coupons"} available
          </h2>
          <Link
            href={`/coupons/submit?store=${store.slug}`}
            className="font-display inline-flex items-center gap-1.5 rounded-sm border-2 border-foreground px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors hover:bg-foreground hover:text-background"
          >
            <Plus className="h-4 w-4" />
            Submit a Code
          </Link>
        </div>
      </div>

      <div className="mt-4">
        <CouponGrid coupons={coupons} storeSlug={store.slug} feedbackMap={feedbackMap} />
      </div>

      {expiredCoupons.length > 0 && (
        <div className="mt-12">
          <h2 className="font-heading text-lg font-black tracking-tight text-muted-foreground">
            Recently Expired
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {expiredCoupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                storeSlug={store.slug}
                expired
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
