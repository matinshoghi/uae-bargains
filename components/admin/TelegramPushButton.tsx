"use client";

import { useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { pushDealToTelegram } from "@/lib/actions/telegram";

interface TelegramPushButtonProps {
  dealId: string;
  dealTitle: string;
  lastPushedAt?: string | null;
}

export function TelegramPushButton({
  dealId,
  dealTitle,
  lastPushedAt,
}: TelegramPushButtonProps) {
  const [isPending, startTransition] = useTransition();

  const lastPushedLabel =
    lastPushedAt != null
      ? `Sent ${formatDistanceToNow(new Date(lastPushedAt), {
          addSuffix: true,
        })}`
      : null;

  function handleClick() {
    startTransition(async () => {
      const result = await pushDealToTelegram(dealId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Sent to Telegram");
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="rounded-md p-2 text-sky-500 transition-colors hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-950 disabled:opacity-50"
        title={lastPushedLabel ?? `Push "${dealTitle}" to Telegram`}
      >
        <TelegramIcon className="h-4 w-4" />
      </button>
      {lastPushedLabel && (
        <p className="hidden whitespace-nowrap text-[10px] text-muted-foreground sm:block">
          {lastPushedLabel}
        </p>
      )}
    </div>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M21 3L3 11l5 2 2 5 3-3 4 3 4-15Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

