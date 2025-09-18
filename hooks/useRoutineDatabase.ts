"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { RoutineTemplate, RoutineBlock } from '@/types/trainer'
import { toast } from '@/hooks/use-toast'

export interface DatabaseRoutine {
  id: number
  owner_id: string
  name: string
  description?: string
  created_on: string
}

export interface DatabaseRoutineBlock {
  id: number
  routine_id: number
  name: string
  block_order: number
  notes?: string
}

export interface DatabaseBlockExercise {
  id: number
  block_id: number
  exercise_id: string
  display_order: number
  sets: number
  reps: number
  load_target?: string
  tempo?: string
  rest_seconds: number
  is_superset_group?: string
  notes?: string
}

export function useRoutineDatabase() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Save a complete routine to the database
  const saveRoutineToDatabase = async (routine: RoutineTemplate, ownerId: string): Promise<number | null> => {
    try {
      setLoading(true)
      setError(null)

      // First, save the routine
      const { data: routineData, error: routineError } = await supabase
        .from('routines')
        .insert({
          owner_id: ownerId,
          name: routine.name,
          description: routine.description || null
        })
        .select()
        .single()

      if (routineError) {
        console.error('Error saving routine:', routineError)
        setError(routineError.message)
        return null
      }

      const routineId = routineData.id

      // Save each block
      for (let blockIndex = 0; blockIndex < routine.blocks.length; blockIndex++) {
        const block = routine.blocks[blockIndex]
        
        const { data: blockData, error: blockError } = await supabase
          .from('routine_block')
          .insert({
            routine_id: routineId,
            name: block.name,
            block_order: blockIndex + 1,
            notes: null
          })
          .select()
          .single()

        if (blockError) {
          console.error('Error saving block:', blockError)
          setError(blockError.message)
          return null
        }

        const blockId = blockData.id

        // Save each exercise in the block
        for (let exerciseIndex = 0; exerciseIndex < block.exercises.length; exerciseIndex++) {
          const exercise = block.exercises[exerciseIndex]
          
          const { error: exerciseError } = await supabase
            .from('block_exercise')
            .insert({
              block_id: blockId,
              exercise_id: exercise.exerciseId,
              display_order: exerciseIndex + 1,
              sets: exercise.sets,
              reps: exercise.reps,
              rest_seconds: exercise.restSec,
              load_target: null,
              tempo: null,
              is_superset_group: null,
              notes: null
            })

          if (exerciseError) {
            console.error('Error saving exercise:', exerciseError)
            setError(exerciseError.message)
            return null
          }
        }
      }

      toast({
        title: "Rutina guardada",
        description: `La rutina "${routine.name}" ha sido guardada en la base de datos.`,
      })

      return routineId

    } catch (err) {
      console.error('Error saving routine to database:', err)
      setError('Error al guardar la rutina')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Load routines from database
  const loadRoutinesFromDatabase = async (ownerId: string): Promise<RoutineTemplate[]> => {
    try {
      setLoading(true)
      setError(null)

      // Get routines with their blocks and exercises
      const { data: routines, error: routinesError } = await supabase
        .from('routines')
        .select(`
          *,
          routine_block (
            *,
            block_exercise (
              *
            )
          )
        `)
        .eq('owner_id', ownerId)
        .order('created_on', { ascending: false })

      if (routinesError) {
        console.error('Error loading routines:', routinesError)
        setError(routinesError.message)
        return []
      }

      if (!routines || routines.length === 0) {
        console.log('No routines found for user:', ownerId)
        return []
      }

      // Transform database structure to our app structure
      const transformedRoutines: RoutineTemplate[] = routines.map((routine: any) => ({
        id: routine.id,
        name: routine.name,
        description: routine.description,
        blocks: (routine.routine_block || [])
          .sort((a: any, b: any) => a.block_order - b.block_order)
          .map((block: any) => ({
            id: block.id,
            name: block.name,
            exercises: (block.block_exercise || [])
              .sort((a: any, b: any) => a.display_order - b.display_order)
              .map((exercise: any) => ({
                exerciseId: exercise.exercise_id,
                sets: exercise.sets,
                reps: exercise.reps,
                restSec: exercise.rest_seconds
              })),
            repetitions: 1, // Default value
            restBetweenRepetitions: 60, // Default value
            restAfterBlock: 90 // Default value
          }))
      }))

      return transformedRoutines

    } catch (err) {
      console.error('Error loading routines from database:', err)
      setError('Error al cargar las rutinas')
      return []
    } finally {
      setLoading(false)
    }
  }

  // Update an existing routine
  const updateRoutineInDatabase = async (routine: RoutineTemplate, ownerId: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      // Update the routine
      const { error: routineError } = await supabase
        .from('routines')
        .update({
          name: routine.name,
          description: routine.description || null
        })
        .eq('id', routine.id)
        .eq('owner_id', ownerId)

      if (routineError) {
        console.error('Error updating routine:', routineError)
        setError(routineError.message)
        return false
      }

      // Delete existing blocks and exercises (we'll recreate them)
      const { error: deleteError } = await supabase
        .from('routine_block')
        .delete()
        .eq('routine_id', routine.id)

      if (deleteError) {
        console.error('Error deleting old blocks:', deleteError)
        setError(deleteError.message)
        return false
      }

      // Recreate blocks and exercises
      for (let blockIndex = 0; blockIndex < routine.blocks.length; blockIndex++) {
        const block = routine.blocks[blockIndex]
        
        const { data: blockData, error: blockError } = await supabase
          .from('routine_block')
          .insert({
            routine_id: routine.id,
            name: block.name,
            block_order: blockIndex + 1,
            notes: null
          })
          .select()
          .single()

        if (blockError) {
          console.error('Error creating block:', blockError)
          setError(blockError.message)
          return false
        }

        const blockId = blockData.id

        // Save each exercise in the block
        for (let exerciseIndex = 0; exerciseIndex < block.exercises.length; exerciseIndex++) {
          const exercise = block.exercises[exerciseIndex]
          
          const { error: exerciseError } = await supabase
            .from('block_exercise')
            .insert({
              block_id: blockId,
              exercise_id: exercise.exerciseId,
              display_order: exerciseIndex + 1,
              sets: exercise.sets,
              reps: exercise.reps,
              rest_seconds: exercise.restSec,
              load_target: null,
              tempo: null,
              is_superset_group: null,
              notes: null
            })

          if (exerciseError) {
            console.error('Error creating exercise:', exerciseError)
            setError(exerciseError.message)
            return false
          }
        }
      }

      toast({
        title: "Rutina actualizada",
        description: `La rutina "${routine.name}" ha sido actualizada en la base de datos.`,
      })

      return true

    } catch (err) {
      console.error('Error updating routine in database:', err)
      setError('Error al actualizar la rutina')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Delete a routine from database
  const deleteRoutineFromDatabase = async (routineId: number, ownerId: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      console.log('🗑️ Attempting to delete routine:', { routineId, ownerId })

      const { error } = await supabase
        .from('routines')
        .delete()
        .eq('id', routineId)
        .eq('owner_id', ownerId)

      if (error) {
        console.error('❌ Error deleting routine:', error)
        setError(error.message)
        return false
      }

      console.log('✅ Routine deleted successfully from database')
      
      toast({
        title: "Rutina eliminada",
        description: "La rutina ha sido eliminada de la base de datos.",
      })

      return true

    } catch (err) {
      console.error('❌ Error deleting routine from database:', err)
      setError('Error al eliminar la rutina')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    saveRoutineToDatabase,
    loadRoutinesFromDatabase,
    updateRoutineInDatabase,
    deleteRoutineFromDatabase
  }
}