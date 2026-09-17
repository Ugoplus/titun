DO $$ BEGIN
 CREATE TYPE "order_status" AS ENUM('pending', 'paid', 'failed', 'fulfilled', 'cancelled', 'refunded');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS "products" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "scent" text NOT NULL,
  "description" text NOT NULL,
  "category" text NOT NULL,
  "pack_size" text NOT NULL,
  "price" integer NOT NULL CHECK (price >= 0),
  "currency" text NOT NULL DEFAULT 'NGN',
  "stock_on_hand" integer NOT NULL DEFAULT 0 CHECK (stock_on_hand >= 0),
  "stock_reserved" integer NOT NULL DEFAULT 0 CHECK (stock_reserved >= 0),
  "low_stock_threshold" integer NOT NULL DEFAULT 10 CHECK (low_stock_threshold >= 0),
  "low_stock_alerted_at" timestamptz,
  "images" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "featured" boolean NOT NULL DEFAULT false,
  "active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CHECK (stock_reserved <= stock_on_hand)
);

CREATE TABLE IF NOT EXISTS "discounts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" text NOT NULL UNIQUE,
  "type" text NOT NULL CHECK (type IN ('percentage', 'fixed')),
  "value" integer NOT NULL CHECK (value >= 0),
  "active" boolean NOT NULL DEFAULT true,
  "expires_at" timestamptz,
  "max_uses" integer,
  "used_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

INSERT INTO discounts (code, type, value, active)
VALUES ('WELCOME10', 'percentage', 10, true)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS "orders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "reference" text NOT NULL UNIQUE,
  "status" order_status NOT NULL DEFAULT 'pending',
  "customer_name" text NOT NULL,
  "customer_email" text NOT NULL,
  "customer_phone" text NOT NULL,
  "delivery_address" text NOT NULL,
  "delivery_city" text NOT NULL,
  "notes" text,
  "subtotal" integer NOT NULL,
  "discount_amount" integer NOT NULL DEFAULT 0,
  "total" integer NOT NULL,
  "currency" text NOT NULL DEFAULT 'NGN',
  "discount_code" text,
  "payment_provider" text NOT NULL DEFAULT 'paystack',
  "payment_reference" text,
  "reservation_expires_at" timestamptz NOT NULL,
  "paid_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "order_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id" uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  "product_id" uuid NOT NULL REFERENCES products(id),
  "product_name" text NOT NULL,
  "scent" text NOT NULL,
  "pack_size" text NOT NULL,
  "image" text,
  "unit_price" integer NOT NULL,
  "quantity" integer NOT NULL CHECK (quantity > 0),
  "line_total" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "inventory_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id" uuid NOT NULL REFERENCES products(id),
  "order_id" uuid REFERENCES orders(id),
  "type" text NOT NULL CHECK (type IN ('restock', 'sale', 'adjustment', 'reservation_release')),
  "quantity_change" integer NOT NULL,
  "stock_after" integer NOT NULL,
  "note" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_status_created_idx ON orders(status, created_at);
CREATE INDEX IF NOT EXISTS inventory_product_created_idx ON inventory_events(product_id, created_at);

CREATE TABLE IF NOT EXISTS "community_members" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "phone" text NOT NULL,
  "joined_at" timestamptz NOT NULL DEFAULT now(),
  "last_event_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" text NOT NULL UNIQUE,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "venue" text NOT NULL,
  "starts_at" timestamptz NOT NULL,
  "image" text,
  "ticket_product_id" uuid NOT NULL UNIQUE REFERENCES products(id),
  "published" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "event_products" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_id" uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  "product_id" uuid NOT NULL REFERENCES products(id),
  "display_order" integer NOT NULL DEFAULT 0,
  UNIQUE (event_id, product_id)
);

CREATE TABLE IF NOT EXISTS "event_attendees" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_id" uuid NOT NULL REFERENCES events(id),
  "member_id" uuid NOT NULL REFERENCES community_members(id),
  "order_id" uuid NOT NULL REFERENCES orders(id),
  "ticket_quantity" integer NOT NULL DEFAULT 1,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id, event_id)
);

