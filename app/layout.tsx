import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";
import { NavBar } from "@/components/layout/NavBar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import { AuthModalProvider } from "@/components/auth/AuthModalProvider";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "HalaSaves — Community Deals for UAE",
    template: "%s — HalaSaves",
  },
  description:
    "Discover and share the best deals in UAE. Community-driven bargains on electronics, dining, fashion, groceries, and travel.",
  openGraph: {
    type: "website",
    locale: "en_AE",
    siteName: "HalaSaves",
  },
};

type ServerProfile = {
  username: string;
  avatar_url: string | null;
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let serverProfile: ServerProfile | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .single();
    serverProfile = data;
  }

  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <AuthModalProvider>
          <NavBar serverProfile={serverProfile} />
          <main className="mx-auto min-h-screen max-w-7xl">
            {children}
          </main>
          <Footer />
          <MobileNav />
          <Toaster />
        </AuthModalProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
