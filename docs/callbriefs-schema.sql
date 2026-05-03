-- =====================================================================
-- CallBriefs — Consolidated Database Schema
-- =====================================================================
-- This is the canonical current state after all migrations have been
-- applied. Use this for a cold start against a fresh Supabase project.
--
-- For the migration history (applied one file at a time), see /sql/.
--
-- Safe to run on a fresh database. Not idempotent against an existing
-- one — it'll collide with the already-created tables/policies.
-- =====================================================================


-- Enable UUID extension
create extension if not exists "uuid-ossp";


-- ========================
-- ORGANIZATIONS
-- ========================
-- No owner_id column — ownership lives on memberships (role = 'owner').
create table organizations (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  logo_url        text,
  brand_color     text,
  domain          text,
  created_at      timestamp with time zone default now()
);


-- ========================
-- USERS (profile row; one per auth.users)
-- ========================
-- No org_id, no role — both live on memberships. This row is
-- auto-created by the on_auth_user_created trigger below.
create table users (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null,
  name            text,
  created_at      timestamp with time zone default now()
);


-- ========================
-- MEMBERSHIPS (users ↔ organizations, multi-tenant)
-- ========================
create table memberships (
  org_id     uuid not null references organizations(id) on delete cascade,
  user_id    uuid not null references users(id)         on delete cascade,
  role       text not null default 'member'
             check (role in ('owner', 'admin', 'member')),
  created_at timestamp with time zone default now(),
  primary key (org_id, user_id)
);

-- Exactly one owner per org
create unique index one_owner_per_org
  on memberships (org_id)
  where role = 'owner';

-- Hot lookup: "what orgs does this user belong to?"
create index memberships_user_id_idx on memberships (user_id);


-- ========================
-- WORKSPACES
-- ========================
create table workspaces (
  id              uuid primary key default uuid_generate_v4(),
  org_id          uuid not null references organizations(id) on delete cascade,
  name            text not null,
  type            text not null check (type in ('sales', 'onboarding', 'customer_service')),
  created_at      timestamp with time zone default now()
);


-- ========================
-- DOCUMENTS
-- ========================
create table documents (
  id                  uuid primary key default uuid_generate_v4(),
  workspace_id        uuid not null references workspaces(id) on delete cascade,
  name                text not null,
  file_url            text,
  mime_type           text,
  file_size           bigint,
  type                text check (type in ('pitch_deck', 'one_pager', 'case_study', 'battlecard', 'other')),
  status              text not null default 'uploaded' check (status in ('uploaded', 'processing', 'ready', 'failed')),
  extracted_content   jsonb,
  uploaded_by         uuid default auth.uid() references users(id) on delete set null,
  created_at          timestamp with time zone default now()
);


-- ========================
-- CALLS
-- ========================
create table calls (
  id                uuid primary key default uuid_generate_v4(),
  org_id            uuid not null references organizations(id) on delete cascade,
  workspace_id      uuid not null references workspaces(id) on delete cascade,
  created_by        uuid default auth.uid() references users(id) on delete set null,
  prospect_name     text,
  prospect_company  text,
  prospect_email    text,
  transcript        text,
  status            text not null default 'processing' check (status in ('processing', 'ready', 'sent', 'failed')),
  created_at        timestamp with time zone default now()
);


-- ========================
-- MICROSITES
-- ========================
create table microsites (
  id                  uuid primary key default uuid_generate_v4(),
  org_id              uuid not null references organizations(id) on delete cascade,
  workspace_id        uuid not null references workspaces(id) on delete cascade,
  call_id             uuid not null references calls(id) on delete cascade,
  created_by          uuid references users(id) on delete set null,
  slug                text not null unique,
  content             jsonb,
  overall_narrative   jsonb,
  status              text not null default 'draft' check (status in ('draft', 'sent', 'viewed')),
  sent_at             timestamp with time zone,
  viewed_at           timestamp with time zone,
  created_at          timestamp with time zone default now()
);


-- ========================
-- MICROSITE EVENTS
-- ========================
create table microsite_events (
  id              uuid primary key default uuid_generate_v4(),
  microsite_id    uuid not null references microsites(id) on delete cascade,
  prospect_email  text,
  fingerprint_id  uuid,
  session_id      uuid,
  event_type      text not null check (event_type in ('session_start', 'session_end', 'viewed', 'section_viewed', 'cta_clicked')),
  section         text,
  time_spent_ms   integer,
  device_type     text check (device_type in ('mobile', 'tablet', 'desktop', 'unknown')),
  metadata        jsonb,
  created_at      timestamp with time zone default now()
);


