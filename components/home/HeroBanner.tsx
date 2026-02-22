"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import type { Database } from "@/lib/supabase/types";

type HeroBanner = Database["public"]["Tables"]["hero_banners"]["Row"];

const AUTO_ROTATE_MS = 5500;

export function HeroBannerCarousel({ banners }: { banners: HeroBanner[] }) {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = banners.length;

  const advance = useCallback(() => {
    setActive((prev) => (prev + 1) % count);
  }, [count]);

  useEffect(() => {
    if (count <= 1 || isPaused) return;

    timerRef.current = setInterval(advance, AUTO_ROTATE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [count, isPaused, advance]);

  if (count === 0) return null;

  const goTo = (idx: number) => {
    setActive(idx);
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isPaused && count > 1) {
      timerRef.current = setInterval(advance, AUTO_ROTATE_MS);
    }
  };

  return (
    <div
      className="relative w-screen -ml-[calc((100vw-100%)/2)] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
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
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
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
    <Tag {...linkProps} className="relative block w-screen shrink-0">
      <div className="hidden md:block">
        <Image
          src={banner.desktop_image_url}
          alt=""
          width={1440}
          height={400}
          priority
          className="h-auto w-full object-cover"
          sizes="100vw"
        />
      </div>
      <div className="block md:hidden">
        <Image
          src={banner.mobile_image_url || banner.desktop_image_url}
          alt=""
          width={768}
          height={400}
          priority
          className="h-auto w-full object-cover"
          sizes="100vw"
        />
      </div>
    </Tag>
  );
}
