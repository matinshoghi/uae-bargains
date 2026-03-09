import { fetchPendingCoupons, fetchAllStoresAdmin } from "@/lib/queries/coupons";
import { CouponSubmissionList } from "@/components/admin/CouponSubmissionList";

export default async function CouponSubmissionsPage() {
  const [pendingCoupons, stores] = await Promise.all([
    fetchPendingCoupons(),
    fetchAllStoresAdmin(),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold">
        Coupon Submissions
        {pendingCoupons.length > 0 && (
          <span className="ml-2 rounded-full bg-yellow-100 px-2.5 py-0.5 text-sm font-medium text-yellow-800">
            {pendingCoupons.length}
          </span>
        )}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Review and approve user-submitted coupon codes.
      </p>

      <div className="mt-6">
        <CouponSubmissionList coupons={pendingCoupons} stores={stores} />
      </div>
    </div>
  );
}
