"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SitePrompts } from "@/components/site-prompts";
import type { ContactDetails } from "@/lib/contact";

export function SiteShell({
  children,
  announcementText,
  contactDetails,
}: {
  children: React.ReactNode;
  announcementText: string;
  contactDetails: ContactDetails;
}) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin"))
    return <main className="min-h-screen">{children}</main>;
  return (
    <>
      <Header announcementText={announcementText} />
      <main>{children}</main>
      <Footer contactDetails={contactDetails} />
      <SitePrompts whatsappHref={contactDetails.whatsappHref} />
    </>
  );
}