CREATE TABLE IF NOT EXISTS "rate_limit_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "bucket" text NOT NULL,
  "occurred_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rate_limit_bucket_occurred_idx ON rate_limit_events(bucket, occurred_at);
CREATE INDEX IF NOT EXISTS rate_limit_occurred_idx ON rate_limit_events(occurred_at);

CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" text NOT NULL UNIQUE,
  "source" text NOT NULL DEFAULT 'website',
  "subscribed_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "corporate_enquiries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "company" text NOT NULL,
  "industry" text NOT NULL,
  "email" text NOT NULL,
  "phone" text NOT NULL,
  "estimated_quantity" integer NOT NULL CHECK (estimated_quantity > 0),
  "product_required" text NOT NULL,
  "message" text NOT NULL,
  "status" text NOT NULL DEFAULT 'new',
  "created_at" timestamptz NOT NULL DEFAULT now()
);

INSERT INTO products (slug, name, scent, description, category, pack_size, price, stock_on_hand, low_stock_threshold, featured)
VALUES
  ('green-tea-refreshing-towel', 'Green Tea Refreshing Towel', 'Green tea', 'A soft, individually wrapped wet towel with a clean green-tea scent for graceful everyday refreshment.', 'Individual towels', '1 individually wrapped towel', 180000, 72, 12, true),
  ('lemongrass-refreshing-towel', 'Lemongrass Refreshing Towel', 'Lemongrass', 'A bright, delicately scented towel that makes a clean reset feel effortless after travel, dining or movement.', 'Individual towels', '1 individually wrapped towel', 180000, 34, 8, true),
  ('sandalwood-refreshing-towel', 'Sandalwood Refreshing Towel', 'Sandalwood', 'A warm, grounded scent in TITUN''s signature black-and-gold wrap—made for considered hospitality and evening rituals.', 'Individual towels', '1 individually wrapped towel', 180000, 18, 6, true),
  ('titun-discovery-gift-box', 'TITUN Discovery Gift Box', 'Green tea, lemongrass and sandalwood', 'A presentation-ready collection of TITUN''s signature refreshing towels for gifting and elevated hospitality.', 'Boxes and multipacks', 'Curated gift box', 1450000, 9, 5, false)
ON CONFLICT (slug) DO NOTHING;

UPDATE products SET images = CASE slug
  WHEN 'green-tea-refreshing-towel' THEN '["/images/titun/green-tea-towel.jpg"]'::jsonb
  WHEN 'lemongrass-refreshing-towel' THEN '["/images/titun/lemongrass-towel.jpg"]'::jsonb
  WHEN 'sandalwood-refreshing-towel' THEN '["/images/titun/sandalwood-towel.jpg"]'::jsonb
  WHEN 'titun-discovery-gift-box' THEN '["/images/titun/gift-box.jpg"]'::jsonb
  ELSE images END;

UPDATE products
SET category = 'Refreshing towels',
    pack_size = '25, 50 or 100 individually wrapped towels',
    scent = CASE slug
      WHEN 'green-tea-refreshing-towel' THEN 'Fresh · Clean · Restorative'
      WHEN 'lemongrass-refreshing-towel' THEN 'Bright · Fresh · Invigorating'
      WHEN 'sandalwood-refreshing-towel' THEN 'Warm · Refined · Grounding'
      ELSE scent
    END,
    stock_on_hand = CASE
      WHEN stock_on_hand IN (72, 34, 18) THEN 500
      ELSE stock_on_hand
    END,
    low_stock_threshold = CASE
      WHEN low_stock_threshold IN (12, 8, 6) THEN 50
      ELSE low_stock_threshold
    END
WHERE slug IN (
  'green-tea-refreshing-towel',
  'lemongrass-refreshing-towel',
  'sandalwood-refreshing-towel'
);
