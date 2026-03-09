"use client";

import { useState, useTransition } from "react";
import { expireCoupon, deleteCoupon } from "@/lib/actions/coupons";
import { AdminCouponForm } from "@/components/admin/AdminCouponForm";
import type { CouponWithStore, StoreRow } from "@/lib/types";

export function AdminCouponList({
  coupons,
  stores,
}: {
  coupons: CouponWithStore[];
  stores: StoreRow[];
}) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);

  function handleExpire(id: string) {
    startTransition(async () => {
      const result = await expireCoupon(id);
      if (result.error) alert(result.error);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Permanently delete this coupon?")) return;
    startTransition(async () => {
      const result = await deleteCoupon(id);
      if (result.error) alert(result.error);
    });
  }

  if (coupons.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No coupons yet. Add one above.</p>
    );
  }

  return (
    <div className="divide-y divide-border rounded-xl border border-border">
      {coupons.map((coupon) => (
        <div key={coupon.id} className="px-4 py-3">
          {editingId === coupon.id ? (
            <div>
              <h3 className="mb-3 text-sm font-semibold">
                Editing: {coupon.title}
              </h3>
              <AdminCouponForm
                stores={stores}
                coupon={coupon}
                onCancel={() => setEditingId(null)}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{coupon.title}</span>
                  {coupon.code && (
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                      {coupon.code}
                    </code>
                  )}
                  {coupon.status === "expired" && (
                    <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-800">
                      Expired
                    </span>
                  )}
                  {coupon.is_featured && (
                    <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-800">
                      Featured
                    </span>
                  )}
                  {coupon.is_verified && (
                    <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-800">
                      Verified
                    </span>
                  )}
                  {coupon.moderation_status === "pending" && (
                    <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-[10px] font-medium text-yellow-800">
                      Pending
                    </span>
                  )}
                  {coupon.moderation_status === "rejected" && (
                    <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-800">
                      Rejected
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {coupon.stores?.name ?? "Unknown store"} ·{" "}
                  {coupon.click_count} clicks
                  {coupon.expires_at &&
                    ` · Expires ${new Date(coupon.expires_at).toLocaleDateString()}`}
                  {coupon.submitted_by && " · User submitted"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditingId(coupon.id)}
                  className="text-xs text-foreground hover:underline"
                >
                  Edit
                </button>
                {coupon.status === "active" && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleExpire(coupon.id)}
                    className="text-xs text-yellow-600 hover:underline disabled:opacity-50"
                  >
                    Expire
                  </button>
                )}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDelete(coupon.id)}
                  className="text-xs text-red-600 hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
