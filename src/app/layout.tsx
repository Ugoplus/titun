import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import { Toaster } from "sonner";
import { CartProvider } from "@/components/cart-provider";
import { SiteShell } from "@/components/site-shell";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: "TITUN — A fresh ritual", template: "%s — TITUN" },
  description:
    "Premium refreshing towels for travel, movement, hospitality and everyday rituals.",
  applicationName: "TITUN",
  keywords: [
    "refreshing towels",
    "oshibori towels",
    "premium wet wipes",
    "hospitality towels Nigeria",
    "TITUN",
  ],
  openGraph: {
    type: "website",
    siteName: "TITUN",
    locale: "en_NG",
    title: "TITUN — The Art of Renewal",
    description:
      "Premium refreshing towels and wipes for hospitality, travel, wellness and everyday rituals.",
    images: [{ url: "/images/titun/hero-lounge.jpg", alt: "TITUN premium refreshing towels" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TITUN — The Art of Renewal",
    description:
      "Premium refreshing towels and wipes for hospitality, travel, wellness and everyday rituals.",
    images: ["/images/titun/hero-lounge.jpg"],
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} ${newsreader.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <CartProvider>
          <SiteShell>{children}</SiteShell>
          <Toaster richColors position="top-center" />
        </CartProvider>
      </body>
    </html>
  );
}
