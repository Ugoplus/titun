import { desc, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { clearAdminSession, isAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { customOrderRequests, orders, products } from "@/lib/db/schema";
import { ProductManager } from "@/components/admin/product-manager";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";
export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const db = getDb();
  const [catalog, recentOrders, sales, customRequests] = await Promise.all([
    db.select().from(products).orderBy(desc(products.updatedAt)),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(8),
    db
      .select({
        revenue: sql<number>`COALESCE(SUM(${orders.total}) FILTER (WHERE ${orders.status} IN ('paid','fulfilled')), 0)`,
        paidOrders: sql<number>`COUNT(*) FILTER (WHERE ${orders.status} IN ('paid','fulfilled'))`,
      })
      .from(orders),
    db.select().from(customOrderRequests).orderBy(desc(customOrderRequests.createdAt)).limit(8),
  ]);
  const lowStock = catalog.filter(
    (product) =>
      product.stockOnHand - product.stockReserved <= product.lowStockThreshold,
  );
  async function logout() {
    "use server";
    await clearAdminSession();
    redirect("/admin/login");
  }
  return (
    <div className="mx-auto max-w-[1440px] px-5 py-10 md:px-8 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-ink/20 pb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.09em] text-ink/70">
            Operations
          </p>
          <h1 className="mt-2 font-display text-6xl tracking-[-.04em] md:text-8xl">
            Shop control.
          </h1>
        </div>
        <form action={logout}>
          <button className="border border-ink px-4 py-3 text-xs font-bold">
            Sign out
          </button>
        </form>
      </div>
      <section className="grid border-l border-t border-ink/20 sm:grid-cols-3">
        <div className="border-b border-r border-ink/20 p-5">
          <p className="text-xs uppercase tracking-[.08em] text-ink/70">
            Products
          </p>
          <p className="mt-4 font-display text-5xl">{catalog.length}</p>
        </div>
        <div className="border-b border-r border-ink/20 p-5">
          <p className="text-xs uppercase tracking-[.08em] text-ink/70">
            Low stock
          </p>
          <p className="mt-4 font-display text-5xl text-clay">
            {lowStock.length}
          </p>
        </div>
        <div className="border-b border-r border-ink/20 p-5">
          <p className="text-xs uppercase tracking-[.08em] text-ink/70">
            Paid revenue
          </p>
          <p className="mt-4 font-display text-5xl">
            {formatMoney(Number(sales[0]?.revenue ?? 0))}
          </p>
        </div>
      </section>
      {lowStock.length > 0 && (
        <section className="mt-8 border border-clay bg-peach/35 p-5">
          <h2 className="font-display text-3xl">Low-stock attention</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {lowStock.map((product) => (
              <span
                key={product.id}
                className="border border-clay px-3 py-2 text-xs font-bold"
              >
                {product.name}: {product.stockOnHand - product.stockReserved}{" "}
                available
              </span>
            ))}
          </div>
        </section>
      )}
      <ProductManager initialProducts={catalog} />
      <section className="mt-16">
        <h2 className="font-display text-4xl">Custom order requests</h2>
        {customRequests.length ? (
          <div className="mt-5 grid gap-3">
            {customRequests.map((request) => (
              <article key={request.id} className="grid gap-4 border border-ink/20 p-5 md:grid-cols-[1fr_1fr_auto]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.06em] text-ink/60">{request.reference}</p>
                  <h3 className="mt-2 font-display text-2xl">{request.orderType}</h3>
                  <p className="mt-1 text-sm text-ink/70">{request.estimatedQuantity.toLocaleString("en-NG")} units</p>
                </div>
                <div className="text-sm leading-relaxed">
                  <p className="font-semibold">{request.name}{request.company ? ` · ${request.company}` : ""}</p>
                  <a href={`mailto:${request.email}`}>{request.email}</a><br />
                  <a href={`tel:${request.phone}`}>{request.phone}</a>
                </div>
                {request.artworkUrl ? <a className="inline-flex min-h-11 items-center border border-ink px-4 text-sm font-semibold" href={request.artworkUrl} target="_blank" rel="noreferrer">View artwork</a> : <span className="text-xs text-ink/60">No artwork</span>}
                <p className="leading-relaxed text-ink/70 md:col-span-3">{request.message}</p>
              </article>
            ))}
          </div>
        ) : <p className="mt-4 text-sm text-ink/65">No custom requests yet.</p>}
      </section>
      <section className="mt-16">
        <h2 className="font-display text-4xl">Recent orders</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/30 text-xs uppercase tracking-[.06em] text-ink/70">
                <th className="py-3">Reference</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Placed</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-ink/15">
                  <td className="py-4 font-bold">{order.reference}</td>
                  <td>
                    {order.customerName}
                    <br />
                    <span className="text-xs text-ink/70">
                      {order.customerEmail}
                    </span>
                  </td>
                  <td>
                    <span className="rounded-full border border-ink/20 px-3 py-1 text-xs capitalize">
                      {order.status}
                    </span>
                  </td>
                  <td>{order.createdAt.toLocaleDateString("en-NG")}</td>
                  <td className="text-right font-bold">
                    {formatMoney(order.total, order.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
