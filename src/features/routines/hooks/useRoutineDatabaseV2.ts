"use client"

import { useState, useCallback } from 'react'
import { toast } from '@/hooks/use-toast'
import DataCacheManager from '@/lib/cache/dataCache'
import type { RoutineWithBlocksV2, CreateBlockExerciseV2Payload } from '../types'
import {
  createRoutineV2,
  loadRoutineV2,
  loadAllRoutinesV2,
  updateRoutineV2,
  deleteRoutineV2,
  addExerciseToBlockV2,
  updateExerciseV2,
  deleteExerciseV2
} from '../services/routineHandlersV2'

/**
 * V2 Database Hook
 * ================
 * React hook for managing routines using the V2 schema
 * Includes state management, caching, and all CRUD operations
 * 
 * Status: Ready for implementation
 */
export function useRoutineDatabaseV2() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [routines, setRoutines] = useState<RoutineWithBlocksV2[]>([])
  const [lastUpdateEvent, setLastUpdateEvent] = useState<Date | null>(null)

  /**
   * Save a complete routine with blocks and exercises (V2)
   */
  const saveRoutineV2 = async (
    name: string,
    description: string | null,
    ownerId: string,
    blocks: Array<{
      name: string
      block_order: number
      notes?: string | null
      exercises: CreateBlockExerciseV2Payload[]
    }>
  ): Promise<string | null> => {
    try {
      setLoading(true)
      setError(null)

      const routineId = await createRoutineV2(name, description, ownerId, blocks)

      if (routineId) {
        // Update cache
        await refreshRoutinesV2(ownerId)
        setLastUpdateEvent(new Date())
      }

      return routineId

    } catch (err) {
      console.error('Error saving routine V2:', err)
      setError('Error al guardar la rutina')
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Load all routines for a user (V2)
   */
  const loadRoutinesV2 = useCallback(async (
    ownerId: string,
    forceRefresh: boolean = false
  ): Promise<RoutineWithBlocksV2[]> => {
    try {
      // Cache-first strategy
      if (!forceRefresh && routines.length > 0) {
        return routines
      }

      // Check persistent cache
      const cacheKey = `routines_v2_${ownerId}`
      if (!forceRefresh) {
        const cachedData = localStorage.getItem(cacheKey)
        if (cachedData) {
          try {
            const cached = JSON.parse(cachedData)
            if (cached.timestamp && Date.now() - cached.timestamp < 5 * 60 * 1000) {
              setRoutines(cached.data)
              setLastUpdateEvent(new Date())
              return cached.data
            }
          } catch (e) {
            console.warn('Failed to parse cached routines V2', e)
          }
        }
      }

      // Load from database
      setLoading(true)
      setError(null)
      const loadedRoutines = await loadAllRoutinesV2(ownerId)

      // Update state and cache
      setRoutines(loadedRoutines)
      setLastUpdateEvent(new Date())
      
      // Cache the results
      localStorage.setItem(cacheKey, JSON.stringify({
        data: loadedRoutines,
        timestamp: Date.now()
      }))

      return loadedRoutines

    } catch (err) {
      console.error('Error loading routines V2:', err)
      setError('Error al cargar las rutinas')
      return []
    } finally {
      setLoading(false)
    }
  }, [routines])

  /**
   * Load a single routine (V2)
   */
  const loadSingleRoutineV2 = async (routineId: string): Promise<RoutineWithBlocksV2 | null> => {
    try {
      setLoading(true)
      setError(null)

      const routine = await loadRoutineV2(routineId)
      return routine

    } catch (err) {
      console.error('Error loading routine V2:', err)
      setError('Error al cargar la rutina')
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Update a routine (V2)
   */
  const updateRoutineV2Handler = async (
    routineId: string,
    name: string,
    description: string | null,
    ownerId: string,
    blocks: Array<{
      name: string
      block_order: number
      notes?: string | null
      exercises: CreateBlockExerciseV2Payload[]
    }>
  ): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const success = await updateRoutineV2(routineId, name, description, ownerId, blocks)

      if (success) {
        // Update cache
        await refreshRoutinesV2(ownerId)
        setLastUpdateEvent(new Date())
      }

      return success

    } catch (err) {
      console.error('Error updating routine V2:', err)
      setError('Error al actualizar la rutina')
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Delete a routine (V2)
   */
  const deleteRoutineV2Handler = async (
    routineId: string,
    ownerId: string
  ): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const success = await deleteRoutineV2(routineId, ownerId)

      if (success) {
        // Update local state
        setRoutines(prev => prev.filter(r => r.id !== routineId))
        
        // Update cache
        const cacheKey = `routines_v2_${ownerId}`
        localStorage.removeItem(cacheKey)
        
        setLastUpdateEvent(new Date())
      }

      return success

    } catch (err) {
      console.error('Error deleting routine V2:', err)
      setError('Error al eliminar la rutina')
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Add an exercise to a block (V2)
   */
  const addExerciseToBlockV2Handler = async (
    payload: CreateBlockExerciseV2Payload
  ) => {
    try {
      setLoading(true)
      setError(null)

      const result = await addExerciseToBlockV2(payload)

      if (result) {
        toast({
          title: "Ejercicio añadido",
          description: "El ejercicio ha sido añadido exitosamente.",
        })
        setLastUpdateEvent(new Date())
      }

      return result

    } catch (err) {
      console.error('Error adding exercise V2:', err)
      setError('Error al añadir ejercicio')
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Refresh routines (force reload from database)
   */
  const refreshRoutinesV2 = useCallback(async (ownerId: string) => {
    return loadRoutinesV2(ownerId, true)
  }, [loadRoutinesV2])

  /**
   * Clear cache
   */
  const clearCacheV2 = (ownerId: string) => {
    const cacheKey = `routines_v2_${ownerId}`
    localStorage.removeItem(cacheKey)
    setRoutines([])
  }

  return {
    // State
    loading,
    error,
    routines,
    lastUpdateEvent,

    // Operations
    saveRoutineV2,
    loadRoutinesV2,
    loadSingleRoutineV2,
    updateRoutineV2: updateRoutineV2Handler,
    deleteRoutineV2: deleteRoutineV2Handler,
    addExerciseToBlockV2: addExerciseToBlockV2Handler,
    refreshRoutinesV2,
    clearCacheV2,

    // Direct service access (for advanced use cases)
    services: {
      updateExerciseV2,
      deleteExerciseV2
    }
  }
}

