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
      title="A quieter way to care."
      introduction="TITUN creates premium refreshment essentials for the small moments that shape how an experience is remembered."
      headerAlign="center"
    >
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative min-h-[60svh]">
          <Image src={siteImages["about.hero"]} alt="TITUN refreshing towel presented during a dining experience" fill className="object-cover" />
        </div>
        <div className="flex flex-col justify-center">
          <h2 className="font-display text-5xl leading-[.95] tracking-[-.03em]">Renewal is a gesture.</h2>
          <div className="mt-7 grid max-w-xl gap-5 text-base leading-relaxed text-ink/65">
            <p>We believe care often arrives through details: a welcome offered before it is requested, a pause between one moment and the next, a sense that someone considered how the experience should feel.</p>
            <p>TITUN brings that thinking to refreshing towels and wipes designed for hospitality, dining, travel, wellness, events and everyday movement.</p>
          </div>
          <Link href="/shop" className="mt-8 inline-flex w-fit items-center gap-4 border-b border-ink pb-2 text-sm font-semibold">Shop TITUN <ArrowRight /></Link>
        </div>
      </div>
    </ContentPage>
  );
}
