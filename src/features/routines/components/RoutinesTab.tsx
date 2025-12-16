"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTrainerDashboard } from "@/lib/context/TrainerDashboardContext"
import { useTranslation } from "@/lib/i18n/LanguageProvider"
import { useExerciseSearch } from "@/features/exercises"
import { useAuth } from "@/features/auth/services/auth-context"
import { supabase } from "@/services/database"
import { useRoutineDatabase, createRoutine, updateRoutine, type CreateBlockExerciseV2Payload, useRoutineAssignments, type RoutineTemplate } from "@/features/routines"
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

  // Routine Database hook
  const routineDatabase = useRoutineDatabase()

  // Routine Assignments hook
  const { assignRoutineToStudent } = useRoutineAssignments()

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
      showNewRoutineInput,
      newRoutineName,
      routineSearch,
      editingRoutine,
      isRoutineEditorOpen,
      isExerciseSelectorOpen,
      isCreateExerciseDialogOpen,
      showExerciseCatalog,
      exerciseInputs,
      pendingExercise,
      newExerciseForm,
    },
    data: { allClients, loadingClients, clientsError },
    actions: {
      setSelectedFolderId,
      setShowNewFolderInput,
      setNewFolderName,
      setShowNewRoutineInput,
      setNewRoutineName,
      setRoutineSearch,
      setEditingRoutine,
      setIsRoutineEditorOpen,
      setIsExerciseSelectorOpen,
      setIsCreateExerciseDialogOpen,
      setShowExerciseCatalog,
      setExerciseInputs,
      setNewExerciseForm,
      handleCreateExercise,
      handleCreateFolder,
      handleDeleteTemplate,
      handleMoveTemplate,
      handleCreateTemplate,
      handleAssignTemplateToClient,
      assignRoutineToClient,
      handleEditRoutine,
      handleAddExerciseToRoutine,
      confirmAddExercise,
      cancelAddExercise,
      clearPendingExercise,
      handleSelectExercise,
      handleSaveRoutine,
      handleDeleteExercise,
      handleExportRoutineToExcel,
    },
  } = useTrainerDashboard()

  const [isSaving, setIsSaving] = useState(false)
  // Track how many students have this routine assigned
  const [assignedCounts, setAssignedCounts] = useState<Record<string, number>>({})
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
      console.log('📝 Loading data for editing routine:', editingRoutine.id)

      // Populate exerciseSetsData with the full sets information
      const setsData: Record<string, SetInputV2[]> = {}

      routine.blocks.forEach((block: any) => {
        block.exercises?.forEach((exercise: any) => {
          setsData[exercise.exercise_id] = exercise.sets
        })
      })

      setExerciseSetsData(setsData)
      console.log('✅ Loaded sets data for', Object.keys(setsData).length, 'exercises')
    }
  }, [editingRoutine?.id])

  // Load routines initially
  useEffect(() => {
    if (!customUser?.id || hasLoadedInitial.current) return

    let cancelled = false

    const loadRoutines = async () => {
      try {
        console.log('📚 Loading routines for user:', customUser.id)
        const routines = await routineDatabase.loadRoutinesV2(customUser.id)

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
        console.log(`✅ Loaded ${transformedTemplates.length} routines`)
      } catch (error) {
        console.error('Error loading routines:', error)
      }
    }

    loadRoutines()

    return () => {
      cancelled = true
    }
  }, [customUser?.id])

  // Check for action parameter to open new routine dialog directly
  useEffect(() => {
    if (searchParams.get('action') === 'newRoutine' && !hasHandledNewRoutine.current) {
      hasHandledNewRoutine.current = true
      // Ensure main folder is selected
      if (selectedFolderId == null) {
        setSelectedFolderId("1")
      }
      // Open the routine editor directly
      handleCreateTemplate()
      // Clean up URL parameter
      router.replace('/rutinas', { scroll: false })
    }
  }, [searchParams, selectedFolderId, setSelectedFolderId, handleCreateTemplate, router])

  // Load assignment counts for routines owned by the trainer
  useEffect(() => {
    const loadAssignmentCounts = async () => {
      if (!authUser?.id) return
      try {
        // Fetch trainee_routine rows for routines owned by this trainer
        const { data, error } = await supabase
          .from('trainee_routine')
          .select('routine_id, routines!inner(owner_id)')
          .eq('routines.owner_id', authUser.id)

        if (error) {
          console.warn('Unable to load assignment counts:', error)
          return
        }

        const counts: Record<string, number> = {}
        for (const row of (data as any[]) || []) {
          const rid = String((row as any).routine_id)
          counts[rid] = (counts[rid] || 0) + 1
        }
        setAssignedCounts(counts)
      } catch (err) {
        console.warn('Error computing assignment counts:', err)
      }
    }

    loadAssignmentCounts()
  }, [authUser?.id, routineFolders])

  // Helper function to refresh routine data
  const refreshRoutineData = useCallback(async () => {
    if (!customUser?.id) return

    try {
      console.log('🔄 Refreshing routine data...')
      const refreshedRoutines = await routineDatabase.refreshRoutinesV2(customUser.id)

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
      console.log('✅ Routine data refreshed, found', refreshedRoutines.length, 'routines')
    } catch (error) {
      console.error('Error refreshing routine data:', error)
    }
  }, [customUser?.id, routineDatabase])

  // Listen for chat assistant "routine created" events to refresh immediately
  useEffect(() => {
    const handleRoutineCreated = (event: Event) => {
      console.log('⚡ Routine created event received from chat', event)
      refreshRoutineData()
    }

    window.addEventListener('treino:routine-created', handleRoutineCreated)
    return () => window.removeEventListener('treino:routine-created', handleRoutineCreated)
  }, [refreshRoutineData])

  // Real-time subscription + polling for routines (handles AI-created routines)
  useEffect(() => {
    if (!customUser?.id) return

    console.log('📡 Setting up real-time subscription for routines...')

    // Set up real-time subscription
    const channel = supabase
      .channel(`routines_changes_${customUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'routines',
          filter: `owner_id=eq.${customUser.id}`
        },
        (payload) => {
          console.log('📡 Routine change detected:', payload.eventType)
          refreshRoutineData()
        }
      )
      .subscribe((status) => {
        console.log('📡 Routines subscription status:', status)
      })

    // Also poll every 5 seconds as backup (in case realtime is not enabled)
    const pollInterval = setInterval(() => {
      refreshRoutineData()
    }, 5000)

    // Refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Tab visible, refreshing routines...')
        refreshRoutineData()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      console.log('📡 Cleaning up routines subscription')
      supabase.removeChannel(channel)
      clearInterval(pollInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [customUser?.id, refreshRoutineData])

  const saveRoutine = async () => {
    if (!editingRoutine) return
    if (!customUser?.id) {
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
        console.log('🔄 Updating existing routine:', editingRoutine.id)
        success = await updateRoutine(
          editingRoutine.id as string,
          editingRoutine.name,
          editingRoutine.description || null,
          customUser.id,
          blocks
        )
      } else {
        // Create new routine
        console.log('➕ Creating new routine')
        const routineId = await routineDatabase.saveRoutineV2(
          editingRoutine.name,
          editingRoutine.description || null,
          customUser.id,
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

    console.log(`🗑️ Deleted exercise at index ${exerciseIndex}`)
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
        showNewRoutineInput={showNewRoutineInput}
        newRoutineName={newRoutineName}
        onFolderNameChange={setNewFolderName}
        onRoutineNameChange={setNewRoutineName}
        onCreateFolder={handleCreateFolder}
        onCreateRoutine={handleCreateTemplate}
        onToggleNewFolder={() => setShowNewFolderInput(true)}
        onToggleNewRoutine={handleCreateTemplate}
        onCancelNewFolder={() => {
          setShowNewFolderInput(false)
          setNewFolderName("")
        }}
        onCancelNewRoutine={() => {
          setShowNewRoutineInput(false)
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
          onEditRoutine={handleEditRoutine}
          onMoveTemplate={handleMoveTemplate}
          onDeleteTemplate={handleDeleteTemplateWithRefresh}
          onExportToExcel={handleExportRoutineToExcel}
          onAssignToClient={handleAssignTemplateToClient}
          onSendToClient={async (templateId: string | number, clientId: string) => {
            try {
              // Find the routine template
              const routine = routineDatabase.routines.find(r => r.id === templateId)
              if (!routine) {
                throw new Error('Routine not found')
              }

              // Find the client
              const client = allClients.find(c => c.id === clientId)
              if (!client) {
                throw new Error('Client not found')
              }

              // Convert RoutineWithBlocksV2 to RoutineTemplate format
              const routineTemplate: RoutineTemplate = {
                id: routine.id,
                name: routine.name,
                description: routine.description,
                exercises: routine.blocks.flatMap(block =>
                  block.exercises?.map(exercise => ({
                    exerciseId: exercise.exercise_id,
                    sets: exercise.sets?.length || 0,
                    reps: exercise.sets?.[0]?.reps || '',
                    rest_seconds: 60, // default rest
                    load_target: exercise.sets?.[0]?.load_kg?.toString() || '',
                    tempo: '',
                    notes: exercise.notes
                  })) || []
                )
              }

              // Assign the routine using the proper function
              // Use client.userId (the actual user ID) instead of client.id
              const success = await assignRoutineToStudent(
                routineTemplate,
                client.userId, // Use the actual user ID, not the client ID
                authUser?.id || '',
                undefined // notes
              )

              if (success) {
                // Optimistically bump assignment count for this routine
                setAssignedCounts(prev => ({
                  ...prev,
                  [String(templateId)]: (prev[String(templateId)] || 0) + 1
                }))
              }
            } catch (error) {
              // If assignment fails, we could revert the optimistic update here
              console.error('Error assigning routine:', error)
              throw error
            }
          }}
          assignedCounts={assignedCounts}
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
