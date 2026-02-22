"use client";

import { useActionState, useRef, useEffect } from "react";
import { postDealAsSeedUser, type SeedFormState } from "@/lib/actions/seed";
import type { SeedUserWithProfile } from "@/lib/queries/seed";

type Category = { id: string; label: string };

export function SeedDealForm({
  users,
  categories,
}: {
  users: SeedUserWithProfile[];
  categories: Category[];
}) {
  const [state, action, isPending] = useActionState<SeedFormState, FormData>(
    postDealAsSeedUser,
    null
  );

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <div>
        <label htmlFor="deal_user_id" className="block text-sm font-medium">
          Post as <span className="text-red-500">*</span>
        </label>
        <select
          id="deal_user_id"
          name="user_id"
          required
          className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
        >
          <option value="">Select a seed user...</option>
          {users.map((u) => (
            <option key={u.user_id} value={u.user_id}>
              {u.profiles.display_name || u.profiles.username} (@{u.profiles.username})
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="deal_title" className="block text-sm font-medium">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="deal_title"
            name="title"
            type="text"
            required
            placeholder="50% off Samsung Galaxy S24 at Noon"
            className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="deal_category" className="block text-sm font-medium">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="deal_category"
            name="category_id"
            required
            className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
          >
            <option value="">Select category...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="deal_description" className="block text-sm font-medium">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="deal_description"
          name="description"
          required
          rows={3}
          placeholder="Describe the deal..."
          className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none resize-y"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="deal_price" className="block text-sm font-medium">
            Deal Price
          </label>
          <input
            id="deal_price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="99.00"
            className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="deal_original_price" className="block text-sm font-medium">
            Original Price
          </label>
          <input
            id="deal_original_price"
            name="original_price"
            type="number"
            step="0.01"
            min="0"
            placeholder="199.00"
            className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="deal_expires" className="block text-sm font-medium">
            Expires
          </label>
          <input
            id="deal_expires"
            name="expires_at"
            type="date"
            className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="deal_url" className="block text-sm font-medium">
            Deal URL
          </label>
          <input
            id="deal_url"
            name="url"
            type="url"
            placeholder="https://www.noon.com/..."
            className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="deal_location" className="block text-sm font-medium">
            Location
          </label>
          <input
            id="deal_location"
            name="location"
            type="text"
            placeholder="Dubai, Online, etc."
            className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="deal_image_url" className="block text-sm font-medium">
          Image URL
        </label>
        <input
          id="deal_image_url"
          name="image_url"
          type="url"
          placeholder="https://example.com/product-image.jpg"
          className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Paste a direct image URL. Leave empty if none.
        </p>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      {state?.success && (
        <p className="text-sm text-green-600">Deal posted successfully.</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Posting..." : "Post Deal"}
      </button>
    </form>
  );
}
