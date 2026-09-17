import { z } from "zod";

export const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.email(),
    phone: z.string().trim().min(7).max(30),
    address: z.string().trim().min(8).max(250),
    city: z.string().trim().min(2).max(80),
    notes: z.string().trim().max(500).optional(),
  }),
  items: z.array(z.object({
    productId: z.uuid(),
    quantity: z.int().min(1).max(100),
  })).min(1).max(20),
  discountCode: z.string().trim().max(40).optional(),
  paymentProvider: z.enum(["paystack", "stripe"]),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  scent: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(1200),
  category: z.string().trim().min(2).max(80),
  packSize: z.string().trim().min(1).max(80),
  price: z.int().min(0),
  stockOnHand: z.int().min(0),
  lowStockThreshold: z.int().min(0),
  images: z.array(z.string()).max(8).default([]),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

export const eventSchema = z.object({
  title: z.string().trim().min(2).max(140),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(20).max(2400),
  venue: z.string().trim().min(2).max(240),
  startsAt: z.string().datetime({ offset: true }),
  image: z.string().trim().optional().default(""),
  ticketPrice: z.int().min(0),
  capacity: z.int().min(1).max(10000),
  lowStockThreshold: z.int().min(0),
  recommendedProductIds: z.array(z.uuid()).max(8).default([]),
  published: z.boolean().default(false),
});

export const newsletterSchema = z.object({
  email: z.email().max(254).transform((value) => value.trim().toLowerCase()),
  source: z.enum(["welcome", "footer"]).default("footer"),
});

export const corporateEnquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  company: z.string().trim().min(2).max(140),
  industry: z.string().trim().min(2).max(100),
  email: z.email().max(254).transform((value) => value.trim().toLowerCase()),
  phone: z.string().trim().min(7).max(30),
  estimatedQuantity: z.int().min(1).max(1_000_000),
  productRequired: z.string().trim().min(2).max(120),
  message: z.string().trim().min(10).max(1500),
});
