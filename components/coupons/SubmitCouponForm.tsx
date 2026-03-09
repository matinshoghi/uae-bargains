"use client";

import { useActionState, useRef, useEffect } from "react";
import { submitCoupon, type CouponFormState } from "@/lib/actions/coupons";
import type { StoreRow } from "@/lib/types";

const DISCOUNT_TYPES = [
  { value: "percentage", label: "Percentage" },
  { value: "flat", label: "Flat Amount" },
  { value: "bogo", label: "Buy One Get One" },
  { value: "free_shipping", label: "Free Shipping" },
  { value: "other", label: "Other" },
] as const;

export function SubmitCouponForm({
  stores,
  defaultStoreId,
}: {
  stores: StoreRow[];
  defaultStoreId?: string;
}) {
  const [state, action, isPending] = useActionState<CouponFormState, FormData>(
    submitCoupon,
    null
  );

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  const inputClass =
    "mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none";

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="submit_store_id" className="block text-sm font-medium">
            Store <span className="text-red-500">*</span>
          </label>
          <select
            id="submit_store_id"
            name="store_id"
            required
            defaultValue={defaultStoreId ?? ""}
            className={inputClass}
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
          <label htmlFor="submit_discount_type" className="block text-sm font-medium">
            Discount Type <span className="text-red-500">*</span>
          </label>
          <select
            id="submit_discount_type"
            name="discount_type"
            required
            className={inputClass}
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
        <label htmlFor="submit_code" className="block text-sm font-medium">
          Coupon Code
        </label>
        <input
          id="submit_code"
          name="code"
          type="text"
          placeholder="SAVE10"
          className={`${inputClass} font-mono`}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Leave blank if the deal is a link-only promotion.
        </p>
      </div>

      <div>
        <label htmlFor="submit_title" className="block text-sm font-medium">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="submit_title"
          name="title"
          type="text"
          required
          placeholder="10% off all electronics"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="submit_description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="submit_description"
          name="description"
          rows={3}
          placeholder="Any additional details about the coupon..."
          className={`${inputClass} resize-y`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="submit_url" className="block text-sm font-medium">
            Deal URL
          </label>
          <input
            id="submit_url"
            name="url"
            type="url"
            placeholder="https://www.noon.com/..."
            className={inputClass}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Link to the deal or product page.
          </p>
        </div>

        <div>
          <label htmlFor="submit_expires_at" className="block text-sm font-medium">
            Expiry Date
          </label>
          <input
            id="submit_expires_at"
            name="expires_at"
            type="date"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Leave blank if unknown.
          </p>
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      {state?.success && (
        <p className="text-sm text-green-600">
          Your coupon has been submitted for review. It will appear once approved by our team.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Submitting..." : "Submit Coupon"}
      </button>
    </form>
  );
}
