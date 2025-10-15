"use client"

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/services/database'
import type { RoutineTemplate, RoutineBlock } from '../types'
import { toast } from '@/hooks/use-toast'
import DataCacheManager from '@/lib/cache/dataCache'

export interface DatabaseRoutine {
  id: string
  owner_id: string
  name: string
  description?: string | null
  created_on: string
}

export interface DatabaseRoutineBlock {
  id: string
  routine_id: string
  name: string
  block_order: number
  notes?: string | null
}

export interface DatabaseBlockExercise {
  id: string
  block_id: string
  exercise_id: string
  display_order: number
  sets?: number | null
  reps?: string | null
  load_target?: string | null
  tempo?: string | null
  rest_seconds?: number | null
  is_superset_group?: string | null
  notes?: string | null
}

export function useRoutineDatabase() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [routines, setRoutines] = useState<RoutineTemplate[]>([])
  const [lastUpdateEvent, setLastUpdateEvent] = useState<Date | null>(null)

  // Save a complete routine to the database
  const saveRoutineToDatabase = async (routine: RoutineTemplate, ownerId: string): Promise<string | null> => {
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

      // Save a single default block (abstraction for the user)
      const { data: blockData, error: blockError } = await supabase
        .from('routine_block')
        .insert({
          routine_id: routineId,
          name: 'Ejercicios', // Default block name
          block_order: 1,
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
      if (routine.exercises && routine.exercises.length > 0) {
        for (let exerciseIndex = 0; exerciseIndex < routine.exercises.length; exerciseIndex++) {
          const exercise = routine.exercises[exerciseIndex]
        
          const { error: exerciseError } = await supabase
            .from('block_exercise')
            .insert({
              block_id: blockId,
              exercise_id: exercise.exerciseId,
              display_order: exerciseIndex + 1,
              sets: exercise.sets,
              reps: exercise.reps,
              rest_seconds: exercise.rest_seconds,
              load_target: exercise.load_target || null,
              tempo: exercise.tempo || null,
              is_superset_group: null,
              notes: exercise.notes || null
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

      // ✅ Actualizar cache automáticamente
      const newRoutineWithId = { ...routine, id: routineId }
      setRoutines(prev => [newRoutineWithId, ...prev])
      DataCacheManager.addCachedRoutine(ownerId, newRoutineWithId)
      setLastUpdateEvent(new Date())

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
  const loadRoutinesFromDatabase = useCallback(async (ownerId: string, forceRefresh: boolean = false): Promise<RoutineTemplate[]> => {
    try {
      // 🚀 CACHE-FIRST: Intentar cargar desde cache primero si no estamos forzando refresh
      if (!forceRefresh) {
        // 1. Verificar cache en memoria
        if (routines.length > 0) {
          console.log('🚀 Using in-memory cached routines')
          return routines
        }

        // 2. Verificar cache persistente (localStorage)
        const cachedRoutines = DataCacheManager.getCachedRoutines(ownerId)
        if (cachedRoutines && cachedRoutines.length > 0) {
          console.log('💾 Loading routines from persistent cache')
          setRoutines(cachedRoutines)
          setLastUpdateEvent(new Date())
          
          // Verificar actualizaciones en background (sin loading visible)
          setTimeout(() => {
            checkForUpdatesInBackground(ownerId, cachedRoutines)
          }, 0)
          
          return cachedRoutines
        }
      }

      // 📚 Si no hay cache o se forzó refresh, cargar desde base de datos
      setLoading(true)
      setError(null)

      // Get routines with their blocks and exercises
      console.log('📚 Loading routines from database...')

      const { data: routinesData, error: routinesError } = await supabase
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

      if (!routinesData || routinesData.length === 0) {
        console.log('No routines found for user:', ownerId)
        setRoutines([])
        DataCacheManager.setCachedRoutines(ownerId, [])
        return []
      }

      // Transform database structure to our app structure
      // Flatten blocks into a single exercises array
      const transformedRoutines: RoutineTemplate[] = routinesData.map((routine: any) => {
        const allExercises: any[] = []
        
        // Collect exercises from all blocks (though we only use one now)
        if (routine.routine_block && routine.routine_block.length > 0) {
          routine.routine_block.forEach((block: any) => {
            if (block.block_exercise) {
              const blockExercises = block.block_exercise
                .sort((a: any, b: any) => a.display_order - b.display_order)
                .map((exercise: any) => ({
                  exerciseId: exercise.exercise_id,
                  sets: exercise.sets,
                  reps: exercise.reps,
                  rest_seconds: exercise.rest_seconds,
                  load_target: exercise.load_target,
                  tempo: exercise.tempo,
                  notes: exercise.notes
                }))
              allExercises.push(...blockExercises)
            }
          })
        }

        return {
          id: routine.id,
          name: routine.name,
          description: routine.description,
          exercises: allExercises
        }
      })

      // ✅ Actualizar both cache en memoria y persistente
      setRoutines(transformedRoutines)
      setLastUpdateEvent(new Date())
      DataCacheManager.setCachedRoutines(ownerId, transformedRoutines)

      return transformedRoutines

    } catch (err) {
      console.error('Error loading routines from database:', err)
      setError('Error al cargar las rutinas')
      return []
    } finally {
      setLoading(false)
    }
  }, [routines])

  // 🔍 Verificar actualizaciones en background sin mostrar loading al usuario
  const checkForUpdatesInBackground = useCallback(async (ownerId: string, cachedRoutines: RoutineTemplate[]) => {
    try {
      console.log('🔍 Checking for updates in background...')
      
      // Solo verificar metadatos para detectar cambios
      const { data: routinesMetadata, error } = await supabase
        .from('routines')
        .select('id, name, created_on')
        .eq('owner_id', ownerId)
        .order('created_on', { ascending: false })

      if (error) {
        console.error('Background update check failed:', error)
        return
      }

      // Comparar con cache para detectar cambios
      if (!routinesMetadata || routinesMetadata.length !== cachedRoutines.length) {
        console.log('🔄 Changes detected, refreshing data...')
        await loadRoutinesFromDatabase(ownerId, true)
        return
      }

      // Verificar si hay nuevas rutinas o cambios por ID
      const cachedIds = cachedRoutines.map(r => r.id).sort()
      const currentIds = routinesMetadata.map(r => r.id).sort()
      const hasChanges = cachedIds.some((id, index) => id !== currentIds[index])

      if (hasChanges) {
        console.log('🔄 Routine changes detected, refreshing data...')
        await loadRoutinesFromDatabase(ownerId, true)
      } else {
        console.log('✅ No changes detected, cache is up to date')
      }

    } catch (err) {
      console.error('Error in background update check:', err)
    }
  }, [loadRoutinesFromDatabase])

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

      // Recreate single default block with all exercises
      const { data: blockData, error: blockError } = await supabase
        .from('routine_block')
        .insert({
          routine_id: routine.id,
          name: 'Ejercicios', // Default block name
          block_order: 1,
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
      if (routine.exercises && routine.exercises.length > 0) {
        for (let exerciseIndex = 0; exerciseIndex < routine.exercises.length; exerciseIndex++) {
          const exercise = routine.exercises[exerciseIndex]
        
          const { error: exerciseError } = await supabase
            .from('block_exercise')
            .insert({
              block_id: blockId,
              exercise_id: exercise.exerciseId,
              display_order: exerciseIndex + 1,
              sets: exercise.sets,
              reps: exercise.reps,
              rest_seconds: exercise.rest_seconds,
              load_target: exercise.load_target || null,
              tempo: exercise.tempo || null,
              is_superset_group: null,
              notes: exercise.notes || null
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

      // ✅ Actualizar cache automáticamente
      setRoutines(prev => prev.map(r => r.id === routine.id ? routine : r))
      DataCacheManager.updateCachedRoutine(ownerId, routine)
      setLastUpdateEvent(new Date())

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
  const deleteRoutineFromDatabase = async (routineId: number | string, ownerId: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      console.log('🗑️ Attempting to delete routine:', { routineId, ownerId })

      // Ensure we have a concrete ID value to match DB type (Supabase uuid or int)
      const routineIdValue = routineId

      // Best-effort cleanup of dependent rows if CASCADE isn't present in DB
      // 1) Delete trainee assignments referencing this routine
      const { error: traineeDelErr } = await supabase
        .from('trainee_routine')
        .delete()
        .eq('routine_id', routineIdValue)
      if (traineeDelErr) {
        console.warn('⚠️ Could not delete trainee_routine rows (may be handled by CASCADE):', traineeDelErr)
      }
      // 2) Delete blocks and their exercises explicitly if needed
      // First fetch blocks to cascade delete exercises if CASCADE not set
      const { data: blocks, error: blocksErr } = await supabase
        .from('routine_block')
        .select('id')
        .eq('routine_id', routineIdValue)
      if (!blocksErr && blocks && blocks.length > 0) {
        const blockIds = blocks.map(b => b.id)
        const { error: beDelErr } = await supabase
          .from('block_exercise')
          .delete()
          .in('block_id', blockIds)
        if (beDelErr) {
          console.warn('⚠️ Could not delete block_exercise rows (may be handled by CASCADE):', beDelErr)
        }
      }
      const { error: rbDelErr } = await supabase
        .from('routine_block')
        .delete()
        .eq('routine_id', routineIdValue)
      if (rbDelErr) {
        console.warn('⚠️ Could not delete routine_block rows (may be handled by CASCADE):', rbDelErr)
      }

      const { error } = await supabase
        .from('routines')
        .delete()
        .eq('id', routineIdValue)
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

      // ✅ Actualizar cache automáticamente
      setRoutines(prev => prev.filter(r => r.id !== routineIdValue))
      DataCacheManager.removeCachedRoutine(ownerId, routineIdValue)
      setLastUpdateEvent(new Date())

      return true

    } catch (err) {
      console.error('❌ Error deleting routine from database:', err)
      setError('Error al eliminar la rutina')
      return false
    } finally {
      setLoading(false)
    }
  }

  // 🔄 Función para forzar refresh
  const refreshRoutines = useCallback(async (ownerId: string) => {
    console.log('🔄 Refreshing routines cache...')
    return loadRoutinesFromDatabase(ownerId, true)
  }, [loadRoutinesFromDatabase])

  return {
    loading,
    error,
    routines,
    lastUpdateEvent,
    saveRoutineToDatabase,
    loadRoutinesFromDatabase,
    updateRoutineInDatabase,
    deleteRoutineFromDatabase,
    refreshRoutines
  }
}