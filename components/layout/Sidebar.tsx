"use client";

import { ShareButtons } from "@/components/shared/ShareButtons";

const SITE_URL = "https://uaebargains.com";
const SHARE_TEXT = "Check out UAE Bargains — the best community deals in the UAE!";

export function Sidebar() {
  return (
    <div className="space-y-6 lg:sticky lg:top-24">
      {/* About Section */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          About UAE Bargains 🇦🇪
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your community-driven platform for discovering and sharing the best deals across the UAE.
          Let&apos;s save more, together.
        </p>
      </div>

      <hr />

      {/* Share Section */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Share & Spread the Word
        </h2>
        <div className="mt-3">
          <ShareButtons url={SITE_URL} title={SHARE_TEXT} />
        </div>
      </div>
    </div>
  );
}
