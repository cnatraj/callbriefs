-- pouncing-fox — adds device_type to microsite_events. Populated by
-- the track-event edge function from the request user-agent. Phase 1/2
-- rows stay null (no backfill).

begin;

alter table microsite_events
  add column device_type text
    check (device_type in ('mobile', 'tablet', 'desktop', 'unknown'));

commit;
