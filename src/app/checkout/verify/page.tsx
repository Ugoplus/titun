"use client";

import Link from "next/link";
import { CheckCircle, CircleNotch } from "@phosphor-icons/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";

function VerifyOrder() {
  const params = useSearchParams();
  const reference = params.get("reference");
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState<"checking" | "paid" | "pending" | "error">(
    reference ? "checking" : "error",
  );
  const { clear } = useCart();

  useEffect(() => {
    if (!reference) return;
    const query = new URLSearchParams({ reference });
    if (sessionId) query.set("session_id", sessionId);
    fetch(`/api/orders/verify?${query.toString()}`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error();
        if (payload.status === "paid" || payload.status === "fulfilled") {
          clear();
          setStatus("paid");
          return;
        }
        setStatus("pending");
      })
      .catch(() => setStatus("error"));
  }, [reference, sessionId, clear]);

  return <div className="grid min-h-[65svh] place-content-center px-5 text-center">
    {status === "checking" ? <><CircleNotch className="mx-auto animate-spin" size={40}/><h1 className="mt-6 font-display text-5xl">Confirming your payment…</h1></> : status === "paid" ? <><CheckCircle className="mx-auto text-leaf" size={48}/><p className="mt-5 text-xs font-bold uppercase tracking-[.09em]">Order {reference}</p><h1 className="mt-3 font-display text-6xl tracking-[-.05em]">Your refresh is on its way.</h1><p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-ink/65">We’ve received your order and sent the details to your email.</p><Link href="/shop" className="mx-auto mt-8 bg-ink px-6 py-4 font-bold text-cream">Continue shopping</Link></> : <><h1 className="font-display text-5xl">We’re still checking.</h1><p className="mx-auto mt-5 max-w-md text-sm text-ink/65">If payment was successful, your confirmation email will arrive shortly. Your reference is {reference}.</p><Link href="/shop" className="mt-8 font-bold">Return to the shop →</Link></>}
  </div>;
}

export default function VerifyPage() {
  return <Suspense><VerifyOrder /></Suspense>;
}
