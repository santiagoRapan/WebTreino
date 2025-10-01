"use client"

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/services/database'
import type { Exercise } from '@/lib/types/trainer'

interface UseExercisesOptions {
  searchTerm?: string
  category?: string
  equipment?: string
  pageSize?: number
  initialLoad?: boolean
}

export function useExercises(options: UseExercisesOptions = {}) {
  const { 
    searchTerm = '', 
    category, 
    equipment, 
    pageSize = 50,
    initialLoad = false // Changed default to false - don't load on mount
  } = options

  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  const fetchExercises = useCallback(async (pageNumber: number = 0, append: boolean = false) => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('exercises')
        .select('*', { count: 'exact' })
        .order('name', { ascending: true })
        .range(pageNumber * pageSize, (pageNumber + 1) * pageSize - 1)

      // Apply search filter
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`)
      }

      // Apply category filter
      if (category) {
        query = query.or(`category.eq.${category},body_parts.cs.{${category}}`)
      }

      // Apply equipment filter
      if (equipment) {
        query = query.contains('equipments', [equipment])
      }

      const { data, error: queryError, count } = await query

      if (queryError) {
        console.error('Error fetching exercises:', queryError)
        setError(queryError.message)
        return
      }

      // Transform the data to match our Exercise type
      const transformedExercises: Exercise[] = (data || []).map((exercise: any) => ({
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

      if (append) {
        setExercises(prev => [...prev, ...transformedExercises])
      } else {
        setExercises(transformedExercises)
      }

      // Check if there are more results
      const totalLoaded = append 
        ? exercises.length + transformedExercises.length 
        : transformedExercises.length
      setHasMore(count ? totalLoaded < count : false)
      setError(null)
    } catch (err) {
      console.error('Error fetching exercises:', err)
      setError('Error al cargar ejercicios')
    } finally {
      setLoading(false)
    }
  }, [searchTerm, category, equipment, pageSize, exercises.length])

  // Fetch exercises when filters change or on initial load
  useEffect(() => {
    if (initialLoad || searchTerm || category || equipment) {
      setPage(0)
      fetchExercises(0, false)
    }
  }, [searchTerm, category, equipment, initialLoad])

  // Fetch exercises when filters change or on initial load
  useEffect(() => {
    if (initialLoad || searchTerm || category || equipment) {
      setPage(0)
      fetchExercises(0, false)
    }
  }, [searchTerm, category, equipment, initialLoad])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchExercises(nextPage, true)
    }
  }, [loading, hasMore, page, fetchExercises])

  const refetch = useCallback(() => {
    setPage(0)
    fetchExercises(0, false)
  }, [fetchExercises])

  const search = useCallback((filters: Partial<UseExercisesOptions>) => {
    setPage(0)
    fetchExercises(0, false)
  }, [fetchExercises])

  return {
    exercises,
    loading,
    error,
    hasMore,
    loadMore,
    refetch,
    search
  }
}