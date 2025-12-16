/**
 * Routine Handlers (Minimal stub for backward compatibility)
 * 
 * This file provides minimal handler implementations for the TrainerDashboardContext.
 * Most actual routine operations are now handled directly in components using V2 hooks.
 */

import { toast } from "@/hooks/use-toast"
import { supabase } from "@/services/database"
import {
  createCustomExercise,
  musclesArrayToDb,
  secondaryMusclesArrayToDb,
  bodyPartsArrayToDb,
  equipmentsArrayToDb,
} from "@/features/exercises"

export interface RoutineHandlers {
  handleCreateRoutine: () => void
  handleCreateExercise: () => Promise<void>
  handleCreateFolder: () => void
  handleDeleteTemplate: (templateId: number | string) => Promise<void>
  handleMoveTemplate: (templateId: number | string, targetFolderId: string | number) => void
  handleCreateTemplate: () => void
  handleAssignTemplateToClient: (template: any, client: any) => void
  assignRoutineToClient: (routineId: number | string, traineeId: number | string) => Promise<void>
  handleEditRoutine: (template: any) => void
  handleAddExerciseToRoutine: () => void
  handleSelectExercise: (exercise: any) => void
  confirmAddExercise: () => void
  cancelAddExercise: () => void
  clearPendingExercise: () => void
  handleSaveRoutine: () => Promise<void>
  handleDeleteExercise: (exerciseIndex: number) => void
  handleDeleteBlock: (blockId: number) => void
  toggleBlockExpansion: (blockId: number) => void
  handleExportRoutineToPDF: (template: any) => Promise<void>
  handleExportRoutineToExcel: (template: any) => Promise<void>
}

/**
 * Creates routine handlers (minimal stub implementation)
 * Most actual functionality is now in components using V2 hooks
 */
