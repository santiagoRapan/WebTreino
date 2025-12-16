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
 * Exercise inputs state for routine builder (V1)
 */
export type ExerciseInputsState = {
  sets: string
  reps: string
  restSec: string
  loadTarget: string
}

/**
 * Exercise inputs state for routine builder (V2)
 * Supports per-set configuration
 */
export type ExerciseInputsStateV2 = {
  numSets: number
  sets: SetInputV2[]
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

// ==========================================
// V2 SCHEMA TYPES (UPCOMING IMPLEMENTATION)
// ==========================================
// These types support the new normalized schema with per-set customization
// Status: Not yet implemented in the application

/**
 * Block exercise V2 - exercise level data without per-set fields
 * Corresponds to block_exercise_v2 table
 */
export interface BlockExerciseV2 {
  id: string
  block_id: string
  exercise_id: string
  display_order: number
  superset_group?: string | null // Renamed from is_superset_group for clarity
  notes?: string | null
}

/**
 * Individual set configuration for V2 schema
 * Corresponds to block_exercise_set_v2 table
 */
export interface BlockExerciseSetV2 {
  id: string
  block_exercise_id: string
  set_index: number // 1, 2, 3, ...
  reps?: string | null // '8', '8-10', 'AMRAP', 'to failure', etc.
  unit?: string | null // 'kg', 'lb', etc.
  load_kg?: number | null // null if bodyweight/N/A
  notes?: string | null
}

/**
 * Complete exercise with all sets - for V2 operations
 * Combines BlockExerciseV2 with its sets
 */
export interface BlockExerciseWithSetsV2 extends BlockExerciseV2 {
  sets: BlockExerciseSetV2[]
}

/**
 * Routine block with V2 exercises - for fetching complete routine structure
 */
export interface RoutineBlockV2 {
  id: string
  routine_id: string
  name: string
  block_order: number
  notes?: string | null
  exercises?: BlockExerciseWithSetsV2[]
}

/**
 * Complete routine structure with V2 schema
 */
export interface RoutineWithBlocksV2 {
  id: string
  owner_id: string
  name: string
  description?: string | null
  created_on: string
  blocks: RoutineBlockV2[]
}

/**
 * Set input for creating/editing exercises in V2 schema
 * Used in UI forms
 */
export interface SetInputV2 {
  set_index: number
  reps: string
  load_kg?: number | null
  unit?: string
  notes?: string
  rest_seconds?: number | null
  rir?: number | null
}

/**
 * Exercise form state for V2 schema
 * Used when adding exercises to a routine with per-set configuration
 */
export interface ExerciseFormStateV2 {
  exercise_id: string
  display_order: number
  superset_group?: string | null
  notes?: string
  sets: SetInputV2[]
}

/**
 * Payload for creating a block exercise with sets in V2 schema
 */
export interface CreateBlockExerciseV2Payload {
  block_id: string
  exercise_id: string
  display_order: number
  superset_group?: string | null
  notes?: string
  sets: Array<{
    set_index: number
    reps?: string
    load_kg?: number | null
    unit?: string
    notes?: string
  }>
}

/**
 * Payload for updating a block exercise in V2 schema
 */
export interface UpdateBlockExerciseV2Payload {
  display_order?: number
  superset_group?: string | null
  notes?: string
  sets?: Array<{
    id?: string // If updating existing set
    set_index: number
    reps?: string
    load_kg?: number | null
    unit?: string
    notes?: string
  }>
}

/**
 * Superset group with exercises for V2 schema
 * Useful for UI rendering of supersets
 */
export interface SupersetGroupV2 {
  group_id: string
  exercises: Array<BlockExerciseWithSetsV2 & { exercise?: Exercise }>
}

/**
 * Exercise summary for V2 - aggregated set information
 * Useful for displaying exercise cards
 */
export interface ExerciseSummaryV2 {
  exercise_id: string
  exercise_name?: string
  total_sets: number
  rep_range?: string // e.g., "8-12" if all sets are in that range
  load_range?: string // e.g., "50-70 kg"
  superset_group?: string | null
}
