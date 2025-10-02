"use client"

import { useState, useEffect, useMemo } from 'react'
import { useExercises } from './useExercises'
import type { UseExerciseSearchOptions } from '../types'

/**
 * Hook optimizado para búsqueda de ejercicios con debouncing
 * Solo carga ejercicios cuando el usuario está buscando activamente
 */
export function useExerciseSearch(options: UseExerciseSearchOptions = {}) {
  const { debounceMs = 300, pageSize = 50 } = options

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [category, setCategory] = useState<string | undefined>()
  const [equipment, setEquipment] = useState<string | undefined>()

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchTerm, debounceMs])

  // Always fetch - will show first page of exercises by default
  // Then filter/search as user types
  const {
    exercises,
    loading,
    error,
    hasMore,
    loadMore,
    refetch
  } = useExercises({
    searchTerm: debouncedSearchTerm,
    category,
    equipment,
    pageSize,
    initialLoad: true // Always load initial exercises
  })

  // Get unique values for filters from loaded exercises
  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>()
    exercises.forEach(ex => {
      if (ex.category) categories.add(ex.category)
      ex.body_parts?.forEach(bp => categories.add(bp))
    })
    return Array.from(categories).sort()
  }, [exercises])

  const uniqueEquipments = useMemo(() => {
    const equipments = new Set<string>()
    exercises.forEach(ex => {
      ex.equipments?.forEach(eq => equipments.add(eq))
    })
    return Array.from(equipments).sort()
  }, [exercises])

  return {
    // Search state
    searchTerm,
    setSearchTerm,
    category,
    setCategory,
    equipment,
    setEquipment,
    
    // Results
    exercises,
    loading,
    error,
    hasMore,
    loadMore,
    refetch,
    
    // Filter options
    uniqueCategories,
    uniqueEquipments,
    
    // Helper
    isSearchActive: debouncedSearchTerm.length > 0 || !!category || !!equipment
  }
}
