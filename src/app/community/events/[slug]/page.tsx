import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarBlank,
  CaretRight,
  MapPin,
} from "@phosphor-icons/react/dist/ssr";
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
  if (!event) return { title: "Event not found" };
  return {
    title: event.title,
    description: event.description,
    alternates: { canonical: `/community/events/${event.slug}` },
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

  const available =
    event.ticketProduct.stockOnHand - event.ticketProduct.stockReserved;
  const storyParagraphs = (event.story || event.description)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const isFree = event.ticketProduct.price === 0;

  return (
    <main className="min-w-0 overflow-x-clip bg-white">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: event.title,
          description: event.description,
          image: event.image ? [absoluteUrl(event.image)] : undefined,
          startDate: event.startsAt.toISOString(),
          eventAttendanceMode:
            "https://schema.org/OfflineEventAttendanceMode",
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
              href="/community"
              className="min-h-11 content-center hover:text-ink"
            >
              Community
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
              <p className="font-semibold text-clayInk">
                {isFree
                  ? "Free event"
                  : `${formatMoney(event.ticketProduct.price)} per guest`}
              </p>
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
                Reserve your place, then add any recommended TITUN products you
                would like to receive with your booking.
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
      </article>
    </main>
  );
}
