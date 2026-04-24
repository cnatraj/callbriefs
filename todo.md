# TODO

Follow-up items flagged during development. Not blockers — things worth revisiting when the time is right. Strike through or remove entries when done.

## Performance

- **Lazy-load `extracted_content` on drawer open.** The documents list query in [src/services/documents.js](src/services/documents.js) currently selects `extracted_content` (a `jsonb` blob) for every row, even though the Knowledge table view only reads the other columns. If the library grows large (hundreds+ of docs with sizable extracted content), refactor to:
  - Drop `extracted_content` from `getDocumentsForWorkspace`'s select.
  - Add `getDocumentById(id)` to the service + a `loadDocument(id)` action to the documents store.
  - The artifact drawer fetches the full doc lazily on open and caches it on `activeDoc`.
  - Worth doing when the Knowledge page's initial load starts feeling slow — measure before refactoring.

- **Real-time subscription instead of polling.** [src/stores/documents.js](src/stores/documents.js) polls every 2s while any doc is `uploaded` or `processing`. Good enough for a single user, but burns requests at scale. Swap for a Supabase Realtime subscription on `documents` scoped to `current_workspace_id`; live updates, no polling burn. Non-trivial (need to handle channel reconnects) — defer until polling cost shows up in the bill.

## Security / RLS

- **Tighten the microsite public SELECT policy.** [sql/wandering-otter.sql](sql/wandering-otter.sql) preserved the original `using (true)` on `microsites` for prospect-facing reads, meaning *every* row is publicly readable, not just shared ones. When the publishing flow lands, tighten to `using (status = 'sent')`. Worth flagging if microsite drafts ever contain sensitive content.

- **Wire real webhook auth.** The edge function deploys with `--no-verify-jwt` so Supabase webhooks can hit it unauthenticated. Fine for dev; before prod, either (a) add a shared-secret header check at the top of `process-document`, or (b) switch to the `pg_net` pattern with a signed request.

- **Prod auth hygiene before launch.**
  - Turn email confirmation back **on** in Supabase Auth settings (we disabled it for dev so signup produces a session immediately).
  - OAuth callback redirect currently lands on `/login?error=auth_failed` on failure — swap for a more informative error page, or at least render the error query param on `/login`.
  - `Keep me signed in` checkbox on [src/views/auth/Login.vue](src/views/auth/Login.vue) is decorative. Either wire it to a localStorage vs sessionStorage Supabase client swap, or remove the checkbox.
  - `Forgot password?` link on the same page is unwired. Hook to `supabase.auth.resetPasswordForEmail(...)` + a new `/reset-password` view.

- **Edge function error monitoring.** [supabase/functions/process-document/index.ts](supabase/functions/process-document/index.ts) currently just `console.error`s. Wire Sentry / Logtail / etc. before prod so failed Claude calls or permission issues surface somewhere that pages you.

## UX polish

- **Replace `window.confirm()` with a proper modal.** Used in the document delete flow ([src/components/knowledge/ArtifactsTable.vue](src/components/knowledge/ArtifactsTable.vue) + [src/components/knowledge/ArtifactDrawer.vue](src/components/knowledge/ArtifactDrawer.vue)). A shared `ConfirmDialog` component using `AppModal` would cover this and any future destructive actions (remove member, delete workspace, delete org).

- **Sidebar stubs.**
  - "Workspace settings" button in the sidebar workspace picker ([src/components/sidebar/OrgWorkspaceSwitcher.vue](src/components/sidebar/OrgWorkspaceSwitcher.vue)) currently closes the picker and does nothing. Needs a workspace settings page + route.
  - Same picker has a "Create new workspace" button that works; consider adding a disabled/tooltip state for non-admins instead of hiding it silently.

- **ArtifactsTable toolbar stubs.**
  - Search input is decorative. Wire to a client-side filter on `documents.documents` (name substring) as the minimum, or add `.ilike` on the service layer.
  - Grid view toggle renders the icon but doesn't change the layout. Either implement a card grid, or remove the toggle until it's needed.

- **UploadRow right panel (connected sources).** "Google Drive / Notion / SharePoint / Dropbox" tiles in [src/components/knowledge/UploadRow.vue](src/components/knowledge/UploadRow.vue) are decorative. Either hide until those integrations exist, or make clicking route somewhere useful (a Settings → Integrations page).

- **Org switcher in app header.** The data model supports a user belonging to multiple orgs; no UI surfaces it today. Build when a user first ends up in 2+ orgs (likely after invites land).

