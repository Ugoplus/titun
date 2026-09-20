import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { ContentPage } from "@/components/content-page";
import { getSiteAssetMap } from "@/lib/site-assets";

export const metadata: Metadata = {
  title: "About TITUN",
  description: "Discover TITUN’s considered approach to premium refreshing towels, hospitality and everyday renewal.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const siteImages = await getSiteAssetMap();
  return (
    <ContentPage
      title="Care, thoughtfully given."
      introduction="TITUN was created from a simple belief: the smallest gestures can leave the most lasting impression."
      headerAlign="center"
    >
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative min-h-[60svh]">
          <Image src={siteImages["about.hero"]} alt="TITUN refreshing towel presented during a dining experience" fill className="object-cover" />
        </div>
        <div className="flex flex-col justify-center">
          <div className="mt-7 grid max-w-xl gap-5 text-base leading-relaxed text-ink/65">
            <p>
              Inspired by the art of hospitality, we create premium refreshing
              towels and wipes for moments that deserve a little more thought.
              A welcome at the table, a pause between journeys or simply a
              moment to reset.
            </p>
            <p>
              Through thoughtful design, considered fragrance and everyday
              function, TITUN brings comfort, cleanliness and care to the
              experiences that shape how we feel and what we remember.
            </p>
            <p>
              Because true hospitality is rarely about the grand gesture. It
              lives in the little things, thoughtfully given and quietly
              remembered.
            </p>
            <p className="font-display text-3xl leading-tight tracking-[-.025em] text-ink">
              TITUN. A little moment of renewal.
            </p>
          </div>
          <Link href="/shop" className="mt-8 inline-flex w-fit items-center gap-4 border-b border-ink pb-2 text-sm font-semibold">Shop TITUN <ArrowRight /></Link>
        </div>
      </div>
    </ContentPage>
  );
}
