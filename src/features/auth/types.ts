import type { User, Session, AuthError } from '@supabase/supabase-js';
import type { PostgrestError } from '@supabase/postgrest-js';

// Single source of truth for roles
export type AppRole = 'entrenador' | 'alumno' | 'admin';

/**
 * Row as read from public.users
 * (DB always has created_on once inserted)
 */
export interface CustomUser {
  id: string;
  name: string | null;
  role: AppRole;
  avatar_url: string | null;
  created_on: string; // ISO timestamptz from DB
}

/**
 * Payload to create a new row (no created_on; DB fills it)
 */
export interface CreateUserData {
  id: string;
  name: string | null;
  role?: AppRole;            // optional if you want DB default; require it if you set 'entrenador'
  avatar_url?: string | null;
}

/**
 * Partial update payload
 */
export interface UpdateUserData {
  name?: string | null;
  role?: AppRole;
  avatar_url?: string | null;
}

/**
 * Combined auth + custom user snapshot
 */
export interface FullUserData {
  authUser: User | null;
  customUser: CustomUser | null;
  isAuthenticated: boolean;
  session: Session | null;
}

/**
 * Generic Result helpers to avoid optional fields
 */
export type ResultOk<T> = { ok: true; data: T };
export type ResultErr<E> = { ok: false; error: E };
export type Result<T, E> = ResultOk<T> | ResultErr<E>;

/**
 * Auth & DB results
 */
export type AuthResult = Result<User | null, AuthError>;
export type CustomUserResult = Result<CustomUser | null, PostgrestError>;

/**
 * Auth context API
 */
export interface AuthContextType {
  authUser: User | null;
  customUser: CustomUser | null;
  session: Session | null;
  loading: boolean;

  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  signOut: () => Promise<void>;

  isAuthenticated: boolean;
  fullUserData: FullUserData | null;
  refreshUserData: () => Promise<void>;
}

/**
 * Page mode for auth UI
 */
export type AuthMode = 'signin' | 'signup';
