import { StoreCard } from "@/components/coupons/StoreCard";
import type { StoreWithCouponCount } from "@/lib/types";

export function StoreGrid({ stores }: { stores: StoreWithCouponCount[] }) {
  if (stores.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No stores available yet. Check back soon!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </div>
  );
}
