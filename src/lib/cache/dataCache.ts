"use client"

import { RoutineTemplate } from '@/features/routines/types'
import type { Client } from '@/features/trainer/types'

interface CacheData<T> {
  userId: string
  data: T
  lastUpdated: Date
  version: string
}

class DataCacheManager {
  private static readonly CACHE_VERSION = '1.1.0'
  private static readonly CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000 // 24 hours

  /**
   * Generic method to get cached data for a specific user and data type
   */
  private static getCachedData<T>(key: string, userId: string): T | null {
    try {
      if (typeof window === 'undefined') return null

      const cached = localStorage.getItem(key)
      if (!cached) {
        // console.log(`🗄️ No cached data found for key: ${key}`)
        return null
      }

      const parsedCache: CacheData<T> = JSON.parse(cached)

      // Check if cache is for the correct user
      if (parsedCache.userId !== userId) {
        // console.log(`🗄️ Cache is for different user, clearing key: ${key}`)
        this.clearCache(key)
        return null
      }

      // Check cache version
      if (parsedCache.version !== this.CACHE_VERSION) {
        // console.log(`🗄️ Cache version mismatch for key: ${key}, clearing...`)
        this.clearCache(key)
        return null
      }

      // Check if cache has expired
      const lastUpdated = new Date(parsedCache.lastUpdated)
      const now = new Date()
      const timeDiff = now.getTime() - lastUpdated.getTime()

      if (timeDiff > this.CACHE_EXPIRY_MS) {
        // console.log(`🗄️ Cache has expired for key: ${key}, clearing...`)
        this.clearCache(key)
        return null
      }

      // console.log(`🚀 Loading data from cache for key: ${key}`)
      return parsedCache.data

    } catch (error) {
      console.error(`❌ Error reading cached data for key: ${key}`, error)
      this.clearCache(key)
      return null
    }
  }

  /**
   * Generic method to save data to cache
   */
  private static setCachedData<T>(key: string, userId: string, data: T): void {
    try {
      if (typeof window === 'undefined') return

      const cacheData: CacheData<T> = {
        userId,
        data,
        lastUpdated: new Date(),
        version: this.CACHE_VERSION
      }

      localStorage.setItem(key, JSON.stringify(cacheData))
      // console.log(`💾 Data cached successfully for key: ${key}`)

    } catch (error) {
      console.error(`❌ Error caching data for key: ${key}`, error)
    }
  }

  /**
   * Clear specific cache
   */
  private static clearCache(key: string): void {
    try {
      if (typeof window === 'undefined') return
      localStorage.removeItem(key)
      // console.log(`🧹 Cache cleared for key: ${key}`)
    } catch (error) {
      console.error(`❌ Error clearing cache for key: ${key}`, error)
    }
  }

  // =================== ROUTINES CACHE ===================
  
  static getCachedRoutines(userId: string): RoutineTemplate[] | null {
    return this.getCachedData<RoutineTemplate[]>('treino_routines_cache', userId)
  }

  static setCachedRoutines(userId: string, routines: RoutineTemplate[]): void {
    this.setCachedData('treino_routines_cache', userId, routines)
  }

  static updateCachedRoutine(userId: string, updatedRoutine: RoutineTemplate): boolean {
    try {
      const cachedRoutines = this.getCachedRoutines(userId)
      if (!cachedRoutines) return false

      const updatedRoutines = cachedRoutines.map(routine => 
        routine.id === updatedRoutine.id ? updatedRoutine : routine
      )

      this.setCachedRoutines(userId, updatedRoutines)
      // console.log('📝 Routine updated in cache:', updatedRoutine.id)
      return true

    } catch (error) {
      console.error('❌ Error updating cached routine:', error)
      return false
    }
  }

