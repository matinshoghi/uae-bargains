"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/deals/new", icon: Plus, label: "Post" },
  { href: "/settings", icon: Settings, label: "Settings" },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-[1.5px] border-foreground/10 bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 transition-colors",
                isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-sm transition-colors",
                  isActive && "bg-primary"
                )}
              >
                <item.icon className="h-4 w-4" />
              </div>
              <span className="font-display text-[9px] font-semibold uppercase tracking-wider">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
