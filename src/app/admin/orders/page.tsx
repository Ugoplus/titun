import { desc } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { OrderManager } from "@/components/admin/order-manager";
import { isAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const records = await getDb().select().from(orders).orderBy(desc(orders.createdAt));
  return (
    <main className="mx-auto max-w-[1440px] px-5 py-10 md:px-8 md:py-16">
      <Link href="/admin" className="border-b border-ink pb-1 text-sm font-semibold">Back to dashboard</Link>
      <div className="mt-8 border-b border-ink/20 pb-8"><p className="text-xs font-bold uppercase tracking-[.09em] text-ink/65">Operations</p><h1 className="mt-2 font-display text-6xl tracking-[-.035em] md:text-8xl">Orders.</h1><p className="mt-5 max-w-2xl leading-relaxed text-ink/65">Track every order from payment through processing, shipment and final fulfilment. All times use West Africa Time.</p></div>
      <OrderManager initialOrders={records} />
    </main>
  );
}
