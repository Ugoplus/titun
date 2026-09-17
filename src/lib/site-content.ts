import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { siteContent } from "@/lib/db/schema";
import { getSiteAssetMap, type SiteAssetKey } from "@/lib/site-assets";

export const homepageHeroKey = "home.hero.slides";

const localMediaPath = /^\/(?:uploads|images|videos)\/[a-zA-Z0-9_./-]+$/;

export const homepageHeroSlideSchema = z.object({
  id: z.string().min(1).max(80),
  mediaType: z.enum(["image", "video"]),
  mediaUrl: z.string().regex(localMediaPath, "Choose an uploaded image or video"),
  posterUrl: z.string().regex(localMediaPath, "Choose an uploaded poster image").optional().or(z.literal("")),
  title: z.string().trim().min(1, "Add a slide heading").max(90, "Keep the heading under 90 characters"),
  copy: z.string().trim().min(1, "Add a short description").max(240, "Keep the description under 240 characters"),
  alt: z.string().trim().max(160, "Keep the image description under 160 characters"),
  durationMs: z.number().int().min(3000).max(15000),
});

export const homepageHeroSlidesSchema = z.array(homepageHeroSlideSchema).min(1).max(6);
export type HomepageHeroSlide = z.infer<typeof homepageHeroSlideSchema>;

export function defaultHomepageHeroSlides(
  images: Record<SiteAssetKey, string>,
): HomepageHeroSlide[] {
  return [
    {
      id: "renewal-film",
      mediaType: "video",
      mediaUrl: "/videos/titun-renewal.mp4",
      posterUrl: "/videos/titun-renewal-poster.jpg",
      durationMs: 7000,
      alt: "",
      title: "The Art of Renewal",
      copy: "Scented refreshing towels for moments of welcome, movement and everyday care.",
    },
    {
      id: "thoughtful-welcome",
      mediaType: "image",
      mediaUrl: images["home.hero.two"],
      posterUrl: "",
      durationMs: 4500,
      alt: "A guest enjoying a TITUN refreshing wipe",
      title: "A thoughtful welcome",
      copy: "A simple gesture, made memorable through scent, softness and considered presentation.",
    },
    {
      id: "life-in-motion",
      mediaType: "image",
      mediaUrl: images["home.hero.three"],
      posterUrl: "",
      durationMs: 4500,
      alt: "TITUN refreshing towels prepared for travel and movement",
      title: "Refresh wherever life moves",
      copy: "Individually sealed and ready for travel, dining, wellness and the everyday in between.",
    },
  ];
}

export async function getHomepageHeroSlides(
  suppliedImages?: Record<SiteAssetKey, string>,
): Promise<HomepageHeroSlide[]> {
  const images = suppliedImages ?? await getSiteAssetMap();
  const defaults = defaultHomepageHeroSlides(images);
  if (!isDatabaseConfigured()) return defaults;

  const [record] = await getDb()
    .select({ content: siteContent.content })
    .from(siteContent)
    .where(eq(siteContent.key, homepageHeroKey))
    .limit(1);
  if (!record) return defaults;
  const parsed = homepageHeroSlidesSchema.safeParse(record.content);
  return parsed.success ? parsed.data : defaults;
}
