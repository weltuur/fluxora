/*
# FLUXORA - Admin mode: schema and functions

## Changes

### 1. profiles table — add is_admin column
- `is_admin boolean NOT NULL DEFAULT false`
- Revoke UPDATE on this column from authenticated (users cannot self-promote)

### 2. SECURITY DEFINER functions
- `is_current_user_admin()` — safe check for frontend
- `get_all_profiles()` — list all users (admin only)
- `get_platform_stats()` — aggregate platform data (admin only)

### 3. Grant your account admin access
After applying, promote your account:
  UPDATE profiles SET is_admin = true WHERE user_id = '<your-auth-uuid>';
*/

-- Add is_admin column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Revoke user ability to update is_admin (column-level)
REVOKE UPDATE (is_admin) ON profiles FROM authenticated;

-- Function: is_current_user_admin()
-- Returns true if the calling user is an admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE user_id = auth.uid()),
    false
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_current_user_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;

-- Function: get_all_profiles()
-- Returns all profiles. Admin only — checks is_admin inside the function.
CREATE OR REPLACE FUNCTION public.get_all_profiles()
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY SELECT * FROM public.profiles ORDER BY created_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_all_profiles() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_all_profiles() TO authenticated;

-- Function: get_platform_stats()
-- Returns aggregate platform statistics. Admin only.
CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS TABLE(
  total_users bigint,
  total_leads bigint,
  total_sales bigint,
  total_revenue numeric,
  total_products bigint,
  active_subscriptions bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT
    (SELECT count(*) FROM public.profiles),
    (SELECT count(*) FROM public.leads),
    (SELECT count(*) FROM public.sales),
    (SELECT COALESCE(sum(amount), 0) FROM public.sales),
    (SELECT count(*) FROM public.products),
    (SELECT count(*) FROM public.subscriptions WHERE status = 'active')
  INTO
    total_users, total_leads, total_sales, total_revenue, total_products,
    active_subscriptions;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_platform_stats() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_platform_stats() TO authenticated;
