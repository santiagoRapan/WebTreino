/**
 * Routine Handlers (Minimal stub for backward compatibility)
 * 
 * This file provides minimal handler implementations for the TrainerDashboardContext.
 * Most actual routine operations are now handled directly in components using V2 hooks.
 */

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
      console.log('handleCreateExercise called - implemented in component')
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

    handleExportRoutineToPDF: async (template: any) => {
      console.log('handleExportRoutineToPDF called - not yet implemented')
    },

    handleExportRoutineToExcel: async (template: any) => {
      console.log('handleExportRoutineToExcel called - implemented in component')
    }
  }
}

