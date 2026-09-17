"use client";

import { useMemo, useState } from "react";
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

export function EventBookingPanel({
  ticket,
  recommendations,
}: {
  ticket: Product;
  recommendations: Product[];
}) {
  const router = useRouter();
  const { addItems } = useCart();
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const available = ticket.stockOnHand - ticket.stockReserved;
  const selectedProducts = useMemo(
    () => recommendations.filter((product) => selected.includes(product.id)),
    [recommendations, selected],
  );
  const total =
    ticket.price * ticketQuantity +
    selectedProducts.reduce(
      (sum, product) => sum + getPackOptions(product)[0].total,
      0,
    );

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

  return (
    <section className="border border-ink/20 bg-cream p-5 md:p-8">
      <p className="text-xs font-bold uppercase tracking-[.09em] text-ink/70">
        Reserve your place
      </p>
      <div className="mt-4 flex items-center justify-between gap-5 border-b border-ink/20 pb-6">
        <div>
          <h2 className="font-display text-3xl">Guest admission</h2>
          <p className="mt-1 text-sm text-ink/70">
            {formatMoney(ticket.price)} per guest · {available} places left
          </p>
        </div>
        <div className="flex items-center border border-ink/25">
          <button
            type="button"
            aria-label="Reduce ticket quantity"
            onClick={() => setTicketQuantity((value) => Math.max(1, value - 1))}
            className="grid h-11 w-11 place-content-center"
          >
            <Minus />
          </button>
          <span className="w-9 text-center text-sm font-bold">
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
            <Plus />
          </button>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="py-7">
          <p className="text-xs font-bold uppercase tracking-[.09em] text-ink/70">
            Recommended for your experience
          </p>
          <h3 className="mt-2 font-display text-4xl">Complete the ritual.</h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Choose any TITUN products you would like to receive with your
            booking. They will be added to the same secure checkout.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {recommendations.map((product, index) => {
              const isSelected = selected.includes(product.id);
              const productAvailable =
                product.stockOnHand - product.stockReserved >=
                getDefaultPurchaseQuantity(product);
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
                  className={`grid grid-cols-[76px_1fr_auto] items-center gap-3 border p-2 text-left transition-colors disabled:opacity-45 ${isSelected ? "border-ink bg-citron/20" : "border-ink/20"}`}
                >
                  <ProductVisual
                    images={product.images}
                    name={product.name}
                    index={index}
                    className="aspect-square"
                  />
                  <span>
                    <span className="block font-display text-xl leading-tight">
                      {product.name}
                    </span>
                    <span className="mt-1 block text-xs text-ink/70">
                      {product.scent} · From {formatMoney(getPackOptions(product)[0].total)}
                    </span>
                  </span>
                  <span
                    className={`grid h-7 w-7 place-content-center border ${isSelected ? "border-ink bg-ink text-cream" : "border-ink/30"}`}
                  >
                    {isSelected && <Check weight="bold" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 border-t border-ink/20 pt-6">
        <div>
          <p className="text-xs text-ink/70">Total before delivery</p>
          <p className="mt-1 text-xl font-bold">{formatMoney(total)}</p>
        </div>
        <button
          disabled={available < 1}
          onClick={continueToCheckout}
          className="min-h-12 bg-ink px-6 text-sm font-bold text-cream disabled:cursor-not-allowed disabled:opacity-45"
        >
          {available > 0 ? "Continue to checkout" : "Event sold out"}
        </button>
      </div>
      <p className="mt-4 text-xs text-ink/70">
        Secure payment with Paystack or Stripe. Your place is confirmed after
        payment.
      </p>
    </section>
  );
}
