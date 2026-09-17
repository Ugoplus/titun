import type { Metadata } from "next";
import Image from "next/image";
import { CorporateEnquiryForm } from "@/components/corporate-enquiry-form";

export const metadata: Metadata = {
  title: "Corporate and Hospitality Orders",
  description: "Request premium TITUN refreshing towels and wipes for hotels, restaurants, airlines, wellness, teams and private events.",
  alternates: { canonical: "/corporate" },
};

export default async function CorporatePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const defaultProduct = typeof query.product === "string" ? query.product : "";
  return (
    <div className="bg-white">
      <section className="grid min-h-[68svh] border-b border-ink/15 lg:grid-cols-[.9fr_1.1fr]">
        <div className="flex flex-col justify-center px-5 py-16 md:px-10 lg:px-[7vw]">
          <h1 className="font-display text-[clamp(4rem,8vw,6rem)] leading-[.84] tracking-[-.035em]">Hospitality at your scale.</h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink/65">Create a considered welcome for hotels, restaurants, airlines, spas, gyms, corporate teams and private events.</p>
          <a href="#enquiry" className="mt-8 w-fit bg-ink px-6 py-4 text-sm font-semibold text-white">Enquire about corporate orders</a>
        </div>
        <div className="relative min-h-[50svh]">
          <Image src="/images/titun/wipes-lifestyle.jpg" alt="A guest using a TITUN wipe in an elegant hospitality setting" fill priority className="object-cover" />
        </div>
      </section>
      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid border-l border-t border-ink/20 sm:grid-cols-2 lg:grid-cols-5">
            {["Discover TITUN", "See applications", "Enquire", "Receive a quote", "Place your order"].map((step) => (
              <div key={step} className="border-b border-r border-ink/20 p-5 font-display text-2xl">{step}</div>
            ))}
          </div>
          <div id="enquiry" className="mt-20 grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
            <div>
              <h2 className="font-display text-6xl leading-[.9] tracking-[-.03em]">Tell us what welcome looks like for you.</h2>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-ink/65">Share the product, quantity and occasion. We’ll use those details to prepare the right next step.</p>
            </div>
            <CorporateEnquiryForm defaultProduct={defaultProduct} />
          </div>
        </div>
      </section>
    </div>
  );
}