export function createRoutineHandlers(
  routineState: any,
  uiState: any
): RoutineHandlers {

  return {
    handleCreateRoutine: () => {
      if (routineState.setEditingRoutine && routineState.setIsRoutineEditorOpen) {
        // Create a new empty routine
        const newRoutine = {
          id: `temp-${Date.now()}`,
          name: '',
          description: '',
          exercises: [],
          blocks: []
        }
        routineState.setEditingRoutine(newRoutine)
        routineState.setIsRoutineEditorOpen(true)
        console.log('Created new routine')
      }
    },

    handleCreateExercise: async () => {
      // Get the current user ID (owner_id for the exercise)
      const ownerId = routineState.customUser?.id

      if (!ownerId) {
        toast({
          title: "Error de autenticación",
          description: "No se pudo identificar el usuario. Por favor, inicia sesión nuevamente.",
          variant: "destructive",
        })
        return
      }

      // Validate required fields
      const form = routineState.newExerciseForm
      if (!form.name.trim()) {
        toast({
          title: "Nombre requerido",
          description: "Por favor, ingresa un nombre para el ejercicio.",
          variant: "destructive",
        })
        return
      }

      if (form.target_muscles.length === 0) {
        toast({
          title: "Músculos objetivo requeridos",
          description: "Por favor, selecciona al menos un músculo objetivo.",
          variant: "destructive",
        })
        return
      }

      try {
        // Convert Spanish UI labels to actual database values
        const targetMusclesDb = musclesArrayToDb(form.target_muscles)
        const secondaryMusclesDb = secondaryMusclesArrayToDb(form.secondary_muscles)
        const bodyPartsDb = bodyPartsArrayToDb(form.body_parts)
        const equipmentsDb = equipmentsArrayToDb(form.equipments)

        // Create the exercise in the database
        const createdExercise = await createCustomExercise(
          {
            name: form.name.trim(),
            gif_URL: form.gif_URL?.trim() || undefined,
            target_muscles: targetMusclesDb,
            body_parts: bodyPartsDb,
            equipments: equipmentsDb,
            secondary_muscles: secondaryMusclesDb,
            instructions: form.instructions?.trim() || undefined,
          },
          ownerId
        )

        if (!createdExercise) {
          throw new Error("Failed to create exercise")
        }

        // Success! Show toast and close dialog
        toast({
          title: "¡Ejercicio creado!",
          description: `El ejercicio "${createdExercise.name}" ha sido creado exitosamente.`,
        })

        // Reset form
        routineState.setNewExerciseForm({
          name: "",
          gif_URL: "",
          target_muscles: [],
          body_parts: [],
          equipments: [],
          secondary_muscles: [],
          instructions: "",
          description: "",
          category: "",
        })

        // Close dialog
        uiState.setIsCreateExerciseDialogOpen(false)

        // Optionally: Add the new exercise to the exercises catalog in state
        // so it appears immediately without needing to refresh
        if (routineState.exercisesCatalog) {
          routineState.setExercisesCatalog([createdExercise, ...routineState.exercisesCatalog])
        }

      } catch (error) {
        console.error("Error creating custom exercise:", error)
        toast({
          title: "Error al crear ejercicio",
          description: "No se pudo crear el ejercicio. Por favor, intenta nuevamente.",
          variant: "destructive",
        })
      }
    },

    handleCreateFolder: () => {
      console.log('handleCreateFolder called - implemented in component')
    },

    handleDeleteTemplate: async (templateId: number | string) => {
      if (!routineState.customUser?.id) {
        console.error('No user ID available for delete')
        return
      }

      try {
        console.log('🗑️ Deleting routine:', templateId)

        // Only skip DB deletion for temporary IDs
        const isTempId = typeof templateId === 'string' && templateId.startsWith('temp-')

        if (!isTempId) {
          // Import deleteRoutineV2 dynamically to avoid circular dependencies
          const { deleteRoutineV2 } = await import('../services/routineHandlersV2')
          const success = await deleteRoutineV2(templateId as string, routineState.customUser.id)

          if (!success) {
            console.log('❌ Failed to delete from database')
            return
          }
          console.log('✅ Successfully deleted from database')
        }

        // Remove from local state
        if (routineState.routineFolders && routineState.setRoutineFolders) {
          const updatedFolders = routineState.routineFolders.map((folder: any) => ({
            ...folder,
            templates: folder.templates.filter((template: any) => template.id !== templateId)
          }))
          routineState.setRoutineFolders(updatedFolders)
        }
      } catch (error) {
        console.error('❌ Error deleting routine:', error)
      }
    },

    handleMoveTemplate: (templateId: number | string, targetFolderId: string | number) => {
      console.log('handleMoveTemplate called - implemented in component')
    },

    handleCreateTemplate: () => {
      if (routineState.setEditingRoutine && routineState.setIsRoutineEditorOpen) {
        // Create a new empty routine
        const newRoutine = {
          id: `temp-${Date.now()}`,
          name: '',
          description: '',
          exercises: [],
          blocks: []
        }
        routineState.setEditingRoutine(newRoutine)
        routineState.setIsRoutineEditorOpen(true)
        console.log('Created new routine template')
      }
    },

    handleAssignTemplateToClient: (template: any, client: any) => {
      console.log('handleAssignTemplateToClient called - implemented in component')
    },

    assignRoutineToClient: async (routineId: number | string, traineeId: number | string) => {
      console.log('assignRoutineToClient called - implemented in component')
    },

    handleEditRoutine: (template: any) => {
      if (routineState.setEditingRoutine) {
        routineState.setEditingRoutine(template)
        routineState.setIsRoutineEditorOpen(true)
      }
    },

    handleAddExerciseToRoutine: () => {
      if (routineState.setIsExerciseSelectorOpen && routineState.setPendingExercise) {
        // Clear any pending exercise to show the exercise list
        routineState.setPendingExercise(null)
        routineState.setIsExerciseSelectorOpen(true)
        console.log('Opening exercise selector with cleared pending exercise')
      }
    },

    handleSelectExercise: (exercise: any) => {
      if (routineState.setPendingExercise) {
        routineState.setPendingExercise({ exercise, blockId: 'default' })
        console.log('Exercise selected:', exercise.name)
      }
    },

    confirmAddExercise: () => {
      console.log('confirmAddExercise called - implemented in component')
    },

    cancelAddExercise: () => {
      if (routineState.setIsExerciseSelectorOpen) {
        routineState.setIsExerciseSelectorOpen(false)
        routineState.setPendingExercise(null)
      }
    },

    clearPendingExercise: () => {
      if (routineState.setPendingExercise) {
        routineState.setPendingExercise(null)
      }
    },

    handleSaveRoutine: async () => {
      console.log('handleSaveRoutine called - implemented in component')
    },

    handleDeleteExercise: (exerciseIndex: number) => {
      if (routineState.editingRoutine && routineState.setEditingRoutine) {
        const updatedExercises = routineState.editingRoutine.exercises.filter((_: any, index: number) => index !== exerciseIndex)
        routineState.setEditingRoutine({
          ...routineState.editingRoutine,
          exercises: updatedExercises
        })
        console.log('Exercise deleted from routine:', exerciseIndex)
      }
    },

    handleDeleteBlock: (blockId: number) => {
      if (!routineState.editingRoutine) return

      const updatedRoutine = {
        ...routineState.editingRoutine,
        blocks: routineState.editingRoutine.blocks.filter((block: any) => block.id !== blockId)
      }

      routineState.setEditingRoutine(updatedRoutine)

      toast({
        title: "Bloque eliminado",
        description: "El bloque ha sido eliminado de la rutina.",
      })
    },

    toggleBlockExpansion: (blockId: number) => {
      if (!routineState.expandedBlocks || !routineState.setExpandedBlocks) return
      const newExpanded = new Set(routineState.expandedBlocks)
      if (newExpanded.has(blockId)) {
        newExpanded.delete(blockId)
      } else {
        newExpanded.add(blockId)
      }
      routineState.setExpandedBlocks(newExpanded)
    },

    handleExportRoutineToPDF: async (template: any) => {
      console.log('handleExportRoutineToPDF called - not yet implemented')
    },

    handleExportRoutineToExcel: async (template: any) => {
      try {
        // Define headers
        const headers = ['Ejercicio', 'Series', 'Repeticiones', 'Carga', 'Descanso (seg)', 'Notas']

        // Create CSV content
        let csvContent = `${template.name}\n`
        if (template.description) {
          csvContent += `Descripción: ${template.description}\n`
        }
        csvContent += '\n' // Empty line
        csvContent += headers.join(',') + '\n'

        // Add exercises
        template.exercises.forEach((ex: any) => {
          const row = [
            // Exercise name - we might need to fetch it if it's not in the template
            // For now assuming the template might have it or we use ID
            ex.name || `Ejercicio ${ex.exerciseId}`,
            ex.sets,
            `"${ex.reps}"`, // Quote to handle potential commas
            `"${ex.load_target || ''}"`,
            ex.rest_seconds,
            `"${ex.notes || ''}"`
          ]
          csvContent += row.join(',') + '\n'
        })

        // Create blob with BOM for Excel UTF-8 compatibility
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })

        // Create download link
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`)
        link.style.visibility = 'hidden'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        console.error('Error exporting routine:', error)
      }
    }
  }
}
