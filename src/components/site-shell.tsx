"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SitePrompts } from "@/components/site-prompts";
import type { ContactDetails } from "@/lib/contact";
import type { EmailPopupContent } from "@/lib/site-content";

export function SiteShell({
  children,
  announcementText,
  contactDetails,
  emailPopupContent,
}: {
  children: React.ReactNode;
  announcementText: string;
  contactDetails: ContactDetails;
  emailPopupContent: EmailPopupContent;
}) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin"))
    return <main className="min-h-screen">{children}</main>;
  return (
    <>
      <Header announcementText={announcementText} />
      <main>{children}</main>
      <Footer contactDetails={contactDetails} />
      <SitePrompts
        whatsappHref={contactDetails.whatsappHref}
        emailPopupContent={emailPopupContent}
      />
    </>
  );
}
