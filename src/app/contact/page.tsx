import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";
import { getContactDetails } from "@/lib/contact";
import { getSiteSettings } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact TITUN about products, existing orders and corporate hospitality projects.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const contactDetails = getContactDetails(await getSiteSettings());
  return (
    <ContentPage
      title="Let’s talk about the moment."
      introduction="Questions about products, an order or a hospitality project? Choose the most direct way to reach TITUN."
      singleLineTitle
    >
      <div className="grid border-l border-t border-ink/20 sm:grid-cols-2 xl:grid-cols-4">
        {contactDetails.email ? (
          <a
            href={`mailto:${contactDetails.email}`}
            className="border-b border-r border-ink/20 p-7"
          >
            <h2 className="font-display text-3xl">Email</h2>
            <p className="mt-3 text-sm text-ink/65">{contactDetails.email}</p>
          </a>
        ) : (
          <div className="border-b border-r border-ink/20 p-7">
            <h2 className="font-display text-3xl">Email</h2>
            <p className="mt-3 text-sm text-ink/65">
              Contact details coming soon
            </p>
          </div>
        )}
        <a
          href={contactDetails.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="border-b border-r border-ink/20 p-7"
        >
          <h2 className="font-display text-3xl">WhatsApp</h2>
          <p className="mt-3 text-sm text-ink/65">
            {contactDetails.whatsappLabel}
          </p>
        </a>
        <a
          href={contactDetails.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="border-b border-r border-ink/20 p-7"
        >
          <h2 className="font-display text-3xl">Instagram</h2>
          <p className="mt-3 text-sm text-ink/65">
            {contactDetails.instagramLabel}
          </p>
        </a>
        <a
          href={contactDetails.tiktokUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="border-b border-r border-ink/20 p-7"
        >
          <h2 className="font-display text-3xl">TikTok</h2>
          <p className="mt-3 text-sm text-ink/65">
            {contactDetails.tiktokLabel}
          </p>
        </a>
      </div>
    </ContentPage>
  );
}
