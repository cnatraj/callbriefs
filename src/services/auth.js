import { supabase } from '@/lib/supabase'

export const signUpWithEmail = ({ email, password, fullName }) =>
  supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })

export const signInWithEmail = ({ email, password }) =>
  supabase.auth.signInWithPassword({ email, password })

export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })

export const signOut = () => supabase.auth.signOut()

export const getSession = () => supabase.auth.getSession()
