import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { GiftBoxCartConfiguration } from "@/lib/gift-box";

export const orderStatus = pgEnum("order_status", [
  "pending",
  "paid",
  "processing",
  "shipped",
  "failed",
  "fulfilled",
  "cancelled",
  "refunded",
]);

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    scent: text("scent").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    packSize: text("pack_size").notNull(),
    price: integer("price").notNull(),
    currency: text("currency").notNull().default("NGN"),
    stockOnHand: integer("stock_on_hand").notNull().default(0),
    stockReserved: integer("stock_reserved").notNull().default(0),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(10),
    lowStockAlertedAt: timestamp("low_stock_alerted_at", {
      withTimezone: true,
    }),
    images: jsonb("images").$type<string[]>().notNull().default([]),
    featured: boolean("featured").notNull().default(false),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("products_slug_unique").on(table.slug)],
);

export const discounts = pgTable(
  "discounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: text("code").notNull(),
    type: text("type", { enum: ["percentage", "fixed"] }).notNull(),
    value: integer("value").notNull(),
    active: boolean("active").notNull().default(true),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    maxUses: integer("max_uses"),
    usedCount: integer("used_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("discounts_code_unique").on(table.code)],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reference: text("reference").notNull(),
    status: orderStatus("status").notNull().default("pending"),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone").notNull(),
    deliveryAddress: text("delivery_address").notNull(),
    deliveryCity: text("delivery_city").notNull(),
    notes: text("notes"),
    subtotal: integer("subtotal").notNull(),
    discountAmount: integer("discount_amount").notNull().default(0),
    total: integer("total").notNull(),
    currency: text("currency").notNull().default("NGN"),
    discountCode: text("discount_code"),
    paymentProvider: text("payment_provider").notNull().default("paystack"),
    paymentReference: text("payment_reference"),
    reservationExpiresAt: timestamp("reservation_expires_at", {
      withTimezone: true,
    }).notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    processingAt: timestamp("processing_at", { withTimezone: true }),
    shippedAt: timestamp("shipped_at", { withTimezone: true }),
    fulfilledAt: timestamp("fulfilled_at", { withTimezone: true }),
    failedAt: timestamp("failed_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    refundedAt: timestamp("refunded_at", { withTimezone: true }),
    courier: text("courier"),
    trackingNumber: text("tracking_number"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("orders_reference_unique").on(table.reference),
    index("orders_status_created_idx").on(table.status, table.createdAt),
  ],
);

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  productName: text("product_name").notNull(),
  scent: text("scent").notNull(),
  packSize: text("pack_size").notNull(),
  image: text("image"),
  unitPrice: integer("unit_price").notNull(),
  quantity: integer("quantity").notNull(),
  lineTotal: integer("line_total").notNull(),
  configuration: jsonb("configuration")
    .$type<GiftBoxCartConfiguration>()
    .notNull()
    .default({}),
});

export const inventoryEvents = pgTable(
  "inventory_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    orderId: uuid("order_id").references(() => orders.id),
    type: text("type", {
      enum: ["restock", "sale", "adjustment", "reservation_release"],
    }).notNull(),
    quantityChange: integer("quantity_change").notNull(),
    stockAfter: integer("stock_after").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("inventory_product_created_idx").on(table.productId, table.createdAt),
  ],
);

export const communityMembers = pgTable(
  "community_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastEventAt: timestamp("last_event_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("community_members_email_unique").on(table.email)],
);

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    story: text("story").notNull().default(""),
    venue: text("venue").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    image: text("image"),
    galleryImages: jsonb("gallery_images").$type<string[]>().notNull().default([]),
    videoUrl: text("video_url"),
    registrationUrl: text("registration_url"),
    ctaLabel: text("cta_label"),
    ticketProductId: uuid("ticket_product_id")
      .notNull()
      .references(() => products.id),
    published: boolean("published").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("events_slug_unique").on(table.slug),
    uniqueIndex("events_ticket_product_unique").on(table.ticketProductId),
  ],
);

export const eventProducts = pgTable(
  "event_products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    displayOrder: integer("display_order").notNull().default(0),
  },
  (table) => [
    uniqueIndex("event_products_unique").on(table.eventId, table.productId),
  ],
);

export const eventAttendees = pgTable(
  "event_attendees",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id),
    memberId: uuid("member_id")
      .notNull()
      .references(() => communityMembers.id),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id),
    ticketQuantity: integer("ticket_quantity").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("event_attendees_order_event_unique").on(
      table.orderId,
      table.eventId,
    ),
    uniqueIndex("event_attendees_event_member_unique").on(
      table.eventId,
      table.memberId,
    ),
  ],
);

export const rateLimitEvents = pgTable(
  "rate_limit_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bucket: text("bucket").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("rate_limit_bucket_occurred_idx").on(table.bucket, table.occurredAt),
    index("rate_limit_occurred_idx").on(table.occurredAt),
  ],
);

export const newsletterSubscribers = pgTable(
  "newsletter_subscribers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    source: text("source").notNull().default("website"),
    subscribedAt: timestamp("subscribed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("newsletter_subscribers_email_unique").on(table.email),
  ],
);

export const siteAssets = pgTable("site_assets", {
  key: text("key").primaryKey(),
  label: text("label").notNull(),
  url: text("url").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const siteContent = pgTable("site_content", {
  key: text("key").primaryKey(),
  label: text("label").notNull(),
  content: jsonb("content").$type<unknown>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const corporateEnquiries = pgTable("corporate_enquiries", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  industry: text("industry").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  estimatedQuantity: integer("estimated_quantity").notNull(),
  productRequired: text("product_required").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const adminRoles = pgTable(
  "admin_roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    permissions: jsonb("permissions").$type<string[]>().notNull().default([]),
    isSystem: boolean("is_system").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("admin_roles_slug_unique").on(table.slug)],
);

export const adminUsers = pgTable(
  "admin_users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    passwordHash: text("password_hash"),
    roleId: uuid("role_id")
      .notNull()
      .references(() => adminRoles.id),
    active: boolean("active").notNull().default(false),
    sessionVersion: integer("session_version").notNull().default(1),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("admin_users_email_unique").on(table.email)],
);

export const adminAuthChallenges = pgTable(
  "admin_auth_challenges",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    type: text("type", {
      enum: ["login_2fa", "password_reset", "invite"],
    }).notNull(),
    codeHash: text("code_hash").notNull(),
    attempts: integer("attempts").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("admin_auth_challenges_user_type_idx").on(
      table.userId,
      table.type,
      table.createdAt,
    ),
  ],
);

export const adminAuditLog = pgTable(
  "admin_audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorUserId: uuid("actor_user_id").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    targetType: text("target_type"),
    targetId: text("target_id"),
    metadata: jsonb("metadata")
      .$type<Record<string, string | number | boolean | null>>()
      .notNull()
      .default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("admin_audit_log_created_idx").on(table.createdAt)],
);

export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Event = typeof events.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type AdminRole = typeof adminRoles.$inferSelect;
