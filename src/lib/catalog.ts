import { and, asc, eq, ne } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { products, type Product } from "@/lib/db/schema";

const now = new Date();
export const sampleProducts: Product[] = [
  {
    id: "11111111-1111-4111-8111-111111111111", slug: "green-tea-refreshing-towel", name: "Green Tea Refreshing Towel", scent: "Green tea", description: "A soft, individually wrapped wet towel with a clean green-tea scent for graceful everyday refreshment.", category: "Individual towels", packSize: "1 individually wrapped towel", price: 180000, currency: "NGN", stockOnHand: 72, stockReserved: 0, lowStockThreshold: 12, lowStockAlertedAt: null, images: ["/images/titun/green-tea-towel.jpg"], featured: true, active: true, createdAt: now, updatedAt: now,
  },
  {
    id: "22222222-2222-4222-8222-222222222222", slug: "lemongrass-refreshing-towel", name: "Lemongrass Refreshing Towel", scent: "Lemongrass", description: "A bright, delicately scented towel that makes a clean reset feel effortless after travel, dining or movement.", category: "Individual towels", packSize: "1 individually wrapped towel", price: 180000, currency: "NGN", stockOnHand: 34, stockReserved: 0, lowStockThreshold: 8, lowStockAlertedAt: null, images: ["/images/titun/lemongrass-towel.jpg"], featured: true, active: true, createdAt: now, updatedAt: now,
  },
  {
    id: "33333333-3333-4333-8333-333333333333", slug: "sandalwood-refreshing-towel", name: "Sandalwood Refreshing Towel", scent: "Sandalwood", description: "A warm, grounded scent in TITUN’s signature black-and-gold wrap—made for considered hospitality and evening rituals.", category: "Individual towels", packSize: "1 individually wrapped towel", price: 180000, currency: "NGN", stockOnHand: 18, stockReserved: 0, lowStockThreshold: 6, lowStockAlertedAt: null, images: ["/images/titun/sandalwood-towel.jpg"], featured: true, active: true, createdAt: now, updatedAt: now,
  },
  {
    id: "44444444-4444-4444-8444-444444444444", slug: "titun-discovery-gift-box", name: "TITUN Discovery Gift Box", scent: "Green tea, lemongrass and sandalwood", description: "A presentation-ready collection of TITUN’s signature refreshing towels for gifting and elevated hospitality.", category: "Boxes and multipacks", packSize: "Curated gift box", price: 1450000, currency: "NGN", stockOnHand: 9, stockReserved: 0, lowStockThreshold: 5, lowStockAlertedAt: null, images: ["/images/titun/gift-box.jpg"], featured: false, active: true, createdAt: now, updatedAt: now,
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
