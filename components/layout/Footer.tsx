import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/contact", label: "Contact Us" },
] as const;

export function Footer() {
  return (
    <footer className="border-t-2 border-foreground bg-foreground text-background">
      <div className="grain-overlay mx-auto max-w-7xl px-6 py-10 pb-24 md:py-14 md:pb-14 lg:px-8">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          {/* Branding */}
          <div className="max-w-sm space-y-3">
            <h2 className="font-display text-2xl font-bold uppercase tracking-wider">
              HalaSaves
            </h2>
            <p className="text-sm leading-relaxed text-background/50">
              Your community-driven platform for discovering and sharing the
              best deals across the UAE. Let&apos;s save more, together.
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-3">
            {FOOTER_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="font-display group flex items-center gap-2 text-base font-bold uppercase tracking-wide text-background/80 transition-colors hover:text-background"
              >
                {label}
                <span className="inline-block transition-transform group-hover:translate-x-1">
                  &rarr;
                </span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center gap-3 border-t border-background/15 pt-6 md:flex-row md:justify-between">
          <p className="text-xs text-background/40">
            HalaSaves is not affiliated with any merchants listed on this
            website.
          </p>
          <p className="text-xs text-background/40">
            &copy; {new Date().getFullYear()} HalaSaves
          </p>
        </div>
      </div>
    </footer>
  );
}
