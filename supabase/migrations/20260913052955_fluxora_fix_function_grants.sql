/*
# FLUXORA - Fix function execute grants

Functions in Postgres default to EXECUTE granted to PUBLIC.
REVOKE FROM anon was insufficient because PUBLIC still grants it.
Must REVOKE FROM PUBLIC, then GRANT only to the intended roles.
*/

-- Revoke EXECUTE from PUBLIC on all SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.check_content_generation_allowed() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_all_profiles() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_platform_stats() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_current_user_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;

-- Grant EXECUTE only to authenticated (not anon) for user-facing functions
GRANT EXECUTE ON FUNCTION public.check_content_generation_allowed() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_platform_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;

-- handle_new_user is a trigger function — no role should call it via RPC
-- (it runs as SECURITY DEFINER from the auth trigger, not via API)
