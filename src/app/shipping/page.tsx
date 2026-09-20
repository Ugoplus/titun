import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";
import { getDeliveryContent, type DeliveryRegion } from "@/lib/delivery-content";

export const metadata: Metadata = {
  title: "Delivery",
  description: "TITUN delivery estimates for Lagos, Nigeria, the UK and international destinations.",
  alternates: { canonical: "/shipping" },
};

function DeliveryRows({ regions }: { regions: DeliveryRegion[] }) {
  return (
    <dl className="mt-7 border-t border-ink/20">
      {regions.map((region) => (
        <div
          key={region.id}
          className="grid gap-1 border-b border-ink/20 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline sm:gap-8"
        >
          <dt className="font-semibold text-ink">{region.name}</dt>
          <dd className="text-sm tabular-nums text-ink/70 sm:text-right">
            {region.timeframe}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default async function ShippingPage() {
  const content = await getDeliveryContent();

  return (
    <ContentPage
      title={content.pageTitle}
      introduction={content.introduction}
      singleLineTitle
    >
      <div className="grid border-y border-ink/20 lg:grid-cols-2 lg:divide-x lg:divide-ink/20">
        <section aria-labelledby="nigeria-delivery" className="py-10 lg:pr-12">
          <h2 id="nigeria-delivery" className="font-display text-4xl tracking-[-.025em] md:text-5xl">
            {content.nigeriaHeading}
          </h2>
          <DeliveryRows regions={content.nigeriaRegions} />
          <p className="mt-6 max-w-[58ch] text-sm leading-relaxed text-ink/65">
            {content.nigeriaCourierNote}
          </p>
        </section>

        <section aria-labelledby="international-delivery" className="border-t border-ink/20 py-10 lg:border-t-0 lg:pl-12">
          <h2 id="international-delivery" className="font-display text-4xl tracking-[-.025em] md:text-5xl">
            {content.internationalHeading}
          </h2>
          <DeliveryRows regions={content.internationalRegions} />
        </section>
      </div>

      <section aria-labelledby="delivery-note" className="mt-10 bg-cream px-6 py-7 md:mt-14 md:px-8 md:py-9">
        <h2 id="delivery-note" className="font-display text-2xl tracking-[-.015em]">
          Please note
        </h2>
        <p className="mt-3 max-w-[72ch] text-sm leading-relaxed text-ink/70">
          {content.disclaimer}
        </p>
      </section>
    </ContentPage>
  );
}
