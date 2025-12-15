// Routines feature exports

// Components
export { RoutinesTab } from './components/RoutinesTab'

// Hooks
export { useRoutineState } from './hooks/useRoutineState'
export { useRoutineAssignments } from './hooks/useRoutineAssignments'
export { useRoutineDatabaseV2 as useRoutineDatabase } from './hooks/useRoutineDatabaseV2'

// Services
export {
  createRoutineV2 as createRoutine,
  loadRoutineV2 as loadRoutine,
  loadAllRoutinesV2 as loadAllRoutines,
  updateRoutineV2 as updateRoutine,
  deleteRoutineV2 as deleteRoutine,
  addExerciseToBlockV2 as addExerciseToBlock,
  updateExerciseV2 as updateExercise,
  deleteExerciseV2 as deleteExercise,
  // Keep V2 names for compatibility
  createRoutineV2,
  loadRoutineV2,
  loadAllRoutinesV2,
  updateRoutineV2,
  deleteRoutineV2,
  addExerciseToBlockV2,
  updateExerciseV2,
  deleteExerciseV2
} from './services/routineHandlersV2'

// Types
export type {
  RoutineBlock,
  RoutineTemplate,
  RoutineFolder,
  ExerciseInputsState,
  ExerciseInputsStateV2,
  ExerciseFilterState,
  ExerciseFormState,
  PendingExercise,
  DatabaseBlockExercise,
  Exercise,
  // V2 Schema Types
  BlockExerciseV2,
  BlockExerciseSetV2,
  BlockExerciseWithSetsV2,
  RoutineBlockV2,
  RoutineWithBlocksV2,
  SetInputV2,
  ExerciseFormStateV2,
  CreateBlockExerciseV2Payload,
  UpdateBlockExerciseV2Payload,
  SupersetGroupV2,
  ExerciseSummaryV2
} from './types'
