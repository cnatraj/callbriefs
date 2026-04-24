-- =====================================================================
-- Migration: multi-tenant memberships refactor
-- =====================================================================
-- What this does:
--   * Drops organizations.owner_id
--   * Drops users.org_id and users.role (single-tenant assumptions)
--   * Creates memberships (org_id, user_id, role) as the join table
--   * Constrains "one owner per org" at the DB level
--   * Rewrites RLS SELECT policies to key off memberships
--
-- What this does NOT do (intentional — follow-up steps):
--   * Populate public.users on auth signup (step 2)
--   * INSERT policies / RPCs for onboarding (step 3)
--   * Invites (later)
--
-- Destructive: drops columns. Only run in an environment where
-- losing the current users.org_id / users.role / organizations.owner_id
-- values is acceptable.
-- =====================================================================

begin;

-- ----------------------------------------------------------------
-- 1. Drop existing RLS policies that reference columns we're removing
-- ----------------------------------------------------------------
drop policy if exists "org members can view their org"        on organizations;
drop policy if exists "users can view teammates"              on users;
drop policy if exists "users can update own record"           on users;
drop policy if exists "org members can view workspaces"       on workspaces;
drop policy if exists "org members can view documents"        on documents;
drop policy if exists "org members can view calls"            on calls;
drop policy if exists "org members can view microsites"       on microsites;
drop policy if exists "public can view microsites by slug"    on microsites;
drop policy if exists "public can insert microsite events"    on microsite_events;
drop policy if exists "org members can view microsite events" on microsite_events;


-- ----------------------------------------------------------------
-- 2. Drop columns replaced by the memberships table
-- ----------------------------------------------------------------
alter table organizations drop column if exists owner_id;
alter table users         drop column if exists org_id;
alter table users         drop column if exists role;


-- ----------------------------------------------------------------
-- 3. Create memberships
-- ----------------------------------------------------------------
create table memberships (
  org_id     uuid not null references organizations(id) on delete cascade,
  user_id    uuid not null references users(id)         on delete cascade,
  role       text not null default 'member'
             check (role in ('owner', 'admin', 'member')),
  created_at timestamp with time zone default now(),
  primary key (org_id, user_id)
);

-- Exactly one owner per org, enforced at the DB level
create unique index one_owner_per_org
  on memberships (org_id)
  where role = 'owner';

-- "What orgs does this user belong to?" — hot lookup in the guard
create index memberships_user_id_idx on memberships (user_id);

alter table memberships enable row level security;


-- ----------------------------------------------------------------
-- 4. New RLS policies — all keyed off memberships
-- ----------------------------------------------------------------

-- Organizations: read if I'm a member
create policy "members can view their orgs"
  on organizations for select
  using (
    id in (select org_id from memberships where user_id = auth.uid())
  );

-- Users: read if we share at least one org (or it's me)
create policy "users can view teammates"
  on users for select
  using (
    id = auth.uid()
    or exists (
      select 1
      from memberships m1
      join memberships m2 on m1.org_id = m2.org_id
      where m1.user_id = auth.uid() and m2.user_id = users.id
    )
  );

-- Users: update own record
create policy "users can update own record"
  on users for update
  using (id = auth.uid());

-- Memberships: members can see their org's memberships
create policy "members can view org memberships"
  on memberships for select
  using (
    org_id in (select org_id from memberships where user_id = auth.uid())
  );

-- Workspaces: read if I'm a member of the org
create policy "members can view workspaces"
  on workspaces for select
  using (
    org_id in (select org_id from memberships where user_id = auth.uid())
  );

-- Documents: read if I'm a member of the workspace's org
create policy "members can view documents"
  on documents for select
  using (
    workspace_id in (
      select w.id from workspaces w
      where w.org_id in (select org_id from memberships where user_id = auth.uid())
    )
  );

-- Calls: read if I'm a member of the org
create policy "members can view calls"
  on calls for select
  using (
    org_id in (select org_id from memberships where user_id = auth.uid())
  );

-- Microsites: read if I'm a member of the org (internal view)
create policy "members can view microsites"
  on microsites for select
  using (
    org_id in (select org_id from memberships where user_id = auth.uid())
  );

-- Microsites: public can view (prospect-facing)
-- NOTE: preserves prior behavior — currently any microsite is publicly
-- readable. Tighten later (e.g. WHERE status = 'sent') when invites/
-- publishing flow is in place.
create policy "public can view microsites"
  on microsites for select
  using (true);

-- Microsite events: public can insert (prospect tracking pixels)
create policy "public can insert microsite events"
  on microsite_events for insert
  with check (true);

-- Microsite events: members can view their org's events
create policy "members can view microsite events"
  on microsite_events for select
  using (
    microsite_id in (
      select m.id from microsites m
      where m.org_id in (select org_id from memberships where user_id = auth.uid())
    )
  );

commit;
