"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { PostDealButton } from "@/components/layout/PostDealButton";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/settings", icon: Settings, label: "Settings" },
] as const;

export function MobileNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-foreground bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex items-center justify-around py-2">
        {/* Home link */}
        <Link
          href={NAV_ITEMS[0].href}
          className={cn(
            "flex flex-col items-center gap-0.5 transition-colors",
            pathname === NAV_ITEMS[0].href
              ? "text-primary-foreground"
              : "text-muted-foreground"
          )}
        >
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-sm transition-colors",
              pathname === NAV_ITEMS[0].href && "bg-primary"
            )}
          >
            <Home className="h-4 w-4" />
          </div>
          <span className="font-display text-[9px] font-semibold uppercase tracking-wider">
            Home
          </span>
        </Link>

        {/* Post Deal button (auth-gated) */}
        <PostDealButton isLoggedIn={isLoggedIn} variant="mobile" />

        {/* Settings link */}
        <Link
          href={NAV_ITEMS[1].href}
          className={cn(
            "flex flex-col items-center gap-0.5 transition-colors",
            pathname === NAV_ITEMS[1].href
              ? "text-primary-foreground"
              : "text-muted-foreground"
          )}
        >
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-sm transition-colors",
              pathname === NAV_ITEMS[1].href && "bg-primary"
            )}
          >
            <Settings className="h-4 w-4" />
          </div>
          <span className="font-display text-[9px] font-semibold uppercase tracking-wider">
            Settings
          </span>
        </Link>
      </div>
    </nav>
  );
}
