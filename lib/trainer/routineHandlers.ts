import { toast } from "@/hooks/use-toast"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import { supabase } from "@/lib/supabaseClient"
import type { Exercise, RoutineTemplate, RoutineFolder, Client } from "@/types/trainer"

export interface RoutineHandlers {
  handleCreateRoutine: () => void
  handleCreateExercise: () => void
  handleCreateFolder: () => void
  handleDeleteTemplate: (templateId: number | string) => void
    handleMoveTemplate: (templateId: number | string, targetFolderId: number) => void
  handleCreateTemplate: () => void
  handleAssignTemplateToClient: (template: RoutineTemplate, client: Client) => void
  assignRoutineToClient: (routineId: number | string, traineeId: number | string) => Promise<void>
  handleEditRoutine: (template: RoutineTemplate) => void
  handleAddBlock: () => void
  handleAddExerciseToBlock: (blockId: number) => void
  handleAddRest: (blockId: number) => void
  handleSelectExercise: (exercise: Exercise) => void
  confirmAddExercise: () => void
  cancelAddExercise: () => void
  handleSaveRoutine: () => void
  handleDeleteExercise: (blockId: number, exerciseIndex: number) => void
  handleDeleteBlock: (blockId: number) => void
  toggleBlockExpansion: (blockId: number) => void
  handleExportRoutineToPDF: (template: RoutineTemplate) => Promise<void>
  handleExportRoutineToExcel: (template: RoutineTemplate) => Promise<void>
}