-- ========================
-- MICROSITE SESSION NARRATIVES
-- ========================
-- Per-session narration generated by the narrate-session edge function
-- on every session_end. The overall_narrative on microsites is the
-- denormalized rollup, regenerated in the same LLM call.
create table microsite_session_narratives (
  id              uuid primary key default uuid_generate_v4(),
  session_id      uuid not null,
  microsite_id    uuid not null references microsites(id) on delete cascade,
  fingerprint_id  uuid,
  narrative       text,
  signals         jsonb,
  events_count    integer,
  session_start   timestamptz,
  session_end     timestamptz,
  status          text not null default 'processing'
                    check (status in ('processing', 'ready', 'failed')),
  generated_at    timestamp with time zone default now()
);


-- ========================
-- INDEXES
-- ========================
create index on workspaces(org_id);
create index on documents(workspace_id);
create index on calls(org_id);
create index on calls(workspace_id);
create index on microsites(org_id);
create index on microsites(workspace_id);
create index on microsites(call_id);
create index on microsites(slug);
create index on microsite_events(microsite_id);
create index on microsite_events(fingerprint_id);
create index on microsite_events(session_id);
create index on microsite_session_narratives(microsite_id);
create index on microsite_session_narratives(session_id);


-- ========================
-- ROW LEVEL SECURITY — enable
-- ========================
alter table organizations     enable row level security;
alter table users             enable row level security;
alter table memberships       enable row level security;
alter table workspaces        enable row level security;
alter table documents         enable row level security;
alter table calls             enable row level security;
alter table microsites        enable row level security;
alter table microsite_events  enable row level security;
alter table microsite_session_narratives enable row level security;


-- ========================
-- RLS POLICIES
-- ========================
-- NOTE: do not write self-referencing policies (e.g., a policy on
-- memberships that queries memberships). That causes infinite recursion.
-- Use a SECURITY DEFINER helper function for cross-row checks.

-- Organizations: members can read their own orgs
create policy "members can view their orgs"
  on organizations for select
  using (
    id in (select org_id from memberships where user_id = auth.uid())
  );

-- Users: can view self (bootstrap case — user has no memberships yet
-- so shares_org_with would return false)
create policy "users can view own record"
  on users for select
  using (id = auth.uid());

-- Users: can view teammates (people we share at least one org with).
-- Uses a SECURITY DEFINER helper to avoid RLS recursion on memberships.
create policy "users can view teammates"
  on users for select
  using (shares_org_with(id));

-- Users: can update own record
create policy "users can update own record"
  on users for update
  using (id = auth.uid());

-- Memberships: users can view their own memberships (non-recursive)
create policy "users can view their own memberships"
  on memberships for select
  using (user_id = auth.uid());

-- Workspaces: org members can view
create policy "members can view workspaces"
  on workspaces for select
  using (
    org_id in (select org_id from memberships where user_id = auth.uid())
  );

-- Documents: org members can view
create policy "members can view documents"
  on documents for select
  using (
    workspace_id in (
      select w.id from workspaces w
      where w.org_id in (select org_id from memberships where user_id = auth.uid())
    )
  );

-- Calls: org members can view
create policy "members can view calls"
  on calls for select
  using (
    org_id in (select org_id from memberships where user_id = auth.uid())
  );

-- Microsites: org members can view
create policy "members can view microsites"
  on microsites for select
  using (
    org_id in (select org_id from memberships where user_id = auth.uid())
  );

-- Microsites: public can view (prospect-facing)
-- TODO: tighten to WHERE status = 'sent' once publishing flow exists.
create policy "public can view microsites"
  on microsites for select
  using (true);

-- Microsite events: public can insert (prospect tracking pixels)
create policy "public can insert microsite events"
  on microsite_events for insert
  with check (true);

-- Microsite events: org members can view their org's events
create policy "members can view microsite events"
  on microsite_events for select
  using (
    microsite_id in (
      select m.id from microsites m
      where m.org_id in (select org_id from memberships where user_id = auth.uid())
    )
  );

-- Microsite session narratives: org members can view their org's narratives
create policy "members can view session narratives"
  on microsite_session_narratives for select
  using (
    microsite_id in (
      select m.id from microsites m
      where m.org_id in (select org_id from memberships where user_id = auth.uid())
    )
  );


-- ========================
-- GRANTS
-- ========================
-- RLS layers on top of table grants, so each role needs explicit SELECT.

grant usage on schema public to anon, authenticated;

-- authenticated: read anywhere the RLS allows
grant select on table public.organizations     to authenticated;
grant select on table public.users             to authenticated;
grant select on table public.memberships       to authenticated;
grant select on table public.workspaces        to authenticated;
grant select on table public.documents         to authenticated;
grant select on table public.calls             to authenticated;
grant select on table public.microsites        to authenticated;
grant select on table public.microsite_events  to authenticated;

-- authenticated: update own profile row (RLS enforces "only own")
grant update on table public.users to authenticated;

-- anon: prospect-facing reads. Tracking writes go through the
-- track-event edge function (service-role) — anon does NOT write events
-- directly.
grant select on table public.microsites        to anon;

-- Default privileges so new tables auto-grant SELECT to authenticated.
-- Stops the "create table, forget grant, hit 42501" loop.
alter default privileges in schema public
  grant select on tables to authenticated;


