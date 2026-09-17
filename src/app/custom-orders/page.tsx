import type { Metadata } from "next";
import Image from "next/image";
import { CustomOrderForm } from "@/components/custom-order-form";

export const metadata: Metadata = {
  title: "Custom and Branded Orders",
  description: "Request branded TITUN towels, wipes, gift boxes and event orders with your artwork or reference image.",
  alternates: { canonical: "/custom-orders" },
};

export default function CustomOrdersPage() {
  return (
    <div>
      <section className="grid min-h-[36rem] bg-ink text-white lg:grid-cols-2">
        <div className="flex items-center px-5 py-16 md:px-10 lg:px-[7vw]">
          <div className="max-w-2xl">
            <h1 className="text-balance font-display text-[clamp(4rem,8vw,6rem)] leading-[.88] tracking-[-.035em]">Made around your occasion.</h1>
            <p className="mt-6 max-w-[55ch] text-base leading-relaxed text-white/80 md:text-lg">Share your artwork, quantity and requirements for branded towels, wipes, considered gift boxes or event orders.</p>
          </div>
        </div>
        <div className="relative min-h-[24rem] lg:min-h-full"><Image src="/images/titun/gift-box.jpg" alt="TITUN gift box prepared for a custom order" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div>
      </section>
      <section className="bg-cream px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
          <div>
            <h2 className="font-display text-5xl leading-[.95] tracking-[-.03em]">Start your order</h2>
            <p className="mt-5 max-w-md leading-relaxed text-ink/70">Upload a visual reference if you have one. TITUN will review feasibility, timing and pricing before confirming the order.</p>
          </div>
          <CustomOrderForm />
        </div>
      </section>
    </div>
  );
}
