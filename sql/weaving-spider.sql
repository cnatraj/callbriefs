-- weaving-spider — adds narration storage for prospect-side session
-- events. Phase 3 of event tracking. See event-tracking.md.

begin;

-- Per-session narrative. One row per session_id (in normal flow), but
-- the PK is its own uuid — session_id has no unique constraint so
-- edge cases (re-narration, etc.) don't blow up.
create table microsite_session_narratives (
  id              uuid primary key default uuid_generate_v4(),
  session_id      uuid not null,
  microsite_id    uuid not null references microsites(id) on delete cascade,
  fingerprint_id  uuid,
  narrative       text,
  signals         jsonb,
  events_count    integer,
  status          text not null default 'processing'
                    check (status in ('processing', 'ready', 'failed')),
  generated_at    timestamp with time zone default now()
);

create index on microsite_session_narratives(microsite_id);
create index on microsite_session_narratives(session_id);

alter table microsite_session_narratives enable row level security;

-- Org members can view their org's session narratives.
create policy "members can view session narratives"
  on microsite_session_narratives for select
  using (
    microsite_id in (
      select m.id from microsites m
      where m.org_id in (select org_id from memberships where user_id = auth.uid())
    )
  );

-- Overall narrative — denormalized snapshot per microsite, regenerated
-- by narrate-session on every session_end. Read inherits the existing
-- "members can view microsites" policy.
alter table microsites add column overall_narrative jsonb;

commit;
