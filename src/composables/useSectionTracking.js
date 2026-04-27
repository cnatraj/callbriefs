// Phase 2 — section_viewed firing.
//
// One IntersectionObserver per microsite render. Observes every element
// with [data-section-name] and fires `section_viewed` on viewport entry
// with the attribute value as the `section` field. No threshold, no
// dwell — multiple visits = multiple events; the read-time narrator
// infers dwell from event timestamps.
//
// A MutationObserver re-observes any [data-section-name] elements
// added later (e.g., when a tab swap mounts a new tab panel). This
// keeps the composable agnostic to the component tree.

import { onBeforeUnmount, onMounted, nextTick } from 'vue'
import { trackEvent } from '@/lib/tracking'

export function useSectionTracking() {
  let intersectionObserver = null
  let mutationObserver = null

  const handleIntersect = (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      const name = entry.target.dataset?.sectionName
      if (name) trackEvent('section_viewed', { section: name })
    }
  }

  const observeUnder = (root) => {
    if (!root || root.nodeType !== 1) return
    if (root.matches?.('[data-section-name]')) {
      intersectionObserver.observe(root)
    }
    root.querySelectorAll?.('[data-section-name]').forEach((el) => {
      intersectionObserver.observe(el)
    })
  }

  onMounted(async () => {
    await nextTick()
    if (typeof IntersectionObserver === 'undefined') return

    intersectionObserver = new IntersectionObserver(handleIntersect, {
      threshold: 0,
    })
    observeUnder(document.body)

    if (typeof MutationObserver === 'undefined') return

    mutationObserver = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach(observeUnder)
      }
    })
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    })
  })

  onBeforeUnmount(() => {
    intersectionObserver?.disconnect()
    mutationObserver?.disconnect()
  })
}
