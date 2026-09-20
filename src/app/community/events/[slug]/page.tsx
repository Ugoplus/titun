import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarBlank, MapPin } from "@phosphor-icons/react/dist/ssr";
import { EventBookingPanel } from "@/components/event-booking-panel";
import { StructuredData } from "@/components/structured-data";
import { getCommunityEventBySlug } from "@/lib/community";
import { formatMoney } from "@/lib/money";
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

  const available =
    event.ticketProduct.stockOnHand - event.ticketProduct.stockReserved;
  const storyParagraphs = (event.story || event.description)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const isFree = event.ticketProduct.price === 0;

  return (
    <article>
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
          isAccessibleForFree: isFree,
          offers: {
            "@type": "Offer",
            url: absoluteUrl(`/community/events/${event.slug}`),
            priceCurrency: event.ticketProduct.currency,
            price: (event.ticketProduct.price / 100).toFixed(2),
            availability:
              available > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/SoldOut",
          },
        }}
      />

      <header className="mx-auto max-w-[1200px] px-5 pb-10 pt-12 md:px-8 md:pb-14 md:pt-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_.45fr] lg:items-end">
          <div>
            <h1 className="max-w-4xl font-display text-[clamp(3.75rem,8vw,7.5rem)] leading-[.84] tracking-[-.04em]">
              {event.title}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-ink/70">
              {event.description}
            </p>
          </div>
          <div className="grid gap-4 border-t border-ink/20 pt-5 text-sm font-semibold lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="flex items-start gap-3">
              <CalendarBlank className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                {event.startsAt.toLocaleDateString("en-NG", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                <br />
                {event.startsAt.toLocaleTimeString("en-NG", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </p>
            <p className="flex items-start gap-3">
              <MapPin className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>{event.venue}</span>
            </p>
            <p className="font-bold text-clayInk">
              {isFree ? "Free event" : `${formatMoney(event.ticketProduct.price)} per guest`}
            </p>
          </div>
        </div>
      </header>

      <div className="relative mx-auto aspect-[16/9] w-full max-w-[1440px] overflow-hidden bg-oat md:aspect-[16/7]">
        {event.image && (
          <Image
            src={event.image}
            alt={`${event.title} event setting`}
            fill
            priority
            sizes="(max-width: 1440px) 100vw, 1440px"
            className="object-cover"
          />
        )}
      </div>

      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-14 md:px-8 md:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(360px,.62fr)] lg:gap-16">
        <section aria-labelledby="event-story-title" className="max-w-[72ch]">
          <h2 id="event-story-title" className="font-display text-5xl tracking-[-.03em] md:text-6xl">
            The story
          </h2>
          <div className="mt-7 grid gap-6 text-base leading-[1.75] text-ink/75 md:text-lg">
            {storyParagraphs.map((paragraph, index) => (
              <p key={`${event.id}-story-${index}`}>{paragraph}</p>
            ))}
          </div>
        </section>

        <aside id="attend" className="scroll-mt-28 lg:sticky lg:top-28 lg:self-start">
          <EventBookingPanel
            eventId={event.id}
            eventTitle={event.title}
            ticket={event.ticketProduct}
            recommendations={event.recommendedProducts}
          />
        </aside>
      </div>
    </article>
  );
}
