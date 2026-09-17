import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { getProductBySlug } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = {
  title: "Build Your Gift Box",
  description: "Create a TITUN gift box with your choice of refreshing towels and wet wipes.",
  alternates: { canonical: "/custom-orders" },
};

export default async function CustomOrdersPage() {
  const giftBox = await getProductBySlug("titun-discovery-gift-box");
  if (!giftBox) notFound();
  return (
    <div>
      <section className="grid min-h-[36rem] bg-ink text-white lg:grid-cols-2">
        <div className="flex items-center px-5 py-16 md:px-10 lg:px-[7vw]">
          <div className="max-w-2xl">
            <h1 className="text-balance font-display text-[clamp(4rem,8vw,6rem)] leading-[.88] tracking-[-.035em]">Build your gift box.</h1>
            <p className="mt-6 max-w-[55ch] text-base leading-relaxed text-white/80 md:text-lg">Choose the refreshing towels and wet wipes you want together in one considered TITUN box.</p>
          </div>
        </div>
        <div className="relative min-h-[24rem] lg:min-h-full"><Image src="/images/titun/gift-box.jpg" alt="TITUN gift box with refreshing towels and wet wipes" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div>
      </section>
      <section className="bg-cream px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
          <div>
            <h2 className="font-display text-5xl leading-[.95] tracking-[-.03em]">Your box, your mix.</h2>
            <p className="mt-5 max-w-md leading-relaxed text-ink/70">Select one or several towel and wipe types. Your choices are saved with the order so the TITUN team can prepare the right mix.</p>
            <p className="mt-6 text-xl font-semibold tabular-nums">{formatMoney(giftBox.price, giftBox.currency)}</p>
          </div>
          <div className="border-t border-ink/20 pt-8">
            <AddToCart product={giftBox} />
          </div>
        </div>
      </section>
    </div>
  );
}
