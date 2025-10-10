// Student feature types
import type { Client } from '@/features/trainer/types'

/**
 * Request status enum matching database schema
 */
export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'canceled'

/**
 * Request actor enum matching database schema
 */
export type RequestActor = 'alumno' | 'entrenador'

/**
 * Trainer-student relationship matching database schema
 */
export interface TrainerStudent {
  trainer_id: string
  student_id: string
  joined_at: string
}

/**
 * Trainer link request matching database schema
 */
export interface TrainerLinkRequest {
  id: string
  trainer_id: string
  student_id: string
  requested_by: RequestActor
  message?: string | null
  status: RequestStatus
  created_at: string
  decided_at?: string | null
}

/**
 * Workout session data structure matching database schema
 */
export interface WorkoutSession {
  id: string
  performer_id: string
  routine_id: string | null
  started_at: string
  completed_at: string | null
  notes: string | null
  routine?: { id: string; name: string | null; owner_id: string | null } | null
}

/**
 * Workout set log entry matching database schema
 */
export interface WorkoutSetLog {
  id: string
  session_id: string
  exercise_id: string
  exercise_name?: string
  block_id?: string | null
  block_exercise_id?: string | null
  set_index: number
  reps: number | null
  weight: number | null
  rpe: number | null
  duration_sec: number | null
  rest_seconds: number | null
  notes: string | null
}

/**
 * Student data structure (simplified for UI)
 */
export interface Student {
  id: string
  name: string | null
  email?: string
  avatar_url?: string | null
  role: 'alumno'
  created_on?: string
  // Relationship data
  trainer_id?: string
  joined_at?: string
  request_status?: RequestStatus
}

/**
 * Return type for useStudents hook
 */
export interface UseStudentsReturn {
  students: Client[]
  loading: boolean
  error: string | null
  refreshStudents: () => Promise<void>
  fetchStudentSessions: (studentId: string) => Promise<{ sessions: WorkoutSession[]; logs: WorkoutSetLog[] }>
  lastUpdateEvent: Date | null
}

/**
 * Return type for useStudentHistory hook
 */
export interface UseStudentHistoryReturn {
  loadingHistory: boolean
  sessions: WorkoutSession[]
  logs: WorkoutSetLog[]
  fetchHistory: (studentId: string) => Promise<{ sessions: WorkoutSession[]; logs: WorkoutSetLog[] }>
  clearHistory: () => void
}
