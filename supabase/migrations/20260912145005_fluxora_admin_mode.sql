/*
# FLUXORA - Admin mode (backend-enforced)

## Overview
Adds a backend-enforced admin role to the FLUXORA platform. Only accounts with
`is_admin = true` in the `profiles` table can access admin features. This flag
is controlled entirely at the database level — users cannot set or modify it
themselves.

## Changes

### profiles table
- Added `is_admin boolean NOT NULL DEFAULT false` column.
- REVOKED UPDATE on `is_admin` from `authenticated` so users cannot self-promote
  via the data API. The existing `update_own_profile` policy still allows row-level
  updates, but column-level privileges block writes to `is_admin`.

### SECURITY DEFINER functions
1. `is_current_user_admin()` — returns boolean. Checks if the calling user has
   `is_admin = true`. Revoked from anon, granted to authenticated. Used by the
   frontend to check admin status.

2. `get_all_profiles()` — returns all profiles. SECURITY DEFINER bypasses RLS.
   Checks `is_admin` inside the function body before returning data. If the
   caller is not admin, raises an exception. Revoked from anon, granted to
   authenticated.

3. `get_platform_stats()` — returns aggregate counts (total users, total leads,
   total sales, total revenue, total products). SECURITY DEFINER bypasses RLS.
   Checks `is_admin` before returning data. Revoked from anon, granted to
   authenticated.

### Promote an admin
To grant admin access to your account, run:
  UPDATE profiles SET is_admin = true WHERE user_id = '<your-auth-uuid>';

## Security
- `is_admin` column is NOT writable by users (column-level privilege revoked).
- All admin data access goes through SECURITY DEFINER functions that check the
  caller's `is_admin` flag inside the function body — not through RLS policies.
- anon role has no access to any admin function.
*/
