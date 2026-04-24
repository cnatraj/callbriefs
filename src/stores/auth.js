import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/lib/supabase";
import * as authService from "@/services/auth";

let initPromise = null;

export const useAuthStore = defineStore("auth", () => {
  const session = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const user = computed(() => session.value?.user ?? null);
  const isAuthed = computed(() => !!session.value);

  const init = () => {
    if (initPromise) return initPromise;
    initPromise = (async () => {
      const { data } = await authService.getSession();
      session.value = data.session;
      supabase.auth.onAuthStateChange((_event, sess) => {
        session.value = sess;
      });
    })();
    return initPromise;
  };

  const refreshSession = async () => {
    const { data } = await authService.getSession();
    session.value = data.session;
    return data.session;
  };

  const signUpWithEmail = async (payload) => {
    loading.value = true;
    error.value = null;
    const { data, error: err } = await authService.signUpWithEmail(payload);
    if (err) error.value = err.message;
    loading.value = false;
    return { data, error: err };
  };

  const signInWithEmail = async (payload) => {
    loading.value = true;
    error.value = null;
    const { data, error: err } = await authService.signInWithEmail(payload);
    if (err) error.value = err.message;
    loading.value = false;
    return { data, error: err };
  };

  const signInWithGoogle = async () => {
    loading.value = true;
    error.value = null;
    const { error: err } = await authService.signInWithGoogle();
    if (err) {
      error.value = err.message;
      loading.value = false;
    }
  };

  const signOut = async () => {
    await authService.signOut();
  };

  return {
    session,
    user,
    loading,
    error,
    isAuthed,
    init,
    refreshSession,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOut,
  };
});
