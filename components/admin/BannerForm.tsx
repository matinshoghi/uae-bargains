"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  createBanner,
  updateBanner,
  type BannerFormState,
} from "@/lib/actions/banners";
import type { Database } from "@/lib/supabase/types";

type HeroBanner = Database["public"]["Tables"]["hero_banners"]["Row"];

interface BannerFormProps {
  banner?: HeroBanner;
  onDone?: () => void;
}

export function BannerForm({ banner, onDone }: BannerFormProps) {
  const isEdit = !!banner;
  const boundAction = isEdit ? updateBanner : createBanner;

  const [state, action, isPending] = useActionState<BannerFormState, FormData>(
    boundAction,
    null
  );

  const formRef = useRef<HTMLFormElement>(null);
  const [bannerType, setBannerType] = useState<"image" | "dynamic">(
    banner?.banner_type ?? "image"
  );
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);

  useEffect(() => {
    if (state?.success) {
      if (isEdit) {
        onDone?.();
      } else {
        formRef.current?.reset();
        setDesktopPreview(null);
        setMobilePreview(null);
        setBannerType("image");
      }
    }
  }, [state, isEdit, onDone]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setter(URL.createObjectURL(file));
    } else {
      setter(null);
    }
  };

  return (
    <form ref={formRef} action={action} className="space-y-6">
      {isEdit && <input type="hidden" name="banner_id" value={banner.id} />}

      {/* Banner type selector */}
      <div>
        <label className="block text-sm font-medium">Banner Type</label>
        <div className="mt-1.5 flex gap-2">
          <button
            type="button"
            onClick={() => setBannerType("image")}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              bannerType === "image"
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:bg-accent"
            }`}
          >
            Image Only
          </button>
          <button
            type="button"
            onClick={() => setBannerType("dynamic")}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              bannerType === "dynamic"
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:bg-accent"
            }`}
          >
            Dynamic (Text + Image)
          </button>
        </div>
        <input type="hidden" name="banner_type" value={bannerType} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Desktop image */}
        <div>
          <label className="block text-sm font-medium">
            Desktop Image{" "}
            {isEdit ? (
              <span className="text-muted-foreground">
                (leave empty to keep current)
              </span>
            ) : (
              <span className="text-red-500">*</span>
            )}
          </label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Recommended: 1440 x 400px
          </p>
          <input
            type="file"
            name="desktop_image"
            accept="image/jpeg,image/png,image/webp"
            required={!isEdit}
            onChange={(e) => handleFileChange(e, setDesktopPreview)}
            className="mt-2 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-accent/80"
          />
          {(desktopPreview || (isEdit && banner.desktop_image_url)) && (
            <div className="mt-3 overflow-hidden rounded-lg border border-border">
              <Image
                src={desktopPreview || banner!.desktop_image_url}
                alt="Desktop preview"
                width={720}
                height={200}
                className="h-auto w-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Mobile image */}
        <div>
          <label className="block text-sm font-medium">
            Mobile Image{" "}
            <span className="text-muted-foreground">(optional)</span>
          </label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Recommended: 768 x 400px. Falls back to desktop if empty.
          </p>
          <input
            type="file"
            name="mobile_image"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleFileChange(e, setMobilePreview)}
            className="mt-2 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-accent/80"
          />
          {(mobilePreview || (isEdit && banner.mobile_image_url)) && (
            <div className="mt-3 overflow-hidden rounded-lg border border-border">
              <Image
                src={mobilePreview || banner!.mobile_image_url!}
                alt="Mobile preview"
                width={384}
                height={200}
                className="h-auto w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Dynamic banner fields */}
      {bannerType === "dynamic" && (
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={banner?.title ?? ""}
              placeholder="Summer Sale is Here"
              className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="subtitle" className="block text-sm font-medium">
              Subtitle{" "}
              <span className="text-muted-foreground">(optional)</span>
            </label>
            <input
              id="subtitle"
              name="subtitle"
              type="text"
              defaultValue={banner?.subtitle ?? ""}
              placeholder="Up to 70% off on electronics, fashion & more"
              className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="button_text"
                className="block text-sm font-medium"
              >
                Button Text{" "}
                <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                id="button_text"
                name="button_text"
                type="text"
                defaultValue={banner?.button_text ?? ""}
                placeholder="Shop Now"
                className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="button_url"
                className="block text-sm font-medium"
              >
                Button Link{" "}
                <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                id="button_url"
                name="button_url"
                type="url"
                defaultValue={banner?.button_url ?? ""}
                placeholder="https://..."
                className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Link URL (image-only banners) */}
      {bannerType === "image" && (
        <div>
          <label htmlFor="link_url" className="block text-sm font-medium">
            Click-through Link{" "}
            <span className="text-muted-foreground">(optional)</span>
          </label>
          <input
            id="link_url"
            name="link_url"
            type="url"
            defaultValue={banner?.link_url ?? ""}
            placeholder="https://..."
            className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
        </div>
      )}

      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      {state?.success && (
        <p className="text-sm text-green-600">
          Banner {isEdit ? "updated" : "created"} successfully.
        </p>
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
              : "Uploading..."
            : isEdit
              ? "Save Changes"
              : "Upload Banner"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={onDone}
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
