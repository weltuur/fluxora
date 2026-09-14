/*
# FLUXORA - Security fixes

## Changes
1. Revoke EXECUTE from anon on all SECURITY DEFINER functions.
   - check_content_generation_allowed: anon should not be able to query limits
   - get_all_profiles: exposes all user data — anon must not call it
   - get_platform_stats: exposes platform stats — anon must not call it
   - is_current_user_admin: admin check — anon has no uid so it's useless, but lock it
   - handle_new_user: trigger function — should never be callable via RPC

2. Revoke EXECUTE from authenticated on handle_new_user (trigger only, not RPC).

3. Fix search_path on update_updated_at trigger function.
*/
