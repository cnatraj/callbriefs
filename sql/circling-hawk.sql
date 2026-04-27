-- circling-hawk — promote fingerprint_id and session_id from
-- microsite_events.metadata to first-class columns. Sessionization
-- queries (Phase 3) will group/filter by these constantly; jsonb path
-- lookups are slower than indexed columns.
--
-- No backfill — Phase 1 rows keep their metadata-style values. Read
-- paths handle both shapes.
--
-- Phase 2 of event tracking. See event-tracking.md.

begin;

alter table microsite_events
  add column fingerprint_id uuid;

alter table microsite_events
  add column session_id uuid;

create index on microsite_events(fingerprint_id);
create index on microsite_events(session_id);

commit;
