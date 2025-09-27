"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/services/database'
import type { Exercise } from '@/src/lib/types/trainer'

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .order('name', { ascending: true })

        if (error) {
          console.error('Error fetching exercises:', error)
          setError(error.message)
          return
        }

        // Transform the data to match our Exercise type
        const transformedExercises: Exercise[] = data.map((exercise: any) => ({
          id: exercise.id,
          name: exercise.name || '',
          gif_URL: exercise.gif_url || exercise.gif_URL || '',
          target_muscles: exercise.target_muscles || [],
          body_parts: exercise.body_parts || [],
          equipments: exercise.equipments || [],
          secondary_muscles: exercise.secondary_muscles || [],
          description: exercise.description || '',
          category: exercise.category || ''
        }))

        setExercises(transformedExercises)
        setError(null)
      } catch (err) {
        console.error('Error fetching exercises:', err)
        setError('Error al cargar ejercicios')
      } finally {
        setLoading(false)
      }
    }

    fetchExercises()
  }, [])

  const refetch = () => {
    setLoading(true)
    setError(null)
    // Re-run the effect
    const fetchExercises = async () => {
      try {
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .order('name', { ascending: true })

        if (error) {
          console.error('Error fetching exercises:', error)
          setError(error.message)
          return
        }

        const transformedExercises: Exercise[] = data.map((exercise: any) => ({
          id: exercise.id,
          name: exercise.name || '',
          gif_URL: exercise.gif_url || exercise.gif_URL || '',
          target_muscles: exercise.target_muscles || [],
          body_parts: exercise.body_parts || [],
          equipments: exercise.equipments || [],
          secondary_muscles: exercise.secondary_muscles || [],
          description: exercise.description || '',
          category: exercise.category || ''
        }))

        setExercises(transformedExercises)
        setError(null)
      } catch (err) {
        console.error('Error fetching exercises:', err)
        setError('Error al cargar ejercicios')
      } finally {
        setLoading(false)
      }
    }

    fetchExercises()
  }

  return {
    exercises,
    loading,
    error,
    refetch
  }
}