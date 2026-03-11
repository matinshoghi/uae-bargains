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
          letterSpacing: "0.02em",
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          letterSpacing: "-0.03em",
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
      <div className="mx-auto max-w-[1100px] px-6 py-7 text-center md:py-8">
        {/* Badge */}
        <div
          className="mb-3.5 inline-flex items-center gap-1 rounded-sm border border-primary/25 bg-primary/[0.12] px-4 py-1.5 font-mono-display text-xs tracking-wider text-primary opacity-0"
          style={{ animation: "hero-fade-up 0.4s ease 0.05s forwards" }}
        >
          Made with{" "}
          <span
            className="inline-flex items-center"
            style={{ animation: "heartbeat 1.8s ease-in-out infinite" }}
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              style={{ filter: "drop-shadow(0 0 4px rgba(255, 51, 85, 0.5))" }}
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="#ff3355"
              />
            </svg>
          </span>{" "}
          from the{" "}
          <span
            className="inline-block text-base"
            style={{
              animation: "flag-pop 3s ease-in-out infinite",
              transformOrigin: "center bottom",
            }}
          >
            🇦🇪
          </span>
        </div>

        {/* Headline */}
        <div ref={headlineWrapRef}>
          <h1 className="hero-headline mx-auto mb-2 font-heading text-[22px] font-black leading-[1.1] text-background sm:text-[26px] md:text-4xl">
            Don&apos;t overpay.{" "}
            <span className="hero-accent">Your neighbours</span> found it
            cheaper.
          </h1>
        </div>

        {/* Subtext */}
        <p
          className="mx-auto mb-5 max-w-[520px] text-[15px] leading-relaxed text-background/55 opacity-0"
          style={{ animation: "hero-fade-up 0.5s ease 0.7s forwards" }}
        >
          Post deals, vote on the best ones, and never pay full price in the UAE
          again. Built by locals, for locals.
        </p>

        {/* CTA */}
        <div
          className="mb-5 opacity-0"
          style={{ animation: "hero-fade-up 0.5s ease 0.85s forwards" }}
        >
          {isLoggedIn ? (
            <Link
              href="/deals/new"
              className="inline-block border-2 border-primary bg-primary px-7 py-2.5 font-display text-[15px] font-bold text-primary-foreground transition-all duration-150 hover:border-[#d8ff6a] hover:bg-[#d8ff6a]"
            >
              Post a Deal →
            </Link>
          ) : (
            <button
              onClick={() => openAuthModal()}
              className="border-2 border-primary bg-primary px-7 py-2.5 font-display text-[15px] font-bold text-primary-foreground transition-all duration-150 hover:border-[#d8ff6a] hover:bg-[#d8ff6a]"
            >
              Join the Community →
            </button>
          )}
        </div>

        {/* Stats */}
        <div
          className="mx-auto flex max-w-md justify-center gap-8 border-t border-background/[0.08] pt-4 opacity-0 md:gap-8"
          style={{ animation: "hero-fade-up 0.5s ease 0.95s forwards" }}
        >
          <div className="text-center">
            <div className="font-mono-display text-xl font-medium text-primary">
              {stats.dealsCount}
            </div>
            <div className="font-mono-display text-[11px] tracking-wider text-background/35">
              deals shared
            </div>
          </div>
          <div className="text-center">
            <div className="font-mono-display text-xl font-medium text-primary">
              {stats.votesCount}
            </div>
            <div className="font-mono-display text-[11px] tracking-wider text-background/35">
              votes cast
            </div>
          </div>
          <div className="text-center">
            <div className="font-mono-display text-xl font-medium text-primary">
              {stats.commentsCount}
            </div>
            <div className="font-mono-display text-[11px] tracking-wider text-background/35">
              comments
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
