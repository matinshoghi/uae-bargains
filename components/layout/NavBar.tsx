"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AuthButton } from "@/components/auth/AuthButton";
import { PostDealButton } from "@/components/layout/PostDealButton";

type ServerProfile = {
  username: string;
  avatar_url: string | null;
};

const SCROLL_THRESHOLD_RATIO = 0.8;
const TRANSITION_MS = 800;
const EASING = "cubic-bezier(0.28, 0.11, 0.32, 1)";

function UaeTopRibbon() {
  return (
    <div className="relative h-1.5 w-full overflow-hidden" aria-hidden="true">
      <div className="flex h-full w-full">
        <span className="h-full w-1/4 bg-[#FF0000]" />
        <span className="h-full w-1/4 bg-[#00732F]" />
        <span className="h-full w-1/4 bg-[#FFFFFF]" />
        <span className="h-full w-1/4 bg-[#000000]" />
      </div>
      <span className="uae-ribbon-shimmer pointer-events-none absolute inset-y-0 left-[-45%] w-1/2 bg-gradient-to-r from-transparent via-white/45 to-transparent" />
    </div>
  );
}

function CompactNav({ visible, serverProfile, isLoggedIn }: { visible: boolean; serverProfile: ServerProfile | null; isLoggedIn: boolean }) {
  return (
    <nav
      className="fixed left-1/2 z-50 w-[calc(100%-24px)] max-w-[980px] -translate-x-1/2 rounded-sm border-2 border-foreground bg-background"
      style={{
        top: visible ? "12px" : "-100px",
        opacity: visible ? 1 : 0,
        transition: `top ${TRANSITION_MS}ms ${EASING}, opacity ${TRANSITION_MS}ms ${EASING}`,
      }}
    >
      <div className="flex h-[56px] items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logo.svg"
            alt="HalaSaves"
            width={90}
            height={30}
            priority
            className="h-5 w-auto object-contain md:h-6"
          />
        </Link>

        <div className="flex items-center gap-3 md:gap-6">
          <Link
            href="/coupons"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:block"
          >
            Coupons
          </Link>
          <PostDealButton isLoggedIn={isLoggedIn} variant="compact" />
          <AuthButton variant="link" initialProfile={serverProfile} />
        </div>
      </div>
    </nav>
  );
}

export function NavBar({ serverProfile }: { serverProfile: ServerProfile | null }) {
  const [compactReady, setCompactReady] = useState(false);
  const [compactVisible, setCompactVisible] = useState(false);
  const canUseDOM = typeof window !== "undefined";
  const pathname = usePathname();
  const hideTopPostDealOnMobile = pathname === "/";

  const compactVisibleRef = useRef(false);

  const handleScroll = useCallback(() => {
    const threshold = window.innerHeight * SCROLL_THRESHOLD_RATIO;
    const shouldShow = window.scrollY > threshold;

    if (shouldShow !== compactVisibleRef.current) {
      compactVisibleRef.current = shouldShow;
      if (shouldShow) setCompactReady(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setCompactVisible(shouldShow);
        });
      });
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <>
      <header className="relative z-40 bg-background">
        <UaeTopRibbon />
        <div className="border-b-2 border-foreground">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.svg"
                alt="HalaSaves"
                width={120}
                height={40}
                priority
                className="h-6 w-auto md:h-7"
              />
            </Link>

            <div className="flex items-center gap-3 md:gap-6">
              <Link
                href="/coupons"
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:block"
              >
                Coupons
              </Link>
              <div className={hideTopPostDealOnMobile ? "hidden sm:block" : undefined}>
                <PostDealButton isLoggedIn={serverProfile !== null} />
              </div>
              <AuthButton variant="link" initialProfile={serverProfile} />
            </div>
          </div>
        </div>
      </header>

      {canUseDOM &&
        compactReady &&
        createPortal(
          <CompactNav visible={compactVisible} serverProfile={serverProfile} isLoggedIn={serverProfile !== null} />,
          document.body
        )}
    </>
  );
}
