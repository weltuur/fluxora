/*
# FLUXORA - Admin plan and account activation

## Changes
1. Insert an "Admin" plan with unlimited feature limits and active=true.
2. Set is_admin = true for the existing user (Elton).
3. Create an active subscription for that user linked to the Admin plan.
*/

-- 1. Create the admin plan (unlimited everything)
INSERT INTO plans (name, slug, price, billing_period, content_limit, hook_limit, x1_limit, features, checkout_url, active, sort_order)
VALUES (
  'Admin',
  'admin',
  0,
  'ilimitado',
  999999,
  999999,
  999999,
  '["Acesso ilimitado","Todas as funcionalidades","Painel administrativo","Sem restrições"]'::jsonb,
  '',
  true,
  0
)
ON CONFLICT (slug) DO NOTHING;

-- 2. Promote Elton to admin
UPDATE profiles
SET is_admin = true
WHERE user_id = '666cae94-ab73-48a3-97fc-54a4cd79c236';

-- 3. Create active subscription linked to the admin plan
-- Use a DO block to look up the plan id dynamically
DO $$
DECLARE
  v_plan_id uuid;
  v_user_id uuid := '666cae94-ab73-48a3-97fc-54a4cd79c236';
BEGIN
  SELECT id INTO v_plan_id FROM plans WHERE slug = 'admin';

  -- Remove any existing subscription for this user first
  DELETE FROM subscriptions WHERE user_id = v_user_id;

  -- Insert the active admin subscription
  INSERT INTO subscriptions (user_id, plan_id, status, started_at, expires_at)
  VALUES (v_user_id, v_plan_id, 'active', now(), now() + interval '100 years');
END $$;
