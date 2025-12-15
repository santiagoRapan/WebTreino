"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "@/services/database"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/features/auth/services/auth-context"
import type { Client } from "@/features/trainer/types"
import type { UseStudentsReturn } from '../types'
import DataCacheManager from "@/lib/cache/dataCache"
import { guestService } from "../services/guest-service"

export function useStudents(): UseStudentsReturn {
  const { authUser } = useAuth()
  const [students, setStudents] = useState<Client[]>([])
  const studentsRef = useRef<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTimeout, setRefreshTimeout] = useState<NodeJS.Timeout | null>(null)
  const [lastUpdateEvent, setLastUpdateEvent] = useState<Date | null>(null)

  const fetchStudents = useCallback(async (forceRefresh: boolean = false) => {
    try {
      // Get current trainer id from auth context
      if (!authUser) {
        // console.error('❌ No authenticated user')
        setError('No se pudo obtener el usuario autenticado')
        return
      }
      const trainerId = authUser.id

      // 🚀 CACHE-FIRST: Intentar cargar desde cache primero si no estamos forzando refresh
      if (!forceRefresh) {
        // 1. Verificar cache en memoria
        if (studentsRef.current.length > 0) {
          // console.log('🚀 Using in-memory cached students')
          return
        }

        // 2. Verificar cache persistente (localStorage)
        const cachedStudents = DataCacheManager.getCachedStudents(trainerId)
        if (cachedStudents && cachedStudents.length > 0) {
          // console.log('💾 Loading students from persistent cache')
          setStudents(cachedStudents)
          setLastUpdateEvent(new Date())

          // Verificar actualizaciones en background (sin loading visible)
          setTimeout(() => {
            checkForStudentUpdatesInBackground(trainerId, cachedStudents)
          }, 0)

          return
        }
      }

      setLoading(true)
      setError(null)

      // console.log('📚 Loading roster and pending requests...')

      // 1) Fetch roster (trainer_student)
      const { data: rosterRows, error: rosterError } = await supabase
        .from('trainer_student')
        .select('id, trainer_id, student_id, joined_at, status')
        .eq('trainer_id', trainerId)

      if (rosterError) {
        console.error('❌ Error loading roster:', rosterError)
        setError(rosterError.message)
        return
      }

      const studentIds = (rosterRows || []).map(r => r.student_id)
      const { data: rosterProfiles, error: profilesError } = studentIds.length > 0
        ? await supabase.from('users').select('id, name, avatar_url, created_on').in('id', studentIds)
        : { data: [], error: null as any }

      if (profilesError) {
        console.error('❌ Error loading student profiles:', profilesError)
        setError(profilesError.message)
        return
      }

      const formatDate = (iso?: string | null) =>
        iso
          ? new Date(iso).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
          : ''

      const rosterProfileMap = new Map<string, any>(
        (rosterProfiles || []).map((profile: any) => [profile.id, profile])
      )

      const rosterClients: Client[] = (rosterRows || []).map((row: any) => {
        const profile = rosterProfileMap.get(row.student_id) || {}
        return {
          id: String(row.id), // Use trainer_student.id as the primary identifier
          userId: String(row.student_id),
          relationshipId: String(row.id), // Store the trainer_student.id for reference
          name: profile.name || 'Alumno',
          email: '',
          phone: '',
          status: (row.status as any) || "active",
          joinDate: formatDate(row.joined_at || profile.created_on),
          createdAt: profile.created_on || undefined,
          lastSession: "N/A",
          nextSession: "N/A",
          progress: 0,
          goal: "Sin definir",
          avatar: profile.avatar_url || "/images/placeholder-user.jpg",
          sessionsCompleted: 0,
          totalSessions: 0,
          plan: "Básico",
        }
      })

      // 2) Fetch pending requests involving this trainer
      const { data: pendingRows, error: pendingError } = await supabase
        .from('trainer_link_request')
        .select('id, trainer_id, student_id, requested_by, status, created_at')
        .eq('trainer_id', trainerId)
        .eq('status', 'pending')

      if (pendingError) {
        console.error('❌ Error loading pending requests:', pendingError)
        setError(pendingError.message)
        return
      }

      const pendingStudentIds = (pendingRows || []).map(r => r.student_id)
      const { data: pendingProfiles, error: pendingProfilesError } = pendingStudentIds.length > 0
        ? await supabase.from('users').select('id, name, avatar_url, created_on').in('id', pendingStudentIds)
        : { data: [], error: null as any }

      if (pendingProfilesError) {
        console.error('❌ Error loading pending profiles:', pendingProfilesError)
        setError(pendingProfilesError.message)
        return
      }

      const pendingProfileMap = new Map<string, any>(
        (pendingProfiles || []).map((p: any) => [p.id, p])
      )

      const pendingClients: Client[] = (pendingRows || []).map((row: any) => {
        const profile = pendingProfileMap.get(row.student_id) || {}
        return {
          id: String(row.id),
          userId: String(row.student_id),
          relationshipId: null,
          requestId: row.id,
          requestedBy: row.requested_by ?? null,
          requestStatus: row.status ?? null,
          name: profile.name || 'Solicitud pendiente',
          email: '',
          phone: '',
          status: "pending" as const,
          joinDate: formatDate(row.created_at),
          createdAt: row.created_at || undefined,
          lastSession: "N/A",
          nextSession: "N/A",
          progress: 0,
          goal: "Sin definir",
          avatar: profile.avatar_url || "/images/placeholder-user.jpg",
          sessionsCompleted: 0,
          totalSessions: 0,
          plan: "Básico",
        }
      })

      // 3) Fetch guest students
      const guests = await guestService.getGuests()
      const guestClients: Client[] = guests.map(guest => ({
        id: guest.id,
        userId: `guest_${guest.id}`, // Virtual user ID for guests
        name: guest.name,
        email: guest.email || '',
        phone: guest.phone || '',
        status: (guest.status as any) || "active",
        joinDate: formatDate(guest.created_at),
        createdAt: guest.created_at,
        lastSession: "N/A",
        nextSession: "N/A",
        progress: 0,
        goal: "Sin definir",
        avatar: "/images/placeholder-user.jpg", // Default avatar for guests
        sessionsCompleted: 0,
        totalSessions: 0,
        plan: "Invitado",
        isGuest: true
      }))

      const combined = [...rosterClients, ...pendingClients, ...guestClients]
      // console.log(`✅ Loaded ${rosterClients.length} in roster, ${pendingClients.length} pending`)

      // ✅ Actualizar both cache en memoria y persistente
      studentsRef.current = combined
      setStudents(combined)
      setLastUpdateEvent(new Date())
      DataCacheManager.setCachedStudents(trainerId, combined)

    } catch (err) {
      console.error('❌ Error fetching students:', err)
      setError('Error al cargar los alumnos')
      toast({
        title: "Error",
        description: "No se pudieron cargar los alumnos.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [authUser])

  // 🔍 Verificar actualizaciones en background sin mostrar loading al usuario
  const checkForStudentUpdatesInBackground = useCallback(async (trainerId: string, cachedStudents: Client[]) => {
    try {
      // console.log('🔍 Checking for student updates in background...')

      // Verificar cambios en roster
      const { data: rosterRows, error: rosterError } = await supabase
        .from('trainer_student')
        .select('id, student_id')
        .eq('trainer_id', trainerId)

      // Verificar cambios en requests pendientes
      const { data: pendingRows, error: pendingError } = await supabase
        .from('trainer_link_request')
        .select('id, student_id')
        .eq('trainer_id', trainerId)
        .eq('status', 'pending')

      if (rosterError || pendingError) {
        console.error('Background update check failed:', rosterError || pendingError)
        return
      }

      const currentStudentCount = (rosterRows?.length || 0) + (pendingRows?.length || 0)

      // cachedStudents may include guest entries that are not reflected in DB counts.
      const cachedDbBackedCount = (cachedStudents || []).filter((s: any) => !s?.isGuest).length

      // Simple check: si el número de estudiantes cambió, actualizar
      if (currentStudentCount !== cachedDbBackedCount) {
        // console.log('🔄 Student changes detected, refreshing data...')
        await fetchStudents(true)
      } else {
        // console.log('✅ No student changes detected, cache is up to date')
      }

    } catch (err) {
      console.error('Error in background student update check:', err)
    }
  }, [fetchStudents])

  const refreshStudents = useCallback(async () => {
    await fetchStudents(true) // Force refresh
  }, [fetchStudents])

  // Debounced refresh to prevent too many rapid API calls
  const debouncedRefresh = useCallback(() => {
    if (refreshTimeout) {
      clearTimeout(refreshTimeout)
    }
    const newTimeout = setTimeout(() => {
      fetchStudents(true) // Force refresh on real-time events
    }, 500) // Wait 500ms before refreshing
    setRefreshTimeout(newTimeout)
  }, [fetchStudents, refreshTimeout])

  const fetchStudentSessions = async (studentId: string) => {
    // Get current trainer id from auth context
    const trainerId = authUser?.id
    if (!trainerId) return { sessions: [], logs: [] }

    // Sessions for this student where routine is owned by trainer (using V2 tables)
    const { data: sessions, error: sessErr } = await supabase
      .from('workout_session_v2')
      .select('id, performer_id, routine_id, started_at, completed_at, notes, routines!inner(id, name, owner_id)')
      .eq('performer_id', studentId)
      .order('started_at', { ascending: false })

    if (sessErr) {
      console.error('❌ Error loading sessions:', sessErr)
      return { sessions: [], logs: [] }
    }

    const sessionIds = (sessions || []).map((s: any) => s.id)
    const { data: logs, error: logsErr } = sessionIds.length > 0
      ? await supabase
        .from('workout_set_log_v2')
        .select('id, session_id, exercise_id, set_index, reps, weight_kg, rpe, duration_sec, rest_seconds, notes, performed_at')
        .in('session_id', sessionIds)
      : { data: [], error: null as any }

    if (logsErr) {
      console.error('❌ Error loading logs:', logsErr)
      return { sessions, logs: [] }
    }

    // NEW: Fetch exercise names
    const exerciseIds = [...new Set((logs || []).map((l: any) => l.exercise_id))]
    const { data: exercises, error: exErr } = exerciseIds.length > 0
      ? await supabase.from('exercises').select('id, name').in('id', exerciseIds)
      : { data: [], error: null as any }

    if (exErr) {
      console.error('❌ Error loading exercises:', exErr)
      // Non-fatal, just won't have names, but return original logs
      return { sessions: sessions || [], logs: logs || [] }
    }

    const exerciseMap = new Map((exercises || []).map((e: any) => [e.id, e.name]))
    const logsWithExerciseNames = (logs || []).map((l: any) => ({ ...l, exercise_name: exerciseMap.get(l.exercise_id) || 'Ejercicio desconocido' }))


    return { sessions: sessions || [], logs: logsWithExerciseNames }
  }

  useEffect(() => {
    if (authUser) {
      fetchStudents(false) // Initial load with cache-first
    }
  }, [authUser, fetchStudents])

  // Keep ref in sync for cache-first short-circuit.
  useEffect(() => {
    studentsRef.current = students
  }, [students])

  // Real-time subscriptions for automatic updates
  useEffect(() => {
    if (!authUser) return

    console.log('🔔 Setting up real-time subscriptions for trainer:', authUser.id)

    let requestsSubscription: any = null
    let relationshipSubscription: any = null
    let reconnectTimeout: NodeJS.Timeout | null = null

    const setupSubscriptions = () => {
      // Subscribe to trainer_link_request changes
      requestsSubscription = supabase
        .channel('trainer-link-requests', {
          config: {
            broadcast: { self: true },
            presence: { key: authUser.id },
          },
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'trainer_link_request',
            filter: `trainer_id=eq.${authUser.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              toast({
                title: "Nueva solicitud recibida",
                description: "Un alumno ha solicitado conectar contigo. Revisa la pestaña de alumnos.",
              })
            }
            debouncedRefresh()
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Subscribed to trainer link requests')
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Error subscribing to trainer link requests:', status)
            scheduleReconnect()
          } else if (status === 'TIMED_OUT') {
            console.warn('⏰ Subscription timed out, attempting reconnect...')
            scheduleReconnect()
          }
        })

      // Subscribe to trainer_student changes (when requests get accepted)
      relationshipSubscription = supabase
        .channel('trainer-student-relationships', {
          config: {
            broadcast: { self: true },
            presence: { key: authUser.id },
          },
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'trainer_student',
            filter: `trainer_id=eq.${authUser.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              toast({
                title: "Alumno añadido",
                description: "Se ha establecido una nueva conexión con un alumno.",
              })
            }
            debouncedRefresh()
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Subscribed to trainer-student relationships')
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Error subscribing to trainer-student relationships:', status)
            scheduleReconnect()
          } else if (status === 'TIMED_OUT') {
            console.warn('⏰ Relationship subscription timed out, attempting reconnect...')
            scheduleReconnect()
          }
        })
    }

    const scheduleReconnect = () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
      reconnectTimeout = setTimeout(() => {
        console.log('🔄 Attempting to reconnect subscriptions...')
        cleanupSubscriptions()
        setupSubscriptions()
      }, 5000) // Wait 5 seconds before reconnecting
    }

    const cleanupSubscriptions = () => {
      if (requestsSubscription) {
        supabase.removeChannel(requestsSubscription)
        requestsSubscription = null
      }
      if (relationshipSubscription) {
        supabase.removeChannel(relationshipSubscription)
        relationshipSubscription = null
      }
    }

    // Initial setup
    setupSubscriptions()

    // Handle page visibility to ensure subscriptions stay active
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Tab visible - checking subscription status...')
        // Force refresh data when tab becomes visible to ensure we have latest data
        setTimeout(() => {
          fetchStudents(true)
        }, 500)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup subscriptions on unmount or auth change
    return () => {
      console.log('🔕 Cleaning up real-time subscriptions')
      if (refreshTimeout) {
        clearTimeout(refreshTimeout)
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      cleanupSubscriptions()
    }
  }, [authUser?.id])

  return {
    students,
    loading,
    error,
    refreshStudents,
    fetchStudentSessions,
    lastUpdateEvent
  }
}
