// Routines feature types

// Import Exercise type from exercises feature
import type { Exercise } from '@/features/exercises'
export type { Exercise }

/**
 * Routine block structure
 */
export type RoutineBlock = {
  id: number
  name: string
  exercises: {
    exerciseId: string
    sets: number
    reps: number
    restSec: number
  }[]
  repetitions: number
  restBetweenRepetitions: number
  restAfterBlock: number
}

/**
 * Routine template structure
 */
export type RoutineTemplate = {
  id: number | string // Allow both number (database ID) and string (temp ID)
  name: string
  description?: string
  blocks: RoutineBlock[]
}

/**
 * Routine folder structure
 */
export type RoutineFolder = {
  id: number
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
export type ExerciseFormState = {
  name: string
  gif_URL: string
  target_muscles: string[]
  body_parts: string[]
  equipments: string[]
  secondary_muscles: string[]
  description?: string
  category?: string
}

/**
 * Pending exercise selection state
 */
export type PendingExercise = {
  exercise: Exercise
  blockId: number
} | null

/**
 * Database block exercise structure
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
