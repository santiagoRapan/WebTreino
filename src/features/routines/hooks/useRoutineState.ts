"use client"

import { useState, useEffect } from "react"
import { useRoutineDatabaseV2 } from "./useRoutineDatabaseV2"
import { useAuth } from "@/features/auth/services/auth-context"
import type { 
  Exercise, 
  ExerciseFormState, 
  ExerciseFilterState, 
  ExerciseInputsState,
  RoutineFolder, 
  RoutineTemplate,
  RoutineBlock,
  BlockExercise
} from "../types"

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
  selectedFolderId: string | null
  setSelectedFolderId: (id: string | null) => void
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
  exerciseSearchTerm: string
  setExerciseSearchTerm: (term: string) => void
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
  // Exercise Selector State
  pendingExercise: { exercise: Exercise; blockId: string } | null
  setPendingExercise: (exercise: { exercise: Exercise; blockId: string } | null) => void
  showNewRoutineInput: boolean
  setShowNewRoutineInput: (show: boolean) => void
  newRoutineName: string
  setNewRoutineName: (name: string) => void

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
  const { customUser, loading: authLoading } = useAuth()
  
  // Exercise Catalog State - Don't load exercises automatically
  // They will be loaded on-demand when user searches
  const [exercisesCatalog, setExercisesCatalog] = useState<Exercise[]>([])
  const [loadingExercises, setLoadingExercises] = useState(false)
  
  // Database operations for routines
  const routineDatabase = useRoutineDatabaseV2()
  
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
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>('1')
  const [routineSearch, setRoutineSearch] = useState<string>("")
  const [exerciseFilter, setExerciseFilter] = useState<ExerciseFilterState>({})
  
  // Routine Editor State
  const [editingRoutine, setEditingRoutine] = useState<RoutineTemplate | null>(null)
  const [isRoutineEditorOpen, setIsRoutineEditorOpen] = useState<boolean>(false)
  const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState<boolean>(false)
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState<string>("")
  const [viewingRoutine, setViewingRoutine] = useState<RoutineTemplate | null>(null)
  const [isRoutineViewerOpen, setIsRoutineViewerOpen] = useState<boolean>(false)
  
  // UI State for Routine Management
  const [showNewFolderInput, setShowNewFolderInput] = useState<boolean>(false)
  const [newFolderName, setNewFolderName] = useState<string>("")
  const [showExerciseCatalog, setShowExerciseCatalog] = useState<boolean>(false)
  const [catalogSearch, setCatalogSearch] = useState<string>("")
  const [pendingExercise, setPendingExercise] = useState<{ exercise: Exercise; blockId: string } | null>(null)
  const [showNewRoutineInput, setShowNewRoutineInput] = useState<boolean>(false)
  const [newRoutineName, setNewRoutineName] = useState<string>("")

    // Initialize routine folders
  useEffect(() => {
    let cancelled = false;

    const initializeRoutineFolders = async () => {
      // Wait for auth to finish loading before attempting to load routines
      if (authLoading) {
        console.log('⏳ Auth is still loading, waiting...')
        return
      }

      // Don't initialize until we have a customUser (if auth is in progress)
      // customUser will be set after fetchCustomUser completes
      if (!customUser) {
        console.log('⚠️ No user authenticated, using empty routines')
        const defaultFolders: RoutineFolder[] = [
          { id: '1', name: 'Mis rutinas', templates: [] }
        ]
        setRoutineFolders(defaultFolders)
        setSelectedFolderId('1')
        return
      }

      if (!customUser.id) {
        console.log('⚠️ User missing ID, using fallback data')
        const defaultFolders: RoutineFolder[] = [
          { id: '1', name: 'Mis rutinas', templates: [] }
        ]
        setRoutineFolders(defaultFolders)
        setSelectedFolderId('1')
        return
      }
      
      try {
        console.log('✅ Loading routines for user:', customUser.id, customUser.name || 'Unknown')
        // Load routines from database using the authenticated user's ID
        const v2Routines = await routineDatabase.loadRoutinesV2(customUser.id)
        
        // Check if the effect was cancelled (component unmounted or deps changed)
        if (cancelled) return;
        
        // Transform V2 routines to RoutineTemplate format
        const transformedTemplates: RoutineTemplate[] = v2Routines.map(routine => {
          const allExercises: any[] = []
          
          // Flatten blocks and exercises
          routine.blocks.forEach(block => {
            block.exercises?.forEach(exercise => {
              const firstSet = exercise.sets[0]
              allExercises.push({
                exerciseId: exercise.exercise_id,
                sets: exercise.sets.length,
                reps: firstSet?.reps || '10',
                rest_seconds: 90,
                load_target: firstSet?.load_kg ? `${firstSet.load_kg}${firstSet.unit || 'kg'}` : null
              })
            })
          })
          
          return {
            id: routine.id,
            name: routine.name,
            description: routine.description,
            exercises: allExercises
          }
        })
        
        const defaultFolders: RoutineFolder[] = [
          { id: '1', name: 'Mis rutinas', templates: transformedTemplates }
        ]
        setRoutineFolders(defaultFolders)
        setSelectedFolderId('1')
        console.log(`📚 Loaded ${transformedTemplates.length} routines from database`)
      } catch (error) {
        if (cancelled) return;
        console.error('❌ Error loading routines from database:', error)
        // Fallback to default folders
        const defaultFolders: RoutineFolder[] = [
          { id: '1', name: 'Mis rutinas', templates: [] }
        ]
        setRoutineFolders(defaultFolders)
        setSelectedFolderId('1')
      }
    }

    initializeRoutineFolders()

    return () => {
      cancelled = true;
    }
  }, [authLoading, customUser?.id]) // Re-run when auth completes or user ID changes

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
    exerciseSearchTerm,
    setExerciseSearchTerm,
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
    pendingExercise,
    setPendingExercise,
    showNewRoutineInput,
    setShowNewRoutineInput,
    newRoutineName,
    setNewRoutineName,
    // Auth
    customUser
  }
}