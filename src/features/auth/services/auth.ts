import { supabase } from '@/services/database/supabaseClient'
import { AuthError, User } from '@supabase/supabase-js'
import type { CustomUser, CreateUserData, UpdateUserData, FullUserData, AuthResponse, CustomUserResponse } from '../types'

// Iniciar sesión con Google y crear/actualizar usuario en tabla custom
export const signInWithGoogle = async (redirectTo?: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo || `${window.location.origin}/dashboard`
      }
    })
    
    if (error) {
      return { error }
    }
    
    // signInWithOAuth no retorna el usuario directamente, solo la URL de redirección
    // El usuario se obtendrá cuando regrese de la redirección
    return { user: null, error: null }
  } catch (error) {
    console.error('Error signing in with Google:', error)
    return { error: error as AuthError }
  }
}

// Crear o actualizar usuario en la tabla users después del login
export const createOrUpdateCustomUser = async (authUser: User): Promise<CustomUserResponse> => {
  try {
    const userData: CreateUserData = {
      id: authUser.id,
      name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuario',
      role: 'entrenador', // Rol por defecto
      avatar_url: authUser.user_metadata?.avatar_url || null
    }

    // Usar upsert para crear o actualizar
    const { data, error } = await supabase
      .from('users')
      .upsert(userData, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating/updating custom user:', error)
      return { error }
    }

    return { customUser: data as CustomUser }
  } catch (error) {
    console.error('Error in createOrUpdateCustomUser:', error)
    return { error }
  }
}

// Cerrar sesión
export const signOut = async (): Promise<{ error?: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    console.error('Error signing out:', error)
    return { error: error as AuthError }
  }
}

// Obtener usuario actual
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Obtener sesión actual
export const getCurrentSession = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Error getting current session:', error)
    return null
  }
}

// Verificar si el usuario está autenticado
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getCurrentSession()
  return !!session
}

// Función para refrescar la sesión
export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession()
    return { session: data.session, error }
  } catch (error) {
    console.error('Error refreshing session:', error)
    return { session: null, error: error as AuthError }
  }
}

// Obtener información del usuario personalizado de la tabla users
export const getCustomUser = async (userId: string): Promise<CustomUserResponse> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error getting custom user:', error)
      return { error }
    }

    return { customUser: data as CustomUser }
  } catch (error) {
    console.error('Error in getCustomUser:', error)
    return { error }
  }
}

// Actualizar información del usuario personalizado
export const updateCustomUser = async (userId: string, updateData: UpdateUserData): Promise<CustomUserResponse> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating custom user:', error)
      return { error }
    }

    return { customUser: data as CustomUser }
  } catch (error) {
    console.error('Error in updateCustomUser:', error)
    return { error }
  }
}

// Obtener datos completos del usuario (auth + custom)
export const getFullUserData = async (authUser: User | null): Promise<FullUserData> => {
  if (!authUser) {
    return {
      authUser: null,
      customUser: null,
      isAuthenticated: false
    }
  }

  const { customUser, error } = await getCustomUser(authUser.id)
  
  if (error) {
    console.error('Error getting full user data:', error)
  }

  return {
    authUser,
    customUser: customUser || null,
    isAuthenticated: true
  }
}