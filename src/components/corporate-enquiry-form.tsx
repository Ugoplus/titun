"use client";

import { FormEvent, useState } from "react";

const inputClass =
  "h-12 w-full border-b border-ink/35 bg-transparent text-base outline-none transition-colors focus:border-ink";

export function CorporateEnquiryForm({ defaultProduct = "" }: { defaultProduct?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/corporate-enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        company: form.get("company"),
        industry: form.get("industry"),
        email: form.get("email"),
        phone: form.get("phone"),
        estimatedQuantity: Number(form.get("estimatedQuantity")),
        productRequired: form.get("productRequired"),
        message: form.get("message"),
      }),
    });
    if (response.ok) {
      event.currentTarget.reset();
      setStatus("success");
    } else {
      setStatus("error");
    }
  };

  if (status === "success")
    return (
      <div role="status" className="border border-ink/20 bg-white p-8">
        <h2 className="font-display text-4xl">Your enquiry is with us.</h2>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-ink/65">
          Thank you. The TITUN team will review the details and respond using
          the contact information you provided.
        </p>
        <button onClick={() => setStatus("idle")} className="mt-6 border-b border-ink pb-1 text-sm font-semibold">
          Send another enquiry
        </button>
      </div>
    );

  return (
    <form onSubmit={handleSubmit} className="grid gap-6" id="enquiry-form">
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="grid gap-2 text-sm">
          Name
          <input required name="name" autoComplete="name" className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm">
          Company
          <input required name="company" autoComplete="organization" className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm">
          Industry
          <input required name="industry" className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm">
          Email address
          <input required name="email" type="email" autoComplete="email" className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm">
          Phone number
          <input required name="phone" type="tel" autoComplete="tel" className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm">
          Estimated quantity
          <input required name="estimatedQuantity" type="number" min="1" max="1000000" className={inputClass} />
        </label>
      </div>
      <label className="grid gap-2 text-sm">
        Product required
        <select required name="productRequired" defaultValue={defaultProduct} className={inputClass}>
          <option value="" disabled>Select a product</option>
          <option>Refreshing towels</option>
          <option>Refreshing wet wipes</option>
          <option>Mixed scent collection</option>
          <option>Event or bespoke order</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm">
        Tell us about the occasion
        <textarea required name="message" minLength={10} maxLength={1500} rows={5} className="w-full resize-none border-b border-ink/35 bg-transparent py-3 text-base leading-relaxed outline-none focus:border-ink" />
      </label>
      {status === "error" && (
        <p role="alert" className="text-sm text-red-800">
          We couldn’t send the enquiry. Check the form and try again.
        </p>
      )}
      <button disabled={status === "loading"} className="min-h-14 bg-ink px-6 font-semibold text-white disabled:opacity-50">
        {status === "loading" ? "Sending enquiry…" : "Request a quote"}
      </button>
    </form>
  );
}
