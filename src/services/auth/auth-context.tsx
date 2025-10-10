"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../database/supabaseClient'
import { signInWithGoogle as authSignInWithGoogle, signOut as authSignOut, createOrUpdateCustomUser, getFullUserData } from './auth'
import { CustomUser, FullUserData } from '@/lib/types/user'
import DataCacheManager from '@/lib/cache/dataCache'

interface AuthContextType {
  authUser: User | null
  customUser: CustomUser | null
  session: Session | null
  loading: boolean
  signInWithGoogle: (redirectTo?: string) => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
  fullUserData: FullUserData | null
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [customUser, setCustomUser] = useState<CustomUser | null>(null)
  const [fullUserData, setFullUserData] = useState<FullUserData | null>(null)

  // Computed value for authUser
  const authUser = session?.user ?? null

  // Función para cargar datos del usuario desde la BD
  const loadUserData = async (user: User) => {
    try {
      console.log('Loading user data for:', user.email)
      
      // Get user data from database
      const userData = await getFullUserData(user)
      
      // If user doesn't exist in custom table, create them
      if (!userData.customUser) {
        console.log('User not found in DB, creating...')
        const result = await createOrUpdateCustomUser(user)
        if (result.customUser) {
          setCustomUser(result.customUser)
          setFullUserData({ authUser: user, customUser: result.customUser, isAuthenticated: true })
        }
      } else {
        // User exists, just set the data
        setCustomUser(userData.customUser)
        setFullUserData(userData)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  // Función para refrescar datos del usuario
  const refreshUserData = async () => {
    if (authUser) {
      console.log('Refreshing user data for:', authUser.email)
      await loadUserData(authUser)
    }
  }

  // Initialize session and listen to auth changes (like mobile version)
  useEffect(() => {
    // Fetch initial session
    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Failed to get session:', error)
        } else {
          setSession(session)
          // Load user data if session exists
          if (session?.user) {
            await loadUserData(session.user)
          }
        }
      } catch (error) {
        console.error('Error in fetchSession:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()

    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, 'session:', !!session)
      setSession(session)

      // Load user data when signed in
      if (session?.user) {
        await loadUserData(session.user)
        setLoading(false) // Ensure loading is false after loading data
      } else {
        // Clear data when signed out
        console.log('No session, clearing user data...')
        setCustomUser(null)
        setFullUserData(null)
        setLoading(false) // Important: Set loading to false when signed out
        DataCacheManager.clearAllCaches()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Periodic refresh of user data (every 5 minutes when page is active)
  useEffect(() => {
    if (!authUser || !session) return

    const interval = setInterval(() => {
      if (!document.hidden) {
        console.log('Periodic user data refresh')
        refreshUserData()
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [authUser, session])

  const handleSignInWithGoogle = async (redirectTo?: string) => {
    try {
      setLoading(true)
      const { error } = await authSignInWithGoogle(redirectTo)
      if (error) {
        console.error('Authentication error:', error.message)
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Error in handleSignInWithGoogle:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      console.log('Signing out...')
      
      // Sign out from Supabase
      const { error } = await authSignOut()
      
      if (error) {
        console.error('Sign out error:', error)
      }
      
      // Clear local state immediately (before navigation)
      setSession(null)
      setCustomUser(null)
      setFullUserData(null)
      setLoading(false) // Important: Set loading to false BEFORE navigation
      DataCacheManager.clearAllCaches()
      
      // Use router.push instead of window.location.href to avoid full reload
      // The full reload will happen naturally, but state is already cleared
      window.location.href = '/auth'
    } catch (error) {
      console.error('Error in handleSignOut:', error)
      // Clear state even on error
      setSession(null)
      setCustomUser(null)
      setFullUserData(null)
      setLoading(false)
      DataCacheManager.clearAllCaches()
      window.location.href = '/auth'
    }
  }

  const value = {
    authUser,
    customUser,
    session,
    loading,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
    isAuthenticated: !!authUser && !!session,
    fullUserData,
    refreshUserData
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook para verificar si el usuario está autenticado
export function useRequireAuth() {
  const { authUser, loading } = useAuth()
  
  useEffect(() => {
    if (!loading && !authUser) {
      // Redirigir a la página de login o mostrar modal
      console.warn('User not authenticated')
    }
  }, [authUser, loading])

  return { user: authUser, loading, isAuthenticated: !!authUser }
}