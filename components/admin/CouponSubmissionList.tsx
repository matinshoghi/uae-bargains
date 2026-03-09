"use client";

import { useState, useTransition } from "react";
import {
  approveCoupon,
  rejectCoupon,
  approveAndUpdateCoupon,
} from "@/lib/actions/coupons";
import { AdminCouponForm } from "@/components/admin/AdminCouponForm";
import type { PendingCoupon, StoreRow } from "@/lib/types";

export function CouponSubmissionList({
  coupons,
  stores,
}: {
  coupons: PendingCoupon[];
  stores: StoreRow[];
}) {
  const [isPending, startTransition] = useTransition();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  function handleApprove(id: string) {
    startTransition(async () => {
      const result = await approveCoupon(id);
      if (result.error) alert(result.error);
    });
  }

  function handleReject(id: string) {
    startTransition(async () => {
      const result = await rejectCoupon(id, rejectNote);
      if (result.error) alert(result.error);
      setRejectingId(null);
      setRejectNote("");
    });
  }

  if (coupons.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No pending submissions to review.
      </p>
    );
  }

  return (
    <div className="divide-y divide-border rounded-xl border border-border">
      {coupons.map((coupon) => (
        <div key={coupon.id} className="px-4 py-3">
          {editingId === coupon.id ? (
            <div>
              <h3 className="mb-3 text-sm font-semibold">
                Edit & Approve: {coupon.title}
              </h3>
              <AdminCouponForm
                stores={stores}
                coupon={coupon}
                onCancel={() => setEditingId(null)}
                submitAction={approveAndUpdateCoupon}
                submitLabel="Save & Approve"
              />
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{coupon.title}</span>
                    {coupon.code && (
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                        {coupon.code}
                      </code>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {coupon.stores?.name ?? "Unknown store"} · Submitted by{" "}
                    {coupon.profiles?.username ?? "Unknown"} ·{" "}
                    {coupon.discount_type}
                    {coupon.discount_value ? ` (${coupon.discount_value})` : ""}
                  </p>
                  {coupon.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {coupon.description}
                    </p>
                  )}
                  {coupon.url && (
                    <p className="mt-1 text-xs text-muted-foreground truncate">
                      URL: {coupon.url}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(coupon.created_at).toLocaleDateString("en-AE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setEditingId(coupon.id)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent disabled:opacity-50"
                  >
                    Edit & Approve
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleApprove(coupon.id)}
                    className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      setRejectingId(
                        rejectingId === coupon.id ? null : coupon.id
                      )
                    }
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>

              {rejectingId === coupon.id && (
                <div className="mt-3 flex items-end gap-2">
                  <div className="flex-1">
                    <label
                      htmlFor={`reject-note-${coupon.id}`}
                      className="block text-xs font-medium text-muted-foreground"
                    >
                      Rejection reason (optional)
                    </label>
                    <input
                      id={`reject-note-${coupon.id}`}
                      type="text"
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      placeholder="e.g. Expired code, duplicate..."
                      className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleReject(coupon.id)}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    Confirm Reject
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
