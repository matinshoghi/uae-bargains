"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { cn } from "@/lib/utils";

interface PostDealButtonProps {
  isLoggedIn: boolean;
  variant?: "default" | "compact" | "mobile";
}

export function PostDealButton({ isLoggedIn, variant = "default" }: PostDealButtonProps) {
  const router = useRouter();
  const { openAuthModal } = useAuthModal();

  function handleClick() {
    if (!isLoggedIn) {
      openAuthModal({ message: "Sign in to post a deal" });
      return;
    }
    router.push("/deals/new");
  }

  if (variant === "mobile") {
    return (
      <button
        onClick={handleClick}
        className="flex flex-col items-center gap-0.5 transition-colors text-muted-foreground"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-sm transition-colors">
          <Plus className="h-4 w-4" />
        </div>
        <span className="font-display text-[9px] font-semibold uppercase tracking-wider">
          Post
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "font-display inline-flex items-center justify-center whitespace-nowrap rounded-sm border-2 border-foreground bg-foreground font-semibold text-primary transition-all duration-150 hover:bg-primary hover:text-primary-foreground",
        variant === "compact"
          ? "px-2.5 py-1.5 text-[11px] md:px-4 md:py-2 md:text-[12px]"
          : "px-3 py-2 text-xs md:px-5 md:py-2.5 md:text-sm"
      )}
    >
      <Plus className={cn("mr-1", variant === "compact" ? "h-3 w-3 md:h-3.5 md:w-3.5" : "mr-1.5 h-4 w-4")} />
      {variant === "compact" ? (
        <>
          <span className="hidden sm:inline">Post Deal</span>
          <span className="sm:hidden">Post</span>
        </>
      ) : (
        "Post Deal"
      )}
    </button>
  );
}
