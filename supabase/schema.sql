-- =============================================================
-- ARTRESE' DATABASE SCHEMA
-- Run this entire file in the Supabase SQL Editor.
-- Requires: Supabase Auth enabled (for admin protection via RLS).
-- =============================================================


-- ---------------------------------------------------------------
-- EXTENSIONS
-- ---------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ---------------------------------------------------------------
-- TABLE: products
-- Holds all items visible in the public catalog.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT        NOT NULL,
  price         NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  description   TEXT,
  image_url     TEXT,        -- Cloudinary URL; leave NULL to show placeholder
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ---------------------------------------------------------------
-- TABLE: orders
-- One row per customer checkout submission.
-- Status lifecycle: pending -> paid -> shipped -> cancelled
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name       TEXT        NOT NULL,
  customer_email      TEXT        NOT NULL,
  customer_phone      TEXT,
  items               JSONB       NOT NULL DEFAULT '[]',  -- snapshot of cart
  total_amount        NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  status              TEXT        NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled')),
  note                TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ---------------------------------------------------------------
-- STORAGE BUCKET: order-receipts  (private)
-- Stores proof-of-payment screenshots uploaded by customers.
-- ---------------------------------------------------------------
-- Run via Supabase Dashboard > Storage, OR uncomment if using CLI:
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('order-receipts', 'order-receipts', false)
-- ON CONFLICT DO NOTHING;


-- =============================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders   ENABLE ROW LEVEL SECURITY;


-- ---------------------------------------------------------------
-- PRODUCTS: Public read, admin write
-- ---------------------------------------------------------------

-- Anyone (including unauthenticated visitors) can read products
CREATE POLICY "products_public_select"
  ON public.products
  FOR SELECT
  USING (true);

-- Only the authenticated admin can insert products
CREATE POLICY "products_admin_insert"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only the authenticated admin can update products
CREATE POLICY "products_admin_update"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only the authenticated admin can delete products
CREATE POLICY "products_admin_delete"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (true);


-- ---------------------------------------------------------------
-- ORDERS: Public insert (customers placing orders), admin full access
-- ---------------------------------------------------------------

-- Customers can create orders without an account
CREATE POLICY "orders_public_insert"
  ON public.orders
  FOR INSERT
  WITH CHECK (true);

-- Only the authenticated admin can read all orders
CREATE POLICY "orders_admin_select"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (true);

-- Only the authenticated admin can update order status
CREATE POLICY "orders_admin_update"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only the authenticated admin can delete orders
CREATE POLICY "orders_admin_delete"
  ON public.orders
  FOR DELETE
  TO authenticated
  USING (true);


-- ---------------------------------------------------------------
-- STORAGE POLICIES: order-receipts bucket
-- Run these after creating the bucket.
-- ---------------------------------------------------------------

-- Allow anyone to upload to the private bucket (so customers can submit screenshots)
CREATE POLICY "receipts_public_upload"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'order-receipts');

-- Only authenticated admin can view/download receipts
CREATE POLICY "receipts_admin_select"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'order-receipts');

-- Only authenticated admin can delete receipts
CREATE POLICY "receipts_admin_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'order-receipts');


-- ---------------------------------------------------------------
-- SEED DATA (optional — remove before production)
-- ---------------------------------------------------------------
INSERT INTO public.products (name, price, description, image_url) VALUES
  ('Handwoven Rattan Basket', 450.00, 'A handcrafted rattan basket made by local artisans. Perfect for home storage and display.', NULL),
  ('Ceramic Bud Vase', 380.00, 'Minimalist earth-tone ceramic vase, wheel-thrown and glazed by hand.', NULL),
  ('Embroidered Linen Pouch', 220.00, 'Small linen pouch with traditional floral embroidery. Great as a gift or daily carry.', NULL)
ON CONFLICT DO NOTHING;
