import { toast } from "@/hooks/use-toast"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import { supabase } from "@/services/database"
import type { Exercise, RoutineTemplate, RoutineFolder, Client } from "@/lib/types/trainer"

export interface RoutineHandlers {
  handleCreateRoutine: () => void
  handleCreateExercise: () => void
  handleCreateFolder: () => void
  handleDeleteTemplate: (templateId: number | string) => Promise<void>
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
  handleSaveRoutine: () => Promise<void>
  handleDeleteExercise: (blockId: number, exerciseIndex: number) => void
  handleDeleteBlock: (blockId: number) => void
  toggleBlockExpansion: (blockId: number) => void
  handleExportRoutineToPDF: (template: RoutineTemplate) => Promise<void>
  handleExportRoutineToExcel: (template: RoutineTemplate) => Promise<void>
}

export function createRoutineHandlers(
  routineState: any,
  uiState: any,
  router?: any
): RoutineHandlers {
  return {
    handleCreateRoutine: () => {
      if (router) {
        // Navigate to dedicated routines page with create action
        router.push('/rutinas?action=create')
      } else {
        // Fallback to tab-based navigation
        uiState.setActiveTab("routines")
        // Asegurar que la carpeta principal esté seleccionada
        if (routineState.selectedFolderId == null) {
          routineState.setSelectedFolderId(1)
        }
      }
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

        // Only skip DB deletion for temporary IDs (created but never saved)
        const isTempId = typeof templateId === 'string' && templateId.startsWith('temp-')
        if (isTempId) {
          console.log('� Routine has temporary ID, skipping database deletion:', templateId)
        } else {
          // Delete from database for any persisted ID (number or UUID string)
          console.log('🗄️ Deleting routine from database:', templateId)
          const success = await routineState.routineDatabase.deleteRoutineFromDatabase(
            templateId as any,
            ownerId
          )

          if (!success) {
            console.log('❌ Failed to delete from database')
            throw new Error("Error al eliminar la rutina de la base de datos")
          }
          console.log('✅ Successfully deleted from database')
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

      // Create a temporary routine that will be saved to database when edited and saved
      const newTemplate: RoutineTemplate = {
        id: `temp-${Date.now()}`, // Temporary ID until saved to database
        name: '',
        blocks: [{
          id: 1,
          name: 'Ejercicios',
          exercises: [],
          repetitions: 1,
          restBetweenRepetitions: 60,
          restAfterBlock: 90
        }]
      }

      // Garantizar que exista la carpeta base
      let folders = routineState.routineFolders
      if (!folders || folders.length === 0) {
        folders = [{ id: 1, name: 'Mis rutinas', templates: [] }]
        routineState.setRoutineFolders(folders)
        routineState.setSelectedFolderId(1)
      }

      const selectedFolder = folders.find((f: RoutineFolder) => f.id === routineState.selectedFolderId) || folders[0]

      if (selectedFolder) {
        const updatedFolders = folders.map((folder: RoutineFolder) =>
          folder.id === routineState.selectedFolderId
            ? { ...folder, templates: [...folder.templates, newTemplate] }
            : folder
        )

        routineState.setRoutineFolders(updatedFolders)
        routineState.setNewRoutineName("")

        // Open the routine editor immediately for the new routine
        routineState.setEditingRoutine(newTemplate)
        routineState.setIsRoutineEditorOpen(true)

        toast({
          title: "Rutina creada",
          description: `La rutina ha sido creada. Agrega ejercicios y guárdala para persistir en la base de datos.`,
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
        const trainerId = routineState.customUser?.id
        console.log('[assignRoutineToClient] start', { routineId, traineeId, trainerId, types: { routineId: typeof routineId, traineeId: typeof traineeId } })

        if (!trainerId) {
          toast({ title: 'Error', description: 'Usuario no autenticado.', variant: 'destructive' })
          return
        }

        // Do not allow assigning unsaved (temporary) routines
        if (typeof routineId === 'string' && routineId.startsWith('temp-')) {
          toast({
            title: 'Rutina no guardada',
            description: 'Primero guarda la rutina antes de enviarla a un alumno.',
            variant: 'destructive'
          })
          return
        }

        // Basic guard
        if (!traineeId) {
          toast({ title: 'Selecciona un alumno', description: 'Debes elegir un alumno antes de enviar la rutina.' })
          return
        }

        // 1. Verify roster membership (RLS usually requires this)
        const { data: rosterRow, error: rosterError } = await supabase
          .from('trainer_student')
          .select('trainer_id, student_id')
          .eq('trainer_id', trainerId)
          .eq('student_id', traineeId)
          .maybeSingle()

        if (rosterError) {
          console.warn('[assignRoutineToClient] roster check error', rosterError)
        }

        if (!rosterRow) {
          toast({
            title: 'Alumno no vinculado',
            description: 'Acepta primero la solicitud del alumno (no está en tu roster).',
            variant: 'destructive'
          })
          return
        }

        // 2. Verify routine ownership
        const { data: routineRow, error: routineFetchError } = await supabase
          .from('routines')
          .select('id, owner_id')
          .eq('id', routineId)
          .eq('owner_id', trainerId)
          .maybeSingle()

        if (routineFetchError) {
          console.warn('[assignRoutineToClient] routine ownership check error', routineFetchError)
        }
        if (!routineRow) {
          toast({
            title: 'Rutina no encontrada',
            description: 'No se encontró la rutina o no eres el propietario.',
            variant: 'destructive'
          })
          return
        }

        // 3. Perform assignment insert
        const payload = {
          trainee_id: traineeId,
            routine_id: routineId,
          assigned_on: new Date().toISOString()
        }
        console.log('[assignRoutineToClient] inserting trainee_routine payload', payload)
        const { error: insertError } = await supabase
          .from('trainee_routine')
          .insert(payload)

        if (insertError) {
          console.error('[assignRoutineToClient] insert error', insertError)
          let userMsg = 'No se pudo asignar la rutina.'
          if ((insertError as any).code === '23505') {
            userMsg = 'Esta rutina ya fue asignada a este alumno.'
          }
          toast({ title: 'Error', description: userMsg, variant: 'destructive' })
          return
        }

        toast({
          title: 'Rutina asignada',
          description: 'La rutina ha sido asignada correctamente al alumno.',
        })
      } catch (error: any) {
        console.error('[assignRoutineToClient] unexpected error', { error })
        toast({
          title: 'Error inesperado',
          description: error?.message || 'No se pudo asignar la rutina.',
          variant: 'destructive'
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

    handleAddExerciseToBlock: (blockId?: number) => {
      // Always use the first block (index 0)
      routineState.setSelectedBlockId(1)
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
        restSec: parseInt(routineState.exerciseInputs.restSec),
        loadTarget: routineState.exerciseInputs.loadTarget ? parseInt(routineState.exerciseInputs.loadTarget) : undefined
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
      routineState.setExerciseInputs({ sets: '', reps: '', restSec: '', loadTarget: '' })
      routineState.setIsExerciseSelectorOpen(false)

      toast({
        title: "Ejercicio añadido",
        description: `${exercise.name} ha sido añadido al bloque.`,
      })
    },

    cancelAddExercise: () => {
      routineState.setPendingExercise(null)
      routineState.setExerciseInputs({ sets: '', reps: '', restSec: '', loadTarget: '' })
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
            let folders = routineState.routineFolders
            if (!folders || folders.length === 0) {
              folders = [{ id: 1, name: 'Mis rutinas', templates: [] }]
            }
            const updatedFolders = folders.map((folder: RoutineFolder) => {
              if (folder.templates.some((t: RoutineTemplate) => t.id === routineState.editingRoutine.id)) {
                return {
                  ...folder,
                  templates: folder.templates.map((template: RoutineTemplate) =>
                    template.id === routineState.editingRoutine.id ? updatedRoutine : template
                  )
                }
              }
              // If somehow not found, add to main folder
              if (folder.id === 1) {
                return { ...folder, templates: [...folder.templates, updatedRoutine] }
              }
              return folder
            })
            
            routineState.setRoutineFolders(updatedFolders)
            if (routineState.selectedFolderId == null) {
              routineState.setSelectedFolderId(1)
            }
            
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
        routineState.setExerciseInputs({ sets: '', reps: '', restSec: '', loadTarget: '' })
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
        workbook.creator = 'Treino'
        workbook.created = new Date()

        const worksheet = workbook.addWorksheet(template.name?.slice(0, 31) || 'Rutina')

        // Map exercises by id to resolve names
        const exercisesById = new Map<string, Exercise>(
          (routineState.exercisesCatalog || []).map((e: Exercise) => [e.id?.toString(), e])
        )

        // Column headers definition
        worksheet.columns = [
          { header: '#', key: 'idx', width: 5 },
          { header: 'Ejercicio', key: 'name', width: 40 },
          { header: 'Series', key: 'sets', width: 12 },
          { header: 'Repeticiones', key: 'reps', width: 16 },
          { header: 'Descanso (seg)', key: 'rest', width: 16 },
          { header: 'Peso (kg)', key: 'loadTarget', width: 16 },
        ]

        const addHeaderStyles = (rowNumber: number) => {
          const row = worksheet.getRow(rowNumber)
          row.font = { bold: true }
          row.alignment = { vertical: 'middle', horizontal: 'center' }
          row.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFEDEDED' },
            }
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
              left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
              bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
              right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            }
          })
        }

        const addBodyBorders = (rowNumber: number) => {
          const row = worksheet.getRow(rowNumber)
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFEEEEEE' } },
              left: { style: 'thin', color: { argb: 'FFEEEEEE' } },
              bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } },
              right: { style: 'thin', color: { argb: 'FFEEEEEE' } },
            }
          })
        }

        // Single table header
        const headerRow = worksheet.getRow(1)
        headerRow.values = ['#', 'Ejercicio', 'Series', 'Repeticiones', 'Descanso (seg)', 'Peso (kg)']
        addHeaderStyles(1)

        let exerciseCounter = 1

        if (!template.blocks || template.blocks.length === 0) {
          worksheet.addRow(['Sin bloques']).font = { italic: true, color: { argb: 'FF777777' } }
        } else {
          template.blocks.forEach((block: any) => {
            // Table rows
            const exercises = block.exercises || []
            exercises.forEach((ex: any) => {
              const resolved = exercisesById.get(ex.exerciseId?.toString())
              const name = resolved?.name || ex.name || `Ejercicio ${exerciseCounter}`
              const row = worksheet.addRow({
                idx: exerciseCounter,
                name,
                sets: ex.sets ?? '',
                reps: ex.reps ?? '',
                rest: ex.restSec ?? '',
                loadTarget: ex.loadTarget ?? '',
              })
              row.getCell('A').alignment = { vertical: 'middle', horizontal: 'center' }
              addBodyBorders(row.number)
              exerciseCounter++
            })
          })
        }

        // Freeze header row
        worksheet.views = [{ state: 'frozen', ySplit: 1 }]

        // File name sanitize
        const safeName = (template.name || 'rutina')
          .replace(/[^a-zA-Z0-9-_ ]/g, '_')
          .trim()
          .slice(0, 50)
        const fileName = `${safeName}_${new Date().toISOString().slice(0, 10)}.xlsx`

        const buffer = await workbook.xlsx.writeBuffer()
        saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), fileName)

        toast({
          title: 'Excel exportado',
          description: 'La rutina ha sido exportada a Excel (XLSX).',
        })
      } catch (error) {
        console.error('Error exporting to Excel', error)
        toast({
          title: 'Error',
          description: 'Error al exportar la rutina a Excel.',
          variant: 'destructive',
        })
      }
    },
  }
}