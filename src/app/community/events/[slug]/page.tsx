import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarBlank, MapPin } from "@phosphor-icons/react/dist/ssr";
import { EventBookingPanel } from "@/components/event-booking-panel";
import { getCommunityEventBySlug } from "@/lib/community";

export default async function CommunityEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getCommunityEventBySlug(slug);
  if (!event) notFound();

  return <div className="mx-auto max-w-[1440px] px-5 py-10 md:px-8 md:py-16">
    <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-14">
      <div>
        <div className="relative aspect-[4/3] overflow-hidden bg-[#ddd6c8]">{event.image && <Image src={event.image} alt={`${event.title} event setting`} fill priority className="object-cover" />}</div>
        <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3 border-b border-ink/20 pb-7 text-sm font-bold">
          <span className="flex items-center gap-2"><CalendarBlank />{event.startsAt.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {event.startsAt.toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" })}</span>
          <span className="flex items-center gap-2"><MapPin />{event.venue}</span>
        </div>
        <p className="mt-7 max-w-2xl text-base leading-relaxed text-ink/70">{event.description}</p>
      </div>
      <div className="lg:sticky lg:top-28 lg:self-start">
        <p className="text-xs font-bold uppercase tracking-[.1em] text-clay">TITUN community experience</p>
        <h1 className="mb-8 mt-3 font-display text-[clamp(4rem,7vw,7rem)] leading-[.84] tracking-[-.06em]">{event.title}</h1>
        <EventBookingPanel ticket={event.ticketProduct} recommendations={event.recommendedProducts} />
      </div>
    </div>
  </div>;
}
