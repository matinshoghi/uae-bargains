"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3X3, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CategoryList } from "@/components/layout/CategoryList";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home", isSheet: false },
  { href: "#categories", icon: Grid3X3, label: "Categories", isSheet: true },
  { href: "/deals/new", icon: Plus, label: "Post", isSheet: false },
  { href: "/settings", icon: Settings, label: "Settings", isSheet: false },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => {
          if (item.isSheet) {
            return (
              <Sheet key={item.label}>
                <SheetTrigger asChild>
                  <button className="flex flex-col items-center gap-0.5 text-muted-foreground">
                    <item.icon className="h-5 w-5" />
                    <span className="text-[10px]">{item.label}</span>
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[60vh]">
                  <SheetHeader>
                    <SheetTitle>Categories</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    <CategoryList />
                  </div>
                </SheetContent>
              </Sheet>
            );
          }

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
