import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";
import { contactDetails } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact TITUN about products, existing orders and corporate hospitality projects.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <ContentPage title="Let’s talk about the moment." introduction="Questions about products, an order or a hospitality project? Choose the most direct way to reach TITUN." singleLineTitle>
      <div className="grid border-l border-t border-ink/20 md:grid-cols-3">
        {contactDetails.email ? <a href={`mailto:${contactDetails.email}`} className="border-b border-r border-ink/20 p-7"><h2 className="font-display text-3xl">Email</h2><p className="mt-3 text-sm text-ink/65">{contactDetails.email}</p></a> : <div className="border-b border-r border-ink/20 p-7"><h2 className="font-display text-3xl">Email</h2><p className="mt-3 text-sm text-ink/65">Contact details coming soon</p></div>}
        {contactDetails.whatsappHref ? <a href={contactDetails.whatsappHref} className="border-b border-r border-ink/20 p-7"><h2 className="font-display text-3xl">WhatsApp</h2><p className="mt-3 text-sm text-ink/65">Start a conversation</p></a> : <div className="border-b border-r border-ink/20 p-7"><h2 className="font-display text-3xl">WhatsApp</h2><p className="mt-3 text-sm text-ink/65">Number to be confirmed</p></div>}
        {contactDetails.instagramUrl ? <a href={contactDetails.instagramUrl} className="border-b border-r border-ink/20 p-7"><h2 className="font-display text-3xl">Instagram</h2><p className="mt-3 text-sm text-ink/65">Follow TITUN</p></a> : <div className="border-b border-r border-ink/20 p-7"><h2 className="font-display text-3xl">Instagram</h2><p className="mt-3 text-sm text-ink/65">Profile to be confirmed</p></div>}
      </div>
    </ContentPage>
  );
}
