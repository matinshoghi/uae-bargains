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
      className="fixed left-1/2 z-50 w-[calc(100%-24px)] max-w-[980px] -translate-x-1/2"
      style={{
        top: visible ? "12px" : "-100px",
        opacity: visible ? 1 : 0,
        transition: `top ${TRANSITION_MS}ms ${EASING}, opacity ${TRANSITION_MS}ms ${EASING}`,
        backgroundColor: "rgba(255, 255, 255, 0.72)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        borderRadius: "16px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
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
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-[#1d1d1f] px-2.5 py-1.5 text-[11px] font-medium text-[#1d1d1f] transition-all duration-200 hover:bg-[#1d1d1f] hover:text-white md:px-4 md:py-2 md:text-[13px]"
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
      // Use rAF to ensure DOM has painted before triggering transition
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
      {/* Initial nav — scrolls away with page content */}
      <header className="relative z-40 border-b border-border bg-background">
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
              className="inline-flex items-center justify-center rounded-lg border border-[#1d1d1f] px-3 py-2 text-xs font-semibold text-[#1d1d1f] transition-all duration-200 hover:bg-[#1d1d1f]/10 md:px-5 md:py-2.5 md:text-sm"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Post Deal
            </Link>
            <AuthButton variant="link" />
          </div>
        </div>
      </header>

      {/* Compact nav — stays mounted once shown, visibility controlled by animation */}
      {mounted &&
        compactReady &&
        createPortal(
          <CompactNav visible={compactVisible} />,
          document.body
        )}
    </>
  );
}
