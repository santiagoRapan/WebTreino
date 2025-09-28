"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../database/supabaseClient'
import { signInWithGoogle as authSignInWithGoogle, signOut as authSignOut, createOrUpdateCustomUser, getFullUserData } from './auth'
import { CustomUser, FullUserData } from '@/lib/types/user'

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
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [customUser, setCustomUser] = useState<CustomUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [fullUserData, setFullUserData] = useState<FullUserData | null>(null)

  // Función para refrescar datos del usuario
  const refreshUserData = async () => {
    if (authUser) {
      console.log('Refreshing user data for:', authUser.email)
      const userData = await getFullUserData(authUser)
      setFullUserData(userData)
      setCustomUser(userData.customUser)
      console.log('User data refreshed:', userData)
    }
  }

  // Función para manejar cuando un usuario se autentica
  const handleUserAuthenticated = async (user: User) => {
    console.log('Usuario autenticado, creando/actualizando en BD:', user.email)
    
    try {
      // Crear o actualizar usuario en la tabla users con rol 'entrenador'
      const result = await createOrUpdateCustomUser(user)
      
      if (result.error) {
        console.error('Error guardando usuario en BD:', result.error)
      } else {
        console.log('Usuario guardado exitosamente:', result.customUser)
        setCustomUser(result.customUser || null)
        
        // Actualizar datos completos
        const userData = await getFullUserData(user)
        setFullUserData(userData)
      }
    } catch (error) {
      console.error('Error en handleUserAuthenticated:', error)
    }
  }

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting initial session:', error)
        } else {
          setSession(session)
          setAuthUser(session?.user ?? null)
          
          // Si hay un usuario, cargar sus datos existentes
          if (session?.user) {
            console.log('Loading existing user data for:', session.user.email)
            const userData = await getFullUserData(session.user)
            setFullUserData(userData)
            setCustomUser(userData.customUser)
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Escuchar cambios en el estado de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event)
      setSession(session)
      setAuthUser(session?.user ?? null)
      
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
      
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

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
      setLoading(true)
      const { error } = await authSignOut()
      if (error) {
        console.error('Sign out error:', error.message)
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Error in handleSignOut:', error)
      throw error
    } finally {
      setLoading(false)
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