import { desc, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { OrderManager } from "@/components/admin/order-manager";
import { AdminNavigation } from "@/components/admin/admin-navigation";
import { adminCan, getAdminIdentity } from "@/lib/auth";
import { toAdminOrderView } from "@/lib/admin-order-view";
import { getDb } from "@/lib/db";
import { orderItems, orders } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const identity = await getAdminIdentity();
  if (!identity) redirect("/admin/login");
  if (!adminCan(identity, "orders:view")) redirect("/admin?error=forbidden");
  const canManage = adminCan(identity, "orders:manage");
  const canViewFinancials = adminCan(identity, "orders:view_financials");
  const db = getDb();
  const records = await db.select().from(orders).orderBy(desc(orders.createdAt));
  const items = records.length
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, records.map(({ id }) => id)))
    : [];
  return (
    <main className="mx-auto max-w-[1440px] px-5 py-10 md:px-8 md:py-16">
      <AdminNavigation identity={identity} />
      <div className="mt-8 border-b border-ink/20 pb-8"><p className="text-xs font-bold uppercase tracking-[.09em] text-ink/65">Operations</p><h1 className="mt-2 font-display text-6xl tracking-[-.035em] md:text-8xl">Orders.</h1><p className="mt-5 max-w-2xl leading-relaxed text-ink/65">Track every order from payment through processing, shipment and final fulfilment. All times use West Africa Time.</p></div>
      {!canViewFinancials && <p className="mt-6 border border-ink/20 bg-linen p-4 text-sm">This role can manage fulfilment details but cannot access prices, totals or payment-provider information.</p>}
      <OrderManager initialOrders={records.map((order) => toAdminOrderView(order, canViewFinancials, items.filter((item) => item.orderId === order.id)))} canManage={canManage} canViewFinancials={canViewFinancials} />
    </main>
  );
}
