import { redirect } from "next/navigation";
import { AdminNavigation } from "@/components/admin/admin-navigation";
import { HomepageContentManager } from "@/components/admin/homepage-content-manager";
import { HomepageCopyManager } from "@/components/admin/homepage-copy-manager";
import { ProductImageManager } from "@/components/admin/product-image-manager";
import { SiteImageManager } from "@/components/admin/site-image-manager";
import { adminCan, getAdminIdentity } from "@/lib/auth";
import { getHomepageCopy, getHomepageHeroSlides } from "@/lib/site-content";
import { getSiteAssetRecords } from "@/lib/site-assets";
import { getProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const identity = await getAdminIdentity();
  if (!identity) redirect("/admin/login");
  if (!adminCan(identity, "site_assets:manage")) redirect("/admin?error=forbidden");

  const canManageProducts = adminCan(identity, "products:manage");
  const [slides, content, assets, products] = await Promise.all([
    getHomepageHeroSlides(),
    getHomepageCopy(),
    getSiteAssetRecords(),
    canManageProducts ? getProducts() : Promise.resolve([]),
  ]);
  const otherAssets = assets.filter(({ key }) => !key.startsWith("home.hero."));

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-10 md:px-8 md:py-16">
      <AdminNavigation identity={identity} />
      <div className="mt-10 border-b border-ink/20 pb-8">
        <h1 className="font-display text-6xl tracking-[-.035em] md:text-8xl">
          Website content.
        </h1>
        <p className="mt-5 max-w-[68ch] leading-relaxed text-ink/70">
          Keep the storefront current without touching the website code. Start with the homepage slideshow, then replace supporting images below.
        </p>
      </div>

      <nav aria-label="Website content sections" className="flex flex-wrap gap-2 border-b border-ink/20 py-5">
        <a href="#homepage-slideshow" className="inline-flex min-h-11 items-center border border-ink bg-ink px-4 text-sm font-semibold text-white">
          Homepage slideshow
        </a>
        <a href="#homepage-text" className="inline-flex min-h-11 items-center border border-ink/30 px-4 text-sm font-semibold hover:border-ink">
          Homepage text
        </a>
        {canManageProducts && (
          <a href="#product-images" className="inline-flex min-h-11 items-center border border-ink/30 px-4 text-sm font-semibold hover:border-ink">
            Product images
          </a>
        )}
        <a href="#other-website-images" className="inline-flex min-h-11 items-center border border-ink/30 px-4 text-sm font-semibold hover:border-ink">
          Other website images
        </a>
      </nav>

      <HomepageContentManager initialSlides={slides} />
      <HomepageCopyManager initialContent={content} />
      {canManageProducts && <ProductImageManager initialProducts={products} />}
      <SiteImageManager initialAssets={otherAssets} />
    </main>
  );
}
