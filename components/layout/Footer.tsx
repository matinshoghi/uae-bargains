import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/contact", label: "Contact Us" },
] as const;

export function Footer() {
  return (
    <footer className="hidden border-t border-border bg-background md:block">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col items-center gap-6">
          {/* Nav links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {FOOTER_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-xs text-muted-foreground transition-colors hover:text-[#1d1d1f]"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Disclaimer */}
          <p className="max-w-md text-center text-xs text-muted-foreground">
            UAE Bargains is not affiliated with any merchants listed on this
            website.
          </p>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} UAE Bargains. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
