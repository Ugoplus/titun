import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getUpcomingEvents } from "@/lib/community";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = {
  title: "Community",
  description: "Gather, restore and discover upcoming TITUN community experiences.",
};

export default async function CommunityPage() {
  const events = await getUpcomingEvents();
  return <div>
    <section className="grid min-h-[72svh] bg-ink text-cream lg:grid-cols-[1.1fr_.9fr]">
      <div className="flex items-end px-5 py-14 md:px-10 md:py-20 lg:px-[7vw]">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-citron">TITUN community</p>
          <h1 className="mt-5 font-display text-[clamp(4.5rem,10vw,10rem)] leading-[.78] tracking-[-.065em]">Refresh,<br/><em>together.</em></h1>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-cream/70">Intimate gatherings for thoughtful conversation, wellbeing and the small rituals that bring us back to ourselves.</p>
        </div>
      </div>
      <div className="relative min-h-[48svh] lg:min-h-full"><Image src="/images/titun/hero-lounge.jpg" alt="A calm lounge prepared for a TITUN community gathering" fill priority className="object-cover" /></div>
    </section>

    <section className="mx-auto max-w-[1440px] px-5 py-16 md:px-8 md:py-24">
      <div className="grid gap-5 border-b border-ink/20 pb-8 md:grid-cols-[1fr_auto] md:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[.09em] text-ink/50">Gather with us</p><h2 className="mt-2 font-display text-5xl tracking-[-.045em] md:text-7xl">Upcoming experiences</h2></div>
        <p className="max-w-sm text-sm leading-relaxed text-ink/60">A paid booking reserves your place and welcomes you into the continuing TITUN community.</p>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {events.map((event) => <article key={event.id} className="group border border-ink/20">
          <Link href={`/community/events/${event.slug}`} className="block">
            <div className="relative aspect-[4/3] overflow-hidden bg-[#ddd6c8]">{event.image && <Image src={event.image} alt={`${event.title} event setting`} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.025]" />}</div>
            <div className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-end md:p-7">
              <div><p className="text-xs font-bold uppercase tracking-[.08em] text-clay">{event.startsAt.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p><h3 className="mt-2 font-display text-4xl">{event.title}</h3><p className="mt-3 text-sm text-ink/60">{event.venue}</p></div>
              <div className="flex items-center gap-3 font-bold"><span>{formatMoney(event.ticketProduct.price)}</span><ArrowRight /></div>
            </div>
          </Link>
        </article>)}
        {events.length === 0 && <div className="border border-ink/20 p-8"><h3 className="font-display text-4xl">The next gathering is taking shape.</h3><p className="mt-4 text-sm text-ink/60">Follow TITUN on Instagram for the first announcement.</p></div>}
      </div>
    </section>
  </div>;
}
