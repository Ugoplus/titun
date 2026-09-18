import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { ProductCard } from "@/components/product-card";
import { ScentShopCard } from "@/components/scent-shop-card";
import { HomeHeroSlideshow } from "@/components/home-hero-slideshow";
import { StructuredData } from "@/components/structured-data";
import { getProducts } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/site";
import { formatMoney } from "@/lib/money";
import { getPackOptions } from "@/lib/product-pricing";
import { getSiteAssetMap, type SiteAssetKey } from "@/lib/site-assets";
import { getHomepageCopy, getHomepageHeroSlides } from "@/lib/site-content";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const productDetails = [
  ["Individually sealed", "Presented one by one for freshness and convenience."],
  ["Three signature scents", "Green Tea, Lemongrass and Sandalwood."],
  ["A generous towel", "Microfiber, 21 × 21 cm and 34 grams."],
  ["Ready for many settings", "Dining, travel, wellness, events and everyday care."],
] as const;

const applicationDefinitions = [
  { titleKey: "applicationDiningTitle", copyKey: "applicationDiningCopy", assetKey: "home.application.dining" },
  { titleKey: "applicationWellnessTitle", copyKey: "applicationWellnessCopy", assetKey: "home.application.wellness" },
  { titleKey: "applicationTravelTitle", copyKey: "applicationTravelCopy", assetKey: "home.application.travel" },
] as const;

const collectionDefinitions = [
  {
    titleKey: "collectionTowelsTitle",
    copyKey: "collectionTowelsCopy",
    assetKey: "home.collection.towels",
    href: "/shop?category=Refreshing%20towels",
  },
  {
    titleKey: "collectionWipesTitle",
    copyKey: "collectionWipesCopy",
    assetKey: "home.collection.wipes",
    href: "/shop#wipes",
  },
  {
    titleKey: "collectionGiftTitle",
    copyKey: "collectionGiftCopy",
    assetKey: "home.collection.gift",
    href: "/products/titun-discovery-gift-box",
  },
] as const;

const scentStories = [
  {
    name: "Green Tea",
    assetKey: "home.scent.green-tea",
    towelSlug: "green-tea-refreshing-towel",
    wipeSlug: "green-tea-refreshing-wipes",
  },
  {
    name: "Lemongrass",
    assetKey: "home.scent.lemongrass",
    towelSlug: "lemongrass-refreshing-towel",
    wipeSlug: "lemongrass-refreshing-wipes",
  },
  {
    name: "Sandalwood",
    assetKey: "home.scent.sandalwood",
    towelSlug: "sandalwood-refreshing-towel",
    wipeSlug: "sandalwood-refreshing-wipes",
  },
] as const;

