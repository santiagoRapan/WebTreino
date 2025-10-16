// Exercises feature exports

// Hooks
export { useExercises } from './hooks/useExercises'
export { useExerciseSearch } from './hooks/useExerciseSearch'

// Services
export {
  createCustomExercise,
  updateCustomExercise,
  deleteCustomExercise,
  getCustomExercises,
} from './services'

// Mappings
export {
  MUSCLE_LABELS,
  SECONDARY_MUSCLE_LABELS,
  BODY_PART_LABELS,
  EQUIPMENT_LABELS,
  musclesArrayToDb,
  secondaryMusclesArrayToDb,
  bodyPartsArrayToDb,
  equipmentsArrayToDb,
  musclesArrayToDisplay,
  secondaryMusclesArrayToDisplay,
  bodyPartsArrayToDisplay,
  equipmentsArrayToDisplay,
  muscleToDisplayName,
  secondaryMuscleToDisplayName,
  bodyPartToDisplayName,
  equipmentToDisplayName,
} from './exerciseMappings'

// Constants
export { FALLBACK_EXERCISES } from './constants'

// Types
export type {
  Exercise,
  UseExercisesOptions,
  UseExercisesReturn,
  UseExerciseSearchOptions,
  UseExerciseSearchReturn
} from './types'
