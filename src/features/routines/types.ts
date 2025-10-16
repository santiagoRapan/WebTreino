// Routines feature types

// Import Exercise type from exercises feature
import type { Exercise } from '@/features/exercises'
export type { Exercise }

/**
 * Routine structure matching database schema
 */
export interface Routine {
  id: string
  owner_id: string
  name: string
  description?: string | null
  created_on: string
}

/**
 * Routine block structure (includes exercises for UI purposes)
 */
export interface RoutineBlock {
  id: string
  routine_id: string
  name: string
  block_order: number
  notes?: string | null
  exercises?: Array<{
    exerciseId: string
    sets: number | null
    reps: number | null
    restSec: number | null
  }>
}

/**
 * Block exercise structure matching database schema
 */
export interface BlockExercise {
  id: string
  block_id: string
  exercise_id: string
  display_order: number
  sets?: number | null
  reps?: string | null // Can be ranges like "8-12" or specific numbers
  load_target?: string | null // Target weight/resistance
  tempo?: string | null // Exercise tempo (e.g., "3-1-2-1")
  rest_seconds?: number | null
  is_superset_group?: string | null // Groups exercises into supersets
  notes?: string | null
}

/**
 * Trainee routine assignment matching database schema
 */
export interface TraineeRoutine {
  id: string
  trainee_id: string
  routine_id: string
  assigned_on: string
}

/**
 * Workout session matching database schema
 */
export interface WorkoutSession {
  id: string
  performer_id: string
  routine_id?: string | null
  started_at: string
  completed_at?: string | null
  notes?: string | null
}

/**
 * Workout set log matching database schema
 */
export interface WorkoutSetLog {
  id: string
  session_id: string
  exercise_id: string
  block_id?: string | null
  block_exercise_id?: string | null
  set_index: number
  reps?: number | null
  weight?: number | null
  rpe?: number | null // Rate of Perceived Exertion (1-10)
  duration_sec?: number | null // For time-based exercises
  rest_seconds?: number | null
  notes?: string | null
}

/**
 * Routine exercise for UI - simplified from BlockExercise
 */
export interface RoutineExercise {
  exerciseId: string
  sets: number | null
  reps: string | null
  rest_seconds: number | null
  load_target?: string | null
  tempo?: string | null
  notes?: string | null
}

/**
 * Routine template structure (for UI purposes)
 * Now uses a flat exercises array instead of blocks
 */
export type RoutineTemplate = {
  id: string
  name: string
  description?: string | null
  exercises: RoutineExercise[]
}

/**
 * Routine folder structure (for UI organization)
 */
export type RoutineFolder = {
  id: string
  name: string
  templates: RoutineTemplate[]
}

/**
 * Exercise inputs state for routine builder
 */
export type ExerciseInputsState = {
  sets: string
  reps: string
  restSec: string
}

/**
 * Exercise filter state
 */
export type ExerciseFilterState = {
  category?: string
  equipment?: string
}

/**
 * Exercise form state for creating new exercises
 */
/**
 * Form state for creating/editing exercises
 * Matches the database schema for exercises table
 */
export type ExerciseFormState = {
  name: string
  gif_URL?: string
  target_muscles: string[]
  body_parts: string[]
  equipments: string[]
  secondary_muscles: string[]
  instructions?: string
  // Legacy fields (not stored in database)
  description?: string
  category?: string
}

/**
 * Pending exercise selection state
 */
export type PendingExercise = {
  exercise: Exercise
  blockId: string
} | null

/**
 * Database block exercise structure (legacy - use BlockExercise instead)
 * @deprecated Use BlockExercise interface instead
 */
export interface DatabaseBlockExercise {
  exercise_id: string
  display_order: number
  sets: number | null
  reps: number | null
  rest_seconds: number | null
  
  is_superset_group?: string
  notes?: string
}
