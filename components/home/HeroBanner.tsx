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
    <div
      className="relative select-none overflow-hidden rounded-xl"
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
              className={`h-2 rounded-full transition-all duration-300 ${
                i === active
                  ? "w-6 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BannerSlide({ banner }: { banner: HeroBanner }) {
  const Tag = banner.link_url ? "a" : "div";
  const linkProps = banner.link_url
    ? { href: banner.link_url, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Tag {...linkProps} className="relative block w-full shrink-0">
      <div className="hidden md:block">
        <Image
          src={banner.desktop_image_url}
          alt=""
          width={1024}
          height={288}
          priority
          className="h-auto w-full rounded-xl object-cover"
          sizes="(min-width: 1024px) 1024px, 100vw"
          draggable={false}
        />
      </div>
      <div className="block md:hidden">
        <Image
          src={banner.mobile_image_url || banner.desktop_image_url}
          alt=""
          width={640}
          height={280}
          priority
          className="h-auto w-full rounded-xl object-cover"
          sizes="100vw"
          draggable={false}
        />
      </div>
    </Tag>
  );
}
