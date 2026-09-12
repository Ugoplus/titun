"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin"))
    return <main className="min-h-screen">{children}</main>;
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
