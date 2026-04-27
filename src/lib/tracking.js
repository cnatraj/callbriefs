// Prospect-side microsite tracking. See event-tracking.md.
//
// Public API:
//   initTracking(micrositeId)   — call once when the microsite mounts
//   trackEvent(type, extra)     — record an event
//   stopTracking()              — call on unmount; does NOT fire session_end
//
// All events are POSTed to the `track-event` edge function (single write
// path). Normal events use fetch; the unload path uses sendBeacon.
//
// The body is JSON but the Content-Type is `text/plain` — that's a
// "simple" CORS request, so the browser skips the preflight OPTIONS
// entirely. With `application/json` we'd get an OPTIONS+POST pair per
// event AND the preflight would die on pagehide before the actual POST
// could fire. The edge function reads req.text() + JSON.parse() so
// content-type doesn't matter to it.

const FP_KEY = 'cb.fingerprint'
const SESSION_KEY = 'cb.session'
const IDLE_MS = 3 * 60 * 1000
const SESSION_TTL_MS = 12 * 60 * 60 * 1000

let idleTimer = null
let pagehideHandler = null
let clickDelegate = null
let micrositeId = null
let fingerprintId = null
let sessionId = null
let active = false

const isSilentMode = () => {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('track') === 'false'
}

const getOrCreateFingerprint = () => {
  let fp = localStorage.getItem(FP_KEY)
  if (!fp) {
    fp = crypto.randomUUID()
    localStorage.setItem(FP_KEY, fp)
  }
  return fp
}

// Returns { id, created_at, justCreated }. justCreated drives session_start.
const getOrCreateSession = () => {
  const raw = localStorage.getItem(SESSION_KEY)
  if (raw) {
    try {
      const s = JSON.parse(raw)
      const ageMs = Date.now() - new Date(s.created_at).getTime()
      if (s?.id && Number.isFinite(ageMs) && ageMs < SESSION_TTL_MS) {
        return { id: s.id, created_at: s.created_at, justCreated: false }
      }
    } catch {
      // malformed entry — fall through to create a new one
    }
  }
  const fresh = { id: crypto.randomUUID(), created_at: new Date().toISOString() }
  localStorage.setItem(SESSION_KEY, JSON.stringify(fresh))
  return { ...fresh, justCreated: true }
}

// Splits caller's payload into first-class columns vs. the metadata
// jsonb. `section` lives in its own column; everything else lands in
// metadata. fingerprint_id / session_id are columns (Phase 2 schema).
const buildPayload = (eventType, { section = null, ...metadata } = {}) => ({
  microsite_id: micrositeId,
  event_type: eventType,
  fingerprint_id: fingerprintId,
  session_id: sessionId,
  section,
  metadata: Object.keys(metadata).length ? metadata : null,
})

const trackEventUrl = () =>
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-event`

// Single write path. `unload=true` switches to sendBeacon for the
// pagehide case. Body is JSON-shaped but content-type is text/plain so
// the request stays "simple" (no CORS preflight).
const postEvent = (eventType, extra, { unload = false } = {}) => {
  const body = JSON.stringify(buildPayload(eventType, extra))
  const url = trackEventUrl()

  if (unload && typeof navigator !== 'undefined' && navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'text/plain' })
    if (navigator.sendBeacon(url, blob)) return
    // sendBeacon can return false (queue full, body too big). Fall
    // through to fetch+keepalive as a best-effort backup.
  }

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body,
    ...(unload ? { keepalive: true } : {}),
  })
    .then((res) => {
      if (!res.ok) console.error('[tracking] insert failed:', res.status)
    })
    .catch((err) => {
      console.error('[tracking] insert failed:', err)
    })
}

const clearSession = () => {
  localStorage.removeItem(SESSION_KEY)
  sessionId = null
}

const cleanup = () => {
  if (idleTimer) {
    clearTimeout(idleTimer)
    idleTimer = null
  }
  if (pagehideHandler) {
    window.removeEventListener('pagehide', pagehideHandler)
    pagehideHandler = null
  }
  if (clickDelegate) {
    document.removeEventListener('click', clickDelegate)
    clickDelegate = null
  }
  active = false
  // Intentionally keep micrositeId so trackEvent can re-init if a fresh
  // event arrives after an idle session_end.
}

const endSessionFromIdle = async () => {
  if (!active) return
  await postEvent('session_end')
  clearSession()
  cleanup()
}

const resetIdleTimer = () => {
  if (idleTimer) clearTimeout(idleTimer)
  idleTimer = setTimeout(endSessionFromIdle, IDLE_MS)
}

const handlePagehide = () => {
  if (!active) return
  postEvent('session_end', undefined, { unload: true })
  clearSession()
  // Don't bother removing the listener — the document is unloading.
}

// Document-level click delegate. Reads data-tracking-* attributes off
// the closest ancestor with [data-tracking-event] and fires the named
// event. The `section` is auto-resolved by walking up to the nearest
// [data-section-name] ancestor — no need to repeat it on each tracked
// element.
const handleClick = (event) => {
  if (!active) return
  try {
    const target = event.target?.closest?.('[data-tracking-event]')
    if (!target) return

    const eventType = target.dataset.trackingEvent
    if (!eventType) return

    const sectionEl = target.closest('[data-section-name]')
    const section = sectionEl?.dataset.sectionName ?? null

    // Pull every data-tracking-* attribute except `event` into metadata.
    const metadata = {}
    for (const [key, value] of Object.entries(target.dataset)) {
      if (key === 'trackingEvent' || !key.startsWith('tracking')) continue
      const stripped = key.slice('tracking'.length)
      const camel = stripped.charAt(0).toLowerCase() + stripped.slice(1)
      metadata[camel] = value
    }

    trackEvent(eventType, { section, ...metadata })
  } catch (err) {
    console.error('[tracking] click delegate failed:', err)
  }
}

export const initTracking = async (id) => {
  if (typeof window === 'undefined') return
  if (isSilentMode()) return
  if (!id) return

  // Already running for this microsite — no-op.
  if (active && micrositeId === id) return

  // Running for a different microsite — tear down first.
  if (active) cleanup()

  micrositeId = id
  fingerprintId = getOrCreateFingerprint()
  const session = getOrCreateSession()
  sessionId = session.id
  active = true

  // Attach listeners BEFORE the session_start await so a fast tab close
  // during the round-trip still gets a session_end fired.
  resetIdleTimer()

  pagehideHandler = handlePagehide
  window.addEventListener('pagehide', pagehideHandler)

  clickDelegate = handleClick
  document.addEventListener('click', clickDelegate)

  if (session.justCreated) {
    await postEvent('session_start')
  }
}

export const trackEvent = async (eventType, extra = {}) => {
  // Idle session_end may have run; re-init if we're seeing a new event.
  if (!active && micrositeId) await initTracking(micrositeId)
  if (!active) return
  await postEvent(eventType, extra)
  resetIdleTimer()
}

// Called from the microsite component on unmount. Tears down listeners
// and the idle timer but does NOT fire session_end — within an SPA the
// prospect may still be around. Real session_end comes from the idle
// timer or pagehide.
export const stopTracking = () => {
  cleanup()
}
