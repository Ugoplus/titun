import type { Metadata } from "next";
import { EventsJournal, type EventJournalItem } from "@/components/events-journal";
import { getPublishedEvents } from "@/lib/community";
import { getEventStatus } from "@/lib/events";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Discover TITUN experiences, gatherings and moments centred on hospitality and renewal.",
  alternates: { canonical: "/events" },
};

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const now = new Date();
  const records = await getPublishedEvents();
  const ordered = [...records].sort((left, right) => {
    const leftStatus = getEventStatus(left.startsAt, now);
    const rightStatus = getEventStatus(right.startsAt, now);
    if (leftStatus !== rightStatus) return leftStatus === "upcoming" ? -1 : 1;
    return leftStatus === "upcoming"
      ? left.startsAt.getTime() - right.startsAt.getTime()
      : right.startsAt.getTime() - left.startsAt.getTime();
  });
  const events: EventJournalItem[] = ordered.map((event) => ({
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    venue: event.venue,
    startsAt: event.startsAt.toISOString(),
    image: event.image,
    ticketPrice: event.ticketProduct.price,
    ctaLabel: event.ctaLabel,
  }));

  return (
    <main className="min-w-0 overflow-x-clip bg-white">
      <EventsJournal events={events} now={now.toISOString()} />
    </main>
  );
}
