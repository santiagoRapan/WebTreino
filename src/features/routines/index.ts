// Routines feature exports

// Components
export { RoutinesTab } from './components/RoutinesTab'

// Hooks
export { useRoutineState } from './hooks/useRoutineState'
export { useRoutineDatabase } from './hooks/useRoutineDatabase'
export { useRoutineAssignments } from './hooks/useRoutineAssignments'

// Services
export { createRoutineHandlers } from './services/routineHandlers'
export type { RoutineHandlers } from './services/routineHandlers'

// Types
export type {
  RoutineBlock,
  RoutineTemplate,
  RoutineFolder,
  ExerciseInputsState,
  ExerciseFilterState,
  ExerciseFormState,
  PendingExercise,
  DatabaseBlockExercise,
  Exercise
} from './types'
