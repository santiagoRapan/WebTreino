// Student feature types

/**
 * Workout session data structure
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
 * Workout set log entry
 */
export interface WorkoutSetLog {
  id: string
  session_id: string
  exercise_id: string
  exercise_name?: string
  set_index: number
  reps: number | null
  weight: number | null
  rpe: number | null
  duration_sec: number | null
  rest_seconds: number | null
  notes: string | null
}

/**
 * Return type for useStudents hook
 */
export interface UseStudentsReturn {
  students: any[] // Will use Client type from trainer
  loading: boolean
  error: string | null
  refreshStudents: () => Promise<void>
  fetchStudentSessions: (studentId: string) => Promise<{ sessions: any[]; logs: any[] }>
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
