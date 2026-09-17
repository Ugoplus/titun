import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "The Oshibori Ritual",
  description: "Learn how TITUN brings the thoughtful Oshibori ritual of welcome and refreshment into contemporary hospitality.",
  alternates: { canonical: "/oshibori" },
};

export default function OshiboriPage() {
  return (
    <ContentPage
      title="More than a towel. A gesture of hospitality."
      introduction="An Oshibori is a refreshing towel traditionally offered to guests as a gesture of welcome and care. TITUN brings that thoughtful ritual into contemporary life."
    >
      <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
        <div className="flex flex-col justify-center">
          <div className="grid border-y border-ink/20 py-6 font-display text-3xl sm:grid-cols-3">
            <span>Refresh</span><span>Welcome</span><span>Elevate</span>
          </div>
          <div className="mt-8 grid max-w-xl gap-5 text-base leading-relaxed text-ink/65">
            <p>The ritual begins before the towel is opened. Its presentation signals attention; its fragrance and touch create a pause; the guest returns to the moment feeling considered.</p>
            <p>TITUN adapts that spirit for restaurants, hotels, travel, spas, fitness, private occasions and the journeys between them.</p>
          </div>
          <Link href="/shop" className="mt-8 inline-flex w-fit items-center gap-4 bg-ink px-6 py-4 text-sm font-semibold text-white">Experience TITUN <ArrowRight /></Link>
        </div>
        <div className="relative min-h-[65svh]">
          <Image src="/images/titun/ritual-spa.jpg" alt="Refreshing towels prepared in a calm spa setting" fill className="object-cover" />
        </div>
      </div>
    </ContentPage>
  );
}
