-- CallBriefs Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";


-- ========================
-- ORGANIZATIONS
-- ========================
create table organizations (
  id              uuid primary key default uuid_generate_v4(),
  owner_id        uuid,                        -- plain UUID, no FK — enforced at app level
  name            text not null,
  logo_url        text,
  brand_color     text,
  domain          text,
  created_at      timestamp with time zone default now()
);


-- ========================
-- USERS
-- ========================
create table users (
  id              uuid primary key references auth.users(id) on delete cascade,
  org_id          uuid not null references organizations(id) on delete cascade,
  name            text,
  email           text not null,
  role            text not null default 'rep' check (role in ('admin', 'rep')),
  created_at      timestamp with time zone default now()
);


-- note: owner_id has no FK constraint — referential integrity enforced at app level
-- owner is distinct from admin — one owner per org, multiple admins allowed


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
  type                text check (type in ('pitch_deck', 'one_pager', 'case_study', 'battlecard', 'other')),
  status              text not null default 'uploaded' check (status in ('uploaded', 'processing', 'ready', 'failed')),
  extracted_content   jsonb,
  uploaded_by         uuid references users(id) on delete set null,
  created_at          timestamp with time zone default now()
);


-- ========================
-- CALLS
-- ========================
create table calls (
  id                uuid primary key default uuid_generate_v4(),
  org_id            uuid not null references organizations(id) on delete cascade,
  workspace_id      uuid not null references workspaces(id) on delete cascade,
  created_by        uuid references users(id) on delete set null,
  prospect_name     text,
  prospect_company  text,
  prospect_email    text,
  transcript        text,
  status            text not null default 'processing' check (status in ('processing', 'ready', 'sent')),
  created_at        timestamp with time zone default now()
);


-- ========================
-- MICROSITES
-- ========================
create table microsites (
  id              uuid primary key default uuid_generate_v4(),
  org_id          uuid not null references organizations(id) on delete cascade,
  workspace_id    uuid not null references workspaces(id) on delete cascade,
  call_id         uuid not null references calls(id) on delete cascade,
  created_by      uuid references users(id) on delete set null,
  slug            text not null unique,
  content         jsonb,
  status          text not null default 'draft' check (status in ('draft', 'sent', 'viewed')),
  sent_at         timestamp with time zone,
  viewed_at       timestamp with time zone,
  created_at      timestamp with time zone default now()
);


-- ========================
-- MICROSITE EVENTS
-- ========================
create table microsite_events (
  id              uuid primary key default uuid_generate_v4(),
  microsite_id    uuid not null references microsites(id) on delete cascade,
  prospect_email  text,
  event_type      text not null check (event_type in ('viewed', 'section_viewed', 'cta_clicked')),
  section         text,
  time_spent_ms   integer,
  metadata        jsonb,
  created_at      timestamp with time zone default now()
);


-- ========================
-- ROW LEVEL SECURITY
-- ========================

alter table organizations     enable row level security;
alter table users             enable row level security;
alter table workspaces        enable row level security;
alter table documents         enable row level security;
alter table calls             enable row level security;
alter table microsites        enable row level security;
alter table microsite_events  enable row level security;


-- ========================
-- RLS POLICIES
-- ========================

-- Organizations: members can read their own org
create policy "org members can view their org"
  on organizations for select
  using (
    id in (
      select org_id from users where id = auth.uid()
    )
  );

-- Users: can view users in same org
create policy "users can view teammates"
  on users for select
  using (
    org_id in (
      select org_id from users where id = auth.uid()
    )
  );

-- Users: can update own record
create policy "users can update own record"
  on users for update
  using (id = auth.uid());

-- Workspaces: org members can view
create policy "org members can view workspaces"
  on workspaces for select
  using (
    org_id in (
      select org_id from users where id = auth.uid()
    )
  );

-- Documents: org members can view
create policy "org members can view documents"
  on documents for select
  using (
    workspace_id in (
      select w.id from workspaces w
      join users u on u.org_id = w.org_id
      where u.id = auth.uid()
    )
  );

-- Calls: org members can view
create policy "org members can view calls"
  on calls for select
  using (
    org_id in (
      select org_id from users where id = auth.uid()
    )
  );

-- Microsites: org members can view
create policy "org members can view microsites"
  on microsites for select
  using (
    org_id in (
      select org_id from users where id = auth.uid()
    )
  );

-- Microsites: public can view by slug (for prospect-facing pages)
create policy "public can view microsites by slug"
  on microsites for select
  using (true);

-- Microsite events: public can insert (prospect tracking)
create policy "public can insert microsite events"
  on microsite_events for insert
  with check (true);

-- Microsite events: org members can view their events
create policy "org members can view microsite events"
  on microsite_events for select
  using (
    microsite_id in (
      select m.id from microsites m
      join users u on u.org_id = m.org_id
      where u.id = auth.uid()
    )
  );


-- ========================
-- INDEXES
-- ========================

create index on users(org_id);
create index on workspaces(org_id);
create index on documents(workspace_id);
create index on calls(org_id);
create index on calls(workspace_id);
create index on microsites(org_id);
create index on microsites(workspace_id);
create index on microsites(call_id);
create index on microsites(slug);
create index on microsite_events(microsite_id);
