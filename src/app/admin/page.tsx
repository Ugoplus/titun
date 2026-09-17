import { desc, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AdminNavigation } from "@/components/admin/admin-navigation";
import { ProductManager } from "@/components/admin/product-manager";
import { firstAllowedAdminPath } from "@/lib/admin-permissions";
import {
  adminCan,
  clearAdminSession,
  getAdminIdentity,
} from "@/lib/auth";
import { getDb } from "@/lib/db";
import { orders, products } from "@/lib/db/schema";
import { formatMoney } from "@/lib/money";
import { isAdminEmailSecurityReady } from "@/lib/email";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: PageProps<"/admin">) {
  const identity = await getAdminIdentity();
  if (!identity) redirect("/admin/login");
  if (!adminCan(identity, "dashboard:view"))
    redirect(firstAllowedAdminPath(identity.roleSlug, identity.permissions));
  const params = await searchParams;
  const canViewProducts = adminCan(identity, "products:view");
  const canManageProducts = adminCan(identity, "products:manage");
  const canViewOrders = adminCan(identity, "orders:view");
  const canViewFinancials = adminCan(identity, "orders:view_financials");
  const db = getDb();
  const [catalog, recentOrders, sales] = await Promise.all([
    canViewProducts
      ? db.select().from(products).orderBy(desc(products.updatedAt))
      : Promise.resolve([]),
    canViewOrders
      ? db.select().from(orders).orderBy(desc(orders.createdAt)).limit(8)
      : Promise.resolve([]),
    canViewFinancials
      ? db
          .select({
            revenue: sql<number>`COALESCE(SUM(${orders.total}) FILTER (WHERE ${orders.status} IN ('paid','processing','shipped','fulfilled')), 0)`,
            paidOrders: sql<number>`COUNT(*) FILTER (WHERE ${orders.status} IN ('paid','processing','shipped','fulfilled'))`,
          })
          .from(orders)
      : Promise.resolve([]),
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
    <main className="mx-auto max-w-[1440px] px-5 py-10 md:px-8 md:py-16">
      <AdminNavigation identity={identity} />
      {params.error === "forbidden" && (
        <p role="alert" className="mt-6 border border-red-800 bg-red-50 p-4 text-sm text-red-900">
          Your role does not allow access to that section.
        </p>
      )}
      {identity.roleSlug === "administrator" && !isAdminEmailSecurityReady() && (
        <p role="status" className="mt-6 border border-clay bg-peach/35 p-4 text-sm">
          Admin email security is not fully connected. Password recovery, invitations and email verification will activate after HTTPS and SMTP are configured.
        </p>
      )}
      <div className="mt-10 flex flex-wrap items-end justify-between gap-5 border-b border-ink/20 pb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.09em] text-ink/70">
            Operations
          </p>
          <h1 className="mt-2 font-display text-6xl tracking-[-.04em] md:text-8xl">
            Shop control.
          </h1>
        </div>
        <form action={logout}>
          <button className="min-h-11 border border-ink px-4 text-xs font-bold">
            Sign out
          </button>
        </form>
      </div>

      <section className="grid border-l border-t border-ink/20 sm:grid-cols-3">
        {canViewProducts && (
          <>
            <div className="border-b border-r border-ink/20 p-5">
              <p className="text-xs uppercase tracking-[.08em] text-ink/70">Products</p>
              <p className="mt-4 font-display text-5xl">{catalog.length}</p>
            </div>
            <div className="border-b border-r border-ink/20 p-5">
              <p className="text-xs uppercase tracking-[.08em] text-ink/70">Low stock</p>
              <p className="mt-4 font-display text-5xl text-clay">{lowStock.length}</p>
            </div>
          </>
        )}
        {canViewOrders && (
          <div className="border-b border-r border-ink/20 p-5">
            <p className="text-xs uppercase tracking-[.08em] text-ink/70">Recent orders</p>
            <p className="mt-4 font-display text-5xl">{recentOrders.length}</p>
          </div>
        )}
        {canViewFinancials && (
          <div className="border-b border-r border-ink/20 p-5">
            <p className="text-xs uppercase tracking-[.08em] text-ink/70">Paid revenue</p>
            <p className="mt-4 font-display text-5xl">{formatMoney(Number(sales[0]?.revenue ?? 0))}</p>
          </div>
        )}
      </section>

      {canViewProducts && lowStock.length > 0 && (
        <section className="mt-8 border border-clay bg-peach/35 p-5">
          <h2 className="font-display text-3xl">Low-stock attention</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {lowStock.map((product) => (
              <span key={product.id} className="border border-clay px-3 py-2 text-xs font-bold">
                {product.name}: {product.stockOnHand - product.stockReserved} available
              </span>
            ))}
          </div>
        </section>
      )}

      {canManageProducts && <ProductManager initialProducts={catalog} />}
      {canViewOrders && (
        <section className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-4xl">Recent orders</h2>
            <a href="/admin/orders" className="border-b border-ink pb-1 text-sm font-semibold">View all orders</a>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/30 text-xs uppercase tracking-[.06em] text-ink/70">
                  <th className="py-3">Reference</th><th>Customer</th><th>Status</th><th>Placed</th>{canViewFinancials && <th className="text-right">Total</th>}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-ink/15">
                    <td className="py-4 font-bold">{order.reference}</td>
                    <td>{order.customerName}<br /><span className="text-xs text-ink/70">{order.customerEmail}</span></td>
                    <td><span className="rounded-full border border-ink/20 px-3 py-1 text-xs capitalize">{order.status}</span></td>
                    <td>{order.createdAt.toLocaleDateString("en-NG")}</td>
                    {canViewFinancials && <td className="text-right font-bold">{formatMoney(order.total, order.currency)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
