import { redirect } from "next/navigation";
import { AdminNavigation } from "@/components/admin/admin-navigation";
import { HomepageContentManager } from "@/components/admin/homepage-content-manager";
import { SiteImageManager } from "@/components/admin/site-image-manager";
import { adminCan, getAdminIdentity } from "@/lib/auth";
import { getHomepageHeroSlides } from "@/lib/site-content";
import { getSiteAssetRecords } from "@/lib/site-assets";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const identity = await getAdminIdentity();
  if (!identity) redirect("/admin/login");
  if (!adminCan(identity, "site_assets:manage")) redirect("/admin?error=forbidden");

  const [slides, assets] = await Promise.all([
    getHomepageHeroSlides(),
    getSiteAssetRecords(),
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

      <HomepageContentManager initialSlides={slides} />
      <SiteImageManager initialAssets={otherAssets} />
    </main>
  );
}
