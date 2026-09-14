/*
# FLUXORA - Content table schema + generation limit function

## Tables
- content: user-generated marketing content with full RLS

## Functions
- check_content_generation_allowed(): backend-enforced limit check
*/

-- ===================== CONTENT TABLE =====================
CREATE TABLE IF NOT EXISTS content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product text NOT NULL DEFAULT '',
  audience text,
  niche text,
  goal text,
  style text,
  tone text,
  duration text,
  hook text,
  on_screen_text text,
  script text,
  visual_structure text,
  cta text,
  caption text,
  hashtags text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_content" ON content;
CREATE POLICY "select_own_content" ON content FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_content" ON content;
CREATE POLICY "insert_own_content" ON content FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_content" ON content;
CREATE POLICY "update_own_content" ON content FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_content" ON content;
CREATE POLICY "delete_own_content" ON content FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_content_user_id ON content(user_id);
CREATE INDEX IF NOT EXISTS idx_content_created_at ON content(created_at DESC);

-- ===================== GENERATION LIMIT FUNCTION =====================
-- Returns true if the current user can generate content, false if limit reached.
-- Admins bypass all limits. Users need an active subscription with remaining quota.
CREATE OR REPLACE FUNCTION public.check_content_generation_allowed()
RETURNS TABLE(allowed boolean, remaining integer, limit_value integer, is_admin_user boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
  v_plan_limit integer;
  v_sub_started timestamptz;
  v_sub_expires timestamptz;
  v_period_start timestamptz;
  v_count integer;
BEGIN
  -- Check admin status
  SELECT COALESCE(is_admin, false) INTO v_is_admin
  FROM profiles WHERE user_id = auth.uid();

  IF v_is_admin THEN
    RETURN QUERY SELECT true, 999999, 999999, true;
    RETURN;
  END IF;

  -- Get active subscription with plan
  SELECT s.started_at, s.expires_at, p.content_limit
  INTO v_sub_started, v_sub_expires, v_plan_limit
  FROM subscriptions s
  JOIN plans p ON p.id = s.plan_id
  WHERE s.user_id = auth.uid()
    AND s.status = 'active'
    AND s.expires_at > now()
  ORDER BY s.created_at DESC
  LIMIT 1;

  -- No active subscription
  IF v_sub_started IS NULL THEN
    RETURN QUERY SELECT false, 0, 0, false;
    RETURN;
  END IF;

  -- Period start is the subscription start (or last renewal)
  v_period_start := v_sub_started;

  -- Count content generated in this period
  SELECT count(*) INTO v_count
  FROM content
  WHERE user_id = auth.uid()
    AND created_at >= v_period_start;

  IF v_count < v_plan_limit THEN
    RETURN QUERY SELECT true, v_plan_limit - v_count, v_plan_limit, false;
  ELSE
    RETURN QUERY SELECT false, 0, v_plan_limit, false;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_content_generation_allowed() FROM anon;
GRANT EXECUTE ON FUNCTION public.check_content_generation_allowed() TO authenticated;
