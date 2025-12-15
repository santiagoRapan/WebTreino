// Simple authentication service - frontend only
// No complex database operations, just basic Supabase auth

import { supabase } from '@/services/database/supabaseClient'

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(redirectTo?: string) {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo || `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      console.error('Google OAuth error:', error)
      return { error }
    }

    return { data }
  } catch (error) {
    console.error('Unexpected error during Google sign in:', error)
    return { error }
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Sign out error:', error)
      return { error }
    }

    return {}
  } catch (error) {
    console.error('Unexpected error during sign out:', error)
    return { error }
  }
}

/**
 * Get the currently authenticated user
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting current user:', error)
      return null
    }

    return user
  } catch (error) {
    console.error('Unexpected error getting current user:', error)
    return null
  }
}

/**
 * Get the current session
 */
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting current session:', error)
      return null
    }

    return session
  } catch (error) {
    console.error('Unexpected error getting current session:', error)
    return null
  }
}