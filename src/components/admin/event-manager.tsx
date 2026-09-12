"use client";

import { FormEvent, useState } from "react";
import { ImageSquare, Plus, X } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { Event, Product } from "@/lib/db/schema";
import { formatMoney } from "@/lib/money";
import { ProductVisual } from "@/components/product-visual";

export type AdminEventSummary = Event & {
  ticketPrice: number;
  capacity: number;
  available: number;
};

export function EventManager({
  initialEvents,
  products,
}: {
  initialEvents: AdminEventSummary[];
  products: Product[];
}) {
  const [events, setEvents] = useState(initialEvents);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const field = "h-11 w-full border-b border-ink/35 bg-transparent text-base font-normal outline-none focus:border-ink";

  const handleUpload = async (file?: File) => {
    if (!file) return;
    const body = new FormData();
    body.set("file", file);
    const response = await fetch("/api/admin/uploads", { method: "POST", body });
    const payload = await response.json();
    if (!response.ok) return toast.error(payload.error);
    setImageUrl(payload.url);
    toast.success("Event image uploaded");
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    const form = new FormData(event.currentTarget);
    const startsAt = String(form.get("startsAt"));
    const input = {
      title: form.get("title"),
      slug: form.get("slug"),
      description: form.get("description"),
      venue: form.get("venue"),
      startsAt: new Date(startsAt).toISOString(),
      image: imageUrl,
      ticketPrice: Math.round(Number(form.get("ticketPrice")) * 100),
      capacity: Number(form.get("capacity")),
      lowStockThreshold: Number(form.get("lowStockThreshold")),
      recommendedProductIds: form.getAll("recommendedProductIds"),
      published: form.get("published") === "on",
    };

    try {
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setEvents((current) => [{ ...payload, startsAt: new Date(payload.startsAt), ticketPrice: input.ticketPrice, capacity: input.capacity, available: input.capacity }, ...current]);
      setImageUrl("");
      setIsAdding(false);
      toast.success(input.published ? "Event published" : "Event saved as a draft");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Event could not be saved");
    } finally {
      setIsSaving(false);
    }
  };

  return <section className="mt-14">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-[.09em] text-ink/50">Programming</p><h2 className="mt-2 font-display text-5xl">Events</h2></div>
      <button onClick={() => setIsAdding(true)} className="flex min-h-12 items-center gap-2 bg-ink px-5 text-sm font-bold text-cream"><Plus /> Create event</button>
    </div>

    {isAdding && <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/50 p-3 md:p-8">
      <div className="mx-auto max-w-4xl bg-cream p-5 md:p-8">
        <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.09em] text-ink/50">Community</p><h3 className="mt-2 font-display text-4xl">New event</h3></div><button onClick={() => setIsAdding(false)} aria-label="Close" className="grid h-11 w-11 place-content-center"><X /></button></div>
        <form onSubmit={handleCreate} className="mt-8 grid gap-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-1 text-xs font-bold">Event title<input required name="title" className={field} /></label>
            <label className="grid gap-1 text-xs font-bold">URL slug<input required name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="e.g. renewal-table" className={field} /></label>
            <label className="grid gap-1 text-xs font-bold">Date and time<input required name="startsAt" type="datetime-local" className={field} /></label>
            <label className="grid gap-1 text-xs font-bold">Venue<input required name="venue" className={field} /></label>
            <label className="grid gap-1 text-xs font-bold">Ticket price (₦)<input required min="0" step="0.01" name="ticketPrice" type="number" className={field} /></label>
            <label className="grid gap-1 text-xs font-bold">Guest capacity<input required min="1" name="capacity" type="number" className={field} /></label>
            <label className="grid gap-1 text-xs font-bold">Low-capacity alert at<input required min="0" defaultValue="5" name="lowStockThreshold" type="number" className={field} /></label>
          </div>
          <label className="grid gap-1 text-xs font-bold">Event description<textarea required minLength={20} name="description" rows={5} className="w-full resize-none border-b border-ink/35 bg-transparent py-3 text-base font-normal outline-none" /></label>
          <label className="flex min-h-28 cursor-pointer items-center justify-center gap-3 border border-dashed border-ink/40 text-sm font-bold"><ImageSquare />{imageUrl ? "Event image ready" : "Upload event image"}<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(uploadEvent) => handleUpload(uploadEvent.target.files?.[0])} /></label>
          <fieldset>
            <legend className="text-xs font-bold">Products to recommend before payment</legend>
            <p className="mt-1 text-xs text-ink/50">Guests can optionally add these products to the same order as their event ticket.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {products.map((product, index) => <label key={product.id} className="grid cursor-pointer grid-cols-[52px_1fr_auto] items-center gap-3 border border-ink/20 p-2">
                <ProductVisual images={product.images} name={product.name} index={index} className="aspect-square" />
                <span><span className="block text-sm font-bold">{product.name}</span><span className="text-xs text-ink/50">{product.scent} · {formatMoney(product.price)}</span></span>
                <input type="checkbox" name="recommendedProductIds" value={product.id} />
              </label>)}
            </div>
          </fieldset>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="published" defaultChecked /> Publish immediately</label>
          <button disabled={isSaving} className="min-h-12 bg-ink px-5 font-bold text-cream disabled:opacity-50">{isSaving ? "Saving event…" : "Save event"}</button>
        </form>
      </div>
    </div>}

    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      {events.map((event, index) => <article key={event.id} className="grid grid-cols-[110px_1fr] gap-4 border border-ink/20 p-3">
        <ProductVisual images={event.image ? [event.image] : []} name={event.title} index={index} className="aspect-square" />
        <div className="py-1"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-display text-2xl">{event.title}</h3><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${event.published ? "bg-leaf/15 text-leaf" : "bg-ink/10"}`}>{event.published ? "Published" : "Draft"}</span></div><p className="mt-2 text-xs text-ink/55">{new Date(event.startsAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</p><p className="mt-2 text-xs font-bold">{formatMoney(event.ticketPrice)} · {event.available} of {event.capacity} places available</p></div>
      </article>)}
      {events.length === 0 && <div className="border border-dashed border-ink/30 p-8 text-sm text-ink/60">No events yet. Create the first gathering when the details are ready.</div>}
    </div>
  </section>;
}
