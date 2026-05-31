-- ============================================================
-- SmartCart Database Schema
-- Uses a dedicated "smartcart" PostgreSQL schema to avoid
-- collision with other projects on the same Supabase instance.
--
-- SETUP ORDER:
--   1. Run this entire file in Supabase SQL Editor
--   2. Go to Supabase Dashboard → Settings → API
--      → "Exposed schemas" → add "smartcart" → Save
--   3. Set VITE_SUPABASE_SCHEMA=smartcart in your .env
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- SCHEMA
-- ============================================================

CREATE SCHEMA IF NOT EXISTS smartcart;

-- Grant PostgREST access
GRANT USAGE ON SCHEMA smartcart TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA smartcart
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA smartcart
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA smartcart
  GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS smartcart.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('RESELLER', 'CUSTOMER')) DEFAULT 'CUSTOMER',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS smartcart.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS smartcart.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  category_id UUID REFERENCES smartcart.categories(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS smartcart.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES smartcart.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS smartcart.carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS smartcart.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES smartcart.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES smartcart.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  UNIQUE(cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS smartcart.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS smartcart.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES smartcart.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES smartcart.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price NUMERIC(12, 2) NOT NULL
);

-- ============================================================
-- FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION smartcart.decrement_product_quantity(p_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE smartcart.products
  SET quantity = GREATEST(0, quantity - p_quantity),
      updated_at = NOW()
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION smartcart.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER products_updated_at
  BEFORE UPDATE ON smartcart.products
  FOR EACH ROW EXECUTE FUNCTION smartcart.update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE smartcart.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE smartcart.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE smartcart.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE smartcart.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE smartcart.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE smartcart.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE smartcart.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE smartcart.order_items ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY "Users can read own profile"
  ON smartcart.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON smartcart.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON smartcart.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories
CREATE POLICY "Anyone can read categories"
  ON smartcart.categories FOR SELECT USING (true);
CREATE POLICY "Resellers can manage categories"
  ON smartcart.categories FOR ALL
  USING (EXISTS (SELECT 1 FROM smartcart.users WHERE id = auth.uid() AND role = 'RESELLER'));

-- Products
CREATE POLICY "Anyone can read active products"
  ON smartcart.products FOR SELECT USING (active = true);
CREATE POLICY "Resellers can manage all products"
  ON smartcart.products FOR ALL
  USING (EXISTS (SELECT 1 FROM smartcart.users WHERE id = auth.uid() AND role = 'RESELLER'));

-- Product images
CREATE POLICY "Anyone can read product images"
  ON smartcart.product_images FOR SELECT USING (true);
CREATE POLICY "Resellers can manage product images"
  ON smartcart.product_images FOR ALL
  USING (EXISTS (SELECT 1 FROM smartcart.users WHERE id = auth.uid() AND role = 'RESELLER'));

-- Carts
CREATE POLICY "Users manage own cart"
  ON smartcart.carts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own cart items"
  ON smartcart.cart_items FOR ALL
  USING (EXISTS (SELECT 1 FROM smartcart.carts WHERE id = cart_id AND user_id = auth.uid()));

-- Orders
CREATE POLICY "Anyone can place orders"
  ON smartcart.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Resellers can read all orders"
  ON smartcart.orders FOR SELECT
  USING (EXISTS (SELECT 1 FROM smartcart.users WHERE id = auth.uid() AND role = 'RESELLER'));
CREATE POLICY "Resellers can update orders"
  ON smartcart.orders FOR UPDATE
  USING (EXISTS (SELECT 1 FROM smartcart.users WHERE id = auth.uid() AND role = 'RESELLER'));
CREATE POLICY "Customers can read own orders"
  ON smartcart.orders FOR SELECT
  USING (customer_email = (SELECT email FROM smartcart.users WHERE id = auth.uid()));

-- Order items
CREATE POLICY "Anyone can create order items"
  ON smartcart.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Resellers can read all order items"
  ON smartcart.order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM smartcart.users WHERE id = auth.uid() AND role = 'RESELLER'));
CREATE POLICY "Customers can read own order items"
  ON smartcart.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM smartcart.orders o
    JOIN smartcart.users u ON u.email = o.customer_email
    WHERE o.id = order_id AND u.id = auth.uid()
  ));

-- ============================================================
-- STORAGE BUCKET
-- Storage always lives in the global "storage" schema.
-- The RLS policies reference smartcart.users for role checks.
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('smartcart-product-images', 'smartcart-product-images', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Public read smartcart product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'smartcart-product-images');

CREATE POLICY "Resellers can upload smartcart product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'smartcart-product-images' AND
    EXISTS (SELECT 1 FROM smartcart.users WHERE id = auth.uid() AND role = 'RESELLER')
  );

CREATE POLICY "Resellers can delete smartcart product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'smartcart-product-images' AND
    EXISTS (SELECT 1 FROM smartcart.users WHERE id = auth.uid() AND role = 'RESELLER')
  );
