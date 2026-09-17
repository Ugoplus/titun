"use client";

import { FormEvent, useState } from "react";
import { ImageSquare, PaperPlaneTilt } from "@phosphor-icons/react";
import { toast } from "sonner";

export function CustomOrderForm() {
  const [artworkUrl, setArtworkUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reference, setReference] = useState("");
  const field = "h-12 w-full border-b border-ink/35 bg-transparent text-base outline-none focus:border-ink";

  const handleUpload = async (file?: File) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/custom-orders/uploads", { method: "POST", body: formData });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setArtworkUrl(payload.url);
      toast.success("Artwork uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Artwork could not be uploaded");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/custom-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          company: form.get("company") || undefined,
          email: form.get("email"),
          phone: form.get("phone"),
          orderType: form.get("orderType"),
          estimatedQuantity: Number(form.get("estimatedQuantity")),
          artworkUrl: artworkUrl || undefined,
          message: form.get("message"),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setReference(payload.reference);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Your request could not be sent");
      setIsSubmitting(false);
    }
  };

  if (reference) return (
    <div role="status" className="border-y border-ink/20 py-10">
      <h2 className="font-display text-4xl">Your request is with us.</h2>
      <p className="mt-4 leading-relaxed text-ink/70">Reference: <strong>{reference}</strong>. We’ll review the details and contact you with the next steps.</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="grid gap-7">
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="grid gap-2 text-xs font-semibold">Full name<input required name="name" autoComplete="name" className={field} /></label>
        <label className="grid gap-2 text-xs font-semibold">Company <span className="text-ink/60">Optional</span><input name="company" autoComplete="organization" className={field} /></label>
        <label className="grid gap-2 text-xs font-semibold">Email address<input required name="email" type="email" autoComplete="email" className={field} /></label>
        <label className="grid gap-2 text-xs font-semibold">Phone number<input required name="phone" type="tel" autoComplete="tel" className={field} /></label>
        <label className="grid gap-2 text-xs font-semibold">Order type<select required name="orderType" className={field}><option>Branded towels</option><option>Branded wipes</option><option>Custom gift boxes</option><option>Event order</option><option>Other</option></select></label>
        <label className="grid gap-2 text-xs font-semibold">Estimated quantity<input required name="estimatedQuantity" type="number" min="50" defaultValue="50" className={field} /></label>
      </div>
      <label className="grid min-h-40 cursor-pointer place-content-center gap-3 border border-dashed border-ink/40 bg-white px-5 text-center text-sm font-semibold">
        <ImageSquare className="mx-auto" size={30} />
        {isUploading ? "Uploading artwork…" : artworkUrl ? "Artwork ready — choose another image" : "Upload artwork or a reference image"}
        <span className="text-xs font-normal text-ink/60">JPG, PNG or WebP · Maximum 5 MB</span>
        <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" disabled={isUploading} onChange={(event) => handleUpload(event.target.files?.[0])} />
      </label>
      <label className="grid gap-2 text-xs font-semibold">Tell us what you need<textarea required name="message" minLength={10} rows={6} placeholder="Describe the product, scents, packaging, event date, branding and delivery location." className="w-full resize-y border-b border-ink/35 bg-transparent py-3 text-base font-normal leading-relaxed outline-none focus:border-ink" /></label>
      <button disabled={isSubmitting || isUploading} className="inline-flex min-h-14 items-center justify-center gap-3 bg-ink px-6 font-semibold text-white hover:bg-walnut disabled:opacity-50">
        <PaperPlaneTilt /> {isSubmitting ? "Sending request…" : "Request a custom order"}
      </button>
    </form>
  );
}
