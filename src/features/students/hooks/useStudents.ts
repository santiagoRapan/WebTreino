"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/services/database"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/features/auth"
import type { Client } from "@/lib/types/trainer"
import type { UseStudentsReturn } from '../types'

export function useStudents(): UseStudentsReturn {
  const { authUser, customUser } = useAuth()
  const [students, setStudents] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTimeout, setRefreshTimeout] = useState<NodeJS.Timeout | null>(null)

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('📚 Loading roster and pending requests...')

      // Get current trainer id from auth context
      if (!authUser) {
        console.error('❌ No authenticated user')
        setError('No se pudo obtener el usuario autenticado')
        return
      }
      const trainerId = authUser.id

      // 1) Fetch roster (trainer_student)
      const { data: rosterRows, error: rosterError } = await supabase
        .from('trainer_student')
        .select('student_id, joined_at')
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

      const rosterClients: Client[] = (rosterProfiles || []).map((profile: any, idx: number) => ({
        id: idx + 1,
        userId: profile.id,
        name: profile.name || 'Alumno',
        email: '',
        phone: '',
        status: "active" as const,
        joinDate: new Date(profile.created_on || new Date()).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
        lastSession: "N/A",
        nextSession: "N/A",
        progress: 0,
        goal: "Sin definir",
  avatar: profile.avatar_url || "/images/placeholder-user.jpg",
        sessionsCompleted: 0,
        totalSessions: 0,
        plan: "Básico",
      }))

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

      const profileMap = new Map<string, any>(
        (pendingProfiles || []).map((p: any) => [p.id, p])
      )

      const pendingClients: Client[] = (pendingRows || []).map((row: any, idx: number) => {
        const profile = profileMap.get(row.student_id) || {}
        return {
          id: rosterClients.length + idx + 1,
          userId: row.student_id,
          requestId: row.id,
          requestedBy: row.requested_by,
          name: profile.name || 'Solicitud pendiente',
          email: '',
          phone: '',
          status: "pending" as const,
          joinDate: new Date(row.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
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

      const combined = [...rosterClients, ...pendingClients]
      console.log(`✅ Loaded ${rosterClients.length} in roster, ${pendingClients.length} pending`)
      setStudents(combined)

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
  }

  const refreshStudents = async () => {
    await fetchStudents()
  }

  // Debounced refresh to prevent too many rapid API calls
  const debouncedRefresh = () => {
    if (refreshTimeout) {
      clearTimeout(refreshTimeout)
    }
    const newTimeout = setTimeout(() => {
      fetchStudents()
    }, 500) // Wait 500ms before refreshing
    setRefreshTimeout(newTimeout)
  }

  const fetchStudentSessions = async (studentId: string) => {
    // Get current trainer id from auth context
    const trainerId = authUser?.id
    if (!trainerId) return { sessions: [], logs: [] }

    // Sessions for this student where routine is owned by trainer
    const { data: sessions, error: sessErr } = await supabase
      .from('workout_session')
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
          .from('workout_set_log')
          .select('id, session_id, exercise_id, set_index, reps, weight, rpe, duration_sec, rest_seconds, notes')
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
      fetchStudents()
    }
  }, [authUser])

  // Real-time subscriptions for automatic updates
  useEffect(() => {
    if (!authUser) return

    console.log('🔔 Setting up real-time subscriptions for trainer:', authUser.id)

    // Subscribe to trainer_link_request changes
    const requestsSubscription = supabase
      .channel('trainer-link-requests')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'trainer_link_request',
          filter: `trainer_id=eq.${authUser.id}`,
        },
        (payload) => {
          console.log('🔔 Trainer link request change:', payload.eventType, payload)
          // Provide user feedback for new requests
          if (payload.eventType === 'INSERT') {
            console.log('📥 Nueva solicitud de entrenador recibida!')
            toast({
              title: "Nueva solicitud recibida",
              description: "Un alumno ha solicitado conectar contigo. Revisa la pestaña de alumnos.",
            })
          } else if (payload.eventType === 'UPDATE') {
            console.log('📝 Estado de solicitud actualizado')
          } else if (payload.eventType === 'DELETE') {
            console.log('🗑️ Solicitud eliminada')
          }
          // Refetch students data when requests change (debounced)
          debouncedRefresh()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to trainer link requests')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to trainer link requests')
        }
      })

    // Subscribe to trainer_student changes (when requests get accepted)
    const relationshipSubscription = supabase
      .channel('trainer-student-relationships')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'trainer_student',
          filter: `trainer_id=eq.${authUser.id}`,
        },
        (payload) => {
          console.log('🔔 Trainer-student relationship change:', payload.eventType, payload)
          if (payload.eventType === 'INSERT') {
            console.log('🎉 Nuevo alumno añadido a la lista!')
            toast({
              title: "Alumno añadido",
              description: "Se ha establecido una nueva conexión con un alumno.",
            })
          }
          // Refetch students data when relationships change (debounced)
          debouncedRefresh()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to trainer-student relationships')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to trainer-student relationships')
        }
      })

    // Cleanup subscriptions on unmount or auth change
    return () => {
      console.log('🔕 Cleaning up real-time subscriptions')
      if (refreshTimeout) {
        clearTimeout(refreshTimeout)
      }
      supabase.removeChannel(requestsSubscription)
      supabase.removeChannel(relationshipSubscription)
    }
  }, [authUser])

  return {
    students,
    loading,
    error,
    refreshStudents,
    fetchStudentSessions
  }
}