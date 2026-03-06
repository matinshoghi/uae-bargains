"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.posthog.com";

if (typeof window !== "undefined" && POSTHOG_KEY && process.env.NODE_ENV === "production") {
  posthog.init(POSTHOG_KEY, {
    api_host: "/ingest",
    ui_host: POSTHOG_HOST,
    capture_pageview: false,
    capture_pageleave: true,
  });
}

const AI_REFERRERS: Record<string, string> = {
  "chat.openai.com": "ChatGPT",
  "chatgpt.com": "ChatGPT",
  "perplexity.ai": "Perplexity",
  "gemini.google.com": "Gemini",
  "grok.x.ai": "Grok",
  "copilot.microsoft.com": "Copilot",
  "claude.ai": "Claude",
};

const AI_UTM_SOURCES: Record<string, string> = {
  chatgpt: "ChatGPT",
  openai: "ChatGPT",
  perplexity: "Perplexity",
  gemini: "Gemini",
  grok: "Grok",
  copilot: "Copilot",
  claude: "Claude",
};

const AI_REFERRAL_SESSION_KEY = "hs_ai_ref_tracked";

function getAiReferralSource(referrer: string, utmSource: string | null): string | null {
  if (utmSource) {
    const source = AI_UTM_SOURCES[utmSource.toLowerCase()];
    if (source) return source;
  }

  if (!referrer) return null;

  try {
    const hostname = new URL(referrer).hostname;
    return AI_REFERRERS[hostname] ?? null;
  } catch {
    return null;
  }
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthogInstance = posthog;

  useEffect(() => {
    if (pathname && posthogInstance) {
      let url = window.origin + pathname;
      const params = searchParams.toString();
      if (params) {
        url = url + "?" + params;
      }
      posthogInstance.capture("$pageview", { $current_url: url });

      const aiSource = getAiReferralSource(document.referrer, searchParams.get("utm_source"));
      if (aiSource && !sessionStorage.getItem(AI_REFERRAL_SESSION_KEY)) {
        posthogInstance.capture("ai_referral", {
          ai_source: aiSource,
          referrer_url: document.referrer || undefined,
          landing_path: pathname,
        });
        posthogInstance.register_once({
          first_ai_source: aiSource,
        });
        sessionStorage.setItem(AI_REFERRAL_SESSION_KEY, "1");
      }
    }
  }, [pathname, searchParams, posthogInstance]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!POSTHOG_KEY || process.env.NODE_ENV !== "production") {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}
