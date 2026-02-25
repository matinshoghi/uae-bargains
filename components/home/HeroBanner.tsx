"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import type { Database } from "@/lib/supabase/types";

type HeroBanner = Database["public"]["Tables"]["hero_banners"]["Row"];

const AUTO_ROTATE_MS = 5000;
const SWIPE_THRESHOLD = 50;

export function HeroBannerCarousel({ banners }: { banners: HeroBanner[] }) {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragStartX = useRef(0);
  const dragDeltaX = useRef(0);
  const isDragging = useRef(false);

  const count = banners.length;

  const startAutoRotate = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (count <= 1) return;
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % count);
    }, AUTO_ROTATE_MS);
  }, [count]);

  useEffect(() => {
    startAutoRotate();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startAutoRotate]);

  if (count === 0) return null;

  const goTo = (idx: number) => {
    setActive(idx);
    startAutoRotate();
  };

  const onDragStart = (x: number) => {
    isDragging.current = true;
    dragStartX.current = x;
    dragDeltaX.current = 0;
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const onDragMove = (x: number) => {
    if (!isDragging.current) return;
    dragDeltaX.current = x - dragStartX.current;
  };

  const onDragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (dragDeltaX.current < -SWIPE_THRESHOLD && active < count - 1) {
      goTo(active + 1);
    } else if (dragDeltaX.current > SWIPE_THRESHOLD && active > 0) {
      goTo(active - 1);
    } else {
      startAutoRotate();
    }
  };

  return (
    <div className="rounded-sm border-2 border-foreground">
    <div
      className="grain-overlay relative select-none overflow-hidden rounded-sm"
      onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
      onTouchMove={(e) => onDragMove(e.touches[0].clientX)}
      onTouchEnd={onDragEnd}
      onMouseDown={(e) => {
        e.preventDefault();
        onDragStart(e.clientX);
      }}
      onMouseMove={(e) => onDragMove(e.clientX)}
      onMouseUp={onDragEnd}
      onMouseLeave={() => {
        if (isDragging.current) onDragEnd();
      }}
    >
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {banners.map((banner) => (
          <BannerSlide key={banner.id} banner={banner} />
        ))}
      </div>

      {count > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to banner ${i + 1}`}
              className={`h-2 rounded-sm transition-all duration-300 ${
                i === active
                  ? "w-6 bg-primary"
                  : "w-2 bg-foreground/30 hover:bg-foreground/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
    </div>
  );
}

function BannerSlide({ banner }: { banner: HeroBanner }) {
  if (banner.banner_type === "dynamic") {
    return <DynamicBannerSlide banner={banner} />;
  }
  return <ImageBannerSlide banner={banner} />;
}

function ImageBannerSlide({ banner }: { banner: HeroBanner }) {
  const Tag = banner.link_url ? "a" : "div";
  const linkProps = banner.link_url
    ? { href: banner.link_url, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Tag
      {...linkProps}
      className="relative w-full shrink-0 overflow-hidden aspect-[640/280] md:aspect-[1024/288]"
    >
      <Image
        src={banner.desktop_image_url}
        alt=""
        fill
        priority
        className="hidden scale-[1.01] object-cover md:block"
        sizes="(min-width: 1024px) 1024px, 100vw"
        draggable={false}
      />
      <Image
        src={banner.mobile_image_url || banner.desktop_image_url}
        alt=""
        fill
        priority
        className="scale-[1.01] object-cover md:hidden"
        sizes="100vw"
        draggable={false}
      />
    </Tag>
  );
}

function DynamicBannerSlide({ banner }: { banner: HeroBanner }) {
  return (
    <div className="relative w-full shrink-0 overflow-hidden aspect-[640/280] md:aspect-[1024/288]">
      <div className="absolute inset-0 bg-card" />

      {/* Desktop: text left, image right */}
      <div className="relative hidden h-full md:flex">
        <div className="flex w-1/2 flex-col justify-center px-8 lg:px-12">
          <h2 className="font-display text-2xl font-bold leading-tight lg:text-3xl">
            {banner.title}
          </h2>
          {banner.subtitle && (
            <p className="mt-2 text-sm text-muted-foreground lg:text-base">
              {banner.subtitle}
            </p>
          )}
          {banner.button_text && banner.button_url && (
            <a
              href={banner.button_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-fit items-center rounded-sm border-2 border-foreground bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {banner.button_text}
            </a>
          )}
        </div>
        <div className="relative w-1/2">
          <Image
            src={banner.desktop_image_url}
            alt={banner.title || ""}
            fill
            priority
            className="scale-[1.01] object-cover"
            sizes="50vw"
            draggable={false}
          />
        </div>
      </div>

      {/* Mobile: text top, image bottom */}
      <div className="relative flex h-full flex-col md:hidden">
        <div className="flex flex-1 flex-col justify-center px-5 py-4">
          <h2 className="font-display text-lg font-bold leading-tight">
            {banner.title}
          </h2>
          {banner.subtitle && (
            <p className="mt-1 text-xs text-muted-foreground">
              {banner.subtitle}
            </p>
          )}
          {banner.button_text && banner.button_url && (
            <a
              href={banner.button_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-fit items-center rounded-sm border-2 border-foreground bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              {banner.button_text}
            </a>
          )}
        </div>
        <div className="relative h-1/2 w-full">
          <Image
            src={banner.mobile_image_url || banner.desktop_image_url}
            alt={banner.title || ""}
            fill
            priority
            className="scale-[1.01] object-cover"
            sizes="100vw"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
