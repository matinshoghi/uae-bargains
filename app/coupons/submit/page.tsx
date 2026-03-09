import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { fetchActiveStores } from "@/lib/queries/coupons";
import { SubmitCouponForm } from "@/components/coupons/SubmitCouponForm";

export const metadata: Metadata = {
  title: "Submit a Coupon Code | HalaSaves",
  description:
    "Share a coupon code with the HalaSaves community. Your submission will be reviewed before going live.",
};

type Props = {
  searchParams: Promise<{ store?: string }>;
};

export default async function SubmitCouponPage({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const stores = await fetchActiveStores();
  const { store: storeSlug } = await searchParams;

  // Pre-select store if coming from a store page
  const defaultStoreId = storeSlug
    ? stores.find((s) => s.slug === storeSlug)?.id
    : undefined;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/coupons"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Coupons
      </Link>

      <h1 className="mt-4 text-2xl font-bold">Submit a Coupon Code</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Found a working coupon? Share it with the community. Your submission
        will be reviewed by our team before it goes live.
      </p>

      <div className="mt-6">
        <SubmitCouponForm stores={stores} defaultStoreId={defaultStoreId} />
      </div>
    </div>
  );
}
