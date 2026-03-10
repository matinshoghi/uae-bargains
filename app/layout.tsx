import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk, Archivo, DM_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";
import { NavBar } from "@/components/layout/NavBar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import { AuthModalProvider } from "@/components/auth/AuthModalProvider";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { createClient } from "@/lib/supabase/server";
import { BRAND } from "@/lib/brand";
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

const archivo = Archivo({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["700", "900"],
});

const dmMono = DM_Mono({
  variable: "--font-mono-display",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  title: {
    default: `${BRAND.name} — Community Deals for UAE`,
    template: `%s — ${BRAND.name}`,
  },
  description: BRAND.description,
  openGraph: {
    type: "website",
    locale: BRAND.locale,
    siteName: BRAND.name,
  },
  alternates: {
    canonical: BRAND.url,
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
        className={`${plusJakartaSans.variable} ${spaceGrotesk.variable} ${archivo.variable} ${dmMono.variable} antialiased`}
      >
        <PostHogProvider>
          <AuthModalProvider>
            <NavBar serverProfile={serverProfile} />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
            <MobileNav isLoggedIn={!!user} />
            <Toaster />
          </AuthModalProvider>
        </PostHogProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
