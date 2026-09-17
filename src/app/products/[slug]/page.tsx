import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { ProductVisual } from "@/components/product-visual";
import { StructuredData } from "@/components/structured-data";
import { getProductBySlug } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { getPackOptions, isRefreshingTowel } from "@/lib/product-pricing";
import { absoluteUrl } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found", robots: { index: false } };
  const image = product.images[0] || "/images/titun/hero-lounge.jpg";

  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description: product.description,
      images: [{ url: image, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: [image],
    },
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const available = product.stockOnHand - product.stockReserved;
  const packOptions = getPackOptions(product);
  const isTowel = isRefreshingTowel(product);
  const inStock = available >= packOptions[0].quantity;

  return (
    <div className="grid min-h-[75svh] lg:grid-cols-[1.1fr_.9fr]">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          image: product.images.map((image) => absoluteUrl(image)),
          sku: product.slug,
          brand: { "@type": "Brand", name: "TITUN" },
          offers: packOptions.map((option) => ({
            "@type": "Offer",
            name: option.label,
            url: absoluteUrl(`/products/${product.slug}`),
            priceCurrency: product.currency,
            price: (option.total / 100).toFixed(2),
            availability: available >= option.quantity
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
          })),
        }}
      />
      <ProductVisual
        images={product.images}
        name={product.name}
        className="min-h-[55svh] lg:min-h-full"
        priority
      />
      <div className="flex items-center px-5 py-12 md:px-12 lg:px-[10%]">
        <div className="w-full max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[.1em] text-ink/70">
            {product.category}
          </p>
          <h1 className="mt-4 whitespace-nowrap font-display text-[clamp(1.625rem,6vw,2.625rem)] leading-none tracking-[-.03em]">
            {product.name}
          </h1>
          <p className="mt-6 text-sm font-bold">{product.scent}</p>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-ink/70">
            {product.description}
          </p>
          <dl className="my-8 grid grid-cols-2 border-y border-ink/20 py-5 text-sm">
            <div>
              <dt className="text-xs text-ink/70">Pack size</dt>
              <dd className="mt-1 font-bold">{product.packSize}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink/70">Availability</dt>
              <dd className="mt-1 font-bold">
                {inStock ? "In stock" : "Sold out"}
              </dd>
            </div>
          </dl>
          <p className="mb-6 text-xl font-bold tabular-nums">
            {packOptions.length > 1 ? "From " : ""}
            {formatMoney(packOptions[0].total, product.currency)}
          </p>
          <AddToCart product={product} />
          <div className="mt-8 grid gap-2 text-xs text-ink/70">
            <p>✓ Secure checkout with Paystack or Stripe</p>
            <p>✓ Delivery updates by email</p>
            <p>✓ Individually sealed for freshness</p>
          </div>
        </div>
      </div>
      {isTowel && (
        <section className="border-t border-ink/15 bg-white px-5 py-16 md:px-8 md:py-24 lg:col-span-2">
          <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <h2 className="font-display text-5xl tracking-[-.03em] md:text-6xl">
                Made for the moment before what comes next.
              </h2>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-ink/70">
                Each towel arrives individually sealed. Open, unfold and use on
                the hands, face or neck for a considered moment of refreshment.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Product details</h3>
              <dl className="mt-5 grid border-t border-ink/20 sm:grid-cols-2">
                {[
                  ["Material", "Microfiber"],
                  ["Towel size", "21 × 21 cm"],
                  ["Weight", "34 grams"],
                  ["Scent", "Fragrance oils"],
                  ["Packaging", "Individually packaged"],
                  ["Storage", "Store in a cool, dry place"],
                ].map(([term, detail]) => (
                  <div
                    key={term}
                    className="border-b border-ink/20 py-5 sm:pr-8"
                  >
                    <dt className="text-xs text-ink/60">{term}</dt>
                    <dd className="mt-1 text-sm font-semibold">{detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
