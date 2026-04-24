// Small helpers for rendering profile rows ({ name?, email? } shape)
// consistently across the app — uploader avatars, teammate lists, etc.

export const profileDisplayName = (profile) => {
  if (!profile) return null
  return profile.name || profile.email || null
}

export const profileInitials = (profile) => {
  if (!profile) return '?'
  if (profile.name) {
    const parts = profile.name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return '?'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return (profile.email?.[0] ?? '?').toUpperCase()
}
