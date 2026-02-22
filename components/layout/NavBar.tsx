"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { AuthButton } from "@/components/auth/AuthButton";
import { Plus } from "lucide-react";

const SCROLL_THRESHOLD_RATIO = 0.8;
const TRANSITION_MS = 800;
const EASING = "cubic-bezier(0.28, 0.11, 0.32, 1)";

function CompactNav({ visible }: { visible: boolean }) {
  return (
    <nav
      className="fixed left-1/2 z-50 w-[calc(100%-24px)] max-w-[980px] -translate-x-1/2 rounded-sm border-[1.5px] border-foreground/15 bg-background"
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
            alt="UAE Bargains"
            width={90}
            height={30}
            priority
            className="h-5 w-auto object-contain md:h-6"
          />
        </Link>

        <div className="flex items-center gap-3 md:gap-6">
          <Link
            href="/deals/new"
            className="font-display inline-flex items-center justify-center whitespace-nowrap rounded-sm bg-primary px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground transition-all duration-200 hover:brightness-95 md:px-4 md:py-2 md:text-[12px]"
          >
            <Plus className="mr-1 h-3 w-3 md:h-3.5 md:w-3.5" />
            <span className="hidden sm:inline">Post Deal</span>
            <span className="sm:hidden">Post</span>
          </Link>
          <AuthButton variant="link" />
        </div>
      </div>
    </nav>
  );
}

export function NavBar() {
  const [mounted, setMounted] = useState(false);
  const [compactReady, setCompactReady] = useState(false);
  const [compactVisible, setCompactVisible] = useState(false);

  const compactVisibleRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <header className="relative z-40 border-b-[1.5px] border-foreground/10 bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="UAE Bargains"
              width={120}
              height={40}
              priority
              className="h-6 w-auto md:h-7"
            />
          </Link>

          <div className="flex items-center gap-3 md:gap-6">
            <Link
              href="/deals/new"
              className="font-display inline-flex items-center justify-center rounded-sm bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-wide text-primary-foreground transition-all duration-200 hover:brightness-95 md:px-5 md:py-2.5 md:text-sm"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Post Deal
            </Link>
            <AuthButton variant="link" />
          </div>
        </div>
      </header>

      {mounted &&
        compactReady &&
        createPortal(
          <CompactNav visible={compactVisible} />,
          document.body
        )}
    </>
  );
}
