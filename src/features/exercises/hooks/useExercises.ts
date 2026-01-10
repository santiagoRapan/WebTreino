"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/services/database'
import type { Exercise, UseExercisesOptions } from '../types'

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
  const pageRef = useRef(0)

  // Guards against repeated fetches for the same page (can happen with fast scroll events).
  const requestedPagesRef = useRef<Set<number>>(new Set())

  // Reset paging guard when filters change.
  useEffect(() => {
    requestedPagesRef.current.clear()
    pageRef.current = 0
  }, [searchTerm, category, equipment, pageSize])

  const fetchExercises = useCallback(async (pageNumber: number = 0, append: boolean = false) => {
    try {
      if (!append) {
        requestedPagesRef.current.clear()
      } else {
        if (requestedPagesRef.current.has(pageNumber)) return
        requestedPagesRef.current.add(pageNumber)
      }

      setLoading(true)
      
      let query = supabase
        .from('exercises')
        .select('*', { count: 'exact' })
        .order('name', { ascending: true })
        .order('id', { ascending: true })
        .range(pageNumber * pageSize, (pageNumber + 1) * pageSize - 1)

      // Apply search filter
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`)
      }

      // Apply category filter - match against body_parts array
      if (category) {
        query = query.contains('body_parts', [category])
      }

      // Apply equipment filter
      if (equipment) {
        query = query.contains('equipments', [equipment])
      }

      const { data, error: queryError, count } = await query

      if (queryError) {
        console.error('Error fetching exercises:', queryError)
        setError(queryError.message)
        if (append) requestedPagesRef.current.delete(pageNumber)
        return
      }

      const totalCount = typeof count === 'number' ? count : null

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
        setExercises(prev => {
          const merged = [...prev, ...transformedExercises]
          const seen = new Set<string>()
          const unique = merged.filter((ex) => {
            const key = String(ex.id)
            if (seen.has(key)) return false
            seen.add(key)
            return true
          })

          if (totalCount !== null) {
            setHasMore(unique.length < totalCount)
          } else {
            setHasMore(transformedExercises.length === pageSize)
          }

          return unique
        })
      } else {
        setExercises(transformedExercises)

        if (totalCount !== null) {
          setHasMore(transformedExercises.length < totalCount)
        } else {
          setHasMore(transformedExercises.length === pageSize)
        }
      }

      setError(null)
    } catch (err) {
      console.error('Error fetching exercises:', err)
      setError('Error al cargar ejercicios')
      if (append) requestedPagesRef.current.delete(pageNumber)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, category, equipment, pageSize])

  // Fetch exercises when filters change or on initial load
  useEffect(() => {
    if (initialLoad || searchTerm || category || equipment) {
      pageRef.current = 0
      fetchExercises(0, false)
    }
  }, [searchTerm, category, equipment, initialLoad, fetchExercises])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = pageRef.current + 1
      pageRef.current = nextPage
      void fetchExercises(nextPage, true)
    }
  }, [loading, hasMore, fetchExercises])

  const refetch = useCallback(() => {
    pageRef.current = 0
    fetchExercises(0, false)
  }, [fetchExercises])

  const search = useCallback((filters: Partial<UseExercisesOptions>) => {
    void filters
    pageRef.current = 0
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