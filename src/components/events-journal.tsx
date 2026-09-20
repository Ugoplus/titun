"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import {
  filterEventsByStatus,
  getEventStatus,
  type EventArchiveFilter,
} from "@/lib/events";
import { formatMoney } from "@/lib/money";

export type EventJournalItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  venue: string;
  startsAt: string;
  image: string | null;
  ticketPrice: number;
  ctaLabel: string | null;
};

const filters: Array<{ value: EventArchiveFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
];

export function EventsJournal({
  events,
  now,
}: {
  events: EventJournalItem[];
  now: string;
}) {
  const [activeFilter, setActiveFilter] = useState<EventArchiveFilter>("all");
  const referenceDate = useMemo(() => new Date(now), [now]);
  const normalizedEvents = useMemo(
    () =>
      events.map((event) => ({ ...event, startsAt: new Date(event.startsAt) })),
    [events],
  );
  const visibleEvents = useMemo(
    () => filterEventsByStatus(normalizedEvents, activeFilter, referenceDate),
    [activeFilter, normalizedEvents, referenceDate],
  );

  return (
    <section aria-labelledby="events-archive-title">
      <h1 id="events-archive-title" className="sr-only">
        TITUN events archive
      </h1>
      <nav
        aria-label="Filter events"
        className="flex min-h-16 items-center justify-center gap-7 border-y border-ink/15 px-5 md:gap-12"
      >
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            aria-pressed={activeFilter === filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`relative min-h-11 text-xs font-bold uppercase tracking-[.09em] transition-colors ${activeFilter === filter.value ? "text-ink" : "text-ink/60 hover:text-ink"}`}
          >
            {filter.label}
            {activeFilter === filter.value && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-px bg-ink"
              />
            )}
          </button>
        ))}
      </nav>

      <div aria-live="polite" className="sr-only">
        Showing {visibleEvents.length}{" "}
        {activeFilter === "all" ? "events" : `${activeFilter} events`}
      </div>

      {visibleEvents.length > 0 ? (
        <div
          className={`mx-auto grid max-w-[1440px] gap-x-14 gap-y-20 px-5 py-14 md:gap-y-28 md:px-8 md:py-20 lg:gap-x-20 lg:px-12 ${visibleEvents.length === 1 ? "md:max-w-[900px] md:grid-cols-1" : "md:grid-cols-2"}`}
        >
          {visibleEvents.map((event, index) => {
            const status = getEventStatus(event.startsAt, referenceDate);
            const href = `/events/${event.slug}`;
            const isFree = event.ticketPrice === 0;
            const actionLabel =
              status === "past"
                ? "View event"
                : event.ctaLabel || (isFree ? "Register" : "Learn more");

            return (
              <article key={event.id} className="group min-w-0">
                <Link
                  href={href}
                  aria-label={`View ${event.title}`}
                  className="relative block aspect-[4/3] overflow-hidden bg-oat focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                >
                  {event.image && (
                    <Image
                      src={event.image}
                      alt={`${event.title} event setting`}
                      fill
                      sizes="(max-width: 767px) 100vw, 50vw"
                      priority={index < 2}
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025] motion-reduce:transition-none"
                    />
                  )}
                </Link>

                <div className="relative -mt-10 ml-4 min-w-0 bg-white px-5 pb-1 pt-6 md:-mt-12 md:ml-8 md:px-7 md:pt-7 lg:ml-12 lg:px-9">
                  <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-[.08em] text-ink/70">
                    <span
                      className={status === "upcoming" ? "text-clayInk" : ""}
                    >
                      {status === "upcoming" ? "Upcoming" : "Past event"}
                    </span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={event.startsAt.toISOString()}>
                      {event.startsAt.toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </time>
                  </div>

                  <h3 className="mt-4 max-w-[18ch] break-words font-display text-[clamp(2rem,4vw,3.25rem)] leading-[.96] tracking-[-.03em]">
                    <Link href={href} className="hover:text-walnut">
                      {event.title}
                    </Link>
                  </h3>
                  <p className="mt-3 break-words text-xs font-semibold text-ink/70">
                    {event.venue}
                  </p>
                  <p className="mt-5 line-clamp-3 max-w-[62ch] break-words text-sm leading-relaxed text-ink/70">
                    {event.description}
                  </p>

                  <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-ink/15 pt-5">
                    <Link
                      href={href}
                      className="inline-flex min-h-11 items-center gap-2 border-b border-ink/50 text-sm font-semibold hover:border-ink"
                    >
                      {actionLabel}
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                    {status === "upcoming" && (
                      <span className="text-xs font-semibold text-ink/65">
                        {isFree
                          ? "Free event"
                          : `${formatMoney(event.ticketPrice)} per guest`}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mx-auto grid min-h-[42svh] max-w-[1440px] place-items-center px-5 text-center">
          <div className="max-w-xl py-20">
            <h3 className="font-display text-5xl tracking-[-.03em]">
              {activeFilter === "upcoming"
                ? "The next gathering is taking shape."
                : activeFilter === "past"
                  ? "The archive is waiting for its first story."
                  : "The events journal is taking shape."}
            </h3>
            <p className="mx-auto mt-5 max-w-[48ch] text-sm leading-relaxed text-ink/65">
              New TITUN experiences will appear here as soon as they are
              published.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
