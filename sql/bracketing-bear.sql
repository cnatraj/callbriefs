-- bracketing-bear — adds session_start / session_end timestamp columns to
-- microsite_session_narratives so the session entity owns its own time
-- bracket. Used by the Story feed for live-session ("still reading")
-- detection and session-duration display without re-querying raw events.
-- Backfills existing rows from microsite_events on the same session_id.

begin;

alter table microsite_session_narratives
  add column session_start timestamptz,
  add column session_end   timestamptz;

-- Backfill from raw events. session_start defaults to the matching
-- session_start event's timestamp; session_end to the matching
-- session_end event's timestamp. Sessions that never produced a
-- session_end (browser crash, force-quit) keep session_end null.
update microsite_session_narratives n
set session_start = (
      select min(e.created_at)
      from microsite_events e
      where e.session_id = n.session_id
        and e.event_type = 'session_start'
    ),
    session_end = (
      select max(e.created_at)
      from microsite_events e
      where e.session_id = n.session_id
        and e.event_type = 'session_end'
    )
where n.session_start is null;

commit;
