-- =====================================================================
-- Fix: grant service_role full access to public schema
-- =====================================================================
-- The process-document edge function authenticates with the service_role
-- key and ran into 42501 "permission denied for table documents" when
-- trying to UPDATE. Supabase usually sets these defaults automatically,
-- but whatever path this project took at provisioning didn't include
-- them for our tables. Explicit is safer.
--
-- service_role should have full access so edge functions (and any
-- future background jobs that use the service_role key) can operate
-- on app data without fighting RLS or per-grant plumbing.
-- =====================================================================

begin;

-- Full access on all existing tables + sequences in public
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all functions in schema public to service_role;

-- Default privileges so future tables/sequences/functions auto-grant
alter default privileges in schema public
  grant all on tables to service_role;
alter default privileges in schema public
  grant all on sequences to service_role;
alter default privileges in schema public
  grant all on functions to service_role;

commit;
