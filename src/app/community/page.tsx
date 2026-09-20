import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getUpcomingEvents } from "@/lib/community";
import { formatMoney } from "@/lib/money";
import { getSiteAssetMap } from "@/lib/site-assets";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Gather, restore and discover upcoming TITUN community experiences.",
  alternates: { canonical: "/community" },
};

export default async function CommunityPage() {
  const [events, siteImages] = await Promise.all([getUpcomingEvents(), getSiteAssetMap()]);
  return (
    <div>
      <section className="grid min-h-[72svh] bg-ink text-cream lg:grid-cols-[1.1fr_.9fr]">
        <div className="flex items-end px-5 py-14 md:px-10 md:py-20 lg:px-[7vw]">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.12em] text-citron">
              TITUN community
            </p>
            <h1 className="mt-5 font-display text-[clamp(4.5rem,10vw,10rem)] leading-[.78] tracking-[-.04em]">
              Refresh,
              <br />
              <em>together.</em>
            </h1>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-cream/70">
              Intimate gatherings for thoughtful conversation, wellbeing and the
              small rituals that bring us back to ourselves.
            </p>
          </div>
        </div>
        <div className="relative min-h-[48svh] lg:min-h-full">
          <Image
            src={siteImages["community.hero"]}
            alt="A calm lounge prepared for a TITUN community gathering"
            fill
            priority
            className="object-cover"
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-5 border-b border-ink/20 pb-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.09em] text-ink/70">
              Gather with us
            </p>
            <h2 className="mt-2 font-display text-5xl tracking-[-.04em] md:text-7xl">
              Upcoming experiences
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-ink/70">
            Read the story behind each gathering, then reserve a free place or
            purchase admission without leaving the event experience.
          </p>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {events.map((event) => (
            <article key={event.id} className="group grid border border-ink/20 bg-white">
              <Link href={`/community/events/${event.slug}`} className="block overflow-hidden">
                <div className="relative aspect-[4/3] overflow-hidden bg-oat">
                  {event.image && (
                    <Image
                      src={event.image}
                      alt={`${event.title} event setting`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                    />
                  )}
                </div>
              </Link>
              <div className="flex flex-col p-5 md:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold uppercase tracking-[.08em] text-clayInk">
                  <p>
                    {event.startsAt.toLocaleDateString("en-NG", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p>{event.ticketProduct.price === 0 ? "Free event" : formatMoney(event.ticketProduct.price)}</p>
                </div>
                <h3 className="mt-3 font-display text-4xl">{event.title}</h3>
                <p className="mt-2 text-sm font-semibold text-ink/70">{event.venue}</p>
                <p className="mt-5 line-clamp-3 text-sm leading-relaxed text-ink/70">
                  {event.description}
                </p>
                <div className="mt-7 grid grid-cols-2 gap-2 border-t border-ink/15 pt-5">
                  <Link
                    href={`/community/events/${event.slug}`}
                    className="inline-flex min-h-12 items-center justify-center gap-2 border border-ink px-4 text-sm font-bold"
                  >
                    Read the story <ArrowRight aria-hidden="true" />
                  </Link>
                  <Link
                    href={`/community/events/${event.slug}#attend`}
                    className="inline-flex min-h-12 items-center justify-center bg-ink px-4 text-sm font-bold text-white"
                  >
                    Attend the event
                  </Link>
                </div>
              </div>
            </article>
          ))}
          {events.length === 0 && (
            <div className="border border-ink/20 p-8">
              <h3 className="font-display text-4xl">
                The next gathering is taking shape.
              </h3>
              <p className="mt-4 text-sm text-ink/70">
                Follow TITUN on Instagram for the first announcement.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
