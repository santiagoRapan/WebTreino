"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTrainerDashboard } from "@/lib/context/TrainerDashboardContext"
import { useTranslation } from "@/lib/i18n/LanguageProvider"
import { useExerciseSearch } from "@/features/exercises"
import { useAuth } from "@/features/auth/services/auth-context"
import { supabase } from "@/services/database"
import { toast } from "@/hooks/use-toast"
import {
  useRoutineDatabase,
  updateRoutine,
  type CreateBlockExerciseV2Payload,
  type RoutineTemplate,
} from "@/features/routines"
import { RoutinesHeader } from "./RoutinesHeader"
import { RoutinesFoldersList } from "./RoutinesFoldersList"
import { RoutinesTemplatesList } from "./RoutinesTemplatesList"
import { ExerciseCatalog } from "./ExerciseCatalog"
import { CreateExerciseDialog } from "./CreateExerciseDialog"
import { ExerciseSelectorDialogV2 } from "./ExerciseSelectorDialogV2"
import { RoutineEditorDialog } from "./RoutineEditorDialog"
import type { SetInputV2 } from "../types"

export function RoutinesTab() {
  const { t } = useTranslation()
  const { authUser, customUser } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const goToNewRoutine = useCallback(() => {
    router.push('/rutinas/nueva')
  }, [router])

  const goToEditRoutine = useCallback((template: RoutineTemplate) => {
    router.push(`/rutinas/${template.id}`)
  }, [router])

  const ownerId = customUser?.id ?? authUser?.id

  // Routine Database hook
  const routineDatabase = useRoutineDatabase()

  // Optimized exercise search hook for exercise selector dialog
  const exerciseSearch = useExerciseSearch({
    debounceMs: 300,
    pageSize: 50,
  })

  // Separate hook for exercise catalog
  const catalogExerciseSearch = useExerciseSearch({
    debounceMs: 300,
    pageSize: 50,
  })

  const {
    state: {
      routineFolders,
      selectedFolderId,
      showNewFolderInput,
      newFolderName,
      newRoutineName,
      routineSearch,
      editingRoutine,
      isRoutineEditorOpen,
      isExerciseSelectorOpen,
      isCreateExerciseDialogOpen,
      showExerciseCatalog,
      pendingExercise,
      newExerciseForm,
    },
    data: { allClients, loadingClients, clientsError },
    actions: {
      setSelectedFolderId,
      setShowNewFolderInput,
      setNewFolderName,
      setNewRoutineName,
      setRoutineSearch,
      setEditingRoutine,
      setIsRoutineEditorOpen,
      setIsExerciseSelectorOpen,
      setIsCreateExerciseDialogOpen,
      setShowExerciseCatalog,
      setNewExerciseForm,
      handleCreateExercise,
      handleCreateFolder,
      handleDeleteTemplate,
      handleMoveTemplate,
      handleCreateTemplate,
      handleAssignTemplateToClient,
      handleEditRoutine,
      handleAddExerciseToRoutine,
      cancelAddExercise,
      clearPendingExercise,
      handleSelectExercise,
      handleExportRoutineToExcel,
    },
  } = useTrainerDashboard()

  const [isSaving, setIsSaving] = useState(false)
  // Track how many students have this routine assigned
  const [assignedCounts, setAssignedCounts] = useState<Record<string, number>>({})
  // Track which student userIds have each routine assigned
  const [assignedStudentUserIdsByRoutine, setAssignedStudentUserIdsByRoutine] =
    useState<Record<string, string[]>>({})
  // Track if we've already handled the newRoutine action
  const hasHandledNewRoutine = useRef(false)

  // Exercise inputs state (per-set configuration)
  const [perSetInputs, setPerSetInputs] = useState<{
    numSets: number
    sets: SetInputV2[]
  }>({
    numSets: 3,
    sets: [
      { set_index: 1, reps: '10', load_kg: null, unit: 'kg' },
      { set_index: 2, reps: '10', load_kg: null, unit: 'kg' },
      { set_index: 3, reps: '10', load_kg: null, unit: 'kg' }
    ]
  })

  // Store exercise sets data (maps exerciseId to its sets data)
  const [exerciseSetsData, setExerciseSetsData] = useState<Record<string, SetInputV2[]>>({})

  // Loaded routines with full data
  const [loadedRoutinesData, setLoadedRoutinesData] = useState<typeof routineFolders>([])
  const [loadedRoutines, setLoadedRoutines] = useState<any[]>([]) // Store raw routine data
  const hasLoadedInitial = useRef(false)

  const currentFolder = loadedRoutinesData.find((f) => f.id === selectedFolderId) || loadedRoutinesData[0] || routineFolders[0]

  // Load routine data when editing
  useEffect(() => {
    if (!editingRoutine?.id || typeof editingRoutine.id === 'string' && editingRoutine.id.startsWith('temp-')) {
      // New routine, no data to load
      return
    }

    // Find the routine in our loaded routines
    const routine = loadedRoutines.find(r => r.id === editingRoutine.id)

    if (routine) {
      // Populate exerciseSetsData with the full sets information
      const setsData: Record<string, SetInputV2[]> = {}

      routine.blocks.forEach((block: any) => {
        block.exercises?.forEach((exercise: any) => {
          setsData[exercise.exercise_id] = exercise.sets
        })
      })

      setExerciseSetsData(setsData)
    }
  }, [editingRoutine?.id, loadedRoutines])

  // Load routines initially
  useEffect(() => {
    if (!ownerId || hasLoadedInitial.current) return

    let cancelled = false

    const loadRoutines = async () => {
      try {
        const routines = await routineDatabase.loadRoutinesV2(ownerId)

        if (cancelled) return

        hasLoadedInitial.current = true

        // Store the full routines for later use (editing)
        setLoadedRoutines(routines)

        // Transform routines for display
        const transformedTemplates = routines.map(routine => {
          const allExercises: any[] = []

          // Flatten blocks and exercises
          routine.blocks.forEach(block => {
            block.exercises?.forEach(exercise => {
              // Use first set data for display (simplified)
              const firstSet = exercise.sets[0]
              allExercises.push({
                exerciseId: exercise.exercise_id,
                name: exercise.exercises?.name, // Add exercise name
                sets: exercise.sets.length,
                reps: firstSet?.reps || '10',
                rest_seconds: 90, // Default
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

        const folders = [{
          id: '1',
          name: 'Mis rutinas',
          templates: transformedTemplates
        }]

        setLoadedRoutinesData(folders)
      } catch (error) {
        console.error('Error loading routines:', error)
      }
    }

    loadRoutines()

    return () => {
      cancelled = true
    }
  }, [ownerId, routineDatabase])

  // Legacy URL param support: redirect to the new creation screen
  useEffect(() => {
    if (searchParams.get('action') === 'newRoutine' && !hasHandledNewRoutine.current) {
      hasHandledNewRoutine.current = true
      router.replace('/rutinas/nueva', { scroll: false })
    }
  }, [searchParams, router])

  const loadAssignmentMetadata = useCallback(async () => {
    if (!authUser?.id) return

    try {
      const { data, error } = await supabase
        .from('trainee_routine')
        .select('routine_id, trainee_id, routines!inner(owner_id)')
        .eq('routines.owner_id', authUser.id)

      if (error) {
        console.warn('Unable to load assignment metadata:', error)
        return
      }

      const counts: Record<string, number> = {}
      const byRoutine = new Map<string, Set<string>>()

      for (const row of (data as any[]) || []) {
        const routineId = String((row as any).routine_id)
        const traineeId = String((row as any).trainee_id)
        counts[routineId] = (counts[routineId] || 0) + 1
        if (!byRoutine.has(routineId)) {
          byRoutine.set(routineId, new Set())
        }
        byRoutine.get(routineId)?.add(traineeId)
      }

      setAssignedCounts(counts)
      setAssignedStudentUserIdsByRoutine(
        Object.fromEntries(
          Array.from(byRoutine.entries()).map(([routineId, userIds]) => [routineId, Array.from(userIds)])
        )
      )
    } catch (err) {
      console.warn('Error computing assignment metadata:', err)
    }
  }, [authUser?.id])

  useEffect(() => {
    loadAssignmentMetadata()
  }, [loadAssignmentMetadata, routineFolders])

  // Helper function to refresh routine data
  const refreshRoutineData = useCallback(async () => {
    if (!ownerId) return

    try {
      const refreshedRoutines = await routineDatabase.refreshRoutinesV2(ownerId)

      // Store full routine data
      setLoadedRoutines(refreshedRoutines)

      // Transform and update display
      const transformedTemplates = refreshedRoutines.map(routine => {
        const allExercises: any[] = []

        routine.blocks.forEach(block => {
          block.exercises?.forEach(exercise => {
            const firstSet = exercise.sets[0]
            allExercises.push({
              exerciseId: exercise.exercise_id,
              name: exercise.exercises?.name, // Add exercise name
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

      const folders = [{
        id: '1',
        name: 'Mis rutinas',
        templates: transformedTemplates
      }]

      setLoadedRoutinesData(folders)
    } catch (error) {
      console.error('Error refreshing routine data:', error)
    }
  }, [ownerId, routineDatabase])

  // Listen for chat assistant "routine created" events to refresh immediately
  useEffect(() => {
    const handleRoutineCreated = () => {
      refreshRoutineData()
    }

    window.addEventListener('treino:routine-created', handleRoutineCreated)
    return () => window.removeEventListener('treino:routine-created', handleRoutineCreated)
  }, [refreshRoutineData])

  // Real-time subscription + polling for routines (handles AI-created routines)
  useEffect(() => {
    if (!ownerId) return

    // Set up real-time subscription
    const channel = supabase
      .channel(`routines_changes_${ownerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'routines',
          filter: `owner_id=eq.${ownerId}`
        },
        () => {
          refreshRoutineData()
        }
      )
      .subscribe(() => {})

    // Also poll every 5 seconds as backup (in case realtime is not enabled)
    const pollInterval = setInterval(() => {
      refreshRoutineData()
    }, 5000)

    // Refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshRoutineData()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(pollInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [ownerId, refreshRoutineData])

  const saveRoutine = async () => {
    if (!editingRoutine) return
    if (!ownerId) {
      console.error('No user ID available')
      return
    }

    setIsSaving(true)
    try {
      // Validate routine name
      if (!editingRoutine.name.trim()) {
        throw new Error("El nombre de la rutina es obligatorio")
      }

      // Build V2 format blocks with exercises and sets
      const exercises: CreateBlockExerciseV2Payload[] = editingRoutine.exercises.map((ex, idx) => ({
        block_id: '', // Will be filled by createRoutineV2/updateRoutineV2
        exercise_id: ex.exerciseId,
        display_order: idx + 1,
        superset_group: undefined,
        notes: undefined,
        sets: exerciseSetsData[ex.exerciseId] || [
          // Fallback if no V2 data (shouldn't happen with new flow)
          { set_index: 1, reps: ex.reps?.toString() || '10', load_kg: null, unit: 'kg' }
        ]
      }))

      const blocks = [{
        name: 'Ejercicios',
        block_order: 1,
        notes: undefined,
        exercises
      }]

      // Check if this is an edit (existing routine) or create (new routine)
      const isEdit = editingRoutine.id &&
        typeof editingRoutine.id === 'string' &&
        !editingRoutine.id.startsWith('temp-')

      let success = false

      if (isEdit) {
        // Update existing routine
        success = await updateRoutine(
          editingRoutine.id as string,
          editingRoutine.name,
          editingRoutine.description || null,
          ownerId,
          blocks
        )
      } else {
        // Create new routine
        const routineId = await routineDatabase.saveRoutineV2(
          editingRoutine.name,
          editingRoutine.description || null,
          ownerId,
          blocks
        )
        success = !!routineId
      }

      if (success) {
        // Close editor
        setIsRoutineEditorOpen(false)
        setEditingRoutine(null)
        setExerciseSetsData({})

        // Reload routines and update UI
        await refreshRoutineData()
      }
    } catch (error) {
      console.error("Error saving routine:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Wrap handleDeleteTemplate to refresh routine data after deletion
  const handleDeleteTemplateWithRefresh = async (templateId: string | number) => {
    // Call the original delete function
    await handleDeleteTemplate(templateId)

    // Refresh routines to update UI
    await refreshRoutineData()
  }

  const handleDuplicateTemplate = async (templateId: string | number) => {
    if (!ownerId) {
      toast({ title: "Error", description: "No se pudo identificar al usuario.", variant: "destructive" })
      return
    }

    if (typeof templateId !== "string") {
      toast({ title: "Error", description: "ID de rutina inválido.", variant: "destructive" })
      return
    }

    const sourceRoutine = loadedRoutines.find((routine) => routine.id === templateId)
    if (!sourceRoutine) {
      toast({
        title: "Rutina no encontrada",
        description: "No se pudo cargar la rutina para duplicarla.",
        variant: "destructive",
      })
      return
    }

    try {
      const sourceName = (sourceRoutine.name || "").trim()
      const baseName = sourceName.replace(/\s*\(\d+\)\s*$/, "").trim() || sourceName || "Rutina"
      const escapedBaseName = baseName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      const duplicateNameRegex = new RegExp(`^${escapedBaseName}\\s*\\((\\d+)\\)$`)

      let maxDuplicateNumber = 0
      for (const routine of loadedRoutines) {
        const routineName = (routine?.name || "").trim()
        const match = routineName.match(duplicateNameRegex)
        if (match) {
          const current = Number(match[1])
          if (Number.isFinite(current) && current > maxDuplicateNumber) {
            maxDuplicateNumber = current
          }
        }
      }

      const duplicatedName = `${baseName} (${maxDuplicateNumber + 1})`

      const blocksPayload = (sourceRoutine.blocks || []).map((block: any, blockIndex: number) => ({
        name: block.name || `Bloque ${blockIndex + 1}`,
        block_order: typeof block.block_order === "number" ? block.block_order : blockIndex + 1,
        notes: block.notes ?? null,
        exercises: (block.exercises || []).map((exercise: any, exerciseIndex: number) => ({
          block_id: "",
          exercise_id: exercise.exercise_id,
          display_order:
            typeof exercise.display_order === "number" ? exercise.display_order : exerciseIndex + 1,
          superset_group: exercise.superset_group ?? null,
          notes: exercise.notes ?? undefined,
          sets: (exercise.sets || []).map((set: any, setIndex: number) => ({
            set_index: typeof set.set_index === "number" ? set.set_index : setIndex + 1,
            reps: set.reps ?? undefined,
            load_kg: set.load_kg ?? null,
            unit: set.unit ?? "kg",
            notes: set.notes ?? undefined,
          })),
        })),
      }))

      const duplicatedRoutineId = await routineDatabase.saveRoutineV2(
        duplicatedName,
        sourceRoutine.description || null,
        ownerId,
        blocksPayload
      )

      if (!duplicatedRoutineId) {
        throw new Error("No se pudo crear la copia de la rutina")
      }

      await refreshRoutineData()

      toast({
        title: "Rutina duplicada",
        description: `Se creó \"${duplicatedName}\" sin asignaciones.`,
      })
    } catch (error) {
      console.error("Error duplicando rutina:", error)
      toast({
        title: "Error",
        description: "No se pudo duplicar la rutina.",
        variant: "destructive",
      })
    }
  }

  // Delete exercise from routine
  const deleteExerciseFromRoutine = (exerciseIndex: number) => {
    if (!editingRoutine) return

    const exerciseToDelete = editingRoutine.exercises[exerciseIndex]

    // Remove from exercises array
    const updatedExercises = editingRoutine.exercises.filter((_, idx) => idx !== exerciseIndex)

    // Update editing routine
    setEditingRoutine({
      ...editingRoutine,
      exercises: updatedExercises
    })

    // Remove from exerciseSetsData
    if (exerciseToDelete) {
      setExerciseSetsData(prev => {
        const updated = { ...prev }
        delete updated[exerciseToDelete.exerciseId]
        return updated
      })
    }
  }

  // Confirm add exercise with per-set data
  const confirmAddExerciseWithSets = () => {
    if (!pendingExercise || !editingRoutine) return

    const { exercise } = pendingExercise
    const totalSets = perSetInputs.sets.length
    const firstSet = perSetInputs.sets[0]

    // Store sets data for this exercise
    setExerciseSetsData(prev => ({
      ...prev,
      [exercise.id]: perSetInputs.sets
    }))

    // For display purposes, add to editing routine
    const exerciseForRoutine = {
      exerciseId: exercise.id.toString(),
      sets: totalSets,
      reps: firstSet?.reps || '10',
      rest_seconds: 90
    }

    const updatedRoutine = {
      ...editingRoutine,
      exercises: [...editingRoutine.exercises, exerciseForRoutine]
    }

    setEditingRoutine(updatedRoutine)

    // Reset states
    setPerSetInputs({
      numSets: 3,
      sets: [
        { set_index: 1, reps: '10', load_kg: null, unit: 'kg' },
        { set_index: 2, reps: '10', load_kg: null, unit: 'kg' },
        { set_index: 3, reps: '10', load_kg: null, unit: 'kg' }
      ]
    })

    // Close dialogs
    setIsExerciseSelectorOpen(false)
  }

  return (
    <main className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header Section */}
      <RoutinesHeader
        title={t("routines.title")}
        subtitle={t("routines.subtitle")}
        showNewFolderInput={showNewFolderInput}
        newFolderName={newFolderName}
        showNewRoutineInput={false}
        newRoutineName={newRoutineName}
        onFolderNameChange={setNewFolderName}
        onRoutineNameChange={setNewRoutineName}
        onCreateFolder={handleCreateFolder}
        onCreateRoutine={goToNewRoutine}
        onToggleNewFolder={() => setShowNewFolderInput(true)}
        onToggleNewRoutine={goToNewRoutine}
        onCancelNewFolder={() => {
          setShowNewFolderInput(false)
          setNewFolderName("")
        }}
        onCancelNewRoutine={() => {
          setNewRoutineName("")
        }}
        translations={{
          newFolder: t("routines.actions.newFolder"),
          newRoutine: t("routines.actions.newRoutine"),
          create: t("routines.actions.create"),
          cancel: t("routines.actions.cancel"),
          folderPlaceholder: t("routines.placeholders.folderName"),
          routinePlaceholder: t("routines.placeholders.routineName"),
        }}
      />

      {/* Folders and Templates Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <RoutinesFoldersList
          folders={loadedRoutinesData.length > 0 ? loadedRoutinesData : routineFolders}
          selectedFolderId={selectedFolderId}
          onFolderSelect={(folderId) => setSelectedFolderId(folderId)}
          foldersTitle="Carpetas"
          foldersDescription={t("routines.folders.description")}
        />

        <RoutinesTemplatesList
          currentFolder={currentFolder}
          templates={currentFolder?.templates || []}
          allFolders={loadedRoutinesData.length > 0 ? loadedRoutinesData : routineFolders}
          searchTerm={routineSearch}
          onSearchChange={setRoutineSearch}
          onEditRoutine={goToEditRoutine}
          onMoveTemplate={handleMoveTemplate}
          onDeleteTemplate={handleDeleteTemplateWithRefresh}
          onExportToExcel={handleExportRoutineToExcel}
          onDuplicateTemplate={handleDuplicateTemplate}
          onSaveAssignments={async (templateId: string | number, selectedClientIds: string[]) => {
            try {
              if (typeof templateId === 'string' && templateId.startsWith('temp-')) {
                toast({
                  title: 'Rutina no guardada',
                  description: 'Primero guarda la rutina antes de asignarla a alumnos.',
                  variant: 'destructive',
                })
                return
              }

              const selectedUserIds = Array.from(
                new Set(
                  selectedClientIds
                    .map((clientId) => allClients.find((client) => client.id === clientId)?.userId)
                    .filter((userId): userId is string => Boolean(userId))
                )
              )

              const routineId = String(templateId)
              const currentUserIds = assignedStudentUserIdsByRoutine[routineId] || []
              const rosterUserIds = new Set(allClients.map((client) => client.userId))
              const managedCurrentUserIds = currentUserIds.filter((userId) => rosterUserIds.has(userId))

              const toAssign = selectedUserIds.filter((userId) => !managedCurrentUserIds.includes(userId))
              const toUnassign = managedCurrentUserIds.filter((userId) => !selectedUserIds.includes(userId))

              if (toAssign.length > 0) {
                const payload = toAssign.map((userId) => ({
                  trainee_id: userId,
                  routine_id: templateId,
                  assigned_on: new Date().toISOString(),
                }))

                const { error: assignError } = await supabase
                  .from('trainee_routine')
                  .insert(payload)

                if (assignError && (assignError as any).code !== '23505') {
                  throw assignError
                }
              }

              if (toUnassign.length > 0) {
                const { error: unassignError } = await supabase
                  .from('trainee_routine')
                  .delete()
                  .eq('routine_id', templateId)
                  .in('trainee_id', toUnassign)

                if (unassignError) {
                  throw unassignError
                }
              }

              await loadAssignmentMetadata()

              toast({
                title: 'Asignaciones actualizadas',
                description: `${toAssign.length} asignadas · ${toUnassign.length} desasignadas.`,
              })
            } catch (error) {
              console.error('Error syncing routine assignments:', error)
              throw error
            }
          }}
          assignedCounts={assignedCounts}
          assignedStudentUserIdsByRoutine={assignedStudentUserIdsByRoutine}
          allClients={allClients}
          loadingClients={loadingClients}
          clientsError={clientsError}
          translations={{
            templatesTitle: t("routines.templates.title"),
            templatesSubtitle: "Selecciona o edita una rutina base",
            searchPlaceholder: t("routines.placeholders.searchTemplates"),
            defaultDescription: t("routines.templates.defaultDescription"),
            blocks: "Bloques",
            totalExercises: t("routines.templates.totalExercises"),
            edit: t("routines.actions.edit"),
            exportExcel: "Exportar a Excel (XLSX)",
            moveToFolder: "Mover a",
            deleteRoutine: t("routines.actions.deleteRoutine"),
            assignToStudent: t("routines.assignments.assignToStudent"),
            sendTo: t("routines.assignments.sendTo"),
            selectStudent: t("routines.assignments.selectStudent"),
            saveBeforeSending: t("routines.assignments.saveBeforeSending"),
            loadingStudents: t("routines.assignments.loadingStudents"),
            errorLoadingStudents: t("routines.assignments.errorLoadingStudents"),
            noStudentsRegistered: t("routines.assignments.noStudentsRegistered"),
            noTemplatesInFolder: t("routines.templates.noTemplatesInFolder"),
          }}
        />
      </div>

      {/* Exercise Catalog Section */}
      <ExerciseCatalog
        showCatalog={showExerciseCatalog}
        onToggleCatalog={() => setShowExerciseCatalog((prev) => !prev)}
        onCreateExercise={() => {
          setIsExerciseSelectorOpen(false)
          setIsCreateExerciseDialogOpen(true)
        }}
        exerciseSearch={catalogExerciseSearch}
        translations={{
          catalogTitle: t("routines.exercises.catalogTitle"),
          catalogDescription: t("routines.exercises.catalogDescription"),
          newExercise: t("routines.exercises.newExercise"),
          hideCatalog: "Ocultar Catálogo",
          showCatalog: "Mostrar Catálogo",
          searchPlaceholder: t("routines.exercises.searchPlaceholder"),
          allCategories: "Todas las categorías",
          category: "Categoría",
          allEquipments: "Todos los equipos",
          equipment: "Equipamiento",
          edit: t("routines.actions.edit"),
          delete: "Eliminar",
          editFeatureSoon: t("routines.exercises.editFeatureSoon"),
          deleteFeatureSoon: "Funcionalidad de eliminar ejercicio estará disponible próximamente",
          loadingMore: "Cargando más ejercicios...",
          noResults: "No se encontraron ejercicios",
          scrollForMore: "Haz scroll para cargar más ejercicios",
        }}
      />

      {/* Create Exercise Dialog */}
      <CreateExerciseDialog
        open={isCreateExerciseDialogOpen}
        onOpenChange={setIsCreateExerciseDialogOpen}
        exerciseForm={newExerciseForm}
        onFormChange={setNewExerciseForm}
        onCreateExercise={handleCreateExercise}
        translations={{
          title: t("routines.dialogs.createExercise.title"),
          description: t("routines.dialogs.createExercise.description"),
          exerciseName: t("routines.forms.exerciseName"),
          exerciseNamePlaceholder: t("routines.forms.exerciseNamePlaceholder"),
          targetMuscles: t("routines.forms.targetMuscles"),
          secondaryMuscles: t("routines.forms.secondaryMuscles"),
          bodyParts: t("routines.forms.bodyParts"),
          equipment: t("routines.forms.equipment"),
          category: t("routines.forms.category"),
          selectCategory: t("routines.forms.selectCategory"),
          instructions: t("routines.forms.instructions"),
          instructionsPlaceholder: t("routines.forms.instructionsPlaceholder"),
          cancel: t("routines.actions.cancel"),
          createExercise: t("routines.actions.createExercise"),
          select: t("routines.actions.select"),
          hide: t("routines.actions.hide"),
        }}
      />

      {/* Exercise Selector Dialog V2 - Per-set configuration */}
      <ExerciseSelectorDialogV2
        open={isExerciseSelectorOpen}
        onOpenChange={setIsExerciseSelectorOpen}
        exerciseSearch={exerciseSearch}
        pendingExercise={pendingExercise}
        exerciseInputs={perSetInputs}
        onExerciseInputsChange={setPerSetInputs}
        onSelectExercise={handleSelectExercise}
        onConfirmAdd={confirmAddExerciseWithSets}
        onCancelAdd={cancelAddExercise}
        onClearPendingExercise={clearPendingExercise}
        translations={{
          title: t("routines.dialogs.selectExercise.title"),
          description: t("routines.dialogs.selectExercise.description"),
          searchPlaceholder: "Buscar ejercicios...",
          filterByCategory: "Filtrar por categoría",
          allCategories: "Todas las categorías",
          filterByEquipment: "Filtrar por equipo",
          allEquipments: "Todos los equipos",
          configureExercise: "Configurar Ejercicio",
          numberOfSets: "Número de Series",
          sets: t("routines.forms.sets"),
          repetitions: t("routines.forms.repetitions"),
          load: "Carga",
          unit: "Unidad",
          notes: "Notas (opcional)",
          confirmAdd: t("routines.actions.confirmAdd"),
          cancel: "Cancelar",
          close: t("routines.actions.close"),
          loadingMore: "Cargando más ejercicios...",
          noResults: "No se encontraron ejercicios",
          scrollForMore: "Haz scroll para cargar más ejercicios",
          addSet: "Añadir Serie",
          removeSet: "Eliminar",
          clickToChange: "Click para cambiar ejercicio"
        }}
      />

      {/* Routine Editor Dialog V2 - With per-set editing */}
      <RoutineEditorDialog
        open={isRoutineEditorOpen}
        onOpenChange={setIsRoutineEditorOpen}
        routine={editingRoutine}
        onRoutineChange={setEditingRoutine}
        onAddExercise={handleAddExerciseToRoutine}
        onDeleteExercise={deleteExerciseFromRoutine}
        onSaveRoutine={saveRoutine}
        isSaving={isSaving}
        exercises={exerciseSearch.exercises}
        exerciseV2Data={exerciseSetsData}
        onUpdateExerciseSets={(exerciseId, sets) => {
          setExerciseSetsData(prev => ({
            ...prev,
            [exerciseId]: sets
          }))
        }}
        translations={{
          title: t("routines.dialogs.editRoutine.title"),
          description: t("routines.dialogs.editRoutine.description"),
          routineName: t("routines.forms.routineName"),
          routineNamePlaceholder: t("routines.placeholders.routineName"),
          routineDescription: t("routines.forms.routineDescription"),
          routineDescriptionPlaceholder: t("routines.placeholders.routineDescription"),
          exercisesTitle: "Ejercicios",
          addExercise: "Agregar Ejercicio",
          noExercises: t("routines.blocks.noExercises"),
          clickToStart: t("routines.blocks.clickToStart"),
          sets: t("routines.forms.sets"),
          reps: t("routines.forms.reps"),
          load: "Carga",
          unit: "Unidad",
          notes: "Notas (opcional)",
          addSet: "Añadir Serie",
          delete: "Eliminar",
          restShort: t("routines.forms.restShort"),
          cancel: t("routines.actions.cancel"),
          saveRoutine: t("routines.actions.saveRoutine"),
          saving: t("routines.actions.saving"),
          noGifAvailable: "GIF no disponible",
        }}
      />
    </main>
  )
}