export function createRoutineHandlers(
  routineState: any,
  uiState: any
): RoutineHandlers {
  return {
    handleCreateRoutine: () => {
      uiState.setActiveTab("routines")
      routineState.setShowNewRoutineInput(true)
    },

    handleCreateExercise: () => {
      uiState.setIsCreateExerciseDialogOpen(true)
    },

    handleCreateFolder: () => {
      if (!routineState.newFolderName.trim()) return

      const newFolder: RoutineFolder = {
        id: Date.now(),
        name: routineState.newFolderName,
        templates: []
      }

      routineState.setRoutineFolders([...routineState.routineFolders, newFolder])
      routineState.setNewFolderName("")
      routineState.setShowNewFolderInput(false)

      toast({
        title: "Carpeta creada",
        description: `La carpeta "${newFolder.name}" ha sido creada.`,
      })
    },

    handleDeleteTemplate: async (templateId: number | string) => {
      try {
        console.log('🗑️ Starting delete process for routine:', templateId)
        
        // Get the user ID from the routine state
        const ownerId = routineState.customUser?.id
        
        console.log('👤 User ID:', ownerId)
        
        if (!ownerId) {
          console.log('❌ No authenticated user found')
          toast({
            title: "Error",
            description: "No se encontró un usuario autenticado. Por favor, inicia sesión.",
            variant: "destructive"
          })
          return
        }

        // Only delete from database if it's not a temporary ID
        if (typeof templateId === 'number') {
          console.log('🔢 Routine has numeric ID, deleting from database:', templateId)
          const success = await routineState.routineDatabase.deleteRoutineFromDatabase(templateId, ownerId)
          
          if (!success) {
            console.log('❌ Failed to delete from database')
            throw new Error("Error al eliminar la rutina de la base de datos")
          }
          console.log('✅ Successfully deleted from database')
        } else {
          console.log('📝 Routine has temporary ID, skipping database deletion:', templateId)
        }

        // Remove from local state
        const updatedFolders = routineState.routineFolders.map((folder: RoutineFolder) => ({
          ...folder,
          templates: folder.templates.filter((template: RoutineTemplate) => template.id !== templateId)
        }))

        routineState.setRoutineFolders(updatedFolders)
        console.log('✅ Removed from local state')

        toast({
          title: "Rutina eliminada",
          description: "La rutina ha sido eliminada exitosamente.",
        })
      } catch (error) {
        console.error("❌ Error deleting routine:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar la rutina. Inténtalo de nuevo.",
          variant: "destructive"
        })
      }
    },

    handleMoveTemplate: (templateId: number | string, targetFolderId: number) => {
      let templateToMove: RoutineTemplate | null = null

      // Find and remove the template from its current folder
      const updatedFolders = routineState.routineFolders.map((folder: RoutineFolder) => {
        const template = folder.templates.find((t: RoutineTemplate) => t.id === templateId)
        if (template) {
          templateToMove = template
          return {
            ...folder,
            templates: folder.templates.filter((t: RoutineTemplate) => t.id !== templateId)
          }
        }
        return folder
      })

      // Add the template to the target folder
      if (templateToMove) {
        const finalFolders = updatedFolders.map((folder: RoutineFolder) =>
          folder.id === targetFolderId
            ? { ...folder, templates: [...folder.templates, templateToMove!] }
            : folder
        )

        routineState.setRoutineFolders(finalFolders)

        toast({
          title: "Rutina movida",
          description: "La rutina ha sido movida exitosamente.",
        })
      }
    },

    handleCreateTemplate: () => {
      if (!routineState.newRoutineName.trim()) return

      // Create a temporary routine that will be saved to database when edited and saved
      const newTemplate: RoutineTemplate = {
        id: `temp-${Date.now()}`, // Temporary ID until saved to database
        name: routineState.newRoutineName,
        blocks: []
      }

      const selectedFolder = routineState.routineFolders.find(
        (f: RoutineFolder) => f.id === routineState.selectedFolderId
      )

      if (selectedFolder) {
        const updatedFolders = routineState.routineFolders.map((folder: RoutineFolder) =>
          folder.id === routineState.selectedFolderId
            ? { ...folder, templates: [...folder.templates, newTemplate] }
            : folder
        )

        routineState.setRoutineFolders(updatedFolders)
        routineState.setNewRoutineName("")
        routineState.setShowNewRoutineInput(false)

        // Open the routine editor immediately for the new routine
        routineState.setEditingRoutine(newTemplate)
        routineState.setIsRoutineEditorOpen(true)

        toast({
          title: "Rutina creada",
          description: `La rutina "${newTemplate.name}" ha sido creada. Agrega bloques y guárdala para persistir en la base de datos.`,
        })
      }
    },

    handleAssignTemplateToClient: (template: RoutineTemplate, client: Client) => {
      toast({
        title: "Rutina asignada",
        description: `La rutina "${template.name}" ha sido asignada a ${client.name}.`,
      })
    },

    assignRoutineToClient: async (routineId: number | string, traineeId: number | string) => {
      try {
        console.log("Assigning routine:", routineId, "to trainee:", traineeId)
        const { error } = await supabase
          .from('trainee_routine')
          .insert({
            trainee_id: traineeId,
            routine_id: routineId,
            assigned_on: new Date().toISOString()
          })

        if (error) throw error

        toast({
          title: "Rutina asignada",
          description: "La rutina ha sido asignada correctamente al alumno.",
        })
      }
       catch (error) {
        console.error('Error assigning routine:', error)
        toast({
          title: "Error",
          description: "No se pudo asignar la rutina al alumno.",
          variant: "destructive"
        })
      }
    },

    handleEditRoutine: (template: RoutineTemplate) => {
      routineState.setEditingRoutine(template)
      routineState.setIsRoutineEditorOpen(true)
    },

    handleAddBlock: () => {
      if (!routineState.editingRoutine || !routineState.newBlockName.trim()) return

      const newBlock = {
        id: Date.now(),
        name: routineState.newBlockName,
        exercises: [],
        repetitions: 1,
        restBetweenRepetitions: 60,
        restAfterBlock: 90
      }

      const updatedRoutine = {
        ...routineState.editingRoutine,
        blocks: [...routineState.editingRoutine.blocks, newBlock]
      }

      routineState.setEditingRoutine(updatedRoutine)
      routineState.setNewBlockName("")

      toast({
        title: "Bloque añadido",
        description: `El bloque "${newBlock.name}" ha sido añadido.`,
      })
    },

    handleAddExerciseToBlock: (blockId: number) => {
      routineState.setSelectedBlockId(blockId)
      routineState.setIsExerciseSelectorOpen(true)
    },

    handleAddRest: (blockId: number) => {
      routineState.setRestBlockId(blockId)
      // Show rest input dialog
    },

    handleSelectExercise: (exercise: Exercise) => {
      if (!routineState.selectedBlockId) return
      
      routineState.setPendingExercise({ 
        exercise, 
        blockId: routineState.selectedBlockId 
      })
      // Show exercise inputs dialog
    },

    confirmAddExercise: () => {
      if (!routineState.pendingExercise || !routineState.editingRoutine) return

      const { exercise, blockId } = routineState.pendingExercise
      const exerciseForBlock = {
        exerciseId: exercise.id.toString(), // Ensure it's a string
        sets: parseInt(routineState.exerciseInputs.sets),
        reps: parseInt(routineState.exerciseInputs.reps),
        restSec: parseInt(routineState.exerciseInputs.restSec)
      }

      const updatedRoutine = {
        ...routineState.editingRoutine,
        blocks: routineState.editingRoutine.blocks.map((block: any) =>
          block.id === blockId
            ? { ...block, exercises: [...block.exercises, exerciseForBlock] }
            : block
        )
      }

      routineState.setEditingRoutine(updatedRoutine)
      routineState.setPendingExercise(null)
      routineState.setExerciseInputs({ sets: '', reps: '', restSec: '' })
      routineState.setIsExerciseSelectorOpen(false)

      toast({
        title: "Ejercicio añadido",
        description: `${exercise.name} ha sido añadido al bloque.`,
      })
    },

    cancelAddExercise: () => {
      routineState.setPendingExercise(null)
      routineState.setExerciseInputs({ sets: '', reps: '', restSec: '' })
      routineState.setIsExerciseSelectorOpen(false)
    },

    handleSaveRoutine: async () => {
      if (!routineState.editingRoutine) return

      try {
        // Get the user ID from the routine state (should be passed from context)
        const ownerId = routineState.customUser?.id
        
        if (!ownerId) {
          toast({
            title: "Error",
            description: "No se encontró un usuario autenticado. Por favor, inicia sesión.",
            variant: "destructive"
          })
          return
        }
        
        if (routineState.editingRoutine.id.toString().startsWith('temp-')) {
          // New routine - save to database
          const newRoutineId = await routineState.routineDatabase.saveRoutineToDatabase(
            routineState.editingRoutine,
            ownerId
          )
          
          if (newRoutineId) {
            // Update the routine with the database ID
            const updatedRoutine = {
              ...routineState.editingRoutine,
              id: newRoutineId
            }
            
            // Update local state
            const updatedFolders = routineState.routineFolders.map((folder: RoutineFolder) => ({
              ...folder,
              templates: folder.templates.map((template: RoutineTemplate) =>
                template.id === routineState.editingRoutine.id
                  ? updatedRoutine
                  : template
              )
            }))
            
            routineState.setRoutineFolders(updatedFolders)
            
            toast({
              title: "Rutina creada",
              description: "La rutina ha sido guardada en la base de datos.",
            })
          } else {
            throw new Error("Error al guardar la rutina en la base de datos")
          }
        } else {
          // Existing routine - update in database
          const success = await routineState.routineDatabase.updateRoutineInDatabase(
            routineState.editingRoutine,
            ownerId
          )
          
          if (success) {
            // Update local state
            const updatedFolders = routineState.routineFolders.map((folder: RoutineFolder) => ({
              ...folder,
              templates: folder.templates.map((template: RoutineTemplate) =>
                template.id === routineState.editingRoutine.id
                  ? routineState.editingRoutine
                  : template
              )
            }))
            
            routineState.setRoutineFolders(updatedFolders)
            
            toast({
              title: "Rutina actualizada",
              description: "La rutina ha sido actualizada en la base de datos.",
            })
          } else {
            throw new Error("Error al actualizar la rutina en la base de datos")
          }
        }
        
        routineState.setIsRoutineEditorOpen(false)
        routineState.setEditingRoutine(null)
        // Resetear estados adicionales para permitir crear/editar rutinas nuevamente
        routineState.setNewBlockName("")
        routineState.setExpandedBlocks(new Set())
        routineState.setSelectedBlockId(null)
        routineState.setExerciseInputs({ sets: '', reps: '', restSec: '' })
        routineState.setPendingExercise(null)
        
      } catch (error) {
        console.error("Error saving routine:", error)
        toast({
          title: "Error",
          description: "No se pudo guardar la rutina. Inténtalo de nuevo.",
          variant: "destructive"
        })
      }
    },

    handleDeleteExercise: (blockId: number, exerciseIndex: number) => {
      if (!routineState.editingRoutine) return

      const updatedRoutine = {
        ...routineState.editingRoutine,
        blocks: routineState.editingRoutine.blocks.map((block: any) =>
          block.id === blockId
            ? {
                ...block,
                exercises: block.exercises.filter((_: any, index: number) => index !== exerciseIndex)
              }
            : block
        )
      }

      routineState.setEditingRoutine(updatedRoutine)

      toast({
        title: "Ejercicio eliminado",
        description: "El ejercicio ha sido eliminado del bloque.",
      })
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
      const newExpanded = new Set(routineState.expandedBlocks)
      if (newExpanded.has(blockId)) {
        newExpanded.delete(blockId)
      } else {
        newExpanded.add(blockId)
      }
      routineState.setExpandedBlocks(newExpanded)
    },

    handleExportRoutineToPDF: async (template: RoutineTemplate) => {
      try {
        const pdf = new jsPDF()
        pdf.setFontSize(20)
        pdf.text(template.name, 20, 30)
        
        let yPosition = 50
        template.blocks.forEach((block: any) => {
          pdf.setFontSize(16)
          pdf.text(block.name, 20, yPosition)
          yPosition += 20
          
          block.exercises.forEach((exercise: any) => {
            pdf.setFontSize(12)
            pdf.text(`${exercise.name} - ${exercise.sets}x${exercise.reps}`, 30, yPosition)
            yPosition += 15
          })
          yPosition += 10
        })
        
        pdf.save(`${template.name}.pdf`)
        
        toast({
          title: "PDF exportado",
          description: "La rutina ha sido exportada a PDF.",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al exportar la rutina a PDF.",
        })
      }
    },

    handleExportRoutineToExcel: async (template: RoutineTemplate) => {
      try {
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet(template.name)
        
        worksheet.addRow([template.name])
        worksheet.addRow([])
        
        template.blocks.forEach((block: any) => {
          worksheet.addRow([block.name])
          worksheet.addRow(['Ejercicio', 'Series', 'Repeticiones'])
          
          block.exercises.forEach((exercise: any) => {
            worksheet.addRow([exercise.name, exercise.sets, exercise.reps])
          })
          
          worksheet.addRow([])
        })
        
        const buffer = await workbook.xlsx.writeBuffer()
        saveAs(new Blob([buffer]), `${template.name}.xlsx`)
        
        toast({
          title: "Excel exportado",
          description: "La rutina ha sido exportada a Excel.",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al exportar la rutina a Excel.",
        })
      }
    },
  }
}