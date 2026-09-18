import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { siteContent } from "@/lib/db/schema";
import { getSiteAssetMap, type SiteAssetKey } from "@/lib/site-assets";

export const homepageHeroKey = "home.hero.slides";
export const homepageCopyKey = "home.copy";

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

const shortHeading = z.string().trim().min(1, "Add a heading").max(90, "Keep headings under 90 characters");
const shortCopy = z.string().trim().min(1, "Add a short description").max(320, "Keep descriptions under 320 characters");

export const homepageCopySchema = z.object({
  collectionHeading: shortHeading,
  collectionTowelsTitle: shortHeading,
  collectionTowelsCopy: shortCopy,
  collectionWipesTitle: shortHeading,
  collectionWipesCopy: shortCopy,
  collectionGiftTitle: shortHeading,
  collectionGiftCopy: shortCopy,
  towelsHeading: shortHeading,
  scentsHeading: shortHeading,
  scentGreenTeaTagline: shortHeading,
  scentGreenTeaCopy: shortCopy,
  scentLemongrassTagline: shortHeading,
  scentLemongrassCopy: shortCopy,
  scentSandalwoodTagline: shortHeading,
  scentSandalwoodCopy: shortCopy,
  applicationsHeading: shortHeading,
  applicationsCopy: shortCopy,
  applicationDiningTitle: shortHeading,
  applicationDiningCopy: shortCopy,
  applicationWellnessTitle: shortHeading,
  applicationWellnessCopy: shortCopy,
  applicationTravelTitle: shortHeading,
  applicationTravelCopy: shortCopy,
  whyHeading: shortHeading,
  whyCopy: shortCopy,
  wipesHeading: shortHeading,
  wipesCopy: shortCopy,
  corporateHeading: shortHeading,
  corporateCopy: shortCopy,
  storyHeading: shortHeading,
  storyCopy: shortCopy,
});

export type HomepageCopy = z.infer<typeof homepageCopySchema>;

export const defaultHomepageCopy: HomepageCopy = {
  collectionHeading: "Shop the collection",
  collectionTowelsTitle: "Refreshing towels",
  collectionTowelsCopy: "Explore Green Tea, Lemongrass and Sandalwood in 25, 50 or 100-piece packs.",
  collectionWipesTitle: "Refreshing wet wipes",
  collectionWipesCopy: "A light, individually wrapped refresh for dining, travel and movement.",
  collectionGiftTitle: "Gift boxes and multipacks",
  collectionGiftCopy: "Considered presentation for gifting, hosting and elevated occasions.",
  towelsHeading: "Our refreshing towels",
  scentsHeading: "Discover the scents",
  scentGreenTeaTagline: "Pause, breathe and begin again.",
  scentGreenTeaCopy: "A delicate veil of green tea creates a moment of calm and clarity, leaving you feeling fresh, serene and beautifully renewed.",
  scentLemongrassTagline: "A little brightness offers a fresh beginning.",
  scentLemongrassCopy: "Crisp lemongrass awakens the senses with clean citrus freshness, creating an invigorating pause that leaves you feeling renewed.",
  scentSandalwoodTagline: "A gentle warmth lingers.",
  scentSandalwoodCopy: "Smooth sandalwood wraps the senses in rich, earthy warmth that feels subtle, sensual and quietly luxurious.",
  applicationsHeading: "A small detail with a lasting effect.",
  applicationsCopy: "TITUN turns a practical moment of refreshment into a thoughtful gesture—easy to offer, pleasant to receive and ready when needed.",
  applicationDiningTitle: "Dining and hospitality",
  applicationDiningCopy: "A considered detail for restaurants, hotels and private occasions.",
  applicationWellnessTitle: "Wellness and care",
  applicationWellnessCopy: "A clean pause for spas, salons, studios and personal routines.",
  applicationTravelTitle: "Travel and movement",
  applicationTravelCopy: "Individually wrapped refreshment for journeys, fitness and busy days.",
  whyHeading: "Why choose TITUN?",
  whyCopy: "Clear product details, purposeful presentation and flexible pack choices make TITUN easy to bring into personal and professional settings.",
  wipesHeading: "Refreshing wet wipes",
  wipesCopy: "A lighter 40 GSM spunlace nonwoven format for dining, travel and movement.",
  corporateHeading: "Your welcome, your scale.",
  corporateCopy: "Hotels, restaurants, airlines, wellness spaces, event teams and private hosts can build a TITUN order around product, scent, quantity and occasion.",
  storyHeading: "Care can be quiet and still be remembered.",
  storyCopy: "TITUN began with a belief that small moments of consideration can change how an experience feels.",
};

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

export async function getHomepageCopy(): Promise<HomepageCopy> {
  if (!isDatabaseConfigured()) return defaultHomepageCopy;
  const [record] = await getDb()
    .select({ content: siteContent.content })
    .from(siteContent)
    .where(eq(siteContent.key, homepageCopyKey))
    .limit(1);
  if (!record) return defaultHomepageCopy;
  const stored = record.content && typeof record.content === "object"
    ? record.content as Partial<HomepageCopy>
    : {};
  const parsed = homepageCopySchema.safeParse({ ...defaultHomepageCopy, ...stored });
  return parsed.success ? parsed.data : defaultHomepageCopy;
}
