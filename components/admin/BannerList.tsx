"use client";

import { useTransition } from "react";
import Image from "next/image";
import {
  toggleBannerActive,
  deleteBanner,
  reorderBanner,
} from "@/lib/actions/banners";
import type { Database } from "@/lib/supabase/types";

type HeroBanner = Database["public"]["Tables"]["hero_banners"]["Row"];

export function BannerList({ banners }: { banners: HeroBanner[] }) {
  if (banners.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No banners yet. Upload one above to get started.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {banners.map((banner, idx) => (
        <BannerRow
          key={banner.id}
          banner={banner}
          isFirst={idx === 0}
          isLast={idx === banners.length - 1}
        />
      ))}
    </div>
  );
}

function BannerRow({
  banner,
  isFirst,
  isLast,
}: {
  banner: HeroBanner;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleBannerActive(banner.id);
    });
  };

  const handleDelete = () => {
    if (!confirm("Delete this banner? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteBanner(banner.id);
    });
  };

  const handleReorder = (direction: "up" | "down") => {
    startTransition(async () => {
      await reorderBanner(banner.id, direction);
    });
  };

  return (
    <div
      className={`flex flex-col gap-4 rounded-xl border p-4 transition-opacity sm:flex-row sm:items-center ${
        isPending ? "opacity-50" : ""
      } ${banner.is_active ? "border-border" : "border-border/50 opacity-60"}`}
    >
      {/* Preview */}
      <div className="shrink-0 overflow-hidden rounded-lg sm:w-48">
        <Image
          src={banner.desktop_image_url}
          alt=""
          width={384}
          height={108}
          className="h-auto w-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              banner.is_active ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          <span className="text-sm font-medium">
            {banner.is_active ? "Active" : "Inactive"}
          </span>
          <span className="text-xs text-muted-foreground">
            &middot; Order: {banner.sort_order}
          </span>
        </div>

        {banner.link_url && (
          <p className="mt-1 truncate text-xs text-muted-foreground">
            Links to: {banner.link_url}
          </p>
        )}

        {banner.mobile_image_url && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            Has mobile variant
          </p>
        )}

        <p className="mt-1 text-xs text-muted-foreground">
          Created {new Date(banner.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => handleReorder("up")}
          disabled={isPending || isFirst}
          title="Move up"
          className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </button>

        <button
          onClick={() => handleReorder("down")}
          disabled={isPending || isLast}
          title="Move down"
          className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        <button
          onClick={handleToggle}
          disabled={isPending}
          title={banner.is_active ? "Deactivate" : "Activate"}
          className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30"
        >
          {banner.is_active ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          )}
        </button>

        <button
          onClick={handleDelete}
          disabled={isPending}
          title="Delete"
          className="rounded-lg border border-red-200 p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-30"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  );
}
