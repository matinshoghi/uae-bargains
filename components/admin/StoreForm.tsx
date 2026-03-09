"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import {
  createStore,
  updateStore,
  type StoreFormState,
} from "@/lib/actions/coupons";
import type { StoreRow } from "@/lib/types";
import { ImagePlus, X } from "lucide-react";

const MAX_LOGO_SIZE = 5 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];

export function StoreForm({
  store,
  onCancel,
}: {
  store?: StoreRow;
  onCancel?: () => void;
}) {
  const isEdit = !!store;

  const [state, action, isPending] = useActionState<StoreFormState, FormData>(
    isEdit ? updateStore : createStore,
    null
  );

  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    store?.logo_url ?? null
  );
  const [logoError, setLogoError] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);

  useEffect(() => {
    if (state?.success && !isEdit) {
      formRef.current?.reset();
      setLogoPreview(null);
      setRemoveLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    if (state?.success && isEdit && onCancel) {
      onCancel();
    }
  }, [state, isEdit, onCancel]);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (isEdit) return;
    const slugInput =
      formRef.current?.querySelector<HTMLInputElement>("#store_slug");
    if (slugInput) {
      slugInput.value = e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setLogoError(null);
    setRemoveLogo(false);
    if (!file) return;

    if (file.size > MAX_LOGO_SIZE) {
      setLogoError("Logo must be under 5MB");
      e.target.value = "";
      return;
    }

    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      setLogoError("Only JPEG, PNG, WebP, and SVG logos are accepted");
      e.target.value = "";
      return;
    }

    setLogoPreview(URL.createObjectURL(file));
  }

  function clearLogo() {
    setLogoPreview(null);
    setRemoveLogo(true);
    setLogoError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <form ref={formRef} action={action} className="space-y-4">
      {isEdit && <input type="hidden" name="id" value={store.id} />}
      {isEdit && (
        <input
          type="hidden"
          name="existing_logo_url"
          value={store.logo_url ?? ""}
        />
      )}
      {removeLogo && <input type="hidden" name="remove_logo" value="true" />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="store_name" className="block text-sm font-medium">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="store_name"
            name="name"
            type="text"
            required
            defaultValue={store?.name}
            onChange={handleNameChange}
            placeholder="Amazon.ae"
            className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="store_slug" className="block text-sm font-medium">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            id="store_slug"
            name="slug"
            type="text"
            required
            defaultValue={store?.slug}
            placeholder="amazon-ae"
            className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* Logo upload */}
      <div>
        <label className="block text-sm font-medium">Logo</label>
        <input
          ref={fileInputRef}
          type="file"
          name="logo"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          className="hidden"
          onChange={handleLogoChange}
        />
        {logoPreview ? (
          <div className="relative mt-1.5 w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoPreview}
              alt="Logo preview"
              className="h-16 w-16 rounded-lg border border-border object-contain"
            />
            <button
              type="button"
              onClick={clearLogo}
              className="absolute -top-2 -right-2 rounded-full border border-border bg-background p-1"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-1.5 flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border px-6 py-4 transition-colors hover:border-foreground/40 hover:bg-muted/50"
          >
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Upload logo (JPEG, PNG, WebP, SVG — max 5MB)
            </span>
          </button>
        )}
        {logoError && (
          <p className="mt-1 text-sm text-red-600">{logoError}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="store_website_url" className="block text-sm font-medium">
            Website URL
          </label>
          <input
            id="store_website_url"
            name="website_url"
            type="url"
            defaultValue={store?.website_url ?? ""}
            placeholder="https://www.amazon.ae"
            className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="store_affiliate_network" className="block text-sm font-medium">
            Affiliate Network
          </label>
          <input
            id="store_affiliate_network"
            name="affiliate_network"
            type="text"
            defaultValue={store?.affiliate_network ?? ""}
            placeholder="ArabClicks, Amazon Associates..."
            className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="store_description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="store_description"
          name="description"
          rows={2}
          defaultValue={store?.description ?? ""}
          placeholder="Brief description shown on the public store page..."
          className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none resize-y"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="store_sort_order" className="block text-sm font-medium">
            Sort Order
          </label>
          <input
            id="store_sort_order"
            name="sort_order"
            type="number"
            defaultValue={store?.sort_order ?? 0}
            className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
          />
        </div>

        <div className="flex items-end gap-2 pb-2">
          <input
            id="store_is_active"
            name="is_active"
            type="checkbox"
            defaultChecked={store?.is_active ?? true}
            className="h-4 w-4 rounded border-border"
          />
          <label htmlFor="store_is_active" className="text-sm font-medium">
            Active
          </label>
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      {state?.success && !isEdit && (
        <p className="text-sm text-green-600">Store created successfully.</p>
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
              : "Create Store"}
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
