import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { ProductCard } from "@/components/product-card";
import { StructuredData } from "@/components/structured-data";
import { getProducts } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const productDetails = [
  ["Individually sealed", "Presented one by one for freshness and convenience."],
  ["Three signature scents", "Green Tea, Lemongrass and Sandalwood."],
  ["A generous towel", "Microfiber, 21 × 21 cm and 34 grams."],
  ["Ready for many settings", "Dining, travel, wellness, events and everyday care."],
] as const;

const applications = [
  { title: "Dining and hospitality", copy: "A considered detail for restaurants, hotels and private occasions.", image: "/images/titun/hero-lounge.jpg" },
  { title: "Wellness and care", copy: "A clean pause for spas, salons, studios and personal routines.", image: "/images/titun/ritual-spa.jpg" },
  { title: "Travel and movement", copy: "Individually wrapped refreshment for journeys, fitness and busy days.", image: "/images/titun/movement-kit.jpg" },
] as const;

const wipeScents = [
  ["Green Tea", "/images/titun/green-tea-wipes.jpg"],
  ["Sandalwood", "/images/titun/sandalwood-wipes.jpg"],
  ["Lemongrass", "/images/titun/lemongrass-wipes.jpg"],
] as const;

export default async function Home() {
  const products = await getProducts();
  const towels = products.filter((product) => product.category === "Refreshing towels");

  return (
    <>
      <StructuredData data={{ "@context": "https://schema.org", "@type": "OnlineStore", name: "TITUN", url: absoluteUrl("/"), description: "Premium refreshing towels and wipes for hospitality, travel, wellness and everyday rituals.", image: absoluteUrl("/images/titun/green-tea-towel.jpg"), currenciesAccepted: "NGN" }} />

      <section className="border-b border-ink/15 bg-[#efefed]">
        <div className="mx-auto grid min-h-[36rem] max-w-[1440px] lg:grid-cols-[.9fr_1.1fr]">
          <div className="reveal flex flex-col justify-center px-5 py-14 md:px-10 lg:px-[6vw] lg:py-20">
            <h1 className="max-w-2xl font-display text-[clamp(3.75rem,7vw,6rem)] leading-[.86] tracking-[-.035em]">The Art of Renewal</h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/70 md:text-lg">Scented refreshing towels designed to make welcome, movement and everyday care feel more considered.</p>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-ink/75">
              <span>Individually sealed</span><span>Three signature scents</span><span>25, 50 or 100 pieces</span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="inline-flex min-h-12 items-center gap-5 bg-ink px-6 text-sm font-semibold text-white">Shop refreshing towels <ArrowRight /></Link>
              <Link href="/corporate" className="inline-flex min-h-12 items-center border border-ink px-6 text-sm font-semibold">Request a quote</Link>
            </div>
          </div>
          <div className="relative min-h-[28rem] overflow-hidden lg:min-h-full">
            <Image src="/images/titun/green-tea-towel.jpg" alt="Green Tea TITUN refreshing towel and its individual packaging" fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover object-center" />
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="text-center">
            <h2 className="font-display text-5xl tracking-[-.03em] md:text-6xl">Our refreshing towels</h2>
            <div className="mt-7 flex flex-wrap justify-center gap-2 text-sm font-semibold">
              <Link href="/shop" className="min-h-11 border border-ink bg-ink px-5 py-3 text-white">All scents</Link>
              <Link href="/shop?category=Refreshing%20towels" className="min-h-11 border border-ink/25 px-5 py-3">Refreshing towels</Link>
              <Link href="/shop#wipes" className="min-h-11 border border-ink/25 px-5 py-3">Wet wipes</Link>
            </div>
          </div>
          <div className="filter-scroll mt-10 grid grid-flow-col auto-cols-[82%] gap-4 overflow-x-auto pb-3 sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-2 sm:overflow-visible xl:grid-cols-3">
            {towels.map((product, index) => <ProductCard key={product.id} product={product} index={index} priority={index === 0} />)}
          </div>
        </div>
      </section>

      <section className="border-y border-ink/15 bg-cream px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1320px]">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-5xl leading-[.95] tracking-[-.03em] md:text-6xl">A small detail with a lasting effect.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink/65">TITUN turns a practical moment of refreshment into a thoughtful gesture—easy to offer, pleasant to receive and ready when needed.</p>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {applications.map((application) => (
              <article key={application.title}>
                <div className="relative aspect-[4/3] overflow-hidden bg-oat"><Image src={application.image} alt={`${application.title} with TITUN refreshing towels`} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" /></div>
                <h3 className="mt-5 font-display text-3xl">{application.title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/65">{application.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
          <div>
            <h2 className="font-display text-5xl leading-[.92] tracking-[-.03em] md:text-6xl">Why choose TITUN?</h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink/65">Clear product details, purposeful presentation and flexible pack choices make TITUN easy to bring into personal and professional settings.</p>
            <Link href="/shop" className="mt-7 inline-flex items-center gap-3 bg-gold px-6 py-4 text-sm font-semibold text-ink">Explore the collection <ArrowRight /></Link>
          </div>
          <div className="border-t border-ink/20">
            {productDetails.map(([title, copy]) => (
              <div key={title} className="grid gap-3 border-b border-ink/20 py-6 sm:grid-cols-[1fr_1.4fr]">
                <h3 className="flex items-center gap-3 font-semibold"><CheckCircle className="text-gold" size={22} weight="fill" />{title}</h3>
                <p className="text-sm leading-relaxed text-ink/65">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="wipes" className="border-y border-ink/15 bg-linen px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
            <h2 className="font-display text-5xl leading-[.92] tracking-[-.03em] md:text-6xl">Refreshing wet wipes</h2>
            <div className="max-w-2xl lg:justify-self-end">
              <p className="text-base leading-relaxed text-ink/65">A lighter 40 GSM spunlace nonwoven format for dining, travel and movement. Retail pricing is being finalised; corporate enquiries are open now.</p>
              <Link href="/corporate?product=Refreshing%20wet%20wipes" className="mt-5 inline-flex items-center gap-3 border-b border-ink pb-2 text-sm font-semibold">Enquire about wet wipes <ArrowRight /></Link>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-2 md:gap-4">
            {wipeScents.map(([name, image]) => (
              <figure key={name} className="bg-white">
                <div className="relative aspect-square overflow-hidden"><Image src={image} alt={`${name} TITUN wet wipe`} fill sizes="(max-width: 768px) 33vw, 30vw" className="object-cover" /></div>
                <figcaption className="border border-ink/15 p-3 text-xs font-semibold md:p-4 md:text-sm">{name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-[1320px] overflow-hidden bg-[#efefed] lg:grid-cols-[1.05fr_.95fr]">
          <div className="relative min-h-[28rem] lg:min-h-[38rem]"><Image src="/images/titun/wipes-lifestyle.jpg" alt="A guest using a TITUN wipe during a hospitality experience" fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" /></div>
          <div className="flex flex-col justify-center px-6 py-14 md:px-12 lg:px-16">
            <h2 className="font-display text-5xl leading-[.92] tracking-[-.03em] md:text-6xl">Your welcome, your scale.</h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-ink/65">Hotels, restaurants, airlines, wellness spaces, event teams and private hosts can build a TITUN order around product, scent, quantity and occasion.</p>
            <Link href="/corporate" className="mt-7 inline-flex w-fit items-center gap-3 bg-ink px-6 py-4 text-sm font-semibold text-white">Request a corporate quote <ArrowRight /></Link>
          </div>
        </div>
      </section>

      <section className="border-y border-ink/15 bg-white px-5 py-10 md:px-8">
        <div className="mx-auto grid max-w-[1320px] grid-cols-2 border-l border-t border-ink/15 md:grid-cols-4">
          {["Microfiber", "21 × 21 cm", "34 grams", "Individually packaged"].map((detail) => <p key={detail} className="border-b border-r border-ink/15 p-5 text-center text-sm font-semibold">{detail}</p>)}
        </div>
      </section>

      <section className="bg-cream px-5 py-20 text-center md:px-8 md:py-28">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-5xl leading-[.92] tracking-[-.03em] md:text-6xl">Care can be quiet and still be remembered.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink/65">TITUN began with a belief that small moments of consideration can change how an experience feels.</p>
          <Link href="/about" className="mt-7 inline-flex items-center gap-3 border-b border-ink pb-2 text-sm font-semibold">Read the TITUN story <ArrowRight /></Link>
        </div>
      </section>
    </>
  );
}