export default async function Home() {
  const [products, siteImages, homepageCopy] = await Promise.all([
    getProducts(),
    getSiteAssetMap(),
    getHomepageCopy(),
  ]);
  const heroSlides = await getHomepageHeroSlides(siteImages);
  const productsBySlug = new Map(products.map((product) => [product.slug, product]));
  const towels = products.filter((product) => product.category === "Refreshing towels");
  const wipes = products.filter((product) => product.category === "Refreshing wet wipes");
  const wipeMinimums = wipes.map((product) => getPackOptions(product)[0]);
  const minimumWipeQuantity = wipeMinimums.length > 0
    ? Math.min(...wipeMinimums.map((option) => option.quantity))
    : null;
  const lowestWipeUnitPrice = wipeMinimums.length > 0
    ? Math.min(...wipeMinimums.map((option) => Math.round(option.total / option.quantity)))
    : null;

  return (
    <>
      <StructuredData data={{ "@context": "https://schema.org", "@type": "OnlineStore", name: "TITUN", url: absoluteUrl("/"), description: "Premium refreshing towels and wipes for hospitality, travel, wellness and everyday rituals.", image: absoluteUrl("/images/titun/green-tea-towel.jpg"), currenciesAccepted: "NGN" }} />

      <HomeHeroSlideshow slides={heroSlides} />

      <section className="border-b border-ink/15 bg-cream px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col gap-4 border-b border-ink/20 pb-7 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-2xl text-balance font-display text-5xl leading-[.94] tracking-[-.03em] md:text-6xl">
              {homepageCopy.collectionHeading}
            </h2>
            <Link href="/shop" className="inline-flex w-fit items-center gap-3 border-b border-ink pb-2 text-sm font-semibold">
              View all products <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {collectionDefinitions.map((collection) => (
              <Link key={collection.titleKey} href={collection.href} className="group relative min-h-96 overflow-hidden bg-ink text-white md:min-h-[30rem]">
                <Image
                  src={siteImages[collection.assetKey as SiteAssetKey]}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025] group-focus-visible:scale-[1.025] motion-reduce:transition-none"
                />
                <div className="absolute inset-0 bg-ink/55 transition-colors group-hover:bg-ink/65 group-focus-visible:bg-ink/65" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
                  <h3 className="max-w-[13ch] font-display text-4xl leading-[.95] tracking-[-.025em]">{homepageCopy[collection.titleKey]}</h3>
                  <p className="mt-3 max-w-[38ch] text-sm leading-relaxed text-white/90">{homepageCopy[collection.copyKey]}</p>
                  <span className="mt-5 inline-flex min-h-11 items-center gap-3 border-b border-white pb-1 text-sm font-semibold">
                    Explore <ArrowRight aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="text-center">
            <h2 className="font-display text-5xl tracking-[-.03em] md:text-6xl">{homepageCopy.towelsHeading}</h2>
            <div className="mt-7 flex flex-wrap justify-center gap-2 text-sm font-semibold">
              <Link href="/shop?category=Refreshing%20towels" className="min-h-11 border border-ink bg-ink px-5 py-3 text-white">Shop all towels</Link>
              <Link href="/shop#wipes" className="min-h-11 border border-ink/25 px-5 py-3">Shop wet wipes</Link>
            </div>
          </div>
          <div className="filter-scroll mt-10 grid snap-x snap-mandatory grid-flow-col auto-cols-[82%] gap-4 overflow-x-auto pb-3 sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-2 sm:overflow-visible xl:grid-cols-3">
            {towels.map((product, index) => <ProductCard key={product.id} product={product} index={index} priority={index === 0} />)}
          </div>
          <div className="mt-16 border-t border-ink/20 pt-10 md:mt-24 md:pt-14">
            <h3 className="font-display text-4xl tracking-[-.025em] md:text-5xl">{homepageCopy.scentsHeading}</h3>
            <div className="filter-scroll mt-8 grid snap-x snap-mandatory grid-flow-col auto-cols-[82%] gap-3 overflow-x-auto pb-3 sm:auto-cols-[46%] lg:grid-flow-row lg:auto-cols-auto lg:grid-cols-3 lg:overflow-visible">
              {scentStories.map((scent) => (
                <ScentShopCard
                  key={scent.name}
                  name={scent.name}
                  image={siteImages[scent.assetKey as SiteAssetKey]}
                  towel={productsBySlug.get(scent.towelSlug)}
                  wipe={productsBySlug.get(scent.wipeSlug)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-ink/15 bg-cream px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1320px]">
          <div className="text-center">
            <h2 className="font-display text-5xl leading-[.95] tracking-[-.03em] lg:whitespace-nowrap lg:text-[clamp(2.75rem,4.2vw,3.75rem)]">{homepageCopy.applicationsHeading}</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink/65">{homepageCopy.applicationsCopy}</p>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {applicationDefinitions.map((application) => (
              <article key={application.titleKey}>
                <div className="relative aspect-[4/3] overflow-hidden bg-oat"><Image src={siteImages[application.assetKey as SiteAssetKey]} alt={`${homepageCopy[application.titleKey]} with TITUN refreshing towels`} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" /></div>
                <h3 className="mt-5 font-display text-3xl">{homepageCopy[application.titleKey]}</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/65">{homepageCopy[application.copyKey]}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
          <div>
            <h2 className="font-display text-5xl leading-[.92] tracking-[-.03em] lg:whitespace-nowrap lg:text-[2.5rem] xl:text-5xl">{homepageCopy.whyHeading}</h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink/65">{homepageCopy.whyCopy}</p>
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

      {wipes.length > 0 && minimumWipeQuantity !== null && lowestWipeUnitPrice !== null && <section id="wipes" className="border-y border-ink/15 bg-linen px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
            <h2 className="font-display text-5xl leading-[.92] tracking-[-.03em] md:text-6xl">{homepageCopy.wipesHeading}</h2>
            <div className="max-w-2xl lg:justify-self-end">
              <p className="text-base leading-relaxed text-ink/65">{homepageCopy.wipesCopy} From {formatMoney(lowestWipeUnitPrice)} per wipe, available from {minimumWipeQuantity} pieces.</p>
              <Link href="/shop?category=Refreshing%20wet%20wipes" className="mt-5 inline-flex items-center gap-3 border-b border-ink pb-2 text-sm font-semibold">Shop wet wipes <ArrowRight /></Link>
            </div>
          </div>
          <div className="filter-scroll mt-10 grid snap-x snap-mandatory grid-flow-col auto-cols-[82%] gap-3 overflow-x-auto pb-3 sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3 lg:gap-4">
            {wipes.map((product) => {
              const minimumPack = getPackOptions(product)[0];
              return <Link key={product.id} href={`/products/${product.slug}`} className="group snap-start bg-white">
                <div className="relative aspect-square overflow-hidden"><Image src={product.images[0]} alt={`${product.name} product packaging`} fill sizes="(max-width: 640px) 82vw, (max-width: 1024px) 50vw, 30vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02] group-focus-visible:scale-[1.02] motion-reduce:transition-none" /></div>
                <div className="border border-ink/15 p-3 md:p-4">
                  <p className="text-sm font-semibold">{product.name}</p>
                  <p className="mt-1 text-sm text-ink/65">{formatMoney(minimumPack.total, product.currency)} · {minimumPack.label}</p>
                </div>
              </Link>;
            })}
          </div>
        </div>
      </section>}

      <section className="bg-white px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-[1320px] overflow-hidden bg-linen lg:grid-cols-[1.05fr_.95fr]">
          <div className="relative min-h-[28rem] lg:min-h-[38rem]"><Image src={siteImages["home.corporate"]} alt="A guest using a TITUN wipe during a hospitality experience" fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" /></div>
          <div className="flex flex-col justify-center px-6 py-14 md:px-12 lg:px-16">
            <h2 className="font-display text-5xl leading-[.92] tracking-[-.03em] lg:whitespace-nowrap lg:text-[2.75rem] xl:text-5xl">{homepageCopy.corporateHeading}</h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-ink/65">{homepageCopy.corporateCopy}</p>
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
        <div className="mx-auto max-w-[1320px]">
          <h2 className="font-display text-5xl leading-[.92] tracking-[-.03em] lg:whitespace-nowrap lg:text-[clamp(2.5rem,3.6vw,3.25rem)]">{homepageCopy.storyHeading}</h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink/65">{homepageCopy.storyCopy}</p>
          <Link href="/about" className="mt-7 inline-flex items-center gap-3 border-b border-ink pb-2 text-sm font-semibold">Read the TITUN story <ArrowRight /></Link>
        </div>
      </section>
    </>
  );
}
