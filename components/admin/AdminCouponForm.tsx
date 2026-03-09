"use client";

import { useActionState, useRef, useEffect } from "react";
import {
  createCoupon,
  updateCoupon,
  type CouponFormState,
} from "@/lib/actions/coupons";
import type { StoreRow, CouponRow } from "@/lib/types";

const DISCOUNT_TYPES = [
  { value: "percentage", label: "Percentage" },
  { value: "flat", label: "Flat Amount" },
  { value: "bogo", label: "Buy One Get One" },
  { value: "free_shipping", label: "Free Shipping" },
  { value: "other", label: "Other" },
] as const;

export function AdminCouponForm({
  stores,
  coupon,
  onCancel,
}: {
  stores: StoreRow[];
  coupon?: CouponRow;
  onCancel?: () => void;
}) {
  const isEdit = !!coupon;

  const [state, action, isPending] = useActionState<CouponFormState, FormData>(
    isEdit ? updateCoupon : createCoupon,
    null
  );

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success && !isEdit) {
      formRef.current?.reset();
    }
    if (state?.success && isEdit && onCancel) {
      onCancel();
    }
  }, [state, isEdit, onCancel]);

  // Format date for input[type=date] defaultValue
  const expiresDefault = coupon?.expires_at
    ? new Date(coupon.expires_at).toISOString().split("T")[0]
    : "";

  return (
    <form ref={formRef} action={action} className="space-y-4">
      {isEdit && <input type="hidden" name="id" value={coupon.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="coupon_store_id" className="block text-sm font-medium">
            Store <span className="text-red-500">*</span>
          </label>
          <select
            id="coupon_store_id"
            name="store_id"
            required
            defaultValue={coupon?.store_id ?? ""}
            className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
          >
            <option value="">Select a store...</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="coupon_discount_type" className="block text-sm font-medium">
            Discount Type <span className="text-red-500">*</span>
          </label>
          <select
            id="coupon_discount_type"
            name="discount_type"
            required
            defaultValue={coupon?.discount_type ?? ""}
            className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
          >
            <option value="">Select type...</option>
            {DISCOUNT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="coupon_title" className="block text-sm font-medium">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="coupon_title"
          name="title"
          type="text"
          required
          defaultValue={coupon?.title}
          placeholder="10% off all electronics"
          className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="coupon_description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="coupon_description"
          name="description"
          rows={2}
          defaultValue={coupon?.description ?? ""}
          placeholder="Details about the coupon..."
          className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none resize-y"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="coupon_code" className="block text-sm font-medium">
            Coupon Code
          </label>
          <input
            id="coupon_code"
            name="code"
            type="text"
            defaultValue={coupon?.code ?? ""}
            placeholder="SAVE10"
            className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="coupon_discount_value" className="block text-sm font-medium">
            Discount Value
          </label>
          <input
            id="coupon_discount_value"
            name="discount_value"
            type="text"
            defaultValue={coupon?.discount_value ?? ""}
            placeholder="10% or AED 50"
            className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="coupon_min_purchase" className="block text-sm font-medium">
            Min. Purchase
          </label>
          <input
            id="coupon_min_purchase"
            name="min_purchase"
            type="text"
            defaultValue={coupon?.min_purchase ?? ""}
            placeholder="AED 100"
            className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="coupon_url" className="block text-sm font-medium">
            Deal URL
          </label>
          <input
            id="coupon_url"
            name="url"
            type="url"
            defaultValue={coupon?.url ?? ""}
            placeholder="https://www.noon.com/..."
            className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="coupon_affiliate_url" className="block text-sm font-medium">
            Affiliate URL
          </label>
          <input
            id="coupon_affiliate_url"
            name="affiliate_url"
            type="url"
            defaultValue={coupon?.affiliate_url ?? ""}
            placeholder="https://..."
            className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="coupon_expires_at" className="block text-sm font-medium">
            Expires
          </label>
          <input
            id="coupon_expires_at"
            name="expires_at"
            type="date"
            defaultValue={expiresDefault}
            className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
          />
        </div>

        <div className="flex items-end gap-2 pb-2">
          <input
            id="coupon_is_verified"
            name="is_verified"
            type="checkbox"
            defaultChecked={coupon?.is_verified ?? false}
            className="h-4 w-4 rounded border-border"
          />
          <label htmlFor="coupon_is_verified" className="text-sm font-medium">
            Verified
          </label>
        </div>

        <div className="flex items-end gap-2 pb-2">
          <input
            id="coupon_is_featured"
            name="is_featured"
            type="checkbox"
            defaultChecked={coupon?.is_featured ?? false}
            className="h-4 w-4 rounded border-border"
          />
          <label htmlFor="coupon_is_featured" className="text-sm font-medium">
            Featured
          </label>
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      {state?.success && !isEdit && (
        <p className="text-sm text-green-600">Coupon created successfully.</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending
            ? isEdit
              ? "Saving..."
              : "Creating..."
            : isEdit
              ? "Save Changes"
              : "Create Coupon"}
        </button>
        {isEdit && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
