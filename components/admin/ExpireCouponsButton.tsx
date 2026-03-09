"use client";

import { useTransition, useState } from "react";
import { expireExpiredCoupons } from "@/lib/actions/coupons";

export function ExpireCouponsButton() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  function handleClick() {
    startTransition(async () => {
      const res = await expireExpiredCoupons();
      if (res.error) {
        setResult(`Error: ${res.error}`);
      } else {
        setResult(`Done — ${res.expired} coupon${res.expired === 1 ? "" : "s"} expired.`);
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={isPending}
        onClick={handleClick}
        className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
      >
        {isPending ? "Running..." : "Expire Outdated Coupons"}
      </button>
      {result && (
        <span className="text-sm text-muted-foreground">{result}</span>
      )}
    </div>
  );
}
