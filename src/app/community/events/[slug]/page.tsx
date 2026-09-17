import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarBlank, MapPin } from "@phosphor-icons/react/dist/ssr";
import { EventBookingPanel } from "@/components/event-booking-panel";
import { StructuredData } from "@/components/structured-data";
import { getCommunityEventBySlug } from "@/lib/community";
import { absoluteUrl } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getCommunityEventBySlug(slug);
  if (!event) return { title: "Event not found", robots: { index: false } };

  return {
    title: event.title,
    description: event.description,
    alternates: { canonical: `/community/events/${event.slug}` },
    openGraph: {
      type: "website",
      title: event.title,
      description: event.description,
      images: event.image ? [{ url: event.image, alt: event.title }] : undefined,
    },
  };
}

export default async function CommunityEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getCommunityEventBySlug(slug);
  if (!event) notFound();

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-10 md:px-8 md:py-16">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: event.title,
          description: event.description,
          startDate: event.startsAt.toISOString(),
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          location: { "@type": "Place", name: event.venue },
          image: event.image ? [absoluteUrl(event.image)] : undefined,
          organizer: {
            "@type": "Organization",
            name: "TITUN",
            url: absoluteUrl("/"),
          },
          offers: {
            "@type": "Offer",
            url: absoluteUrl(`/community/events/${event.slug}`),
            priceCurrency: event.ticketProduct.currency,
            price: (event.ticketProduct.price / 100).toFixed(2),
            availability:
              event.ticketProduct.stockOnHand - event.ticketProduct.stockReserved > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/SoldOut",
          },
        }}
      />
      <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-14">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden bg-oat">
            {event.image && (
              <Image
                src={event.image}
                alt={`${event.title} event setting`}
                fill
                priority
                className="object-cover"
              />
            )}
          </div>
          <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3 border-b border-ink/20 pb-7 text-sm font-bold">
            <span className="flex items-center gap-2">
              <CalendarBlank />
              {event.startsAt.toLocaleDateString("en-NG", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              ·{" "}
              {event.startsAt.toLocaleTimeString("en-NG", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
            <span className="flex items-center gap-2">
              <MapPin />
              {event.venue}
            </span>
          </div>
          <p className="mt-7 max-w-2xl text-base leading-relaxed text-ink/70">
            {event.description}
          </p>
        </div>
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs font-bold uppercase tracking-[.1em] text-clayInk">
            TITUN community experience
          </p>
          <h1 className="mb-8 mt-3 font-display text-[clamp(4rem,7vw,7rem)] leading-[.84] tracking-[-.04em]">
            {event.title}
          </h1>
          <EventBookingPanel
            ticket={event.ticketProduct}
            recommendations={event.recommendedProducts}
          />
        </div>
      </div>
    </div>
  );
}
