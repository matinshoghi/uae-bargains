import { fetchAllStoresAdmin, fetchAllCouponsAdmin } from "@/lib/queries/coupons";
import { AdminCouponForm } from "@/components/admin/AdminCouponForm";
import { AdminCouponList } from "@/components/admin/AdminCouponList";

export default async function AdminCouponsPage() {
  const [stores, coupons] = await Promise.all([
    fetchAllStoresAdmin(),
    fetchAllCouponsAdmin(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Coupons</h1>
      <p className="mt-2 text-muted-foreground">
        Manage coupon codes for stores.
      </p>

      <div className="mt-6 rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Add Coupon
        </h2>
        <div className="mt-4">
          <AdminCouponForm stores={stores} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          All Coupons ({coupons.length})
        </h2>
        <div className="mt-4">
          <AdminCouponList coupons={coupons} stores={stores} />
        </div>
      </div>
    </div>
  );
}
