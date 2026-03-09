import { CouponCard } from "@/components/coupons/CouponCard";
import type { CouponRow } from "@/lib/types";

export function CouponGrid({
  coupons,
  storeSlug,
  feedbackMap = {},
}: {
  coupons: CouponRow[];
  storeSlug: string;
  feedbackMap?: Record<string, boolean>;
}) {
  if (coupons.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No active coupons for this store right now. Check back soon!
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {coupons.map((coupon) => (
        <CouponCard
          key={coupon.id}
          coupon={coupon}
          storeSlug={storeSlug}
          userFeedback={feedbackMap[coupon.id] ?? null}
        />
      ))}
    </div>
  );
}
