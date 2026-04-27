# SQL migrations

Applied in order (from the bottom of this list up). Each file is a single transaction — wrapped in `begin;` / `commit;`.

For the consolidated current schema (cold-start for a fresh project), see [../docs/callbriefs-schema.sql](../docs/callbriefs-schema.sql).

---

19. `quiet-bobcat.sql` — revokes anon INSERT on `microsite_events`; the `track-event` edge function is the single write path. Apply AFTER deploying the function.
18. `circling-hawk.sql` — promotes `fingerprint_id` / `session_id` from `microsite_events.metadata` to first-class columns + indexes (Phase 2 of event tracking)
17. `peering-mole.sql` — extends `microsite_events.event_type` check constraint to include `session_start` / `session_end` (Phase 1 of event tracking; see [../event-tracking.md](../event-tracking.md))
16. `dreaming-whale.sql` — adds `'failed'` to `calls.status`, pins `calls.created_by` to `auth.uid()` via DEFAULT, INSERT policy + grant on `calls` (org members only)
15. `friendly-raven.sql` — `shares_org_with(user_id)` SECURITY DEFINER helper + a `users` SELECT policy that uses it, so teammates can see each other's profile rows
14. `gliding-heron.sql` — narrows the `documents` storage bucket MIME types to PDF + images only (edge function doesn't handle docx/pptx)
13. `soaring-eagle.sql` — grants `service_role` full access to `public` schema so edge functions (starting with `process-document`) can read/write app tables
12. `fading-owl.sql` — DELETE policy + grant on `documents` (owner/admin only, matching the storage.objects DELETE policy)
11. `prowling-cat.sql` — pins `documents.uploaded_by` to `auth.uid()` via column DEFAULT + policy WITH CHECK (prevents client from spoofing)
10. `hopping-hare.sql` — documents: `file_size`/`mime_type` columns, INSERT policy, `documents` storage bucket (private, 50 MB, allowed MIME list) + storage RLS
9. `dancing-falcon.sql` — replaces the `create_workspace` RPC with an INSERT policy + grant (simpler pattern for single-table inserts)
8. `roaming-lynx.sql` — `create_workspace` RPC (owner/admin-only, called from the Create Workspace drawer)
7. `climbing-goat.sql` — extends `complete_onboarding` to also create a default Sales workspace
6. `galloping-deer.sql` — grants across all public tables + default privileges for future tables
5. `racing-fox.sql` — grants SELECT on memberships
4. `quiet-heron.sql` — fixes recursive RLS on memberships
3. `curious-badger.sql` — `complete_onboarding` RPC
2. `humming-sparrow.sql` — trigger to auto-create `public.users` on auth signup
1. `wandering-otter.sql` — multi-tenant refactor (drops `users.org_id`, creates `memberships`, rewrites RLS)
