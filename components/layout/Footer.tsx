import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/contact", label: "Contact Us" },
] as const;

export function Footer() {
  return (
    <footer className="hidden border-t-[1.5px] border-foreground/10 bg-foreground text-background md:block">
      <div className="grain-overlay mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* Branding */}
          <div className="max-w-sm space-y-3">
            <h2 className="font-display text-lg font-bold uppercase tracking-wider">
              UAE Bargains
            </h2>
            <p className="text-sm leading-relaxed text-background/60">
              Your community-driven platform for discovering and sharing the
              best deals across the UAE. Let&apos;s save more, together.
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-2.5">
            <h3 className="section-label text-background/40 mb-1">Navigate</h3>
            {FOOTER_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="font-display group flex items-center gap-2 text-sm font-medium text-background/70 transition-colors hover:text-background"
              >
                <span className="inline-block transition-transform group-hover:translate-x-0.5">
                  &rarr;
                </span>
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center gap-3 border-t border-background/10 pt-6 md:flex-row md:justify-between">
          <p className="text-xs text-background/40">
            UAE Bargains is not affiliated with any merchants listed on this
            website.
          </p>
          <p className="text-xs text-background/40">
            &copy; {new Date().getFullYear()} UAE Bargains
          </p>
        </div>
      </div>
    </footer>
  );
}