-- ========================
-- TRIGGER: auto-create public.users on auth.users insert
-- ========================
-- Works for both email signup and Google OAuth (both insert into
-- auth.users). Extracts name from raw_user_meta_data.
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();


-- ========================
-- RPC: complete_onboarding
-- ========================
-- Called from the client after onboarding form submit. Atomically
-- creates an org + owner membership for the authenticated user.
-- SECURITY DEFINER bypasses the lack of INSERT policies on
-- organizations and memberships — this is intentional and the only
-- write path to those tables.
create or replace function public.complete_onboarding(
  p_org_name   text,
  p_org_domain text default null
)
returns table (
  org_id uuid,
  role   text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_org_id  uuid;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (select 1 from public.users where id = v_user_id) then
    raise exception 'User profile missing';
  end if;

  if p_org_name is null or length(trim(p_org_name)) = 0 then
    raise exception 'Organization name is required';
  end if;

  insert into public.organizations (name, domain)
  values (trim(p_org_name), nullif(trim(p_org_domain), ''))
  returning id into v_org_id;

  insert into public.memberships (org_id, user_id, role)
  values (v_org_id, v_user_id, 'owner');

  -- Default Sales workspace — every new org starts with one
  insert into public.workspaces (org_id, name, type)
  values (v_org_id, 'Sales', 'sales');

  return query select v_org_id, 'owner'::text;
end;
$$;

grant execute on function public.complete_onboarding(text, text) to authenticated;


-- ========================
-- HELPER: shares_org_with
-- ========================
-- SECURITY DEFINER helper used by the users "view teammates" policy to
-- avoid RLS recursion — we need to read both sides of a memberships
-- join, and the memberships policy restricts to the caller's rows.
create or replace function public.shares_org_with(p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
      from public.memberships m1
      join public.memberships m2 on m1.org_id = m2.org_id
      where m1.user_id = auth.uid()
        and m2.user_id = p_user_id
  );
$$;

grant execute on function public.shares_org_with(uuid) to authenticated;


-- Workspaces: owners and admins of the target org can insert.
-- Single-table insert with an authorization rule — fits the INSERT
-- policy pattern better than an RPC. The client inserts via
-- supabase.from('workspaces').insert({...}).
create policy "owners and admins can create workspaces"
  on workspaces for insert
  with check (
    exists (
      select 1
        from memberships m
        where m.user_id = auth.uid()
          and m.org_id = workspaces.org_id
          and m.role in ('owner', 'admin')
    )
  );

grant insert on table public.workspaces to authenticated;


-- Documents: any org member can insert into a workspace in their org.
-- uploaded_by is pinned to auth.uid() — the column DEFAULT sets it
-- automatically, and the WITH CHECK rejects any other value.
create policy "members can add documents"
  on documents for insert
  with check (
    uploaded_by = auth.uid()
    and exists (
      select 1
        from workspaces w
        join memberships m on m.org_id = w.org_id
        where w.id = documents.workspace_id
          and m.user_id = auth.uid()
    )
  );

grant insert on table public.documents to authenticated;

-- Documents: owners and admins can delete.
create policy "owners and admins can delete documents"
  on documents for delete
  using (
    exists (
      select 1
        from workspaces w
        join memberships m on m.org_id = w.org_id
        where w.id = documents.workspace_id
          and m.user_id = auth.uid()
          and m.role in ('owner', 'admin')
    )
  );

grant delete on table public.documents to authenticated;


-- Calls: any org member can create a call in a workspace they belong to.
-- created_by is pinned to auth.uid() via column DEFAULT; WITH CHECK
-- prevents spoofing.
create policy "members can create calls"
  on calls for insert
  with check (
    created_by = auth.uid()
    and exists (
      select 1
        from workspaces w
        join memberships m on m.org_id = w.org_id
        where w.id = calls.workspace_id
          and w.org_id = calls.org_id
          and m.user_id = auth.uid()
    )
  );

grant insert on table public.calls to authenticated;


-- ========================
-- STORAGE: documents bucket
-- ========================
-- Private bucket for uploaded artifacts. 50 MB cap, specific MIME list.
-- Path convention: {org_id}/{workspace_id}/{uuid}.{ext}
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  52428800,  -- 50 MB
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif'
  ]
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;


-- Storage RLS on storage.objects. First path segment = org_id; used to
-- scope read/write/delete to members of that org.
create policy "org members can upload documents"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1]::uuid in (
      select m.org_id from memberships m where m.user_id = auth.uid()
    )
  );

create policy "org members can read documents"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1]::uuid in (
      select m.org_id from memberships m where m.user_id = auth.uid()
    )
  );

create policy "owners and admins can delete documents"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1]::uuid in (
      select m.org_id from memberships m
        where m.user_id = auth.uid()
          and m.role in ('owner', 'admin')
    )
  );
