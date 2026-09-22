"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Minus, Plus } from "@phosphor-icons/react";
import type { Product } from "@/lib/db/schema";
import { useCart } from "@/components/cart-provider";
import { ProductVisual } from "@/components/product-visual";
import { formatMoney } from "@/lib/money";
import {
  getDefaultPurchaseQuantity,
  getPackOptions,
} from "@/lib/product-pricing";
import {
  availableStock,
  hasAvailableStock,
  isUnlimitedStock,
} from "@/lib/inventory";

export function EventBookingPanel({
  eventId,
  eventTitle,
  ticket,
  recommendations,
}: {
  eventId: string;
  eventTitle: string;
  ticket: Product;
  recommendations: Product[];
}) {
  const router = useRouter();
  const { addItems } = useCart();
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [registrationReference, setRegistrationReference] = useState("");
  const available = availableStock(ticket);
  const hasUnlimitedPlaces = isUnlimitedStock(ticket.stockOnHand);
  const isFree = ticket.price === 0;
  const selectedProducts = useMemo(
    () => recommendations.filter((product) => selected.includes(product.id)),
    [recommendations, selected],
  );
  const productTotal = selectedProducts.reduce(
    (sum, product) => sum + getPackOptions(product)[0].total,
    0,
  );
  const total = ticket.price * ticketQuantity + productTotal;
  const usesCheckout = !isFree || selectedProducts.length > 0;
  const fieldClass =
    "h-11 w-full border-b border-ink/35 bg-transparent text-base outline-none focus:border-ink";

  const continueToCheckout = () => {
    addItems([
      { product: ticket, quantity: ticketQuantity },
      ...selectedProducts.map((product) => ({
        product,
        quantity: getDefaultPurchaseQuantity(product),
      })),
    ]);
    router.push("/checkout");
  };

  const handleSubmit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    if (usesCheckout) {
      continueToCheckout();
      return;
    }

    setIsRegistering(true);
    setRegistrationError("");
    const form = new FormData(submitEvent.currentTarget);
    try {
      const response = await fetch(`/api/community/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          quantity: ticketQuantity,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Registration could not be completed");
      setRegistrationReference(payload.reference);
    } catch (error) {
      setRegistrationError(
        error instanceof Error
          ? error.message
          : "Registration could not be completed. Try again.",
      );
    } finally {
      setIsRegistering(false);
    }
  };

  if (registrationReference) {
    return (
      <section className="min-w-0 border border-ink bg-ink p-6 text-white md:p-8" aria-live="polite">
        <h2 className="font-display text-4xl">Your place is confirmed.</h2>
        <p className="mt-4 text-sm leading-relaxed text-white/75">
          You’re registered for {eventTitle}. We’ve sent the event details to your email address.
        </p>
        <p className="mt-6 border-t border-white/20 pt-5 text-xs font-semibold uppercase tracking-[.08em] text-white/70">
          Reference {registrationReference}
        </p>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="min-w-0 border border-ink/20 bg-cream p-5 md:p-8">
      <h2 className="break-words font-display text-3xl sm:text-4xl">
        {isFree ? "Register to attend" : "Reserve your place"}
      </h2>
      <div className="mt-5 grid min-w-0 gap-4 border-b border-ink/20 pb-6 sm:flex sm:items-center sm:justify-between sm:gap-5">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Guest admission</p>
          <p className="mt-1 text-sm text-ink/70">
            {isFree ? "Free" : `${formatMoney(ticket.price)} per guest`}
            {!hasUnlimitedPlaces && ` · ${available} places left`}
          </p>
        </div>
        <div className="flex w-fit shrink-0 items-center border border-ink/25">
          <button
            type="button"
            aria-label="Reduce ticket quantity"
            onClick={() => setTicketQuantity((value) => Math.max(1, value - 1))}
            className="grid h-11 w-11 place-content-center"
          >
            <Minus aria-hidden="true" />
          </button>
          <span className="w-9 text-center text-sm font-bold tabular-nums">
            {ticketQuantity}
          </span>
          <button
            type="button"
            aria-label="Increase ticket quantity"
            onClick={() =>
              setTicketQuantity((value) =>
                Math.min(Math.min(20, available), value + 1),
              )
            }
            className="grid h-11 w-11 place-content-center"
          >
            <Plus aria-hidden="true" />
          </button>
        </div>
      </div>

      {isFree && selectedProducts.length === 0 && (
        <fieldset className="grid gap-5 py-7">
          <legend className="mb-1 text-sm font-semibold">Your details</legend>
          <label className="grid gap-1 text-xs font-semibold">
            Name
            <input required name="name" autoComplete="name" className={fieldClass} />
          </label>
          <label className="grid gap-1 text-xs font-semibold">
            Email address
            <input required name="email" type="email" autoComplete="email" className={fieldClass} />
          </label>
          <label className="grid gap-1 text-xs font-semibold">
            Phone number
            <input required name="phone" type="tel" autoComplete="tel" className={fieldClass} />
          </label>
        </fieldset>
      )}

      {recommendations.length > 0 && (
        <div className={isFree ? "border-t border-ink/20 py-7" : "py-7"}>
          <h3 className="font-display text-3xl">Complete the ritual.</h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Add TITUN products to your booking, or continue with admission only.
          </p>
          <div className="mt-5 grid min-w-0 gap-3">
            {recommendations.map((product, index) => {
              const isSelected = selected.includes(product.id);
              const productAvailable = hasAvailableStock(
                product,
                getDefaultPurchaseQuantity(product),
              );
              return (
                <button
                  key={product.id}
                  type="button"
                  disabled={!productAvailable}
                  aria-pressed={isSelected}
                  onClick={() =>
                    setSelected((current) =>
                      isSelected
                        ? current.filter((id) => id !== product.id)
                        : [...current, product.id],
                    )
                  }
                  className={`grid min-w-0 grid-cols-[56px_minmax(0,1fr)_28px] items-center gap-3 border p-2 text-left transition-colors disabled:opacity-45 sm:grid-cols-[64px_minmax(0,1fr)_28px] ${isSelected ? "border-ink bg-gold/10" : "border-ink/20"}`}
                >
                  <ProductVisual
                    images={product.images}
                    name={product.name}
                    index={index}
                    className="aspect-square"
                  />
                  <span className="min-w-0">
                    <span className="block break-words font-display text-base leading-tight sm:text-lg">
                      {product.name}
                    </span>
                    <span className="mt-1 block text-xs text-ink/70">
                      From {formatMoney(getPackOptions(product)[0].total)}
                    </span>
                  </span>
                  <span
                    className={`grid h-7 w-7 place-content-center border ${isSelected ? "border-ink bg-ink text-cream" : "border-ink/30"}`}
                  >
                    {isSelected && <Check weight="bold" aria-hidden="true" />}
                  </span>
                </button>
              );
            })}
          </div>
          {isFree && selectedProducts.length > 0 && (
            <p className="mt-4 text-xs leading-relaxed text-ink/65">
              Your free admission and selected products will continue together to checkout.
            </p>
          )}
        </div>
      )}

      {registrationError && (
        <p role="alert" className="mb-4 border border-red-700 p-3 text-sm text-red-800">
          {registrationError}
        </p>
      )}

      <div className="grid min-w-0 gap-4 border-t border-ink/20 pt-6 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs text-ink/70">{usesCheckout ? "Total before delivery" : "Admission total"}</p>
          <p className="mt-1 text-xl font-bold tabular-nums">
            {total === 0 ? "Free" : formatMoney(total)}
          </p>
        </div>
        <button
          disabled={available < 1 || isRegistering}
          className="min-h-12 w-full bg-ink px-5 text-sm font-bold text-cream disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto sm:px-6"
        >
          {available < 1
            ? "Event sold out"
            : isRegistering
              ? "Confirming…"
              : usesCheckout
                ? "Continue to checkout"
                : "Register free"}
        </button>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-ink/70">
        {usesCheckout
          ? "Secure payment with Paystack or Stripe. Your place is confirmed after payment."
          : "Your registration is confirmed immediately. No payment details are required."}
      </p>
    </form>
  );
}
