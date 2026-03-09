import type { Metadata } from "next";
import { fetchActiveStores } from "@/lib/queries/coupons";
import { StoreGrid } from "@/components/coupons/StoreGrid";

export const metadata: Metadata = {
  title: "Coupon Codes & Promo Codes UAE | HalaSaves",
  description:
    "Browse verified coupon codes and promo codes for top UAE retailers including Amazon.ae, Noon, Namshi, and more. Save money on your next purchase.",
};

export default async function CouponsPage() {
  const stores = await fetchActiveStores();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold sm:text-3xl">
        Coupon Codes &amp; Promo Codes UAE
      </h1>
      <p className="mt-2 text-muted-foreground">
        Verified coupon codes for your favourite UAE stores. Tap a store to see
        all active codes.
      </p>

      <div className="mt-8">
        <StoreGrid stores={stores} />
      </div>
    </div>
  );
}
