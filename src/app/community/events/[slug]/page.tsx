import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  CalendarBlank,
  CaretRight,
  MapPin,
} from "@phosphor-icons/react/dist/ssr";
import { EventBookingPanel } from "@/components/event-booking-panel";
import { StructuredData } from "@/components/structured-data";
import { getCommunityEventBySlug } from "@/lib/community";
import { getEventStatus } from "@/lib/events";
import { formatMoney } from "@/lib/money";
import { absoluteUrl } from "@/lib/site";
import { hasAvailableStock } from "@/lib/inventory";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getCommunityEventBySlug(slug);
  if (!event) return { title: "Event not found" };
  return {
    title: event.title,
    description: event.description,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: {
      title: event.title,
      description: event.description,
      images: event.image ? [event.image] : [],
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

  const storyParagraphs = (event.story || event.description)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const isFree = event.ticketProduct.price === 0;
  const isPast = getEventStatus(event.startsAt) === "past";
  const eventImages = event.image
    ? [event.image, ...event.galleryImages]
    : event.galleryImages;

  return (
    <main className="min-w-0 overflow-x-clip bg-white">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: event.title,
          description: event.description,
          image:
            eventImages.length > 0 ? eventImages.map(absoluteUrl) : undefined,
          startDate: event.startsAt.toISOString(),
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          location: {
            "@type": "Place",
            name: event.venue,
          },
          organizer: {
            "@type": "Organization",
            name: "TITUN",
            url: absoluteUrl("/"),
          },
          isAccessibleForFree: isFree,
          offers: !isPast
            ? {
                "@type": "Offer",
                url: absoluteUrl(`/events/${event.slug}`),
                priceCurrency: event.ticketProduct.currency,
                price: (event.ticketProduct.price / 100).toFixed(2),
                availability:
                  hasAvailableStock(event.ticketProduct, 1)
                    ? "https://schema.org/InStock"
                    : "https://schema.org/SoldOut",
              }
            : undefined,
        }}
      />

      <article className="min-w-0">
        <header className="mx-auto max-w-[1240px] px-5 pb-10 pt-10 md:px-8 md:pb-14 md:pt-14 lg:px-12">
          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[.08em] text-ink/70"
          >
            <Link href="/" className="min-h-11 content-center hover:text-ink">
              Home
            </Link>
            <CaretRight size={12} aria-hidden="true" />
            <Link
              href="/events"
              className="min-h-11 content-center hover:text-ink"
            >
              Events
            </Link>
            <CaretRight size={12} aria-hidden="true" />
            <span aria-current="page" className="min-w-0 break-words text-ink">
              {event.title}
            </span>
          </nav>

          <div className="mx-auto mt-14 max-w-4xl text-center md:mt-20">
            <h1 className="text-balance break-words font-display text-[clamp(3.25rem,13vw,6rem)] leading-[.88] tracking-[-.035em]">
              {event.title}
            </h1>
            <p className="mx-auto mt-7 max-w-[62ch] text-base leading-relaxed text-ink/65 md:text-lg">
              {event.description}
            </p>
            <div className="mx-auto mt-9 flex min-w-0 max-w-2xl flex-col items-center justify-center gap-4 border-y border-ink/15 py-5 text-sm font-semibold sm:flex-row sm:gap-8">
              <p className="text-xs font-bold uppercase tracking-[.08em] text-clayInk">
                {isPast ? "Past event" : "Upcoming"}
              </p>
              <p className="flex min-w-0 items-start gap-2 text-left">
                <CalendarBlank aria-hidden="true" />
                <time dateTime={event.startsAt.toISOString()}>
                  {event.startsAt.toLocaleDateString("en-NG", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {" · "}
                  {event.startsAt.toLocaleTimeString("en-NG", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </time>
              </p>
              <p className="flex min-w-0 items-start gap-2 text-left">
                <MapPin aria-hidden="true" />
                <span>{event.venue}</span>
              </p>
              {!isPast && (
                <p className="font-semibold text-clayInk">
                  {isFree
                    ? "Free event"
                    : `${formatMoney(event.ticketProduct.price)} per guest`}
                </p>
              )}
            </div>
          </div>
        </header>

        <div className="relative mx-auto aspect-[4/3] w-full max-w-[1360px] overflow-hidden bg-oat md:aspect-[16/8]">
          {event.image && (
            <Image
              src={event.image}
              alt={`${event.title} event setting`}
              fill
              priority
              sizes="(max-width: 1360px) 100vw, 1360px"
              className="object-cover"
            />
          )}
        </div>

        <section
          aria-labelledby="event-story-title"
          className="mx-auto max-w-[760px] px-5 py-16 md:px-8 md:py-24"
        >
          <h2
            id="event-story-title"
            className="font-display text-5xl tracking-[-.03em] md:text-6xl"
          >
            The story
          </h2>
          <div className="mt-8 grid gap-7 text-base leading-[1.7] text-ink/75 md:text-lg">
            {storyParagraphs.map((paragraph, index) => (
              <p key={`${event.id}-story-${index}`}>{paragraph}</p>
            ))}
          </div>
        </section>

        {event.videoUrl && (
          <section className="mx-auto max-w-[1120px] px-5 pb-16 md:px-8 md:pb-24">
            <video
              controls
              playsInline
              preload="metadata"
              poster={event.image ?? undefined}
              className="aspect-video w-full bg-ink object-cover"
            >
              <source src={event.videoUrl} />
            </video>
          </section>
        )}

        {event.galleryImages.length > 0 && (
          <section
            aria-labelledby="event-gallery-title"
            className="mx-auto max-w-[1360px] px-5 pb-16 md:px-8 md:pb-24"
          >
            <h2 id="event-gallery-title" className="sr-only">
              Event gallery
            </h2>
            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
              {event.galleryImages.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className={`relative overflow-hidden bg-oat ${index === 0 ? "aspect-[16/9] md:col-span-2" : "aspect-[4/3]"}`}
                >
                  <Image
                    src={image}
                    alt={`${event.title} gallery image ${index + 1}`}
                    fill
                    sizes={
                      index === 0 ? "100vw" : "(max-width: 767px) 100vw, 50vw"
                    }
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {!isPast && !event.registrationUrl && (
          <section
            id="attend"
            aria-labelledby="attend-title"
            className="min-w-0 scroll-mt-28 bg-linen px-5 py-16 md:px-8 md:py-24"
          >
            <div className="mx-auto grid min-w-0 max-w-[1120px] grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,.72fr)_minmax(0,1.28fr)] lg:items-start lg:gap-16">
              <div className="min-w-0 lg:sticky lg:top-28">
                <h2
                  id="attend-title"
                  className="font-display text-5xl leading-[.95] tracking-[-.03em] md:text-6xl"
                >
                  Attend this gathering
                </h2>
                <p className="mt-6 max-w-[46ch] text-sm leading-relaxed text-ink/65">
                  Reserve your place, then add any recommended TITUN products
                  you would like to receive with your booking.
                </p>
              </div>
              <EventBookingPanel
                eventId={event.id}
                eventTitle={event.title}
                ticket={event.ticketProduct}
                recommendations={event.recommendedProducts}
              />
            </div>
          </section>
        )}
        {!isPast && event.registrationUrl && (
          <section
            id="attend"
            aria-labelledby="external-attend-title"
            className="scroll-mt-28 bg-linen px-5 py-16 text-center md:px-8 md:py-24"
          >
            <div className="mx-auto max-w-[760px]">
              <h2
                id="external-attend-title"
                className="font-display text-5xl leading-[.95] tracking-[-.03em] md:text-6xl"
              >
                Join the gathering.
              </h2>
              <p className="mx-auto mt-6 max-w-[48ch] text-sm leading-relaxed text-ink/70">
                Registration for this event is hosted by our event partner.
              </p>
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex min-h-12 items-center gap-2 bg-ink px-7 text-sm font-bold text-cream"
              >
                {event.ctaLabel || "Register for this event"}
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </div>
          </section>
        )}
        {isPast && (
          <footer className="bg-linen px-5 py-16 text-center md:px-8 md:py-20">
            <p className="text-xs font-bold uppercase tracking-[.1em] text-clayInk">
              TITUN Events Journal
            </p>
            <p className="mx-auto mt-4 max-w-[48ch] font-display text-4xl leading-tight tracking-[-.025em]">
              A moment from the TITUN archive.
            </p>
            <Link
              href="/events"
              className="mt-7 inline-flex min-h-11 items-center border-b border-ink/50 text-sm font-semibold"
            >
              Explore all events
            </Link>
          </footer>
        )}
      </article>
    </main>
  );
}
