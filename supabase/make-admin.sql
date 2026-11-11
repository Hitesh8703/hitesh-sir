-- =====================================================================
--  MAKE HITESH THE ADMINISTRATOR  (run once, after schema.sql)
--
--  1. First create Hitesh's login in Supabase:
--     Authentication → Users → Add user → Create new user
--     (enter your email + a strong password, tick "Auto Confirm User").
--  2. Replace BOTH copies of the email below with that same email.
--  3. Run this in the SQL Editor.
--
--  The database allows only ONE admin, so this can never be used to
--  create a second one.
-- =====================================================================

-- (Creates the profile row if the login was made before schema.sql was run.)
insert into public.profiles (id, email, full_name)
select id, lower(email), 'Hitesh' from auth.users
where lower(email) = lower('REPLACE-WITH-YOUR-EMAIL@example.com')
on conflict (id) do nothing;

update public.profiles
set role = 'admin',
    full_name = 'Hitesh',
    must_change_password = false,
    status = 'active'
where email = lower('REPLACE-WITH-YOUR-EMAIL@example.com');

-- Check it worked: this should show exactly one row with role = admin.
select id, email, role, status from public.profiles where role = 'admin';
