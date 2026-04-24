-- =====================================================================
-- Migration: auto-populate public.users on auth signup
-- =====================================================================
-- What this does:
--   * Adds a function + trigger that inserts a public.users row
--     whenever a new auth.users row is created.
--   * Extracts name from raw_user_meta_data (set by:
--       - email signup:  supabase.auth.signUp({ options: { data: { full_name } }})
--       - Google OAuth:  Supabase fills full_name / name automatically)
--   * ON CONFLICT DO NOTHING so re-runs and edge cases are safe.
--
-- Works for both email/password and Google OAuth signups because both
-- funnel through auth.users INSERT.
--
-- SECURITY DEFINER: the function runs with the owner's privileges
-- (postgres in Supabase) so it can INSERT into public.users even
-- though the authenticated role has no INSERT policy on that table.
-- =====================================================================

begin;

-- ----------------------------------------------------------------
-- 1. Function that creates the profile row
-- ----------------------------------------------------------------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      null
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;


-- ----------------------------------------------------------------
-- 2. Trigger: fire after each auth.users insert
-- ----------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();

commit;
