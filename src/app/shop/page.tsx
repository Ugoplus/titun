import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop Premium Refreshing Towels",
  description:
    "Shop TITUN refreshing towels in Green Tea, Lemongrass and Sandalwood, available in 25, 50 and 100-piece packs.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const query = await searchParams;
  const selectedCategory =
    typeof query.category === "string" ? query.category : "";
  const search = typeof query.q === "string" ? query.q.toLowerCase() : "";
  const allProducts = await getProducts();
  const categories = [
    ...new Set(allProducts.map((product) => product.category)),
  ];
  const filtered = allProducts.filter(
    (product) =>
      (!selectedCategory || product.category === selectedCategory) &&
      (!search ||
        `${product.name} ${product.scent} ${product.description}`
          .toLowerCase()
          .includes(search)),
  );

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-12 md:px-8 md:py-20">
      <div className="grid gap-8 border-b border-ink/20 pb-10 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.1em] text-ink/70">
            TITUN collection
          </p>
          <h1 className="mt-2 font-display text-[clamp(4rem,8vw,6rem)] leading-none tracking-[-.04em]">
            Shop refresh.
          </h1>
        </div>
        <form id="product-search" className="flex scroll-mt-32 border-b border-ink">
          <input
            aria-label="Search products"
            name="q"
            defaultValue={search}
            placeholder="Search by name or scent"
            className="h-12 min-w-0 flex-1 bg-transparent px-1 text-base outline-none md:w-64"
          />
          <button className="min-h-11 px-3 text-sm font-bold">Search</button>
        </form>
      </div>

      <div className="relative">
        <nav
          aria-label="Product categories"
          className="filter-scroll flex gap-2 overflow-x-auto py-7 pr-12 text-xs font-bold uppercase tracking-[.06em] md:pr-0"
        >
          <Link
            href="/shop"
            className={`min-h-11 whitespace-nowrap border px-4 py-3 ${!selectedCategory ? "bg-ink text-cream" : "border-ink/20"}`}
          >
            All
          </Link>
          {categories.map((category) => (
            <Link
              key={category}
              href={`/shop?category=${encodeURIComponent(category)}`}
              className={`min-h-11 whitespace-nowrap border px-4 py-3 ${selectedCategory === category ? "bg-ink text-cream" : "border-ink/20"}`}
            >
              {category}
            </Link>
          ))}
        </nav>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-cream to-transparent md:hidden"
        />
      </div>

      {filtered.length ? (
        <div className="grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              headingLevel="h2"
              priority={index === 0}
            />
          ))}
        </div>
      ) : (
        <div className="py-28 text-center">
          <p className="font-display text-4xl">Nothing matched that search.</p>
          <Link
            href="/shop"
            className="mt-5 inline-block border-b border-ink text-sm font-bold"
          >
            Clear filters
          </Link>
        </div>
      )}

      <section id="wipes" className="mt-24 scroll-mt-28 border-t border-ink/20 pt-14">
        <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
          <h2 className="font-display text-6xl leading-[.9] tracking-[-.03em]">Refreshing wet wipes</h2>
          <div className="max-w-xl lg:justify-self-end">
            <p className="text-base leading-relaxed text-ink/65">A separate 40 GSM spunlace nonwoven format for dining, travel and movement. Retail pack pricing is being finalised.</p>
            <Link href="/corporate?product=Refreshing%20wet%20wipes" className="mt-5 inline-flex items-center gap-3 border-b border-ink pb-2 text-sm font-semibold">Enquire about wipes <ArrowRight /></Link>
          </div>
        </div>
        <div className="mt-9 grid gap-4 sm:grid-cols-3">
          {[
            ["Green Tea", "/images/titun/green-tea-wipes.jpg"],
            ["Sandalwood", "/images/titun/sandalwood-wipes.jpg"],
            ["Lemongrass", "/images/titun/lemongrass-wipes.jpg"],
          ].map(([name, image]) => (
            <figure key={name} className="border border-ink/15 bg-white">
              <div className="relative aspect-square"><Image src={image} alt={`${name} TITUN wet wipe`} fill className="object-cover" /></div>
              <figcaption className="border-t border-ink/15 p-4 font-display text-2xl">{name}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
