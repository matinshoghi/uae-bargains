"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import Image from "next/image";
import { createBanner, type BannerFormState } from "@/lib/actions/banners";

export function BannerForm() {
  const [state, action, isPending] = useActionState<BannerFormState, FormData>(
    createBanner,
    null
  );

  const formRef = useRef<HTMLFormElement>(null);
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      setDesktopPreview(null);
      setMobilePreview(null);
    }
  }, [state]);

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
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Desktop image */}
        <div>
          <label className="block text-sm font-medium">
            Desktop Image <span className="text-red-500">*</span>
          </label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Recommended: 1440 x 400px
          </p>
          <input
            type="file"
            name="desktop_image"
            accept="image/jpeg,image/png,image/webp"
            required
            onChange={(e) => handleFileChange(e, setDesktopPreview)}
            className="mt-2 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-accent/80"
          />
          {desktopPreview && (
            <div className="mt-3 overflow-hidden rounded-lg border border-border">
              <Image
                src={desktopPreview}
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
          {mobilePreview && (
            <div className="mt-3 overflow-hidden rounded-lg border border-border">
              <Image
                src={mobilePreview}
                alt="Mobile preview"
                width={384}
                height={200}
                className="h-auto w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Link URL */}
      <div>
        <label htmlFor="link_url" className="block text-sm font-medium">
          Click-through Link{" "}
          <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          id="link_url"
          name="link_url"
          type="url"
          placeholder="https://..."
          className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      {state?.success && (
        <p className="text-sm text-green-600">Banner created successfully.</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Uploading..." : "Upload Banner"}
      </button>
    </form>
  );
}
