/*
# FLUXORA - Security fixes

## Changes
1. Revoke EXECUTE from anon on all SECURITY DEFINER functions.
2. Revoke EXECUTE from authenticated on handle_new_user (trigger only).
3. Fix search_path on update_updated_at trigger function.
*/

-- 1. Lock down SECURITY DEFINER functions from anon role
REVOKE EXECUTE ON FUNCTION public.check_content_generation_allowed() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_all_profiles() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_platform_stats() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_current_user_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;

-- 2. handle_new_user is a trigger function — should not be callable via RPC at all
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- 3. Fix search_path on update_updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;
