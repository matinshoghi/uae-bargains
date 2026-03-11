"use client";

import { MessageSquare } from "lucide-react";
import { useAuthModal } from "@/components/auth/AuthModalProvider";

export function ReplyButton({
  isLoggedIn,
  isOpen,
  onToggle,
}: {
  dealId: string;
  parentId: string;
  isLoggedIn: boolean;
  renderFormOutside?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}) {
  const { openAuthModal } = useAuthModal();

  function handleClick() {
    if (!isLoggedIn) {
      openAuthModal({ message: "Sign in to reply" });
      return;
    }
    onToggle?.();
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1 p-1 font-mono-display text-[11px] text-muted-foreground transition-colors hover:text-foreground"
    >
      <MessageSquare className="h-3 w-3" />
      {isOpen ? "Cancel" : "Reply"}
    </button>
  );
}