## Data model additions (needed before certain UI can light up)

- **Tags on documents.** Artifact drawer and the original mock show `#pricing`, `#enterprise`, etc. No tags column/table today. Easiest: add `tags text[]` to `documents` + a simple chip editor in the drawer.

- **Document `updated_at`.** Only `created_at` exists. Add `updated_at timestamptz default now()` + a trigger that bumps it on row UPDATE, then show "Updated Today, 11:02" in the drawer.

- **"Used in" count.** Planned briefs feature will reference documents. When that lands, surface per-doc usage: either a denormalized counter or an aggregate query per row.

- **Document `source`.** Originally "Upload" vs "Google Drive" etc. Add once connected-sources integrations exist.

- **Richer extraction schema.**
  - Confidence / relevance scores per key topic so the drawer can render bars (the original mock had these).
  - "Q&A snippets briefs can cite" — short question/answer pairs extractable from the doc for microsite generation to pull.
  - Both are prompt-side changes plus UI rendering in [src/components/knowledge/ArtifactDrawer.vue](src/components/knowledge/ArtifactDrawer.vue).

- **Document kind badge for non-image/non-pdf.** When docx/pptx support lands (see below), update `MIME_TO_KIND` maps in [src/components/knowledge/ArtifactsTable.vue](src/components/knowledge/ArtifactsTable.vue) and [src/components/knowledge/ArtifactDrawer.vue](src/components/knowledge/ArtifactDrawer.vue) + the storage bucket's `allowed_mime_types`.

## Deferred features (explicitly paused)

- **MVP artifact cap: 5 per workspace (client-side).** Cap upload count at 5 artifacts per workspace while the extraction pipeline runs full-document content into the LLM context — any more than that and we'll hit token limits. Implementation: export `MAX_ARTIFACTS_PER_WORKSPACE = 5` from [src/services/documents.js](src/services/documents.js); in [src/components/knowledge/UploadRow.vue](src/components/knowledge/UploadRow.vue) compute `remainingSlots`, disable the drop zone + Upload button when full, and reject drops that would exceed the cap with a clear inline error. Client-side only for MVP — when we want higher caps we'll need RAG + embeddings + chunking, at which point server-side enforcement also lands.

- **Onboarding checklist.** Discussed and paused. See previous conversation — spec is written but no code. File to create: `src/data/checklistSteps.js` + `src/stores/checklist.js` + wire into `OnboardingBanner.vue` on the dashboard.

- **Invite flow.** Schema + plan discussed but not built. Needs:
  - `invites` table (migration).
  - `create_invite` / `accept_invite` RPCs (SECURITY DEFINER).
  - `/accept-invite?token=...` public route + view.
  - Users page UI for admins to send/revoke invites.
  - Callback + signup paths need to honor a pending-invite token in sessionStorage so users who hit the invite link before signup end up on the right accept screen.

- **docx / pptx support for extraction.** Skipped in Stage 5.4 — Claude doesn't ingest them natively. Two paths:
  - Extract text server-side with `mammoth` (docx) and a pptx parser, send as plain text. Loses embedded images.
  - Convert to PDF (LibreOffice headless or CloudConvert API) and use the existing PDF path. Preserves visuals.

- **Sweeper cron for stuck docs.** If the webhook fails to fire or the edge function crashes before flipping status, docs get stuck in `uploaded`. Low frequency but real. Add a Supabase cron (or scheduled edge function) that finds `uploaded` docs older than N minutes and re-invokes `process-document`.

- **Prompt in a DB table.** [supabase/functions/process-document/prompt.ts](supabase/functions/process-document/prompt.ts) is a file — every prompt tweak requires redeploy. If you iterate the extraction prompt frequently, move it to a `prompts(key, content, version, created_at)` table and have the edge function fetch the latest at runtime. Adds one query per invocation; enables hot iteration.

- **Workspace settings / Org settings / Account settings pages.** Placeholder [src/views/Settings.vue](src/views/Settings.vue) exists but is empty. Real surfaces will cover: rename org, rename workspace, brand kit, billing, member management, API keys (if we expose), etc.

## Documentation

- **Keep the canonical schema in sync.** [docs/callbriefs-schema.sql](docs/callbriefs-schema.sql) drifted once already (stage 5.1 changes weren't reflected until I caught it during stage 5.2). Habit worth building: every `sql/*.sql` migration also gets reflected in the canonical schema in the same commit.
