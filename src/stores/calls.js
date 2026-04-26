import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { supabase } from '@/lib/supabase'
import * as callsService from '@/services/calls'

const NON_TERMINAL_STATUSES = new Set(['processing'])
const POLL_INTERVAL_MS = 2000

let subscribed = false
let pollTimer = null

export const useCallsStore = defineStore('calls', () => {
  const activeCall = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const loadedCallId = ref(null)

  const microsite = computed(() => activeCall.value?.microsites?.[0] ?? null)

  const loadCall = async (callId) => {
    if (!callId) {
      activeCall.value = null
      loadedCallId.value = null
      return
    }
    // First load shows the spinner; polled refreshes are silent.
    if (loadedCallId.value !== callId) loading.value = true
    error.value = null
    const { data, error: err } = await callsService.getCallWithMicrosite(callId)
    if (err) {
      error.value = err.message
      activeCall.value = null
    } else {
      activeCall.value = data
      loadedCallId.value = callId
    }
    loading.value = false
  }

  const retry = async () => {
    if (!loadedCallId.value) return { error: new Error('No active call') }
    error.value = null
    // Optimistic flip to 'processing' so the UI hides the failed state and
    // shows the pipeline animation immediately. The needsPolling watcher
    // kicks in from this status change and reconciles with the real result
    // when the function eventually finishes.
    if (activeCall.value) {
      activeCall.value = { ...activeCall.value, status: 'processing' }
    }
    const { error: err } = await callsService.retryGenerate(loadedCallId.value)
    if (err) {
      error.value = err.message
      // Roll back the optimistic flip if the invoke itself failed
      // (network error, function unreachable, etc.).
      if (activeCall.value) {
        activeCall.value = { ...activeCall.value, status: 'failed' }
      }
      return { error: err }
    }
    // No await on loadCall — polling already running from the optimistic
    // flip will pick up the final 'ready'/'failed' status.
    return { error: null }
  }

  const reset = () => {
    activeCall.value = null
    loadedCallId.value = null
    error.value = null
  }

  const needsPolling = computed(
    () =>
      !!activeCall.value &&
      NON_TERMINAL_STATUSES.has(activeCall.value.status),
  )

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  watch(needsPolling, (should) => {
    if (should && !pollTimer) {
      pollTimer = setInterval(() => {
        if (loadedCallId.value) loadCall(loadedCallId.value)
      }, POLL_INTERVAL_MS)
    } else if (!should) {
      stopPolling()
    }
  })

  if (!subscribed) {
    subscribed = true
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        stopPolling()
        reset()
      }
    })
  }

  return {
    activeCall,
    microsite,
    loading,
    error,
    loadedCallId,
    loadCall,
    retry,
    reset,
  }
})
