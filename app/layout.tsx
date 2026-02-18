import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense>
          <Header />
        </Suspense>
        <main className="mx-auto min-h-screen max-w-5xl pb-20 md:pb-0">
          {children}
        </main>
        <MobileNav />
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
