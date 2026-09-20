"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Order } from "@/lib/db/schema";
import type { AdminOrderView } from "@/lib/admin-order-view";
import { formatMoney } from "@/lib/money";
import { formatGiftBoxContents } from "@/lib/gift-box";

const categories = ["all", "pending", "paid", "processing", "shipped", "fulfilled", "failed", "cancelled", "refunded"] as const;
const nextStatus: Partial<Record<Order["status"], Array<"processing" | "shipped" | "fulfilled">>> = {
  paid: ["processing", "fulfilled"],
  processing: ["shipped", "fulfilled"],
  shipped: ["fulfilled"],
};

const formatDate = (value: Date | string | null) => value
  ? new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" }).format(new Date(value))
  : "—";

export function OrderManager({
  initialOrders,
  canManage,
  canViewFinancials,
}: {
  initialOrders: AdminOrderView[];
  canManage: boolean;
  canViewFinancials: boolean;
}) {
  const [records, setRecords] = useState(initialOrders);
  const [filter, setFilter] = useState<(typeof categories)[number]>("all");
  const [savingId, setSavingId] = useState<string | null>(null);
  const visible = filter === "all" ? records : records.filter((order) => order.status === filter);
  const counts = useMemo(() => Object.fromEntries(categories.map((status) => [status, status === "all" ? records.length : records.filter((order) => order.status === status).length])), [records]);

  const handleUpdate = async (order: AdminOrderView, form: HTMLFormElement) => {
    const data = new FormData(form);
    const status = String(data.get("status"));
    if (!status) return;
    setSavingId(order.id);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, courier: data.get("courier") || undefined, trackingNumber: data.get("trackingNumber") || undefined }),
      });
      const updated = await response.json();
      if (!response.ok) throw new Error(updated.error);
      setRecords((current) => current.map((item) => item.id === order.id ? { ...updated, createdAt: new Date(updated.createdAt), paidAt: updated.paidAt ? new Date(updated.paidAt) : null, processingAt: updated.processingAt ? new Date(updated.processingAt) : null, shippedAt: updated.shippedAt ? new Date(updated.shippedAt) : null, fulfilledAt: updated.fulfilledAt ? new Date(updated.fulfilledAt) : null, failedAt: updated.failedAt ? new Date(updated.failedAt) : null, cancelledAt: updated.cancelledAt ? new Date(updated.cancelledAt) : null, refundedAt: updated.refundedAt ? new Date(updated.refundedAt) : null } : item));
      toast.success(`Order marked ${status}`);
      form.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Order could not be updated");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      <nav aria-label="Order categories" className="filter-scroll mt-8 flex gap-2 overflow-x-auto pb-3">
        {categories.map((status) => <button key={status} onClick={() => setFilter(status)} className={`min-h-11 whitespace-nowrap border px-4 text-xs font-bold capitalize ${filter === status ? "border-ink bg-ink text-white" : "border-ink/20"}`}>{status} <span className="ml-1 tabular-nums opacity-70">{counts[status]}</span></button>)}
      </nav>
      <div className="mt-5 grid gap-4">
        {visible.map((order) => (
          <article key={order.id} className="border border-ink/20 bg-white p-5">
            <div className="grid gap-5 lg:grid-cols-[1fr_1fr_auto]">
              <div><p className="text-xs font-bold uppercase tracking-[.06em] text-ink/60">{order.reference}</p><h2 className="mt-2 font-display text-3xl">{order.customerName}</h2><p className="mt-2 text-sm text-ink/70">{order.customerEmail} · {order.customerPhone}</p><p className="mt-1 text-sm text-ink/70">{order.deliveryAddress}, {order.deliveryCity}</p>{order.deliveryMethod ? <p className="mt-2 text-xs font-semibold text-ink/70">{order.deliveryMethod}{order.deliveryTimeframe ? ` · ${order.deliveryTimeframe}` : ""}</p> : null}</div>
              <dl className="grid grid-cols-2 gap-x-5 gap-y-3 text-xs">
                <div><dt className="text-ink/55">Placed</dt><dd className="mt-1 font-semibold">{formatDate(order.createdAt)}</dd></div>
                <div><dt className="text-ink/55">Paid</dt><dd className="mt-1 font-semibold">{formatDate(order.paidAt)}</dd></div>
                <div><dt className="text-ink/55">Processing</dt><dd className="mt-1 font-semibold">{formatDate(order.processingAt)}</dd></div>
                <div><dt className="text-ink/55">Shipped</dt><dd className="mt-1 font-semibold">{formatDate(order.shippedAt)}</dd></div>
                <div><dt className="text-ink/55">Fulfilled</dt><dd className="mt-1 font-semibold">{formatDate(order.fulfilledAt)}</dd></div>
                {canViewFinancials && order.paymentProvider ? <div><dt className="text-ink/55">Payment</dt><dd className="mt-1 font-semibold capitalize">{order.paymentProvider}</dd></div> : null}
                {order.failedAt ? <div><dt className="text-ink/55">Failed</dt><dd className="mt-1 font-semibold">{formatDate(order.failedAt)}</dd></div> : null}
                {order.cancelledAt ? <div><dt className="text-ink/55">Cancelled</dt><dd className="mt-1 font-semibold">{formatDate(order.cancelledAt)}</dd></div> : null}
                {order.refundedAt ? <div><dt className="text-ink/55">Refunded</dt><dd className="mt-1 font-semibold">{formatDate(order.refundedAt)}</dd></div> : null}
              </dl>
              <div className="lg:text-right"><span className="inline-flex border border-ink/20 px-3 py-2 text-xs font-bold capitalize">{order.status}</span>{canViewFinancials && order.total !== undefined ? <><p className="mt-3 font-display text-3xl tabular-nums">{formatMoney(order.total, order.currency)}</p>{order.deliveryFee !== undefined ? <p className="mt-1 text-xs text-ink/60">Includes {formatMoney(order.deliveryFee, order.currency)} delivery</p> : null}</> : null}</div>
            </div>
            {order.items.length > 0 && (
              <section className="mt-5 border-t border-ink/15 pt-5">
                <h3 className="text-xs font-bold uppercase tracking-[.08em] text-ink/60">
                  Order contents
                </h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="border border-ink/15 bg-linen p-4">
                      <p className="text-sm font-semibold">
                        {item.quantity} × {item.productName}
                      </p>
                      <p className="mt-1 text-xs text-ink/60">{item.packSize}</p>
                      {item.configuration.giftBoxContents?.length ? (
                        <div className="mt-3 text-xs leading-relaxed text-ink/75">
                          <p>{formatGiftBoxContents(item.configuration.giftBoxContents)}</p>
                          {item.configuration.giftBoxWipeAddOn ? (
                            <p className="mt-1 font-semibold">Add 25 wet wipes matching the selected towel scents</p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            )}
            {canManage && nextStatus[order.status]?.length ? (
              <form className="mt-5 grid gap-3 border-t border-ink/15 pt-5 sm:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={(event) => { event.preventDefault(); handleUpdate(order, event.currentTarget); }}>
                <label className="grid gap-1 text-xs font-bold uppercase tracking-[.06em]">Next stage<select required name="status" defaultValue="" className="h-11 border border-ink/25 bg-transparent px-3 text-sm normal-case"><option value="" disabled>Choose status</option>{nextStatus[order.status]?.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
                <label className="grid gap-1 text-xs font-bold uppercase tracking-[.06em]">Courier<input name="courier" defaultValue={order.courier ?? ""} className="h-11 border border-ink/25 px-3 text-sm normal-case" /></label>
                <label className="grid gap-1 text-xs font-bold uppercase tracking-[.06em]">Tracking number<input name="trackingNumber" defaultValue={order.trackingNumber ?? ""} className="h-11 border border-ink/25 px-3 text-sm normal-case" /></label>
                <button disabled={savingId === order.id} className="min-h-11 self-end bg-ink px-5 text-sm font-bold text-white disabled:opacity-50">{savingId === order.id ? "Saving…" : "Update order"}</button>
              </form>
            ) : null}
          </article>
        ))}
        {!visible.length && <p className="border border-ink/20 p-8 text-center text-sm text-ink/60">No orders in this category.</p>}
      </div>
    </>
  );
}
