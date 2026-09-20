import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getUpcomingEvents } from "@/lib/community";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = {
  title: "Community",
  description: "Stories and upcoming gatherings from the TITUN community.",
  alternates: { canonical: "/community" },
};

export default async function CommunityPage() {
  const events = await getUpcomingEvents();

  return (
    <main className="min-w-0 overflow-x-clip bg-white">
      <header className="mx-auto max-w-[1440px] px-5 pb-14 pt-10 md:px-8 md:pb-20 md:pt-14 lg:px-12">
        <div className="mx-auto mt-10 max-w-3xl text-center md:mt-16">
          <h1 className="font-display text-[clamp(3.25rem,13vw,6rem)] leading-[.88] tracking-[-.035em]">
            The TITUN Journal
          </h1>
          <p className="mx-auto mt-6 max-w-[58ch] text-base leading-relaxed text-ink/65 md:text-lg">
            Stories of welcome, thoughtful gatherings and the small rituals that
            bring us back to ourselves.
          </p>
        </div>
      </header>

      <section
        aria-labelledby="community-stories-title"
        className="mx-auto max-w-[1440px] px-5 pb-24 md:px-8 md:pb-32 lg:px-12"
      >
        <div className="flex items-end justify-between border-b border-ink/20 pb-4">
          <h2
            id="community-stories-title"
            className="font-display text-3xl tracking-[-.025em] md:text-4xl"
          >
            Upcoming stories and events
          </h2>
          <p className="hidden text-xs font-semibold uppercase tracking-[.08em] text-ink/70 sm:block">
            {events.length} {events.length === 1 ? "gathering" : "gatherings"}
          </p>
        </div>

        {events.length > 0 ? (
          <div className="mt-10 grid gap-x-14 gap-y-20 md:grid-cols-2 md:gap-y-28 lg:gap-x-20">
            {events.map((event, index) => {
              const isFree = event.ticketProduct.price === 0;
              const href = `/community/events/${event.slug}`;

              return (
                <article key={event.id} className="group min-w-0">
                  <Link
                    href={href}
                    aria-label={`Read ${event.title}`}
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

                  <div className="relative -mt-10 ml-4 bg-white px-5 pb-1 pt-6 md:-mt-12 md:ml-8 md:px-7 md:pt-7 lg:ml-12 lg:px-9">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-[.08em] text-ink/70">
                      <time dateTime={event.startsAt.toISOString()}>
                        {event.startsAt.toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </time>
                      <span aria-hidden="true">·</span>
                      <span>
                        {isFree
                          ? "Free event"
                          : `${formatMoney(event.ticketProduct.price)} per guest`}
                      </span>
                    </div>

                    <h3 className="mt-4 max-w-[18ch] font-display text-[clamp(2rem,4vw,3.25rem)] leading-[.96] tracking-[-.03em]">
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

                    <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-ink/15 pt-5 text-sm font-semibold">
                      <Link
                        href={href}
                        className="inline-flex min-h-11 items-center gap-2 border-b border-ink/50 hover:border-ink"
                      >
                        Read the story
                        <ArrowRight size={16} aria-hidden="true" />
                      </Link>
                      <Link
                        href={`${href}#attend`}
                        className="inline-flex min-h-11 items-center gap-2 text-clayInk hover:text-walnut"
                      >
                        Attend the event
                        <ArrowRight size={16} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="grid min-h-[48svh] place-items-center border-b border-ink/15 text-center">
            <div className="max-w-xl py-20">
              <h3 className="font-display text-5xl tracking-[-.03em]">
                The next gathering is taking shape.
              </h3>
              <p className="mx-auto mt-5 max-w-[48ch] text-sm leading-relaxed text-ink/65">
                Join the TITUN list to receive new event stories and invitations
                when they are released.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
