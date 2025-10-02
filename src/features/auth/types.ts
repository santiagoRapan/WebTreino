// Auth feature types
import { User, Session, AuthError } from '@supabase/supabase-js'

/**
 * Custom user data from the users table
 */
export interface CustomUser {
  id: string
  name: string
  role: 'entrenador' | 'alumno'
  avatar_url?: string | null
  created_on?: string
}

/**
 * Data for creating a new user in the users table
 */
export interface CreateUserData {
  id: string
  name: string
  role: 'entrenador' | 'alumno'
  avatar_url?: string | null
}

/**
 * Data for updating an existing user in the users table
 */
export interface UpdateUserData {
  name?: string
  role?: 'entrenador' | 'alumno'
  avatar_url?: string | null
}

/**
 * Combined auth and custom user data
 */
export interface FullUserData {
  authUser: User | null
  customUser: CustomUser | null
  isAuthenticated: boolean
}

/**
 * Auth response type
 */
export interface AuthResponse {
  user?: User | null
  error?: AuthError | null
}

/**
 * Custom user response type
 */
export interface CustomUserResponse {
  customUser?: CustomUser | null
  error?: any
}

/**
 * Auth context type
 */
export interface AuthContextType {
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

/**
 * Auth page mode
 */
export type AuthMode = 'signin' | 'signup'
