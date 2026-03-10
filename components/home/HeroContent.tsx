"use client";

import Link from "next/link";
import { useAuthModal } from "@/components/auth/AuthModalProvider";

interface HeroContentProps {
  stats: {
    dealsCount: number;
    votesCount: number;
    commentsCount: number;
  };
  isLoggedIn: boolean;
}

export function HeroContent({ stats, isLoggedIn }: HeroContentProps) {
  const { openAuthModal } = useAuthModal();

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
        <h1
          className="mx-auto mb-2 font-heading text-[22px] font-black leading-[1.1] text-background sm:text-[26px] md:text-4xl opacity-0"
          style={{
            animation:
              "hero-entrance 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.15s forwards",
          }}
        >
          Don&apos;t overpay.{" "}
          <span className="hero-accent" data-text="Your neighbours">
            Your neighbours
          </span>{" "}
          found it cheaper.
        </h1>

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
