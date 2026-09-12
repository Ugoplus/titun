import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import { Toaster } from "sonner";
import { CartProvider } from "@/components/cart-provider";
import { SiteShell } from "@/components/site-shell";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: { default: "TITUN — A fresh ritual", template: "%s — TITUN" },
  description:
    "Premium refreshing towels for travel, movement, hospitality and everyday rituals.",
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
