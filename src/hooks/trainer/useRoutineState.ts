"use client"

import { useState, useEffect } from "react"
import { useRoutineDatabase } from "@/hooks/useRoutineDatabase"
import { useAuth } from "@/services/auth"
import type { 
  Exercise, 
  ExerciseFormState, 
  ExerciseFilterState, 
  ExerciseInputsState,
  RoutineFolder, 
  RoutineTemplate 
} from "@/lib/types/trainer"

export interface UseRoutineStateReturn {
  // Exercise Catalog State
  exercisesCatalog: Exercise[]
  setExercisesCatalog: (exercises: Exercise[]) => void
  loadingExercises: boolean
  
  // Exercise Forms
  newExerciseForm: ExerciseFormState
  setNewExerciseForm: (form: ExerciseFormState) => void
  exerciseInputs: ExerciseInputsState
  setExerciseInputs: (inputs: ExerciseInputsState) => void
  
  // Routine Management
  routineFolders: RoutineFolder[]
  setRoutineFolders: (folders: RoutineFolder[]) => void
  selectedFolderId: number | null
  setSelectedFolderId: (id: number | null) => void
  routineSearch: string
  setRoutineSearch: (search: string) => void
  exerciseFilter: ExerciseFilterState
  setExerciseFilter: (filter: ExerciseFilterState) => void
  
  // Routine Editor State
  editingRoutine: RoutineTemplate | null
  setEditingRoutine: (routine: RoutineTemplate | null) => void
  isRoutineEditorOpen: boolean
  setIsRoutineEditorOpen: (open: boolean) => void
  isExerciseSelectorOpen: boolean
  setIsExerciseSelectorOpen: (open: boolean) => void
  selectedBlockId: number | null
  setSelectedBlockId: (id: number | null) => void
  exerciseSearchTerm: string
  setExerciseSearchTerm: (term: string) => void
  expandedBlocks: Set<number>
  setExpandedBlocks: (blocks: Set<number>) => void
  viewingRoutine: RoutineTemplate | null
  setViewingRoutine: (routine: RoutineTemplate | null) => void
  isRoutineViewerOpen: boolean
  setIsRoutineViewerOpen: (open: boolean) => void
  
  // UI State for Routine Management
  showNewFolderInput: boolean
  setShowNewFolderInput: (show: boolean) => void
  newFolderName: string
  setNewFolderName: (name: string) => void
  showExerciseCatalog: boolean
  setShowExerciseCatalog: (show: boolean) => void
  catalogSearch: string
  setCatalogSearch: (search: string) => void
  restInput: string
  setRestInput: (input: string) => void
  restBlockId: number | null
  setRestBlockId: (id: number | null) => void
  // Exercise Selector State
  pendingExercise: { exercise: Exercise; blockId: number } | null
  setPendingExercise: (exercise: { exercise: Exercise; blockId: number } | null) => void
  showNewRoutineInput: boolean
  setShowNewRoutineInput: (show: boolean) => void
  newRoutineName: string
  setNewRoutineName: (name: string) => void
  newBlockName: string
  setNewBlockName: (name: string) => void

  // Database Operations
  routineDatabase: {
    loading: boolean
    error: string | null
    saveRoutineToDatabase: (routine: RoutineTemplate, ownerId: string) => Promise<number | null>
    loadRoutinesFromDatabase: (ownerId: string) => Promise<RoutineTemplate[]>
    updateRoutineInDatabase: (routine: RoutineTemplate, ownerId: string) => Promise<boolean>
    deleteRoutineFromDatabase: (routineId: number | string, ownerId: string) => Promise<boolean>
  }

  // Auth
  customUser: any // User from auth context
}

// Fallback exercises data
const FALLBACK_EXERCISES: Exercise[] = [
  {
    id: "1",
    name: "Push-ups",
    gif_URL: "",
    target_muscles: ["chest", "triceps"],
    body_parts: ["upper body"],
    equipments: ["body weight"],
    description: "Classic bodyweight exercise for upper body strength",
    secondary_muscles: ["shoulders", "core"],
    category: "strength"
  },
  {
    id: "2", 
    name: "Squats",
    gif_URL: "",
    target_muscles: ["quadriceps", "glutes"],
    body_parts: ["lower body"],
    equipments: ["body weight"],
    description: "Fundamental lower body exercise",
    secondary_muscles: ["hamstrings", "calves"],
    category: "strength"
  },
  {
    id: "3",
    name: "Plank",
    gif_URL: "",
    target_muscles: ["core", "abs"],
    body_parts: ["core"],
    equipments: ["body weight"],
    description: "Isometric core strengthening exercise",
    secondary_muscles: ["shoulders", "glutes"],
    category: "core"
  }
]

