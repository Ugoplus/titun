import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/catalog";
import { getUpcomingEvents } from "@/lib/community";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

const publicPages = [
  "",
  "/shop",
  "/about",
    "/corporate",
    "/custom-orders",
  "/community",
  "/contact",
  "/faqs",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, events] = await Promise.all([
    getProducts(),
    getUpcomingEvents(),
  ]);

  return [
    ...publicPages.map((path, index) => ({
      url: absoluteUrl(path || "/"),
      lastModified: new Date(),
      changeFrequency: index === 0 ? "weekly" as const : "monthly" as const,
      priority: index === 0 ? 1 : path === "/shop" ? 0.9 : 0.7,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/products/${product.slug}`),
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: product.images.map((image) => absoluteUrl(image)),
    })),
    ...events.map((event) => ({
      url: absoluteUrl(`/community/events/${event.slug}`),
      lastModified: event.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: event.image ? [absoluteUrl(event.image)] : undefined,
    })),
  ];
}
