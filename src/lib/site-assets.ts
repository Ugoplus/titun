import { inArray } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { siteAssets } from "@/lib/db/schema";

export const siteAssetDefaults = [
  ["home.hero.one", "Homepage hero — slide 1", "/images/titun/hero-lounge.jpg"],
  ["home.hero.two", "Homepage hero — slide 2", "/images/titun/wipes-lifestyle.jpg"],
  ["home.hero.three", "Homepage hero — slide 3", "/images/titun/movement-kit.jpg"],
  ["home.collection.towels", "Collection tile — towels", "/images/titun/green-tea-towel.jpg"],
  ["home.collection.wipes", "Collection tile — wipes", "/images/titun/lemongrass-wipes.jpg"],
  ["home.collection.gift", "Collection tile — gift box", "/images/titun/gift-box.jpg"],
  ["home.scent.green-tea", "Scent story — Green Tea", "/images/titun/scent-green-tea.jpg"],
  ["home.scent.lemongrass", "Scent story — Lemongrass", "/images/titun/scent-lemongrass.jpg"],
  ["home.scent.sandalwood", "Scent story — Sandalwood", "/images/titun/scent-sandalwood.jpg"],
  ["home.application.dining", "Application — dining", "/images/titun/hero-lounge.jpg"],
  ["home.application.wellness", "Application — wellness", "/images/titun/ritual-spa.jpg"],
  ["home.application.travel", "Application — travel", "/images/titun/movement-kit.jpg"],
  ["home.corporate", "Homepage corporate section", "/images/titun/wipes-lifestyle.jpg"],
  ["about.hero", "About page", "/images/titun/hero-lounge.jpg"],
  ["corporate.hero", "Corporate page", "/images/titun/wipes-lifestyle.jpg"],
  ["community.hero", "Community page", "/images/titun/hero-lounge.jpg"],
] as const;

export type SiteAssetKey = (typeof siteAssetDefaults)[number][0];
export const siteAssetKeys = new Set<string>(siteAssetDefaults.map(([key]) => key));

export async function getSiteAssetMap() {
  const defaults = Object.fromEntries(siteAssetDefaults.map(([key, , url]) => [key, url])) as Record<SiteAssetKey, string>;
  if (!isDatabaseConfigured()) return defaults;
  const rows = await getDb().select().from(siteAssets).where(inArray(siteAssets.key, [...siteAssetKeys]));
  for (const row of rows) defaults[row.key as SiteAssetKey] = row.url;
  return defaults;
}

export async function getSiteAssetRecords() {
  const map = await getSiteAssetMap();
  return siteAssetDefaults.map(([key, label]) => ({ key, label, url: map[key] }));
}
