"use client"

import { supabase } from '@/lib/supabaseClient'
import { toast } from '@/hooks/use-toast'
import type { RoutineTemplate } from '@/types/trainer'

export interface RoutineAssignment {
  id?: number
  routine_id: number
  student_id: string
  assigned_by: string
  assigned_at: string
  status: 'active' | 'completed' | 'paused'
  notes?: string
}

export function useRoutineAssignments() {
  
  const assignRoutineToStudent = async (
    routine: RoutineTemplate, 
    studentId: string, 
    trainerId: string,
    notes?: string
  ): Promise<boolean> => {
    try {
      // First check if this routine is already assigned to this student
      const { data: existingAssignment, error: checkError } = await supabase
        .from('routine_assignments')
        .select('id')
        .eq('routine_id', routine.id)
        .eq('student_id', studentId)
        .eq('status', 'active')
        .single()

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw checkError
      }

      if (existingAssignment) {
        toast({
          title: "Rutina ya asignada",
          description: `La rutina "${routine.name}" ya está asignada a este alumno.`,
          variant: "destructive"
        })
        return false
      }

      // Create the assignment
      const assignmentData: Omit<RoutineAssignment, 'id'> = {
        routine_id: Number(routine.id),
        student_id: studentId,
        assigned_by: trainerId,
        assigned_at: new Date().toISOString(),
        status: 'active',
        notes: notes || undefined
      }

      const { error } = await supabase
        .from('routine_assignments')
        .insert([assignmentData])

      if (error) {
        throw error
      }

      toast({
        title: "Rutina asignada exitosamente",
        description: `La rutina "${routine.name}" ha sido asignada al alumno.`,
      })

      return true
    } catch (error) {
      console.error('Error assigning routine:', error)
      toast({
        title: "Error al asignar rutina",
        description: "No se pudo asignar la rutina. Inténtalo de nuevo.",
        variant: "destructive"
      })
      return false
    }
  }

  const getStudentAssignments = async (studentId: string): Promise<RoutineAssignment[]> => {
    try {
      const { data, error } = await supabase
        .from('routine_assignments')
        .select(`
          *,
          routines (
            id,
            name,
            description
          )
        `)
        .eq('student_id', studentId)
        .order('assigned_at', { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error fetching student assignments:', error)
      return []
    }
  }

  const removeAssignment = async (assignmentId: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('routine_assignments')
        .delete()
        .eq('id', assignmentId)

      if (error) {
        throw error
      }

      toast({
        title: "Asignación eliminada",
        description: "La rutina ha sido desasignada del alumno.",
      })

      return true
    } catch (error) {
      console.error('Error removing assignment:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la asignación.",
        variant: "destructive"
      })
      return false
    }
  }

  const updateAssignmentStatus = async (
    assignmentId: number, 
    status: 'active' | 'completed' | 'paused'
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('routine_assignments')
        .update({ status })
        .eq('id', assignmentId)

      if (error) {
        throw error
      }

      toast({
        title: "Estado actualizado",
        description: `El estado de la asignación ha sido cambiado a ${status}.`,
      })

      return true
    } catch (error) {
      console.error('Error updating assignment status:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado.",
        variant: "destructive"
      })
      return false
    }
  }

  return {
    assignRoutineToStudent,
    getStudentAssignments,
    removeAssignment,
    updateAssignmentStatus
  }
}
