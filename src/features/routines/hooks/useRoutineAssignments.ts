"use client"

import { supabase } from '@/services/database'
import { toast } from '@/hooks/use-toast'
import type { RoutineTemplate } from '../types'

export interface RoutineAssignment {
  id?: string
  trainee_id: string
  routine_id: string
  assigned_on: string
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
        .from('trainee_routine')
        .select('id')
        .eq('routine_id', routine.id)
        .eq('trainee_id', studentId)
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
        trainee_id: studentId,
        routine_id: routine.id,
        assigned_on: new Date().toISOString()
      }

      const { error } = await supabase
        .from('trainee_routine')
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
        .from('trainee_routine')
        .select(`
          *,
          routines (
            id,
            name,
            description
          )
        `)
        .eq('trainee_id', studentId)
        .order('assigned_on', { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error fetching student assignments:', error)
      return []
    }
  }

  const removeAssignment = async (assignmentId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('trainee_routine')
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

  return {
    assignRoutineToStudent,
    getStudentAssignments,
    removeAssignment
  }
}
