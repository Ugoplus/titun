"use client";

import Link from "next/link";
import { ArrowLeft, LockSimple } from "@phosphor-icons/react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/components/cart-provider";
import { ProductVisual } from "@/components/product-visual";
import {
  PaystackLogo,
  StripeLogo,
  StripePaymentMethodLogos,
} from "@/components/payment-provider-logos";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/db/schema";
import {
  formatGiftBoxContents,
  isDiscoveryGiftBox,
} from "@/lib/gift-box";
import type { CartConfiguration } from "@/lib/cart";
import type { PaymentProvider } from "@/lib/payments";
import { getAlternativePaymentProvider } from "@/lib/payment-recommendation";
import {
  getDefaultPurchaseQuantity,
  getConfiguredLinePricing,
  getPackOptions,
  hasPackOptions,
} from "@/lib/product-pricing";

export default function CheckoutPage() {
  const { items, addItems, replaceItems } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedPaymentProvider, setRecommendedPaymentProvider] =
    useState<PaymentProvider | null>(null);
  const [selectedPaymentProvider, setSelectedPaymentProvider] =
    useState<PaymentProvider | null>(null);
  const [showOtherPaymentMethod, setShowOtherPaymentMethod] = useState(false);
  const paymentChoiceMade = useRef(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [quote, setQuote] = useState<{
    items: Array<{
      product: Product;
      quantity: number;
      configuration?: CartConfiguration;
    }>;
    subtotal: number;
    cartKey: string;
    version: number;
  } | null>(null);
  const [quoteError, setQuoteError] = useState<{
    message: string;
    cartKey: string;
    version: number;
  } | null>(null);
  const [quoteVersion, setQuoteVersion] = useState(0);
  const cartKey = useMemo(
    () => items.map((item) => `${item.product.id}:${item.quantity}:${JSON.stringify(item.configuration ?? {})}`).join(","),
    [items],
  );
  const activeQuote =
    quote?.cartKey === cartKey && quote.version === quoteVersion ? quote : null;
  const activeQuoteError =
    quoteError?.cartKey === cartKey && quoteError.version === quoteVersion
      ? quoteError.message
      : null;
  const displayItems = activeQuote?.items ?? items;
  const localSubtotal = items.reduce(
    (sum, item) =>
      sum +
      getConfiguredLinePricing(
        item.product,
        item.quantity,
        item.configuration,
      ).total,
    0,
  );
  const subtotal = activeQuote?.subtotal ?? localSubtotal;
  const fieldClass =
    "h-12 w-full border-b border-ink/35 bg-transparent px-0 text-base outline-none transition-colors focus:border-ink";

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/payments/recommendation", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Payment recommendation unavailable");
        return response.json() as Promise<{ provider?: PaymentProvider }>;
      })
      .then(({ provider }) => {
        const recommendation =
          provider === "paystack" || provider === "stripe"
            ? provider
            : "stripe";
        setRecommendedPaymentProvider(recommendation);
        if (!paymentChoiceMade.current)
          setSelectedPaymentProvider(recommendation);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setRecommendedPaymentProvider("stripe");
        if (!paymentChoiceMade.current) setSelectedPaymentProvider("stripe");
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const excluded = items.map((item) => item.product.id).join(",");
    fetch(`/api/recommendations?exclude=${encodeURIComponent(excluded)}`)
      .then((response) => (response.ok ? response.json() : []))
      .then((products: Product[]) => setRecommendations(products))
      .catch(() => setRecommendations([]));
  }, [items]);

  useEffect(() => {
    if (!items.length) return;
    const controller = new AbortController();
    fetch("/api/cart/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          configuration: item.configuration,
        })),
      }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Your basket could not be refreshed");
        return payload as Pick<NonNullable<typeof quote>, "items" | "subtotal">;
      })
      .then((nextQuote) => {
        setQuote({ ...nextQuote, cartKey, version: quoteVersion });
        setQuoteError(null);
        replaceItems(nextQuote.items.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          configuration: item.configuration,
        })));
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setQuoteError({
          message:
            error instanceof Error
              ? error.message
              : "Your basket could not be refreshed",
          cartKey,
          version: quoteVersion,
        });
      });
    return () => controller.abort();
  // cartKey represents the customer-visible cart; replacing stale product snapshots does not refetch.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartKey, quoteVersion, replaceItems]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!items.length || !activeQuote) return;
    setIsLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.get("name"),
            email: form.get("email"),
            phone: form.get("phone"),
            address: form.get("address"),
            city: form.get("city"),
            notes: form.get("notes") || undefined,
          },
          items: activeQuote.items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            configuration: item.configuration,
          })),
          expectedSubtotal: activeQuote.subtotal,
          discountCode: form.get("discountCode") || undefined,
          paymentProvider: form.get("paymentProvider"),
        }),
      });
      const payload = (await response.json()) as {
        checkoutUrl?: string;
        error?: string;
      };
      if (!response.ok || !payload.checkoutUrl)
        throw new Error(payload.error ?? "Checkout could not be started");
      window.location.assign(payload.checkoutUrl);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Checkout could not be started",
      );
      setIsLoading(false);
    }
  };

  if (!items.length)
    return (
      <div className="grid min-h-[60svh] place-content-center px-5 text-center">
        <h1 className="font-display text-5xl">Your basket is empty.</h1>
        <Link href="/shop" className="mt-6 font-bold">
          Return to the shop →
        </Link>
      </div>
    );

  return (
    <div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-10 md:px-8 md:py-16 lg:grid-cols-[1.1fr_.9fr]">
      <section>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm font-bold"
        >
          <ArrowLeft /> Continue shopping
        </Link>
        <h1 className="mt-8 font-display text-6xl tracking-[-.04em] md:text-8xl">
          Checkout
        </h1>
        <form onSubmit={handleSubmit} className="mt-10 grid gap-8">
          {!activeQuote && !activeQuoteError && (
            <p role="status" className="border border-ink/20 bg-linen p-4 text-sm">
              Confirming current prices and availability…
            </p>
          )}
          {activeQuoteError && (
            <div role="alert" className="border border-red-800 bg-red-50 p-4 text-sm text-red-900">
              <p>{activeQuoteError}</p>
              <button
                type="button"
                onClick={() => setQuoteVersion((version) => version + 1)}
                className="mt-3 min-h-11 border border-red-900 px-4 font-semibold"
              >
                Refresh basket
              </button>
            </div>
          )}
          <fieldset className="grid gap-5">
            <legend className="mb-5 text-xs font-bold uppercase tracking-[.09em]">
              Contact and delivery
            </legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-1 text-xs">
                Full name
                <input
                  required
                  name="name"
                  autoComplete="name"
                  className={fieldClass}
                />
              </label>
              <label className="grid gap-1 text-xs">
                Email address
                <input
                  required
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={fieldClass}
                />
              </label>
              <label className="grid gap-1 text-xs">
                Phone number
                <input
                  required
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  className={fieldClass}
                />
              </label>
              <label className="grid gap-1 text-xs">
                City
                <input
                  required
                  name="city"
                  autoComplete="address-level2"
                  className={fieldClass}
                />
              </label>
            </div>
            <label className="grid gap-1 text-xs">
              Delivery address
              <input
                required
                name="address"
                autoComplete="street-address"
                className={fieldClass}
              />
            </label>
            <label className="grid gap-1 text-xs">
              Delivery notes <span className="text-ink/70">Optional</span>
              <textarea
                name="notes"
                rows={3}
                className="w-full resize-none border-b border-ink/35 bg-transparent py-3 text-base outline-none focus:border-ink"
              />
            </label>
          </fieldset>
          <fieldset>
            <legend className="mb-5 text-xs font-bold uppercase tracking-[.09em]">
              Payment method
            </legend>
            {!recommendedPaymentProvider || !selectedPaymentProvider ? (
              <p role="status" className="max-w-2xl border border-ink/20 bg-linen p-4 text-sm">
                Finding the best payment option for your location…
              </p>
            ) : (
              <div id="payment-method-options" className="grid max-w-2xl gap-3">
                {[
                  recommendedPaymentProvider,
                  ...(showOtherPaymentMethod
                    ? [getAlternativePaymentProvider(recommendedPaymentProvider)]
                    : []),
                ].map((provider) => (
                  <label
                    key={provider}
                    className="flex min-h-20 cursor-pointer items-center gap-4 border border-ink/25 p-4 has-[:checked]:border-2 has-[:checked]:border-ink has-[:checked]:bg-citron/30"
                  >
                    <input
                      required
                      checked={selectedPaymentProvider === provider}
                      onChange={() => {
                        paymentChoiceMade.current = true;
                        setSelectedPaymentProvider(provider);
                      }}
                      type="radio"
                      name="paymentProvider"
                      value={provider}
                    />
                    <span className="min-w-0">
                      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[.08em] text-ink/65">
                        {provider === recommendedPaymentProvider
                          ? provider === "paystack"
                            ? "Recommended for Nigeria"
                            : "Recommended for your location"
                          : "Another payment option"}
                      </span>
                      {provider === "stripe" ? (
                        <>
                          <strong className="sr-only">Stripe</strong>
                          <StripeLogo className="h-7 w-[4.25rem]" />
                          <span className="mt-1 block text-xs leading-relaxed text-ink/70">
                            Cards, Apple Pay, Google Pay, Link and other eligible payment methods
                          </span>
                          <StripePaymentMethodLogos />
                        </>
                      ) : (
                        <>
                          <strong className="sr-only">Paystack</strong>
                          <PaystackLogo />
                          <span className="mt-1 block text-xs leading-relaxed text-ink/70">
                            Cards, bank transfer and other eligible local payment methods
                          </span>
                        </>
                      )}
                    </span>
                  </label>
                ))}
                {!showOtherPaymentMethod && (
                  <button
                    type="button"
                    aria-expanded="false"
                    aria-controls="payment-method-options"
                    onClick={() => setShowOtherPaymentMethod(true)}
                    className="min-h-11 justify-self-start border-b border-ink pb-1 text-sm font-semibold"
                  >
                    Try another payment method
                  </button>
                )}
              </div>
            )}
          </fieldset>
          <fieldset>
            <legend className="mb-5 text-xs font-bold uppercase tracking-[.09em]">
              Discount
            </legend>
            <label className="grid gap-1 text-xs">
              Discount code
              <input name="discountCode" className={fieldClass} />
            </label>
          </fieldset>
          <button
            disabled={isLoading || !activeQuote || !selectedPaymentProvider}
            className="flex min-h-14 items-center justify-center gap-2 bg-ink px-6 font-bold text-cream hover:bg-leaf disabled:opacity-60"
          >
            <LockSimple />{" "}
            {isLoading
              ? "Opening secure payment…"
              : `Pay ${formatMoney(subtotal)}`}
          </button>
          <p className="text-xs leading-relaxed text-ink/70">
            Payment details are entered directly on your selected provider’s
            secure checkout. TITUN never stores card numbers.
          </p>
        </form>
      </section>
      <aside className="bg-sand p-5 md:p-8">
        <h2 className="font-display text-3xl">Order summary</h2>
        <div className="mt-6 grid gap-5">
          {displayItems.map((item, index) => (
            <div
              key={item.product.id}
              className="grid grid-cols-[72px_1fr_auto] items-center gap-4"
            >
              <ProductVisual
                name={item.product.name}
                images={item.product.images}
                index={index}
                className="aspect-[4/5]"
              />
              <div>
                <p className="font-bold">{item.product.name}</p>
                <p className="mt-1 text-xs text-ink/70">
                  {getConfiguredLinePricing(item.product, item.quantity, item.configuration).label}
                </p>
                {!hasPackOptions(item.product) && !item.configuration?.giftBoxSize && !item.configuration?.giftBoxUpsell && (
                  <p className="mt-1 text-xs font-semibold tabular-nums">
                    Quantity: {item.quantity}
                  </p>
                )}
                {item.configuration?.giftBoxContents?.length ? (
                  <p className="mt-1 text-xs leading-relaxed text-ink/70">
                    {formatGiftBoxContents(item.configuration.giftBoxContents)}
                  </p>
                ) : null}
              </div>
              <p className="text-sm font-bold">
                {formatMoney(
                  getConfiguredLinePricing(
                    item.product,
                    item.quantity,
                    item.configuration,
                  ).total,
                )}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-3 border-t border-ink/20 pt-5 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <strong>{formatMoney(subtotal)}</strong>
          </div>
          <div className="flex justify-between text-ink/70">
            <span>Delivery</span>
            <span>Calculated after order</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-ink/20 pt-5 text-lg">
            <strong>Total</strong>
            <strong>{formatMoney(subtotal)}</strong>
          </div>
        </div>
        {recommendations.length > 0 && (
          <section className="mt-10 border-t border-ink/20 pt-7">
            <p className="text-xs font-bold uppercase tracking-[.09em] text-ink/70">
              You may also like
            </p>
            <h3 className="mt-2 font-display text-3xl">One more refresh?</h3>
            <div className="mt-5 grid gap-3">
              {recommendations.map((product, index) => (
                <div
                  key={product.id}
                  className="grid grid-cols-[64px_1fr_auto] items-center gap-3 border border-ink/15 bg-cream/55 p-2"
                >
                  <ProductVisual
                    name={product.name}
                    images={product.images}
                    index={index}
                    className="aspect-square"
                  />
                  <div>
                    <p className="text-sm font-bold leading-tight">
                      {product.name}
                    </p>
                    <p className="mt-1 text-xs text-ink/70">
                      From {formatMoney(getPackOptions(product)[0].total)}
                    </p>
                  </div>
                  {isDiscoveryGiftBox(product) ? (
                    <Link
                      href={`/products/${product.slug}`}
                      className="inline-flex min-h-11 items-center border border-ink px-3 py-2 text-xs font-bold"
                    >
                      Build
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        addItems([
                          {
                            product,
                            quantity: getDefaultPurchaseQuantity(product),
                          },
                        ])
                      }
                      className="min-h-11 border border-ink px-3 py-2 text-xs font-bold"
                    >
                      Add
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </aside>
    </div>
  );
}
