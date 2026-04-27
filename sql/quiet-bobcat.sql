-- quiet-bobcat — revoke anon INSERT on microsite_events. The track-event
-- edge function (deployed --no-verify-jwt, writes via service-role) is now
-- the single write path for prospect analytics. Direct REST inserts from
-- the client are no longer supported.
--
-- IMPORTANT: apply this AFTER the track-event function is deployed and
-- verified writing rows. Otherwise the client will lose its only path to
-- write events between the migration and the function deploy.
--
-- See event-tracking.md.

begin;

revoke insert on table public.microsite_events from anon;

-- Keep the policy in place for now. RLS without a grant is a no-op for
-- writes (the grant gates whether RLS even runs), but leaving the policy
-- documents intent and avoids breakage if the grant is ever restored.

commit;