export function useRoutineState(): UseRoutineStateReturn {
  // Auth context for user ID
  const { customUser } = useAuth()
  
  // Exercise Catalog State - Don't load exercises automatically
  // They will be loaded on-demand when user searches
  const [exercisesCatalog, setExercisesCatalog] = useState<Exercise[]>([])
  const [loadingExercises, setLoadingExercises] = useState(false)
  
  // Database operations for routines
  const routineDatabase = useRoutineDatabase()
  
  // Exercise Forms
  const [newExerciseForm, setNewExerciseForm] = useState<ExerciseFormState>({
    name: '',
    gif_URL: '',
    target_muscles: [],
    body_parts: [],
    equipments: [],
    description: '',
    secondary_muscles: [],
    category: ''
  })

  const [exerciseInputs, setExerciseInputs] = useState<ExerciseInputsState>({ 
    sets: '', 
    reps: '', 
    restSec: '' 
  })
  
  // Routine Management
  const [routineFolders, setRoutineFolders] = useState<RoutineFolder[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(1)
  const [routineSearch, setRoutineSearch] = useState<string>("")
  const [exerciseFilter, setExerciseFilter] = useState<ExerciseFilterState>({})
  
  // Routine Editor State
  const [editingRoutine, setEditingRoutine] = useState<RoutineTemplate | null>(null)
  const [isRoutineEditorOpen, setIsRoutineEditorOpen] = useState<boolean>(false)
  const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState<boolean>(false)
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null)
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState<string>("")
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set())
  const [viewingRoutine, setViewingRoutine] = useState<RoutineTemplate | null>(null)
  const [isRoutineViewerOpen, setIsRoutineViewerOpen] = useState<boolean>(false)
  
  // UI State for Routine Management
  const [showNewFolderInput, setShowNewFolderInput] = useState<boolean>(false)
  const [newFolderName, setNewFolderName] = useState<string>("")
  const [showExerciseCatalog, setShowExerciseCatalog] = useState<boolean>(false)
  const [catalogSearch, setCatalogSearch] = useState<string>("")
  const [restInput, setRestInput] = useState<string>("")
  const [restBlockId, setRestBlockId] = useState<number | null>(null)
  const [pendingExercise, setPendingExercise] = useState<{ exercise: Exercise; blockId: number } | null>(null)
  const [showNewRoutineInput, setShowNewRoutineInput] = useState<boolean>(false)
  const [newRoutineName, setNewRoutineName] = useState<string>("")
  const [newBlockName, setNewBlockName] = useState<string>("")

    // Initialize routine folders
  useEffect(() => {
    const initializeRoutineFolders = async () => {
      // Use the authenticated user's ID, or skip if no user
      if (!customUser?.id) {
        console.log('No authenticated user found, using fallback data')
        const defaultFolders: RoutineFolder[] = [
          { id: 1, name: 'Mis rutinas', templates: [] }
        ]
        setRoutineFolders(defaultFolders)
        setSelectedFolderId(1)
        return
      }
      
      try {
        console.log('Loading routines for user:', customUser.id)
        // Load routines from database using the authenticated user's ID
        const dbRoutines = await routineDatabase.loadRoutinesFromDatabase(customUser.id)
        
        const defaultFolders: RoutineFolder[] = [
          { id: 1, name: 'Mis rutinas', templates: dbRoutines }
        ]
        setRoutineFolders(defaultFolders)
        setSelectedFolderId(1)
      } catch (error) {
        console.error('Error loading routines from database:', error)
        // Fallback to default folders
        const defaultFolders: RoutineFolder[] = [
          { id: 1, name: 'Mis rutinas', templates: [] }
        ]
        setRoutineFolders(defaultFolders)
        setSelectedFolderId(1)
      }
    }

    initializeRoutineFolders()
  }, [customUser?.id]) // Re-run when user changes

  return {
    exercisesCatalog,
    setExercisesCatalog,
    loadingExercises,
    newExerciseForm,
    setNewExerciseForm,
    exerciseInputs,
    setExerciseInputs,
    routineFolders,
    setRoutineFolders,
    selectedFolderId,
    setSelectedFolderId,
    routineSearch,
    setRoutineSearch,
    exerciseFilter,
    setExerciseFilter,
    editingRoutine,
    setEditingRoutine,
    isRoutineEditorOpen,
    setIsRoutineEditorOpen,
    isExerciseSelectorOpen,
    setIsExerciseSelectorOpen,
    selectedBlockId,
    setSelectedBlockId,
    exerciseSearchTerm,
    setExerciseSearchTerm,
    expandedBlocks,
    setExpandedBlocks,
    viewingRoutine,
    setViewingRoutine,
    isRoutineViewerOpen,
    setIsRoutineViewerOpen,
    showNewFolderInput,
    setShowNewFolderInput,
    newFolderName,
    setNewFolderName,
    showExerciseCatalog,
    setShowExerciseCatalog,
    catalogSearch,
    setCatalogSearch,
    restInput,
    setRestInput,
    restBlockId,
    setRestBlockId,
    pendingExercise,
    setPendingExercise,
    showNewRoutineInput,
    setShowNewRoutineInput,
    newRoutineName,
    setNewRoutineName,
    newBlockName,
    setNewBlockName,
    // Database operations
    routineDatabase,
    // Auth
    customUser
  }
}