"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { postDealAsSeedUser, type SeedFormState } from "@/lib/actions/seed";
import type { SeedUserWithProfile } from "@/lib/queries/seed";
import { ImagePlus, X } from "lucide-react";

type Category = { id: string; label: string };

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      setImagePreview(null);
      setImageError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [state]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setImageError(null);
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("Image must be under 10MB");
      e.target.value = "";
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Only JPEG, PNG, and WebP images are accepted");
      e.target.value = "";
      return;
    }

    setImagePreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setImagePreview(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

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
              @{u.profiles.username}
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
          <label htmlFor="deal_promo_code" className="block text-sm font-medium">
            Promo Code
          </label>
          <input
            id="deal_promo_code"
            name="promo_code"
            type="text"
            placeholder="e.g. SAVE20"
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

      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium">Image</label>
        <input
          ref={fileInputRef}
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleImageChange}
        />
        {imagePreview ? (
          <div className="relative mt-1.5 w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-[200px] max-w-[300px] rounded-lg border border-border object-cover"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-2 -right-2 rounded-full border border-border bg-background p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-1.5 flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border px-6 py-6 transition-colors hover:border-foreground/40 hover:bg-muted/50"
          >
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Click to upload (JPEG, PNG, WebP — max 10MB)
            </span>
          </button>
        )}
        {imageError && (
          <p className="mt-1 text-sm text-red-600">{imageError}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          No image? We&apos;ll automatically grab one from the deal link.
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
