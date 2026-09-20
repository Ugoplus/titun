import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { siteContent } from "@/lib/db/schema";

export const deliveryContentKey = "delivery.page";

export const deliveryRegionSchema = z.object({
  id: z.string().min(1).max(80).regex(/^[a-zA-Z0-9_-]+$/, "The destination identifier is invalid"),
  name: z.string().trim().min(1, "Add a destination").max(80, "Keep destination names under 80 characters"),
  timeframe: z.string().trim().min(1, "Add a delivery timeframe").max(80, "Keep timeframes under 80 characters"),
});

const heading = z.string().trim().min(1, "Add a heading").max(90, "Keep headings under 90 characters");
const paragraph = z.string().trim().min(1, "Add the supporting text").max(500, "Keep supporting text under 500 characters");

export const deliveryContentSchema = z.object({
  pageTitle: heading,
  introduction: paragraph,
  nigeriaHeading: heading,
  nigeriaRegions: z.array(deliveryRegionSchema).min(1, "Add at least one Nigerian destination").max(12),
  nigeriaCourierNote: paragraph,
  internationalHeading: heading,
  internationalRegions: z.array(deliveryRegionSchema).min(1, "Add at least one international destination").max(12),
  disclaimer: paragraph,
});

export type DeliveryRegion = z.infer<typeof deliveryRegionSchema>;
export type DeliveryContent = z.infer<typeof deliveryContentSchema>;

export const defaultDeliveryContent: DeliveryContent = {
  pageTitle: "Delivery",
  introduction: "Clear delivery estimates for Nigeria, the UK and destinations worldwide.",
  nigeriaHeading: "Nigeria",
  nigeriaRegions: [
    { id: "lagos-island", name: "Lagos Island", timeframe: "2–3 working days" },
    { id: "lagos-mainland", name: "Lagos Mainland", timeframe: "2–3 working days" },
    { id: "other-nigerian-states", name: "Other States in Nigeria", timeframe: "5–10 working days" },
  ],
  nigeriaCourierNote: "For deliveries outside Lagos, TITUN currently uses GIG Logistics as its dispatch courier.",
  internationalHeading: "UK and international",
  internationalRegions: [
    { id: "england", name: "England", timeframe: "5–10 working days" },
    { id: "rest-of-world", name: "Rest of the World", timeframe: "10–20 working days" },
  ],
  disclaimer: "Delivery times are estimated from the date your order is dispatched and may vary slightly depending on the destination, courier operations and circumstances outside of TITUN’s control.",
};

export async function getDeliveryContent(): Promise<DeliveryContent> {
  if (!isDatabaseConfigured()) return defaultDeliveryContent;
  const [record] = await getDb()
    .select({ content: siteContent.content })
    .from(siteContent)
    .where(eq(siteContent.key, deliveryContentKey))
    .limit(1);
  if (!record) return defaultDeliveryContent;
  const stored = record.content && typeof record.content === "object"
    ? record.content as Partial<DeliveryContent>
    : {};
  const parsed = deliveryContentSchema.safeParse({ ...defaultDeliveryContent, ...stored });
  return parsed.success ? parsed.data : defaultDeliveryContent;
}
