// Tipos # Tipo para crear un nuevo usuario
export interface CreateUserData {
  id: string // UUID del auth user de Supabase
  name: string
  role?: 'alumno' | 'entrenador'
  avatar_url?: string | null
}

// Tipo para actualizar un usuario existent
export interface UpdateUserData {
  name?: string
  role?: 'alumno' | 'entrenador'
  avatar_url?: string | null
} 
export interface CustomUser {
  id: string
  name: string
  role: 'alumno' | 'entrenador'
  avatar_url: string | null
  created_on: string
}

// Tipo para crear un nuevo usuario
export interface CreateUserData {
  id: string // UUID del auth user de Supabase
  name: string
  role?: 'alumno' | 'entrenador'
  avatar_url?: string | null
}

// Tipo para actualizar un usuario existente
export interface UpdateUserData {
  name?: string
  role?: 'alumno' | 'entrenador'
  avatar_url?: string | null
}

// Tipo combinado que incluye tanto el auth user como el custom user
export interface FullUserData {
  authUser: import('@supabase/supabase-js').User | null
  customUser: CustomUser | null
  isAuthenticated: boolean
}

// Enum para los roles (opcional, para mayor type safety)
export enum UserRole {
  ALUMNO = 'alumno',
  ENTRENADOR = 'entrenador'
}