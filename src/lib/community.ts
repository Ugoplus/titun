import { and, asc, desc, eq, gt } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import {
  eventProducts,
  events,
  products,
  type Event,
  type Product,
} from "@/lib/db/schema";
import { sampleProducts } from "@/lib/catalog";

export type CommunityEvent = Event & {
  ticketProduct: Product;
  recommendedProducts: Product[];
};

const sampleTicket: Product = {
  ...sampleProducts[0],
  id: "55555555-5555-4555-8555-555555555555",
  slug: "renewal-table-ticket",
  name: "The Renewal Table — Admission",
  scent: "Community experience",
  description:
    "An intimate afternoon of thoughtful conversation, dining and everyday renewal with the TITUN community.",
  category: "Community event",
  packSize: "1 guest admission",
  price: 3500000,
  stockOnHand: 40,
  stockReserved: 0,
  images: ["/images/titun/hero-lounge.jpg"],
};

const sampleEvent: CommunityEvent = {
  id: "66666666-6666-4666-8666-666666666666",
  slug: "the-renewal-table",
  title: "The Renewal Table",
  description:
    "An intimate afternoon for the TITUN community—thoughtful conversation, beautiful dining and a shared ritual of renewal.",
  story:
    "The Renewal Table begins with a simple belief: gathering well can change the texture of an ordinary week. Around one considered table, guests share food, thoughtful conversation and the small rituals that help us return to ourselves.\n\nThis is an unhurried afternoon shaped around welcome. Expect a calm setting, a shared meal and space to meet people who value care, curiosity and renewal.",
  venue: "Lagos · Venue shared with confirmed guests",
  startsAt: new Date("2026-10-24T13:00:00+01:00"),
  image: "/images/titun/hero-lounge.jpg",
  galleryImages: [
    "/images/titun/ritual-spa.jpg",
    "/images/titun/wipes-lifestyle.jpg",
  ],
  videoUrl: null,
  registrationUrl: null,
  ctaLabel: "Reserve your place",
  ticketProductId: sampleTicket.id,
  published: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ticketProduct: sampleTicket,
  recommendedProducts: sampleProducts.slice(0, 3),
};

export const getUpcomingEvents = async (): Promise<CommunityEvent[]> => {
  if (!isDatabaseConfigured())
    return process.env.NODE_ENV === "development" ? [sampleEvent] : [];
  const db = getDb();
  const records = await db
    .select()
    .from(events)
    .where(and(eq(events.published, true), gt(events.startsAt, new Date())))
    .orderBy(asc(events.startsAt));
  return Promise.all(
    records.map(async (event) => {
      const [ticketProduct] = await db
        .select()
        .from(products)
        .where(eq(products.id, event.ticketProductId))
        .limit(1);
      const recommended = await db
        .select({ product: products })
        .from(eventProducts)
        .innerJoin(products, eq(eventProducts.productId, products.id))
        .where(eq(eventProducts.eventId, event.id))
        .orderBy(asc(eventProducts.displayOrder));
      return {
        ...event,
        ticketProduct,
        recommendedProducts: recommended.map((item) => item.product),
      };
    }),
  );
};

export const getPublishedEvents = async (): Promise<CommunityEvent[]> => {
  if (!isDatabaseConfigured())
    return process.env.NODE_ENV === "development" ? [sampleEvent] : [];
  const db = getDb();
  const records = await db
    .select()
    .from(events)
    .where(eq(events.published, true))
    .orderBy(desc(events.startsAt));
  return Promise.all(
    records.map(async (event) => {
      const [ticketProduct] = await db
        .select()
        .from(products)
        .where(eq(products.id, event.ticketProductId))
        .limit(1);
      const recommended = await db
        .select({ product: products })
        .from(eventProducts)
        .innerJoin(products, eq(eventProducts.productId, products.id))
        .where(eq(eventProducts.eventId, event.id))
        .orderBy(asc(eventProducts.displayOrder));
      return {
        ...event,
        ticketProduct,
        recommendedProducts: recommended.map((item) => item.product),
      };
    }),
  );
};

export const getCommunityEventBySlug = async (
  slug: string,
): Promise<CommunityEvent | null> => {
  if (!isDatabaseConfigured())
    return process.env.NODE_ENV === "development" && slug === sampleEvent.slug
      ? sampleEvent
      : null;
  const db = getDb();
  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.slug, slug), eq(events.published, true)))
    .limit(1);
  if (!event) return null;
  const [ticketProduct] = await db
    .select()
    .from(products)
    .where(eq(products.id, event.ticketProductId))
    .limit(1);
  const recommended = await db
    .select({ product: products })
    .from(eventProducts)
    .innerJoin(products, eq(eventProducts.productId, products.id))
    .where(eq(eventProducts.eventId, event.id))
    .orderBy(asc(eventProducts.displayOrder));
  return {
    ...event,
    ticketProduct,
    recommendedProducts: recommended.map((item) => item.product),
  };
};
