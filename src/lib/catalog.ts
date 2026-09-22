import { and, asc, eq, ne } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { products, type Product } from "@/lib/db/schema";

const now = new Date();
export const sampleProducts: Product[] = [
  {
    id: "11111111-1111-4111-8111-111111111111", slug: "green-tea-refreshing-towel", name: "Green Tea Refreshing Towel", scent: "Fresh · Clean · Restorative", description: "A soft, individually wrapped towel with a clean green-tea scent for graceful everyday refreshment.", category: "Refreshing towels", packSize: "25, 50 or 100 individually wrapped towels", price: 180000, currency: "NGN", stockOnHand: -1, stockReserved: 0, lowStockThreshold: 50, lowStockAlertedAt: null, images: ["/images/titun/green-tea-towel.jpg"], featured: true, active: true, createdAt: now, updatedAt: now,
  },
  {
    id: "22222222-2222-4222-8222-222222222222", slug: "lemongrass-refreshing-towel", name: "Lemongrass Refreshing Towel", scent: "Bright · Fresh · Invigorating", description: "A bright, delicately scented towel that makes a clean reset feel effortless after travel, dining or movement.", category: "Refreshing towels", packSize: "25, 50 or 100 individually wrapped towels", price: 180000, currency: "NGN", stockOnHand: -1, stockReserved: 0, lowStockThreshold: 50, lowStockAlertedAt: null, images: ["/images/titun/lemongrass-towel.jpg"], featured: true, active: true, createdAt: now, updatedAt: now,
  },
  {
    id: "33333333-3333-4333-8333-333333333333", slug: "sandalwood-refreshing-towel", name: "Sandalwood Refreshing Towel", scent: "Warm · Refined · Grounding", description: "A warm, grounded scent in TITUN’s signature black-and-gold wrap—made for considered hospitality and evening rituals.", category: "Refreshing towels", packSize: "25, 50 or 100 individually wrapped towels", price: 180000, currency: "NGN", stockOnHand: -1, stockReserved: 0, lowStockThreshold: 50, lowStockAlertedAt: null, images: ["/images/titun/sandalwood-towel.jpg"], featured: true, active: true, createdAt: now, updatedAt: now,
  },
  {
    id: "44444444-4444-4444-8444-444444444444", slug: "titun-discovery-gift-box", name: "TITUN Discovery Gift Box", scent: "Green tea, lemongrass and sandalwood", description: "A presentation-ready collection of TITUN refreshing towels, composed in any mix of signature fragrances.", category: "Boxes and multipacks", packSize: "Custom 25, 50 or 100-piece gift box", price: 5000000, currency: "NGN", stockOnHand: -1, stockReserved: 0, lowStockThreshold: 5, lowStockAlertedAt: null, images: ["/images/titun/gift-box.jpg"], featured: false, active: true, createdAt: now, updatedAt: now,
  },
  {
    id: "55555555-5555-4555-8555-555555555555", slug: "green-tea-refreshing-wipes", name: "Green Tea Refreshing Wipes", scent: "Fresh · Clean · Restorative", description: "Individually wrapped Green Tea wet wipes for dining, travel, events and everyday refreshment.", category: "Refreshing wet wipes", packSize: "Minimum 50 wipes", price: 50000, currency: "NGN", stockOnHand: -1, stockReserved: 0, lowStockThreshold: 100, lowStockAlertedAt: null, images: ["/images/titun/green-tea-wipes.jpg"], featured: false, active: true, createdAt: now, updatedAt: now,
  },
  {
    id: "66666666-6666-4666-8666-666666666666", slug: "lemongrass-refreshing-wipes", name: "Lemongrass Refreshing Wipes", scent: "Bright · Fresh · Invigorating", description: "Individually wrapped Lemongrass wet wipes for dining, travel, events and everyday refreshment.", category: "Refreshing wet wipes", packSize: "Minimum 50 wipes", price: 50000, currency: "NGN", stockOnHand: -1, stockReserved: 0, lowStockThreshold: 100, lowStockAlertedAt: null, images: ["/images/titun/lemongrass-wipes.jpg"], featured: false, active: true, createdAt: now, updatedAt: now,
  },
  {
    id: "77777777-7777-4777-8777-777777777777", slug: "sandalwood-refreshing-wipes", name: "Sandalwood Refreshing Wipes", scent: "Warm · Refined · Grounding", description: "Individually wrapped Sandalwood wet wipes for dining, travel, events and everyday refreshment.", category: "Refreshing wet wipes", packSize: "Minimum 50 wipes", price: 50000, currency: "NGN", stockOnHand: -1, stockReserved: 0, lowStockThreshold: 100, lowStockAlertedAt: null, images: ["/images/titun/sandalwood-wipes.jpg"], featured: false, active: true, createdAt: now, updatedAt: now,
  },
];

export const getProducts = async () => {
  if (!isDatabaseConfigured()) return sampleProducts;
  return getDb().select().from(products).where(and(eq(products.active, true), ne(products.category, "Community event"))).orderBy(asc(products.createdAt));
};

export const getFeaturedProducts = async () => {
  if (!isDatabaseConfigured()) return sampleProducts.filter((product) => product.featured);
  return getDb().select().from(products).where(and(eq(products.active, true), eq(products.featured, true))).orderBy(asc(products.createdAt));
};

export const getProductBySlug = async (slug: string) => {
  if (!isDatabaseConfigured()) return sampleProducts.find((product) => product.slug === slug) ?? null;
  const [product] = await getDb().select().from(products).where(and(eq(products.slug, slug), eq(products.active, true))).limit(1);
  return product ?? null;
};
