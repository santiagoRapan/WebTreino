// Routines feature exports

// Components
export { RoutinesTab } from './components/RoutinesTab'

// Hooks
export { useRoutineState } from './hooks/useRoutineState'
export { useRoutineAssignments } from './hooks/useRoutineAssignments'
export { useRoutineDatabaseV2 as useRoutineDatabase } from './hooks/useRoutineDatabaseV2'

// Services
export {
  createRoutine,
  loadRoutine,
  loadAllRoutines,
  updateRoutine,
  deleteRoutine,
  addExerciseToBlock,
  updateExercise,
  deleteExercise
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
