"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/services/database/supabaseClient'
import { signInWithGoogle as authSignInWithGoogle, signOut as authSignOut, createOrUpdateCustomUser, getFullUserData, getCustomUser } from './auth'
import type { CustomUser, FullUserData, AuthContextType } from '../types'
import { logAuthState, detectAuthIssues, createAuthDebugInfo } from '@/lib/debug/auth-debug'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [customUser, setCustomUser] = useState<CustomUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [fullUserData, setFullUserData] = useState<FullUserData | null>(null)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  // Función para refrescar datos del usuario
  const refreshUserData = async () => {
    if (authUser) {
      try {
        console.log('Refreshing user data for:', authUser.email)
        const userData = await getFullUserData(authUser)
        setFullUserData(userData)
        setCustomUser(userData.customUser)
        console.log('User data refreshed:', userData)
      } catch (error) {
        console.error('Error refreshing user data:', error)
      }
    }
  }

  // Función para manejar cuando un usuario se autentica
  const handleUserAuthenticated = async (user: User) => {
    console.log('Usuario autenticado, verificando si necesita creación/actualización en BD:', user.email)
    
    try {
      // Primero verificar si el usuario ya existe
      const existingUserResult = await getCustomUser(user.id)
      
      if (existingUserResult.error || !existingUserResult.customUser) {
        // Usuario no existe, crear nuevo
        console.log('Usuario no existe, creando nuevo usuario en BD')
        const result = await createOrUpdateCustomUser(user)
        
        if (result.error) {
          console.error('Error guardando usuario en BD:', result.error)
        } else {
          console.log('Usuario creado exitosamente:', result.customUser)
          setCustomUser(result.customUser || null)
        }
      } else {
        // Usuario ya existe, solo actualizar datos en memoria
        console.log('Usuario ya existe, actualizando datos en memoria')
        setCustomUser(existingUserResult.customUser)
      }
      
      // Actualizar datos completos
      const userData = await getFullUserData(user)
      setFullUserData(userData)
    } catch (error) {
      console.error('Error en handleUserAuthenticated:', error)
    }
  }

  useEffect(() => {
    // Timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timeout - forcing loading to false')
        setLoading(false)
        setInitialLoadComplete(true)
      }
    }, 10000) // 10 second timeout

    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting initial session:', error)
          setLoading(false)
          setInitialLoadComplete(true)
          return
        }

        console.log('Initial session loaded:', session?.user?.email || 'No user')
        setSession(session)
        setAuthUser(session?.user ?? null)
        
        // Si hay un usuario, cargar sus datos existentes
        if (session?.user) {
          try {
            console.log('Loading existing user data for:', session.user.email)
            const userData = await getFullUserData(session.user)
            setFullUserData(userData)
            setCustomUser(userData.customUser)
          } catch (userDataError) {
            console.error('Error loading user data:', userDataError)
            // Continue even if user data fails to load
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
      } finally {
        console.log('Initial load complete')
        clearTimeout(loadingTimeout)
        setLoading(false)
        setInitialLoadComplete(true)
      }
    }

    getInitialSession()

    // Escuchar cambios en el estado de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email || 'No user')
      
      // Only update loading state if initial load is complete
      if (initialLoadComplete) {
        setLoading(true)
      }
      
      setSession(session)
      setAuthUser(session?.user ?? null)
      
      try {
        // Manejar diferentes eventos de autenticación
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in:', session.user.email)
          await handleUserAuthenticated(session.user)
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out')
          setCustomUser(null)
          setFullUserData(null)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('Token refreshed')
          // Opcional: refrescar datos del usuario si es necesario
        }
      } catch (error) {
        console.error('Error handling auth state change:', error)
      } finally {
        // Always reset loading state after handling auth changes
        if (initialLoadComplete) {
          setLoading(false)
        }
      }
    })

    return () => {
      clearTimeout(loadingTimeout)
      subscription.unsubscribe()
    }
  }, [initialLoadComplete])

  // Refresh user data when page becomes visible (handles tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && authUser && session) {
        console.log('Page became visible, refreshing user data')
        refreshUserData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [authUser, session])

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
      console.log('Starting Google sign in...')
      setLoading(true)
      const { error } = await authSignInWithGoogle(redirectTo)
      if (error) {
        console.error('Authentication error:', error.message)
        throw new Error(error.message)
      }
      console.log('Google sign in initiated successfully')
    } catch (error) {
      console.error('Error in handleSignInWithGoogle:', error)
      throw error
    } finally {
      // Don't set loading to false here - let the auth state change handle it
      console.log('Sign in process completed')
    }
  }

  const handleSignOut = async () => {
    try {
      console.log('Starting sign out...')
      setLoading(true)
      const { error } = await authSignOut()
      if (error) {
        console.error('Sign out error:', error.message)
        throw new Error(error.message)
      }
      console.log('Sign out completed successfully')
    } catch (error) {
      console.error('Error in handleSignOut:', error)
      throw error
    } finally {
      // Don't set loading to false here - let the auth state change handle it
      console.log('Sign out process completed')
    }
  }

  // Debug logging for auth state changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const debugInfo = createAuthDebugInfo(
        loading,
        authUser,
        customUser,
        session,
        !!authUser && !!session,
        initialLoadComplete
      )
      
      logAuthState(debugInfo)
      
      const issues = detectAuthIssues(debugInfo)
      if (issues.length > 0) {
        console.warn('🚨 Auth Issues Detected:', issues)
      }
    }
  }, [loading, authUser, customUser, session, initialLoadComplete])

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