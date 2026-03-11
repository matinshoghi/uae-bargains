import Image from "next/image";
import Link from "next/link";
import type { PlatformStats } from "@/lib/queries/platform-stats";

interface DealAwarenessBarProps {
  stats: PlatformStats;
}

const STAT_ITEMS: Array<{ key: keyof PlatformStats; label: string }> = [
  { key: "dealsCount", label: "deals" },
  { key: "votesCount", label: "votes" },
  { key: "commentsCount", label: "comments" },
];

export function DealAwarenessBar({ stats }: DealAwarenessBarProps) {
  return (
    <section className="border-b border-white/8 bg-[#17191d] text-white">
      <div className="mx-auto max-w-[1100px] px-4 py-3 sm:px-6">
        <div className="flex flex-col items-center text-center sm:hidden">
          <span className="mb-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary">
            <Image src="/icon.svg" alt="HalaSaves icon" width={18} height={18} className="h-[18px] w-[18px]" />
          </span>
          <p className="max-w-[320px] font-heading text-[20px] font-black leading-tight tracking-tight">
            Don&apos;t overpay. <span className="text-primary">Your neighbours found it cheaper.</span>
          </p>
          <p className="mt-1 text-[15px] text-white/60">
            Community-powered deals for the UAE — built by locals, for locals.
          </p>

          <div className="mt-4 flex items-center gap-7">
            {STAT_ITEMS.map((item) => (
              <div key={item.key} className="text-center">
                <div className="font-mono-display text-2xl leading-none text-primary">
                  {stats[item.key]}
                </div>
                <div className="mt-1 font-mono-display text-[10px] uppercase tracking-[0.12em] text-white/45">
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center">
            <Link
              href="/"
              className="border border-white/20 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/10"
            >
              How it works
            </Link>
          </div>
        </div>

        <div className="hidden flex-row items-center gap-5 sm:flex">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary">
              <Image src="/icon.svg" alt="HalaSaves icon" width={18} height={18} className="h-[18px] w-[18px]" />
            </span>
            <div>
              <p className="font-heading text-[22px] font-black leading-tight tracking-tight">
                Don&apos;t overpay. <span className="text-primary">Your neighbours found it cheaper.</span>
              </p>
              <p className="mt-0.5 text-sm text-white/60">
                Community-powered deals for the UAE — built by locals, for locals.
              </p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-5 sm:gap-6">
            {STAT_ITEMS.map((item) => (
              <div key={item.key} className="text-center">
                <div className="font-mono-display text-2xl text-primary">
                  {stats[item.key]}
                </div>
                <div className="font-mono-display text-[10px] uppercase tracking-[0.12em] text-white/45">
                  {item.label}
                </div>
              </div>
            ))}

            <Link
              href="/"
              className="border border-white/20 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/10"
            >
              How it works
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
