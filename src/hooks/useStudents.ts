"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/services/database"
import { toast } from "@/hooks/use-toast"
import type { Client } from "@/lib/types/trainer"

export interface UseStudentsReturn {
  students: Client[]
  loading: boolean
  error: string | null
  refreshStudents: () => Promise<void>
  fetchStudentSessions: (studentId: string) => Promise<{ sessions: any[]; logs: any[] }>
}

export function useStudents(): UseStudentsReturn {
  const [students, setStudents] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('📚 Loading roster and pending requests...')

      // Get current trainer id
      const { data: userRes, error: userErr } = await supabase.auth.getUser()
      if (userErr || !userRes.user) {
        console.error('❌ Error getting auth user:', userErr)
        setError('No se pudo obtener el usuario autenticado')
        return
      }
      const trainerId = userRes.user.id

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
        status: "Activo" as const,
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
          status: "Pendiente" as const,
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

  const fetchStudentSessions = async (studentId: string) => {
    // Get current trainer id
    const { data: userRes } = await supabase.auth.getUser()
    const trainerId = userRes.user?.id
    if (!trainerId) return { sessions: [], logs: [] }

    // Sessions for this student where routine is owned by trainer
    const { data: sessions, error: sessErr } = await supabase
      .from('workout_session')
      .select('id, performer_id, routine_id, started_at, completed_at, notes, routines!inner(id, name, owner_id)')
      .eq('performer_id', studentId)
      .eq('routines.owner_id', trainerId)
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
    fetchStudents()
  }, [])

  return {
    students,
    loading,
    error,
    refreshStudents,
    fetchStudentSessions
  }
}