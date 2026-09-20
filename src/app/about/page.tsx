import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { ContentPage } from "@/components/content-page";
import { getSiteAssetMap } from "@/lib/site-assets";
import { getSiteSettings } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "About TITUN",
  description: "Discover TITUN’s considered approach to premium refreshing towels, hospitality and everyday renewal.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [siteImages, siteSettings] = await Promise.all([
    getSiteAssetMap(),
    getSiteSettings(),
  ]);
  return (
    <ContentPage
      title={siteSettings.aboutHeading}
      introduction={siteSettings.aboutIntroduction}
      headerAlign="center"
    >
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative min-h-[60svh]">
          <Image src={siteImages["about.hero"]} alt="TITUN refreshing towel presented during a dining experience" fill className="object-cover" />
        </div>
        <div className="flex flex-col justify-center">
          <div className="mt-7 grid max-w-xl gap-5 text-base leading-relaxed text-ink/65">
            <p>{siteSettings.aboutParagraphOne}</p>
            <p>{siteSettings.aboutParagraphTwo}</p>
            <p>{siteSettings.aboutParagraphThree}</p>
            <p className="font-display text-3xl leading-tight tracking-[-.025em] text-ink">
              {siteSettings.aboutClosing}
            </p>
          </div>
          <Link href="/shop" className="mt-8 inline-flex w-fit items-center gap-4 border-b border-ink pb-2 text-sm font-semibold">Shop TITUN <ArrowRight /></Link>
        </div>
      </div>
    </ContentPage>
  );
}
