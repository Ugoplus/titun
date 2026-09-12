import Link from "next/link";
import { asc, count, desc, eq, ne } from "drizzle-orm";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { communityMembers, events, products } from "@/lib/db/schema";
import {
  EventManager,
  type AdminEventSummary,
} from "@/components/admin/event-manager";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const db = getDb();
  const [records, catalog, memberCount, recentMembers] = await Promise.all([
    db
      .select({ event: events, ticket: products })
      .from(events)
      .innerJoin(products, eq(events.ticketProductId, products.id))
      .orderBy(asc(events.startsAt)),
    db
      .select()
      .from(products)
      .where(ne(products.category, "Community event"))
      .orderBy(asc(products.name)),
    db.select({ count: count() }).from(communityMembers),
    db
      .select()
      .from(communityMembers)
      .orderBy(desc(communityMembers.joinedAt))
      .limit(12),
  ]);
  const summaries: AdminEventSummary[] = records.map(({ event, ticket }) => ({
    ...event,
    ticketPrice: ticket.price,
    capacity: ticket.stockOnHand,
    available: ticket.stockOnHand - ticket.stockReserved,
  }));

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-10 md:px-8 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-ink/20 pb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.09em] text-ink/70">
            Community control
          </p>
          <h1 className="mt-2 font-display text-6xl tracking-[-.04em] md:text-8xl">
            Gatherings.
          </h1>
        </div>
        <Link
          href="/admin"
          className="border border-ink px-4 py-3 text-xs font-bold"
        >
          Back to shop admin
        </Link>
      </div>
      <section className="grid border-l border-t border-ink/20 sm:grid-cols-3">
        <div className="border-b border-r border-ink/20 p-5">
          <p className="text-xs uppercase tracking-[.08em] text-ink/70">
            Events
          </p>
          <p className="mt-4 font-display text-5xl">{summaries.length}</p>
        </div>
        <div className="border-b border-r border-ink/20 p-5">
          <p className="text-xs uppercase tracking-[.08em] text-ink/70">
            Published
          </p>
          <p className="mt-4 font-display text-5xl">
            {summaries.filter((event) => event.published).length}
          </p>
        </div>
        <div className="border-b border-r border-ink/20 p-5">
          <p className="text-xs uppercase tracking-[.08em] text-ink/70">
            Community members
          </p>
          <p className="mt-4 font-display text-5xl">
            {memberCount[0]?.count ?? 0}
          </p>
        </div>
      </section>
      <EventManager initialEvents={summaries} products={catalog} />
      <section className="mt-16">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.09em] text-ink/70">
            Paid attendees
          </p>
          <h2 className="mt-2 font-display text-5xl">Community members</h2>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/30 text-xs uppercase tracking-[.06em] text-ink/70">
                <th className="py-3">Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentMembers.map((member) => (
                <tr key={member.id} className="border-b border-ink/15">
                  <td className="py-4 font-bold">{member.name}</td>
                  <td>{member.email}</td>
                  <td>{member.phone}</td>
                  <td>{member.joinedAt.toLocaleDateString("en-NG")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentMembers.length === 0 && (
            <p className="border-b border-ink/15 py-8 text-sm text-ink/70">
              Members will appear here after a successful event payment.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
