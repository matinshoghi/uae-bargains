"use client";

import { useState, useEffect } from "react";

interface ActivityItem {
  username: string;
  action: string;
}

const FALLBACK: ActivityItem[] = [
  { username: "sarah_dxb", action: "posted a new deal" },
  { username: "techbargain", action: "upvoted a deal" },
  { username: "ali.deals", action: "commented on a deal" },
  { username: "matin", action: "shared a deal" },
  { username: "savvy_mum", action: "upvoted a deal" },
  { username: "dubai_saver", action: "joined the community" },
];

export function ActivityTicker() {
  const [items, setItems] = useState<ActivityItem[]>(FALLBACK);
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    fetch("/api/activity?limit=10")
      .then((r) => r.json())
      .then((data: ActivityItem[]) => {
        if (Array.isArray(data) && data.length > 0) setItems(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % items.length);
        setShow(true);
      }, 250);
    }, 3000);
    return () => clearInterval(t);
  }, [items.length]);

  return (
    <div className="border-b border-[#e4e3dd] bg-[#fafaf6] px-6 py-2 text-center">
      <span
        className="inline-flex items-center gap-2"
      >
        <span
          className="h-[7px] w-[7px] shrink-0 rounded-full bg-[#7ab800]"
          style={{ animation: "pulse-dot 2s ease infinite" }}
        />
        <span
          aria-live="polite"
          className="max-w-[260px] truncate font-mono-display text-xs text-muted-foreground transition-opacity duration-250 sm:max-w-[400px] md:max-w-[500px]"
          style={{ opacity: show ? 1 : 0 }}
        >
          {items[idx]?.username} {items[idx]?.action}
        </span>
      </span>
    </div>
  );
}
