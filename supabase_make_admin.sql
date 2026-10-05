-- ============================================================
-- NutriVision AI – Make Admin
-- Run AFTER a user has registered via the app Sign Up form.
-- Replace the email below with the account you want as ADMIN.
-- ============================================================

-- Option A: set role in user_metadata (used by the app + RLS is_admin())
update auth.users
set raw_user_meta_data =
  coalesce(raw_user_meta_data, '{}'::jsonb) || '{"role":"ADMIN"}'::jsonb
where email = 'admin@example.com';

-- Option B (also set app_metadata – more secure for JWT claims)
-- Requires service role / dashboard SQL editor (already privileged):
update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"ADMIN"}'::jsonb
where email = 'admin@example.com';

-- Verify:
-- select id, email, raw_user_meta_data->>'role' as role from auth.users;
