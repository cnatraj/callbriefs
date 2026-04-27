-- peering-mole — extend microsite_events.event_type to include the
-- session lifecycle events (session_start / session_end) used by the
-- client-side tracking module (src/lib/tracking.js).
--
-- Phase 1 of event tracking. See event-tracking.md.

begin;

alter table microsite_events
  drop constraint microsite_events_event_type_check;

alter table microsite_events
  add constraint microsite_events_event_type_check
    check (event_type in (
      'session_start',
      'session_end',
      'viewed',
      'section_viewed',
      'cta_clicked'
    ));

commit;
