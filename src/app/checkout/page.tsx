"use client";

import Link from "next/link";
import { ArrowLeft, CreditCard, LockSimple } from "@phosphor-icons/react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/components/cart-provider";
import { ProductVisual } from "@/components/product-visual";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/db/schema";

export default function CheckoutPage() {
  const { items, addItems } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const fieldClass = "h-12 w-full border-b border-ink/35 bg-transparent px-0 text-base outline-none transition-colors focus:border-ink";

  useEffect(() => {
    const excluded = items.map((item) => item.product.id).join(",");
    fetch(`/api/recommendations?exclude=${encodeURIComponent(excluded)}`)
      .then((response) => response.ok ? response.json() : [])
      .then((products: Product[]) => setRecommendations(products))
      .catch(() => setRecommendations([]));
  }, [items]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!items.length) return;
    setIsLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name: form.get("name"), email: form.get("email"), phone: form.get("phone"), address: form.get("address"), city: form.get("city"), notes: form.get("notes") || undefined },
          items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
          discountCode: form.get("discountCode") || undefined,
          paymentProvider: form.get("paymentProvider"),
        }),
      });
      const payload = await response.json() as { checkoutUrl?: string; error?: string };
      if (!response.ok || !payload.checkoutUrl) throw new Error(payload.error ?? "Checkout could not be started");
      window.location.assign(payload.checkoutUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout could not be started");
      setIsLoading(false);
    }
  };

  if (!items.length) return <div className="grid min-h-[60svh] place-content-center px-5 text-center"><h1 className="font-display text-5xl">Your basket is empty.</h1><Link href="/shop" className="mt-6 font-bold">Return to the shop →</Link></div>;

  return <div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-10 md:px-8 md:py-16 lg:grid-cols-[1.1fr_.9fr]">
    <section><Link href="/shop" className="inline-flex items-center gap-2 text-sm font-bold"><ArrowLeft /> Continue shopping</Link><h1 className="mt-8 font-display text-6xl tracking-[-.055em] md:text-8xl">Checkout</h1>
      <form onSubmit={handleSubmit} className="mt-10 grid gap-8">
        <fieldset className="grid gap-5"><legend className="mb-5 text-xs font-bold uppercase tracking-[.09em]">Contact and delivery</legend><div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-1 text-xs">Full name<input required name="name" autoComplete="name" className={fieldClass}/></label><label className="grid gap-1 text-xs">Email address<input required name="email" type="email" autoComplete="email" className={fieldClass}/></label><label className="grid gap-1 text-xs">Phone number<input required name="phone" type="tel" autoComplete="tel" className={fieldClass}/></label><label className="grid gap-1 text-xs">City<input required name="city" autoComplete="address-level2" className={fieldClass}/></label></div><label className="grid gap-1 text-xs">Delivery address<input required name="address" autoComplete="street-address" className={fieldClass}/></label><label className="grid gap-1 text-xs">Delivery notes <span className="text-ink/50">Optional</span><textarea name="notes" rows={3} className="w-full resize-none border-b border-ink/35 bg-transparent py-3 text-base outline-none focus:border-ink"/></label></fieldset>
        <fieldset><legend className="mb-5 text-xs font-bold uppercase tracking-[.09em]">Payment method</legend><div className="grid gap-3 sm:grid-cols-2"><label className="flex min-h-20 cursor-pointer items-center gap-4 border border-ink/25 p-4 has-[:checked]:border-2 has-[:checked]:border-ink has-[:checked]:bg-citron/30"><input required defaultChecked type="radio" name="paymentProvider" value="paystack"/><span><strong className="block">Paystack</strong><span className="text-xs text-ink/55">Cards, transfer and local payment options</span></span></label><label className="flex min-h-20 cursor-pointer items-center gap-4 border border-ink/25 p-4 has-[:checked]:border-2 has-[:checked]:border-ink has-[:checked]:bg-citron/30"><input required type="radio" name="paymentProvider" value="stripe"/><CreditCard/><span><strong className="block">Stripe</strong><span className="text-xs text-ink/55">Secure international card checkout</span></span></label></div></fieldset>
        <fieldset><legend className="mb-5 text-xs font-bold uppercase tracking-[.09em]">Discount</legend><label className="grid gap-1 text-xs">Discount code<input name="discountCode" className={fieldClass}/></label></fieldset>
        <button disabled={isLoading} className="flex min-h-14 items-center justify-center gap-2 bg-ink px-6 font-bold text-cream hover:bg-leaf disabled:opacity-60"><LockSimple /> {isLoading ? "Opening secure payment…" : `Pay ${formatMoney(subtotal)}`}</button><p className="text-xs leading-relaxed text-ink/55">Payment details are entered directly on your selected provider’s secure checkout. TITUN never stores card numbers.</p>
      </form>
    </section>
    <aside className="bg-[#e8e2d7] p-5 md:p-8"><h2 className="font-display text-3xl">Order summary</h2><div className="mt-6 grid gap-5">{items.map((item, index) => <div key={item.product.id} className="grid grid-cols-[72px_1fr_auto] items-center gap-4"><ProductVisual name={item.product.name} images={item.product.images} index={index} className="aspect-[4/5]"/><div><p className="font-bold">{item.product.name}</p><p className="mt-1 text-xs text-ink/55">{item.product.packSize} · Qty {item.quantity}</p></div><p className="text-sm font-bold">{formatMoney(item.product.price * item.quantity)}</p></div>)}</div><div className="mt-8 grid gap-3 border-t border-ink/20 pt-5 text-sm"><div className="flex justify-between"><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div><div className="flex justify-between text-ink/55"><span>Delivery</span><span>Calculated after order</span></div><div className="mt-2 flex justify-between border-t border-ink/20 pt-5 text-lg"><strong>Total</strong><strong>{formatMoney(subtotal)}</strong></div></div>{recommendations.length > 0 && <section className="mt-10 border-t border-ink/20 pt-7"><p className="text-xs font-bold uppercase tracking-[.09em] text-ink/50">You may also like</p><h3 className="mt-2 font-display text-3xl">One more refresh?</h3><div className="mt-5 grid gap-3">{recommendations.map((product, index) => <div key={product.id} className="grid grid-cols-[64px_1fr_auto] items-center gap-3 border border-ink/15 bg-cream/55 p-2"><ProductVisual name={product.name} images={product.images} index={index} className="aspect-square"/><div><p className="text-sm font-bold leading-tight">{product.name}</p><p className="mt-1 text-xs text-ink/55">{formatMoney(product.price)}</p></div><button type="button" onClick={() => addItems([{ product, quantity: 1 }])} className="border border-ink px-3 py-2 text-xs font-bold">Add</button></div>)}</div></section>}</aside>
  </div>;
}
