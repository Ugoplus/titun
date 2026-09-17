import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getFeaturedProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { StructuredData } from "@/components/structured-data";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const benefits = [
  ["Premium presentation", "A considered detail before the experience begins."],
  ["Fragrance-led", "Three distinctive scents set the tone for the moment."],
  ["Convenient", "Individually sealed and ready wherever care is needed."],
  ["Versatile", "Created for dining, travel, wellness, events and daily life."],
  ["Thoughtful hospitality", "A simple gesture that makes welcome tangible."],
];

const applications = [
  "Hotels",
  "Restaurants",
  "Travel and airlines",
  "Spas and wellness",
  "Fitness and sports",
  "Corporate events",
  "Private events",
  "Luxury retail",
];

const wipeScents = [
  ["Green Tea", "/images/titun/green-tea-wipes.jpg"],
  ["Sandalwood", "/images/titun/sandalwood-wipes.jpg"],
  ["Lemongrass", "/images/titun/lemongrass-wipes.jpg"],
] as const;

export default async function Home() {
  const featured = await getFeaturedProducts();

  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "OnlineStore",
          name: "TITUN",
          url: absoluteUrl("/"),
          description:
            "Premium refreshing towels and wipes for hospitality, travel, wellness and everyday rituals.",
          image: absoluteUrl("/images/titun/hero-lounge.jpg"),
          currenciesAccepted: "NGN",
        }}
      />
      <section className="grid min-h-[calc(100svh-108px)] border-b border-ink/15 bg-white lg:grid-cols-[.82fr_1.18fr]">
        <div className="reveal flex flex-col justify-center px-5 py-16 md:px-10 lg:px-[6vw]">
          <h1 className="max-w-3xl font-display text-[clamp(4rem,8vw,6rem)] leading-[.82] tracking-[-.035em]">
            The Art of Renewal
          </h1>
          <p className="mt-8 max-w-lg text-base leading-relaxed text-ink/70 md:text-lg">
            Premium refreshment essentials designed to elevate the moments that
            matter.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex min-h-12 items-center gap-5 bg-ink px-6 text-sm font-semibold text-white"
            >
              Shop TITUN <ArrowRight />
            </Link>
            <Link
              href="/about"
              className="inline-flex min-h-12 items-center gap-5 border border-ink px-6 text-sm font-semibold"
            >
              Discover TITUN
            </Link>
          </div>
        </div>
        <div className="relative min-h-[56svh] overflow-hidden lg:min-h-full">
          <Image
            src="/images/titun/hero-lounge.jpg"
            alt="TITUN refreshing towels presented during an elegant restaurant experience"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover object-center"
          />
          <div className="absolute bottom-6 left-5 bg-white px-4 py-3 text-[11px] font-bold uppercase tracking-[.08em] text-ink">
            Open · Unfold · Renew
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-6 border-b border-ink/20 pb-10 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
            <h2 className="max-w-4xl font-display text-[clamp(3.4rem,7vw,6rem)] leading-[.88] tracking-[-.035em]">
              Towels for the ritual. Wipes for the rhythm.
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-ink/65 lg:justify-self-end">
              Meet three fragrance-led refreshing towels and a related
              cleansing-wipe collection—each individually presented for a
              clean, considered pause.
            </p>
          </div>
          <div className="mt-10 grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 3).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
          <div id="wipes" className="mt-20 grid bg-linen lg:grid-cols-[.9fr_1.1fr]">
            <div className="flex flex-col justify-center p-6 md:p-12 lg:p-16">
              <h3 className="font-display text-5xl leading-[.92] tracking-[-.03em] md:text-6xl">
                Refreshing wet wipes, considered separately.
              </h3>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-ink/65">
                Made from 40 GSM spunlace nonwoven fabric, TITUN wet wipes offer
                a lighter format for dining, travel and movement. Retail pricing
                is being finalised; corporate enquiries are open now.
              </p>
              <Link
                href="/corporate?product=Refreshing%20wet%20wipes"
                className="mt-8 inline-flex w-fit items-center gap-4 border-b border-ink pb-2 text-sm font-semibold"
              >
                Enquire about wipes <ArrowRight />
              </Link>
            </div>
            <div className="grid grid-cols-3">
              {wipeScents.map(([name, image]) => (
                <figure key={name} className="border-l border-ink/10">
                  <div className="relative aspect-[3/4] md:min-h-64">
                    <Image src={image} alt={`${name} TITUN wet wipe`} fill className="object-cover" />
                  </div>
                  <figcaption className="border-t border-ink/10 p-3 text-xs font-semibold">
                    {name}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid border-y border-ink/15 bg-cream lg:grid-cols-2">
        <div className="relative min-h-[56svh]">
          <Image
            src="/images/titun/movement-kit.jpg"
            alt="TITUN refreshing towels packed for movement and travel"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center px-5 py-20 md:px-14 lg:px-[8vw]">
          <h2 className="font-display text-6xl leading-[.9] tracking-[-.03em]">
            Renewal, made tangible.
          </h2>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-ink/65">
            TITUN creates premium refreshment essentials for moments of welcome,
            movement and return. Every individually wrapped towel turns a
            practical gesture into a quiet expression of care.
          </p>
          <Link
            href="/about"
            className="mt-8 inline-flex w-fit items-center gap-4 border-b border-ink pb-2 text-sm font-semibold"
          >
            About TITUN <ArrowRight />
          </Link>
        </div>
      </section>

      <section id="ritual" className="grid bg-ink text-white lg:grid-cols-2">
        <div className="flex flex-col justify-center px-5 py-20 md:px-14 lg:px-[8vw]">
          <h2 className="max-w-xl font-display text-6xl leading-[.9] tracking-[-.03em] md:text-7xl">
            More than a towel. A gesture of hospitality.
          </h2>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-white/70">
            An Oshibori is a refreshing towel traditionally offered as a
            gesture of welcome. TITUN brings that thoughtful ritual into modern
            dining, travel, wellness, events and everyday life.
          </p>
          <div className="mt-10 grid grid-cols-3 border-y border-white/20 py-5 font-display text-2xl text-gold">
            <span>Refresh</span>
            <span>Welcome</span>
            <span>Elevate</span>
          </div>
          <Link
            href="/oshibori"
            className="mt-8 inline-flex w-fit items-center gap-4 border-b border-white pb-2 text-sm font-semibold"
          >
            Discover the ritual <ArrowRight />
          </Link>
        </div>
        <div className="relative min-h-[62svh]">
          <Image
            src="/images/titun/ritual-spa.jpg"
            alt="TITUN refreshing towels arranged in a warm spa setting"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="bg-white px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1440px]">
          <h2 className="max-w-4xl font-display text-6xl leading-[.9] tracking-[-.03em] md:text-7xl">
            Why TITUN belongs in the experience.
          </h2>
          <div className="mt-12 grid border-l border-t border-ink/20 sm:grid-cols-2 lg:grid-cols-5">
            {benefits.map(([title, copy]) => (
              <article key={title} className="border-b border-r border-ink/20 p-6 lg:min-h-64">
                <h3 className="font-display text-3xl leading-[.95]">{title}</h3>
                <p className="mt-5 text-sm leading-relaxed text-ink/60">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-walnut px-5 py-20 text-white md:px-8 md:py-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
            <h2 className="font-display text-6xl leading-[.9] tracking-[-.03em] md:text-7xl">
              Wherever welcome matters.
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-white/70 lg:justify-self-end">
              From the first touchpoint to the final detail, TITUN helps teams
              create a more considered guest experience.
            </p>
          </div>
          <div className="mt-12 grid border-l border-t border-white/25 sm:grid-cols-2 lg:grid-cols-4">
            {applications.map((application) => (
              <div key={application} className="border-b border-r border-white/25 p-5 font-display text-2xl">
                {application}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-ink/20 pb-8">
            <h2 className="font-display text-6xl tracking-[-.03em] md:text-7xl">Shop TITUN</h2>
            <Link href="/shop" className="inline-flex items-center gap-3 text-sm font-semibold">
              View the full collection <ArrowRight />
            </Link>
          </div>
          <div className="mt-9 grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 3).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="grid border-y border-ink/15 bg-white lg:grid-cols-[1.05fr_.95fr]">
        <div className="relative min-h-[58svh]">
          <Image
            src="/images/titun/wipes-lifestyle.jpg"
            alt="A guest using a TITUN wipe during an elegant dining experience"
            fill
            sizes="(max-width: 1024px) 100vw, 54vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center px-5 py-20 md:px-14 lg:px-[7vw]">
          <h2 className="font-display text-6xl leading-[.9] tracking-[-.03em]">
            Hospitality at your scale.
          </h2>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-ink/65">
            Hotels, restaurants, airlines, wellness spaces and event teams can
            build a tailored TITUN order around product, quantity and occasion.
          </p>
          <Link
            href="/corporate"
            className="mt-8 inline-flex w-fit items-center gap-4 bg-ink px-6 py-4 text-sm font-semibold text-white"
          >
            Enquire about corporate orders <ArrowRight />
          </Link>
        </div>
      </section>

      <section className="bg-linen px-5 py-24 md:px-8 md:py-36">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-6xl leading-[.9] tracking-[-.03em] md:text-8xl">
            Care can be quiet and still be remembered.
          </h2>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-ink/65">
            TITUN began with a belief that small moments of consideration can
            change how an experience feels. Renewal is not excess; it is the
            thoughtful pause that helps us return to what matters.
          </p>
          <Link
            href="/about"
            className="mt-8 inline-flex items-center gap-4 border-b border-ink pb-2 text-sm font-semibold"
          >
            Read our story <ArrowRight />
          </Link>
        </div>
      </section>
    </>
  );
}
