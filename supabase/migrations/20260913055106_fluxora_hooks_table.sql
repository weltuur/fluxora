/*
# FLUXORA - Hooks table + hook generation limit function

## Tables
- hooks: stores generated TikTok hooks organized by category

## Functions
- check_hook_generation_allowed(): backend-enforced limit check for hook generations
*/

-- ===================== HOOKS TABLE =====================
CREATE TABLE IF NOT EXISTS hooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  niche text,
  topic text,
  audience text,
  goal text,
  hooks jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE hooks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_hooks" ON hooks;
CREATE POLICY "select_own_hooks" ON hooks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_hooks" ON hooks;
CREATE POLICY "insert_own_hooks" ON hooks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_hooks" ON hooks;
CREATE POLICY "update_own_hooks" ON hooks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_hooks" ON hooks;
CREATE POLICY "delete_own_hooks" ON hooks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_hooks_user_id ON hooks(user_id);
CREATE INDEX IF NOT EXISTS idx_hooks_created_at ON hooks(created_at DESC);

-- ===================== HOOK GENERATION LIMIT FUNCTION =====================
CREATE OR REPLACE FUNCTION public.check_hook_generation_allowed()
RETURNS TABLE(allowed boolean, remaining integer, limit_value integer, is_admin_user boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
  v_plan_limit integer;
  v_sub_started timestamptz;
  v_count integer;
BEGIN
  SELECT COALESCE(is_admin, false) INTO v_is_admin
  FROM profiles WHERE user_id = auth.uid();

  IF v_is_admin THEN
    RETURN QUERY SELECT true, 999999, 999999, true;
    RETURN;
  END IF;

  SELECT s.started_at, p.hook_limit
  INTO v_sub_started, v_plan_limit
  FROM subscriptions s
  JOIN plans p ON p.id = s.plan_id
  WHERE s.user_id = auth.uid()
    AND s.status = 'active'
    AND s.expires_at > now()
  ORDER BY s.created_at DESC
  LIMIT 1;

  IF v_sub_started IS NULL THEN
    RETURN QUERY SELECT false, 0, 0, false;
    RETURN;
  END IF;

  SELECT count(*) INTO v_count
  FROM hooks
  WHERE user_id = auth.uid()
    AND created_at >= v_sub_started;

  IF v_count < v_plan_limit THEN
    RETURN QUERY SELECT true, v_plan_limit - v_count, v_plan_limit, false;
  ELSE
    RETURN QUERY SELECT false, 0, v_plan_limit, false;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_hook_generation_allowed() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_hook_generation_allowed() TO authenticated;
