import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";
import { NavBar } from "@/components/layout/NavBar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "UAE Bargains — Community Deals for UAE",
    template: "%s — UAE Bargains",
  },
  description:
    "Discover and share the best deals in UAE. Community-driven bargains on electronics, dining, fashion, groceries, and travel.",
  openGraph: {
    type: "website",
    locale: "en_AE",
    siteName: "UAE Bargains",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} antialiased`}
      >
        <NavBar />
        <main className="mx-auto min-h-screen max-w-5xl pb-20 md:pb-0">
          {children}
        </main>
        <Footer />
        <MobileNav />
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
