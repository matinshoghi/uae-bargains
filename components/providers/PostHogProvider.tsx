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
