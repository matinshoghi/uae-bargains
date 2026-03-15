"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useAuthModal } from "@/components/auth/AuthModalProvider";

interface HeroContentProps {
  stats: {
    dealsCount: number;
    votesCount: number;
    commentsCount: number;
  };
  isLoggedIn: boolean;
}

const GLOW_SHADOW_OFF = "0 0 12px transparent";
const GLOW_SHADOW_ON =
  "0 0 20px rgba(200, 245, 71, 0.9), 0 0 52px rgba(200, 245, 71, 0.75)";

export function HeroContent({ stats, isLoggedIn }: HeroContentProps) {
  const { openAuthModal } = useAuthModal();
  const headlineWrapRef = useRef<HTMLDivElement>(null);
  const dealsFeedRef = useRef<HTMLElement | null>(null);

  const scrollToDealsFeed = () => {
    if (!dealsFeedRef.current) {
      dealsFeedRef.current = document.getElementById("deals-feed");
    }

    if (!dealsFeedRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    dealsFeedRef.current.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  useGSAP(
    () => {
      const wrap = headlineWrapRef.current;
      if (!wrap) return;
      const headline = wrap.querySelector<HTMLElement>(".hero-headline");
      const accent = wrap.querySelector<HTMLElement>(".hero-accent");
      if (!headline || !accent) return;

      const reduceMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        gsap.fromTo(
          headline,
          { opacity: 0 },
          { opacity: 1, duration: 0.4, delay: 0.15 }
        );
        return;
      }

      gsap.fromTo(
        headline,
        {
          opacity: 0,
          y: 24,
          scale: 0.97,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          delay: 0.15,
          ease: "power2.out",
        }
      );

      gsap.fromTo(
        accent,
        { textShadow: GLOW_SHADOW_OFF },
        {
          textShadow: GLOW_SHADOW_ON,
          duration: 1.5,
          delay: 1.2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        }
      );
    },
    { scope: headlineWrapRef, dependencies: [] }
  );

  return (
    <section className="border-b-[3px] border-primary bg-foreground text-background">
      <div className="mx-auto max-w-[1100px] px-6 pb-11 pt-10 text-center md:pb-14 md:pt-12">
        {/* Built in UAE pill */}
        <div
          className="mb-4 inline-flex items-center gap-2.5 rounded-sm border border-gray-700 bg-gray-800/50 px-4 py-1.5 font-mono-display text-xs tracking-wide text-gray-300 opacity-0 backdrop-blur-sm"
          style={{ animation: "hero-fade-up 0.4s ease 0.05s forwards" }}
        >
          <span
            aria-hidden="true"
            className="uae-flag-wave relative h-4 w-6 overflow-hidden rounded-[2px] shadow-[0_0_8px_rgba(255,255,255,0.14)]"
          >
            <span className="absolute inset-y-0 left-0 w-1/4 bg-[#FF0000]" />
            <span className="absolute right-0 top-0 h-1/3 w-3/4 bg-[#00732F]" />
            <span className="absolute right-0 top-1/3 h-[34%] w-3/4 bg-[#FFFFFF]" />
            <span className="absolute bottom-0 right-0 h-1/3 w-3/4 bg-[#000000]" />
            <span className="uae-flag-shading absolute inset-0 bg-gradient-to-r from-black/25 via-white/40 to-black/25 mix-blend-overlay" />
          </span>
          <span>Proudly Built in the UAE</span>
        </div>

        {/* Headline */}
        <div ref={headlineWrapRef}>
          <h1 className="hero-headline mx-auto mb-2 font-heading text-[29px] font-black leading-[1.1] text-background sm:text-[35px] md:text-[47px]">
            Don&apos;t overpay.{" "}
            <span className="hero-accent">Your neighbours</span> found it
            cheaper.
          </h1>
        </div>

        {/* Subtext */}
        <p
          className="mx-auto mb-5 max-w-[520px] text-sm leading-[1.8] text-background/55 opacity-0"
          style={{ animation: "hero-fade-up 0.5s ease 0.7s forwards" }}
        >
          Post deals, vote on the best ones, and never pay full price in the UAE
          again.
          <strong className="mt-1 block font-bold text-background/80">
            Built by locals, for locals. Supporting our community.
          </strong>
        </p>

        {/* CTA */}
        <div
          className="mb-5 opacity-0"
          style={{ animation: "hero-fade-up 0.5s ease 0.85s forwards" }}
        >
          <div className="flex flex-col items-stretch justify-center gap-2.5 sm:flex-row sm:items-center">
            {isLoggedIn ? (
              <Link
                href="/deals/new"
                className="inline-block w-full border-2 border-primary bg-primary px-7 py-2 text-center font-display text-[15px] font-bold text-primary-foreground transition-all duration-150 hover:border-[#d8ff6a] hover:bg-[#d8ff6a] sm:w-auto"
              >
                Share a Deal →
              </Link>
            ) : (
              <button
                onClick={() => openAuthModal()}
                className="w-full border-2 border-primary bg-primary px-7 py-2 font-display text-[15px] font-bold text-primary-foreground transition-all duration-150 hover:border-[#d8ff6a] hover:bg-[#d8ff6a] sm:w-auto"
              >
                Share a Deal →
              </button>
            )}
            <button
              type="button"
              onClick={scrollToDealsFeed}
              className="w-full border border-gray-700 bg-gray-800 px-7 py-2 font-display text-[15px] font-semibold text-white transition-colors duration-150 hover:border-gray-600 hover:bg-gray-700 sm:w-auto"
            >
              Browse Deals
            </button>
          </div>
        </div>

        {/* Stats */}
        <div
          className="mx-auto flex max-w-md justify-center gap-8 border-t border-gray-800 pt-8 opacity-0 md:gap-8"
          style={{ animation: "hero-fade-up 0.5s ease 0.95s forwards" }}
        >
          <div className="text-center">
            <div className="font-mono-display text-2xl font-bold text-[#c3ff4d]">
              {stats.dealsCount}
            </div>
            <div className="mt-1 text-xs uppercase tracking-wider text-gray-500">
              deals shared
            </div>
          </div>
          <div className="text-center">
            <div className="font-mono-display text-2xl font-bold text-[#c3ff4d]">
              {stats.votesCount}
            </div>
            <div className="mt-1 text-xs uppercase tracking-wider text-gray-500">
              votes cast
            </div>
          </div>
          <div className="text-center">
            <div className="font-mono-display text-2xl font-bold text-[#c3ff4d]">
              {stats.commentsCount}
            </div>
            <div className="mt-1 text-xs uppercase tracking-wider text-gray-500">
              comments
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
