"use client";

import { FormEvent, useState } from "react";
import { ImageSquare, Plus, X } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { Event, Product } from "@/lib/db/schema";
import { formatMoney } from "@/lib/money";
import { ProductVisual } from "@/components/product-visual";
import { DialogShell } from "@/components/dialog-shell";
import { getEventStatus } from "@/lib/events";

export type AdminEventSummary = Event & {
  ticketPrice: number;
  capacity: number;
  available: number;
  lowStockThreshold: number;
  recommendedProductIds: string[];
};

const toDateTimeLocal = (date: Date) => {
  const value = new Date(date);
  const offset = value.getTimezoneOffset();
  return new Date(value.getTime() - offset * 60_000).toISOString().slice(0, 16);
};

export function EventManager({
  initialEvents,
  products,
  canManage,
}: {
  initialEvents: AdminEventSummary[];
  products: Product[];
  canManage: boolean;
}) {
  const [events, setEvents] = useState(initialEvents);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AdminEventSummary | null>(
    null,
  );
  const [isFreeEvent, setIsFreeEvent] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const field =
    "h-11 w-full border-b border-ink/35 bg-transparent text-base font-normal outline-none focus:border-ink";

  const openCreate = () => {
    setEditingEvent(null);
    setImageUrl("");
    setGalleryImages([]);
    setVideoUrl("");
    setIsFreeEvent(false);
    setIsAdding(true);
  };

  const openEdit = (event: AdminEventSummary) => {
    setEditingEvent(event);
    setImageUrl(event.image ?? "");
    setGalleryImages(event.galleryImages);
    setVideoUrl(event.videoUrl ?? "");
    setIsFreeEvent(event.ticketPrice === 0);
    setIsAdding(true);
  };

  const closeEditor = () => {
    setIsAdding(false);
    setEditingEvent(null);
  };

  const uploadFile = async (file: File) => {
    const body = new FormData();
    body.set("file", file);
    const response = await fetch("/api/admin/uploads", {
      method: "POST",
      body,
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error);
    return payload as { url: string; mediaType: "image" | "video" };
  };

  const handleCoverUpload = async (file?: File) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const payload = await uploadFile(file);
      setImageUrl(payload.url);
      toast.success("Main event image uploaded");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Event image could not be uploaded",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleGalleryUpload = async (files?: FileList | null) => {
    if (!files?.length) return;
    const remaining = 12 - galleryImages.length;
    if (remaining < 1)
      return toast.error("The gallery can contain up to 12 images");
    setIsUploading(true);
    try {
      const selected = Array.from(files).slice(0, remaining);
      const uploaded = await Promise.all(selected.map(uploadFile));
      setGalleryImages((current) => [
        ...current,
        ...uploaded.map((item) => item.url),
      ]);
      toast.success(
        `${uploaded.length} gallery ${uploaded.length === 1 ? "image" : "images"} uploaded`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Gallery images could not be uploaded",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleVideoUpload = async (file?: File) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const payload = await uploadFile(file);
      setVideoUrl(payload.url);
      toast.success("Event video uploaded");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Event video could not be uploaded",
      );
    } finally {
      setIsUploading(false);
    }
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
      story: form.get("story"),
      venue: form.get("venue"),
      startsAt: new Date(startsAt).toISOString(),
      image: imageUrl,
      galleryImages,
      videoUrl,
      registrationUrl: form.get("registrationUrl"),
      ctaLabel: form.get("ctaLabel"),
      ticketPrice: isFreeEvent
        ? 0
        : Math.round(Number(form.get("ticketPrice")) * 100),
      capacity: Number(form.get("capacity")),
      lowStockThreshold: Number(form.get("lowStockThreshold")),
      recommendedProductIds: form.getAll("recommendedProductIds"),
      published: form.get("published") === "on",
    };

    try {
      const response = await fetch(
        editingEvent
          ? `/api/admin/events/${editingEvent.id}`
          : "/api/admin/events",
        {
          method: editingEvent ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      const nextEvent: AdminEventSummary = {
        ...payload,
        startsAt: new Date(payload.startsAt),
        ticketPrice: input.ticketPrice,
        capacity: input.capacity,
        available: input.capacity,
        lowStockThreshold: input.lowStockThreshold,
        recommendedProductIds: input.recommendedProductIds as string[],
      };
      setEvents((current) =>
        editingEvent
          ? current.map((item) =>
              item.id === editingEvent.id ? nextEvent : item,
            )
          : [nextEvent, ...current],
      );
      setImageUrl("");
      setGalleryImages([]);
      setVideoUrl("");
      setIsFreeEvent(false);
      closeEditor();
      toast.success(
        editingEvent
          ? "Event updated"
          : input.published
            ? "Event published"
            : "Event saved as a draft",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Event could not be saved",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mt-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-5xl">Events</h2>
        {canManage && (
          <button
            onClick={openCreate}
            className="flex min-h-12 items-center gap-2 bg-ink px-5 text-sm font-bold text-cream"
          >
            <Plus /> Create event
          </button>
        )}
      </div>

      {canManage && isAdding && (
        <DialogShell
          labelledBy="new-event-title"
          onClose={closeEditor}
          panelClassName="my-auto w-full max-w-4xl bg-cream p-5 md:p-8"
        >
          <div className="flex items-center justify-between">
            <h3 id="new-event-title" className="font-display text-4xl">
              {editingEvent ? "Edit event" : "New event"}
            </h3>
            <button
              onClick={closeEditor}
              aria-label="Close"
              className="grid h-11 w-11 place-content-center"
            >
              <X />
            </button>
          </div>
          <form
            key={editingEvent?.id ?? "new-event"}
            onSubmit={handleCreate}
            className="mt-8 grid gap-6"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-bold">
                Event title
                <input
                  required
                  name="title"
                  defaultValue={editingEvent?.title}
                  className={field}
                />
              </label>
              <label className="grid gap-1 text-xs font-bold">
                URL slug
                <input
                  required
                  name="slug"
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  placeholder="e.g. renewal-table"
                  defaultValue={editingEvent?.slug}
                  className={field}
                />
              </label>
              <label className="grid gap-1 text-xs font-bold">
                Date and time
                <input
                  required
                  name="startsAt"
                  type="datetime-local"
                  defaultValue={
                    editingEvent
                      ? toDateTimeLocal(editingEvent.startsAt)
                      : undefined
                  }
                  className={field}
                />
              </label>
              <label className="grid gap-1 text-xs font-bold">
                Venue
                <input
                  required
                  name="venue"
                  defaultValue={editingEvent?.venue}
                  className={field}
                />
              </label>
              <fieldset className="sm:col-span-2">
                <legend className="mb-3 text-xs font-bold">Event access</legend>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { free: false, label: "Paid event" },
                    { free: true, label: "Free event" },
                  ].map((option) => (
                    <label
                      key={option.label}
                      className={`cursor-pointer border p-4 text-sm font-semibold ${isFreeEvent === option.free ? "border-ink bg-ink text-white" : "border-ink/25"}`}
                    >
                      <input
                        type="radio"
                        name="eventAccess"
                        checked={isFreeEvent === option.free}
                        onChange={() => setIsFreeEvent(option.free)}
                        className="sr-only"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              {!isFreeEvent && (
                <label className="grid gap-1 text-xs font-bold">
                  Ticket price (₦)
                  <input
                    required
                    min="0.01"
                    step="0.01"
                    name="ticketPrice"
                    type="number"
                    defaultValue={
                      editingEvent ? editingEvent.ticketPrice / 100 : undefined
                    }
                    className={field}
                  />
                </label>
              )}
              <label className="grid gap-1 text-xs font-bold">
                Guest capacity
                <input
                  required
                  min="1"
                  name="capacity"
                  type="number"
                  defaultValue={editingEvent?.capacity}
                  className={field}
                />
              </label>
              <label className="grid gap-1 text-xs font-bold">
                Low-capacity alert at
                <input
                  required
                  min="0"
                  defaultValue={editingEvent?.lowStockThreshold ?? 5}
                  name="lowStockThreshold"
                  type="number"
                  className={field}
                />
              </label>
            </div>
            <label className="grid gap-1 text-xs font-bold">
              Story excerpt
              <textarea
                required
                minLength={20}
                name="description"
                defaultValue={editingEvent?.description}
                rows={3}
                className="w-full resize-none border-b border-ink/35 bg-transparent py-3 text-base font-normal outline-none"
              />
              <span className="font-normal text-ink/60">
                A short introduction used on the Events page and in search
                results.
              </span>
            </label>
            <label className="grid gap-1 text-xs font-bold">
              Full event story
              <textarea
                required
                minLength={80}
                maxLength={12000}
                name="story"
                defaultValue={editingEvent?.story}
                rows={10}
                className="w-full resize-y border border-ink/25 bg-white p-4 text-base font-normal leading-relaxed outline-none focus:border-ink"
              />
              <span className="font-normal text-ink/60">
                Separate paragraphs with a blank line. This appears above the
                attendance section.
              </span>
            </label>
            <label className="flex min-h-28 cursor-pointer items-center justify-center gap-3 border border-dashed border-ink/40 text-sm font-bold">
              <ImageSquare />
              {isUploading
                ? "Uploading event image…"
                : imageUrl
                  ? "Event image ready"
                  : "Upload event image"}
              <input
                className="sr-only"
                type="file"
                disabled={isUploading}
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={(uploadEvent) =>
                  handleCoverUpload(uploadEvent.target.files?.[0])
                }
              />
            </label>
            {imageUrl && (
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="min-h-11 justify-self-start border-b border-ink/40 text-sm font-semibold"
              >
                Remove main image
              </button>
            )}
            <div className="grid gap-3">
              <label className="flex min-h-24 cursor-pointer items-center justify-center gap-3 border border-dashed border-ink/40 text-sm font-bold">
                <ImageSquare />
                {isUploading
                  ? "Uploading media…"
                  : `Add gallery images · ${galleryImages.length}/12`}
                <input
                  className="sr-only"
                  type="file"
                  multiple
                  disabled={isUploading || galleryImages.length >= 12}
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={(uploadEvent) =>
                    handleGalleryUpload(uploadEvent.target.files)
                  }
                />
              </label>
              {galleryImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {galleryImages.map((image, index) => (
                    <div key={image} className="relative">
                      <ProductVisual
                        images={[image]}
                        name={`Gallery image ${index + 1}`}
                        index={index}
                        className="aspect-square"
                      />
                      <button
                        type="button"
                        aria-label={`Remove gallery image ${index + 1}`}
                        onClick={() =>
                          setGalleryImages((current) =>
                            current.filter((item) => item !== image),
                          )
                        }
                        className="absolute right-1 top-1 grid h-8 w-8 place-content-center bg-white text-ink"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <label className="flex min-h-24 cursor-pointer items-center justify-center gap-3 border border-dashed border-ink/40 text-sm font-bold">
              {isUploading
                ? "Preparing media…"
                : videoUrl
                  ? "Event video ready"
                  : "Add optional event video"}
              <input
                className="sr-only"
                type="file"
                disabled={isUploading}
                accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
                onChange={(uploadEvent) =>
                  handleVideoUpload(uploadEvent.target.files?.[0])
                }
              />
            </label>
            {videoUrl && (
              <button
                type="button"
                onClick={() => setVideoUrl("")}
                className="min-h-11 justify-self-start border-b border-ink/40 text-sm font-semibold"
              >
                Remove event video
              </button>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-bold">
                External registration link (optional)
                <input
                  name="registrationUrl"
                  type="url"
                  placeholder="https://…"
                  defaultValue={editingEvent?.registrationUrl ?? ""}
                  className={field}
                />
              </label>
              <label className="grid gap-1 text-xs font-bold">
                Event CTA (optional)
                <input
                  name="ctaLabel"
                  maxLength={40}
                  placeholder="Join us"
                  defaultValue={editingEvent?.ctaLabel ?? ""}
                  className={field}
                />
              </label>
            </div>
            <fieldset>
              <legend className="text-xs font-bold">
                Products to recommend before payment
              </legend>
              <p className="mt-1 text-xs text-ink/70">
                Guests can optionally add these products to the same order as
                their event ticket.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {products.map((product, index) => (
                  <label
                    key={product.id}
                    className="grid cursor-pointer grid-cols-[52px_1fr_auto] items-center gap-3 border border-ink/20 p-2"
                  >
                    <ProductVisual
                      images={product.images}
                      name={product.name}
                      index={index}
                      className="aspect-square"
                    />
                    <span>
                      <span className="block text-sm font-bold">
                        {product.name}
                      </span>
                      <span className="text-xs text-ink/70">
                        {product.scent} · {formatMoney(product.price)}
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      name="recommendedProductIds"
                      value={product.id}
                      defaultChecked={editingEvent?.recommendedProductIds.includes(
                        product.id,
                      )}
                    />
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                name="published"
                defaultChecked={editingEvent?.published ?? true}
              />
              Published on the Events page
            </label>
            <button
              disabled={isSaving || isUploading}
              className="min-h-12 bg-ink px-5 font-bold text-cream disabled:opacity-50"
            >
              {isSaving
                ? "Saving event…"
                : editingEvent
                  ? "Save changes"
                  : "Save event"}
            </button>
          </form>
        </DialogShell>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {events.map((event, index) => {
          const status = getEventStatus(new Date(event.startsAt));
          return (
            <article
              key={event.id}
              className="grid grid-cols-[110px_1fr] gap-4 border border-ink/20 p-3"
            >
              <ProductVisual
                images={event.image ? [event.image] : []}
                name={event.title}
                index={index}
                className="aspect-square"
              />
              <div className="py-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-display text-2xl">{event.title}</h3>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-bold uppercase tracking-[.06em] ${event.published ? "bg-leaf/15 text-leaf" : "bg-ink/10"}`}
                    >
                      {event.published
                        ? `Published · ${status === "upcoming" ? "Upcoming" : "Past"}`
                        : "Draft"}
                    </span>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => openEdit(event)}
                        className="min-h-10 border border-ink/25 px-3 text-xs font-bold"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-xs text-ink/70">
                  {new Date(event.startsAt).toLocaleString("en-NG", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                <p className="mt-2 text-xs font-bold">
                  {event.ticketPrice === 0
                    ? "Free"
                    : formatMoney(event.ticketPrice)}{" "}
                  · {event.available} of {event.capacity} places available
                </p>
              </div>
            </article>
          );
        })}
        {events.length === 0 && (
          <div className="border border-dashed border-ink/30 p-8 text-sm text-ink/70">
            No events yet. Create the first gathering when the details are
            ready.
          </div>
        )}
      </div>
    </section>
  );
}
