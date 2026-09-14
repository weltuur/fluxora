/*
# FLUXORA - Complete Database Schema

## Overview
Creates the full database structure for the FLUXORA SaaS platform — a multi-tenant
application where each user (affiliate, creator, small business) manages their own
products, leads, sales, and usage limits.

## Tables Created

### profiles
- Stores user profile information including onboarding answers.
- One row per authenticated user (1:1 with auth.users).
- Fields: name, business_type, selling_channels, goal, onboarding_completed.

### plans
- Stores subscription plan definitions (Mensal, Trimestral, Anual).
- Publicly readable so the pricing page can display plans.
- Fields: name, slug, price, billing_period, content_limit, hook_limit, x1_limit, features, checkout_url, active.
- Seeded with the three FLUXORA plans.

### subscriptions
- Links users to their active plan.
- Tracks external IDs from EscalePay payment provider.
- Fields: user_id, plan_id, status, started_at, expires_at, external_customer_id, external_subscription_id.

### products
- User's products (digital, physical, service, affiliate).
- Owner-scoped via user_id.

### leads
- Potential customers tracked by each user.
- Linked to products and users.
- Status tracking: novo, contatado, conversando, ganho, perdido.
- Owner-scoped via user_id.

### sales
- Records of completed sales.
- Linked to leads and products.
- Owner-scoped via user_id.

### usage
- Tracks per-user usage of AI features per billing period.
- Fields: content_generations, hook_generations, x1_analyses.
- Owner-scoped via user_id.

## Security (RLS)
- All user-scoped tables have RLS enabled with owner-based policies (auth.uid() = user_id).
- plans table is publicly readable (anon + authenticated) since plans are shown on the public pricing page.
- profiles table is owner-scoped (users can only see/edit their own profile).

## Triggers
- Auto-create a profile row when a new auth user signs up.
- Auto-update updated_at on leads.
*/

-- ===================== PROFILES =====================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  business_type text,
  selling_channels text[] DEFAULT '{}',
  goal text,
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, name)
  VALUES (NEW.id, NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===================== PLANS =====================
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  price integer NOT NULL,
  billing_period text NOT NULL,
  content_limit integer NOT NULL,
  hook_limit integer NOT NULL,
  x1_limit integer NOT NULL,
  features jsonb NOT NULL DEFAULT '[]',
  checkout_url text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_plans_public" ON plans;
CREATE POLICY "read_plans_public" ON plans FOR SELECT
  TO anon, authenticated USING (true);

-- Seed the three plans
INSERT INTO plans (name, slug, price, billing_period, content_limit, hook_limit, x1_limit, features, checkout_url, sort_order)
VALUES
  ('Mensal', 'mensal', 189, '30 dias', 50, 100, 50,
   '["50 gerações de conteúdo","100 hooks","50 análises X1","Acesso ao CRM","Dashboard completo"]'::jsonb,
   'MONTHLY_CHECKOUT_URL', 1),
  ('Trimestral', 'trimestral', 279, '90 dias', 150, 300, 150,
   '["150 gerações de conteúdo","300 hooks","150 análises X1","Acesso ao CRM","Dashboard completo","Economia de 26%"]'::jsonb,
   'TRIMESTER_CHECKOUT_URL', 2),
  ('Anual', 'anual', 719, '365 dias', 500, 1000, 500,
   '["500 gerações de conteúdo","1000 hooks","500 análises X1","Acesso ao CRM","Dashboard completo","Economia de 58%","Suporte prioritário"]'::jsonb,
   'YEARLY_CHECKOUT_URL', 3)
ON CONFLICT (slug) DO NOTHING;

-- ===================== SUBSCRIPTIONS =====================
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES plans(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'inactive',
  started_at timestamptz,
  expires_at timestamptz,
  external_customer_id text,
  external_subscription_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_subscriptions" ON subscriptions;
CREATE POLICY "select_own_subscriptions" ON subscriptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_subscriptions" ON subscriptions;
CREATE POLICY "insert_own_subscriptions" ON subscriptions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_subscriptions" ON subscriptions;
CREATE POLICY "update_own_subscriptions" ON subscriptions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_subscriptions" ON subscriptions;
CREATE POLICY "delete_own_subscriptions" ON subscriptions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===================== PRODUCTS =====================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  category text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_products" ON products;
CREATE POLICY "select_own_products" ON products FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_products" ON products;
CREATE POLICY "insert_own_products" ON products FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_products" ON products;
CREATE POLICY "update_own_products" ON products FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_products" ON products;
CREATE POLICY "delete_own_products" ON products FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===================== LEADS =====================
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  username text,
  platform text,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'novo',
  potential_value numeric(10,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_leads" ON leads;
CREATE POLICY "select_own_leads" ON leads FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_leads" ON leads;
CREATE POLICY "insert_own_leads" ON leads FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_leads" ON leads;
CREATE POLICY "update_own_leads" ON leads FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_leads" ON leads;
CREATE POLICY "delete_own_leads" ON leads FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS leads_updated_at ON leads;
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===================== SALES =====================
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  source text,
  sold_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_sales" ON sales;
CREATE POLICY "select_own_sales" ON sales FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_sales" ON sales;
CREATE POLICY "insert_own_sales" ON sales FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_sales" ON sales;
CREATE POLICY "update_own_sales" ON sales FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_sales" ON sales;
CREATE POLICY "delete_own_sales" ON sales FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===================== USAGE =====================
CREATE TABLE IF NOT EXISTS usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  content_generations integer NOT NULL DEFAULT 0,
  hook_generations integer NOT NULL DEFAULT 0,
  x1_analyses integer NOT NULL DEFAULT 0
);

ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_usage" ON usage;
CREATE POLICY "select_own_usage" ON usage FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_usage" ON usage;
CREATE POLICY "insert_own_usage" ON usage FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_usage" ON usage;
CREATE POLICY "update_own_usage" ON usage FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_usage" ON usage;
CREATE POLICY "delete_own_usage" ON usage FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_user_id ON usage(user_id);
