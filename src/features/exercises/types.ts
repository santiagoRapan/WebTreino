// Exercise feature types

/**
 * Exercise data structure
 */
export interface Exercise {
  id: string
  name: string
  gif_URL?: string
  target_muscles: string[]
  body_parts: string[]
  equipments: string[]
  description?: string
  category?: string
  secondary_muscles: string[]
}

/**
 * Options for useExercises hook
 */
export interface UseExercisesOptions {
  searchTerm?: string
  category?: string
  equipment?: string
  pageSize?: number
  initialLoad?: boolean
}

/**
 * Return type for useExercises hook
 */
export interface UseExercisesReturn {
  exercises: Exercise[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => void
  refetch: () => void
  search: (filters: Partial<UseExercisesOptions>) => void
}

/**
 * Options for useExerciseSearch hook
 */
export interface UseExerciseSearchOptions {
  debounceMs?: number
  pageSize?: number
}

/**
 * Return type for useExerciseSearch hook
 */
export interface UseExerciseSearchReturn {
  // Search state
  searchTerm: string
  setSearchTerm: (term: string) => void
  category: string | undefined
  setCategory: (category: string | undefined) => void
  equipment: string | undefined
  setEquipment: (equipment: string | undefined) => void
  
  // Results
  exercises: Exercise[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => void
  refetch: () => void
  
  // Filter options
  uniqueCategories: string[]
  uniqueEquipments: string[]
  
  // Helper
  isSearchActive: boolean
}