  static addCachedRoutine(userId: string, newRoutine: RoutineTemplate): boolean {
    try {
      const cachedRoutines = this.getCachedRoutines(userId) || []
      const updatedRoutines = [newRoutine, ...cachedRoutines]

      this.setCachedRoutines(userId, updatedRoutines)
      // console.log('➕ Routine added to cache:', newRoutine.id)
      return true

    } catch (error) {
      console.error('❌ Error adding routine to cache:', error)
      return false
    }
  }

  static removeCachedRoutine(userId: string, routineId: string | number): boolean {
    try {
      const cachedRoutines = this.getCachedRoutines(userId)
      if (!cachedRoutines) return false

      const updatedRoutines = cachedRoutines.filter(routine => routine.id !== routineId)

      this.setCachedRoutines(userId, updatedRoutines)
      // console.log('🗑️ Routine removed from cache:', routineId)
      return true

    } catch (error) {
      console.error('❌ Error removing cached routine:', error)
      return false
    }
  }

  static clearRoutinesCache(): void {
    this.clearCache('treino_routines_cache')
  }

  // =================== STUDENTS CACHE ===================

  static getCachedStudents(userId: string): Client[] | null {
    return this.getCachedData<Client[]>('treino_students_cache', userId)
  }

  static setCachedStudents(userId: string, students: Client[]): void {
    this.setCachedData('treino_students_cache', userId, students)
  }

  static updateCachedStudent(userId: string, updatedStudent: Client): boolean {
    try {
      const cachedStudents = this.getCachedStudents(userId)
      if (!cachedStudents) return false

      const updatedStudents = cachedStudents.map(student => 
        student.id === updatedStudent.id ? updatedStudent : student
      )

      this.setCachedStudents(userId, updatedStudents)
      // console.log('📝 Student updated in cache:', updatedStudent.id)
      return true

    } catch (error) {
      console.error('❌ Error updating cached student:', error)
      return false
    }
  }

  static addCachedStudent(userId: string, newStudent: Client): boolean {
    try {
      const cachedStudents = this.getCachedStudents(userId) || []
      const updatedStudents = [newStudent, ...cachedStudents]

      this.setCachedStudents(userId, updatedStudents)
      // console.log('➕ Student added to cache:', newStudent.id)
      return true

    } catch (error) {
      console.error('❌ Error adding student to cache:', error)
      return false
    }
  }

  static removeCachedStudent(userId: string, studentId: string): boolean {
    try {
      const cachedStudents = this.getCachedStudents(userId)
      if (!cachedStudents) return false

      const updatedStudents = cachedStudents.filter(student => student.id !== studentId)

      this.setCachedStudents(userId, updatedStudents)
      // console.log('🗑️ Student removed from cache:', studentId)
      return true

    } catch (error) {
      console.error('❌ Error removing cached student:', error)
      return false
    }
  }

  static clearStudentsCache(): void {
    this.clearCache('treino_students_cache')
  }

  // =================== UTILITY METHODS ===================

  static clearAllCaches(): void {
    this.clearRoutinesCache()
    this.clearStudentsCache()
    // console.log('🧹 All caches cleared')
  }

  static getCacheMetadata(key: string): { userId?: string; lastUpdated?: Date; dataCount?: number } | null {
    try {
      if (typeof window === 'undefined') return null

      const cached = localStorage.getItem(key)
      if (!cached) return null

      const parsedCache: CacheData<any[]> = JSON.parse(cached)
      return {
        userId: parsedCache.userId,
        lastUpdated: new Date(parsedCache.lastUpdated),
        dataCount: Array.isArray(parsedCache.data) ? parsedCache.data.length : 0
      }

    } catch (error) {
      console.error(`❌ Error reading cache metadata for key: ${key}`, error)
      return null
    }
  }

  static hasCachedRoutines(userId: string): boolean {
    const cached = this.getCachedRoutines(userId)
    return cached !== null && cached.length > 0
  }

  static hasCachedStudents(userId: string): boolean {
    const cached = this.getCachedStudents(userId)
    return cached !== null && cached.length > 0
  }
}

export default DataCacheManager
