/*
# FLUXORA - X1 conversation assistant

## Tables
- x1_conversations: stores each user's conversation analysis.

## Functions
- check_x1_analysis_allowed(): backend-enforced X1 analysis limit.
*/

CREATE TABLE IF NOT EXISTS public.x1_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_text text NOT NULL,
  product text,
  goal text NOT NULL,
  tone text NOT NULL,
  interest_level text NOT NULL,
  conversation_stage text NOT NULL,
  objection text NOT NULL,
  diagnosis text NOT NULL,
  recommendation text NOT NULL,
  suggested_reply text NOT NULL,
  alternative_reply_natural text NOT NULL,
  alternative_reply_persuasive text NOT NULL,
  alternative_reply_short text NOT NULL,
  next_step text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.x1_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_x1_conversations" ON public.x1_conversations;
CREATE POLICY "select_own_x1_conversations" ON public.x1_conversations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_x1_conversations" ON public.x1_conversations;
CREATE POLICY "insert_own_x1_conversations" ON public.x1_conversations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_x1_conversations" ON public.x1_conversations;
CREATE POLICY "delete_own_x1_conversations" ON public.x1_conversations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_x1_conversations_user_id ON public.x1_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_x1_conversations_created_at ON public.x1_conversations(created_at DESC);

CREATE OR REPLACE FUNCTION public.check_x1_analysis_allowed()
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

  SELECT s.started_at, p.x1_limit
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
  FROM x1_conversations
  WHERE user_id = auth.uid()
    AND created_at >= v_sub_started;

  IF v_count < v_plan_limit THEN
    RETURN QUERY SELECT true, v_plan_limit - v_count, v_plan_limit, false;
  ELSE
    RETURN QUERY SELECT false, 0, v_plan_limit, false;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_x1_analysis_allowed() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_x1_analysis_allowed() FROM anon;
GRANT EXECUTE ON FUNCTION public.check_x1_analysis_allowed() TO authenticated;
