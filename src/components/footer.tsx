import Link from "next/link";
import { NewsletterForm } from "./newsletter-form";
import { contactDetails } from "@/lib/contact";

const columns = [
  {
    title: "Shop",
    links: [
      ["Refreshing towels", "/shop?category=Refreshing%20towels"],
      ["Wet wipes", "/shop#wipes"],
      ["Community events", "/community"],
    ],
  },
  {
    title: "Discover",
    links: [
      ["About TITUN", "/about"],
      ["The Oshibori ritual", "/oshibori"],
      ["Corporate and hospitality", "/corporate"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "Help",
    links: [
      ["Frequently asked questions", "/faqs"],
      ["Shipping", "/shipping"],
      ["Returns", "/returns"],
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="bg-ink px-5 py-14 text-white md:px-8 md:py-20">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-12 border-b border-white/20 pb-14 lg:grid-cols-[1.15fr_1.85fr] lg:gap-20">
          <div>
            <p className="font-display text-5xl tracking-[-.03em]">TITUN</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              Premium refreshment essentials designed to elevate the moments
              that matter.
            </p>
            <div className="mt-8 max-w-md">
              <p className="mb-3 text-sm font-semibold">Notes on renewal</p>
              <NewsletterForm />
            </div>
          </div>
          <div className="grid gap-10 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title} className="grid content-start gap-3 text-sm">
                <p className="mb-2 text-xs font-bold uppercase tracking-[.08em] text-white/55">
                  {column.title}
                </p>
                {column.links.map(([label, href]) => (
                  <Link key={href} href={href} className="w-fit hover:text-gold">
                    {label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-6 pt-7 text-xs text-white/60">
          <span>© {new Date().getFullYear()} TITUN</span>
          <div className="flex gap-5">
            {contactDetails.instagramUrl && <a href={contactDetails.instagramUrl}>Instagram</a>}
            {contactDetails.whatsappHref && <a href={contactDetails.whatsappHref}>WhatsApp</a>}
            {contactDetails.email && <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a>}
          </div>
          <span>The Art of Renewal</span>
        </div>
      </div>
    </footer>
  );
}
