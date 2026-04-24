// Single source of truth for UI role → action mappings.
// NOTE: this is the UI-gating layer only. The DB (RLS policies + RPCs) is
// authoritative. Keep these arrays in sync with the server-side rules.

const BY_ROLE = {
  owner: [
    'workspace.create',
    'workspace.delete',
    'workspace.settings',
    'member.invite',
    'member.remove',
    'member.change-role',
    'org.settings',
    'org.delete',
    'document.delete',
  ],
  admin: [
    'workspace.create',
    'workspace.settings',
    'member.invite',
    'member.remove',
    'document.delete',
  ],
  member: [],
}

export const can = (role, action) =>
  !!role && (BY_ROLE[role] ?? []).includes(action)
