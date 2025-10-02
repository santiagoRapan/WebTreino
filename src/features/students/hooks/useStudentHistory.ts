"use client"

import { useCallback, useState } from 'react'
import { supabase } from '@/services/database/supabaseClient'
import { toast } from '@/hooks/use-toast'
import type { WorkoutSession, WorkoutSetLog, UseStudentHistoryReturn } from '../types'

/**
 * Hook especializado para obtener historial de entrenamiento de un alumno.
 * - No filtra por owner de la rutina (permite ver cualquier sesión del alumno)
 * - Intenta traer el nombre de la rutina si RLS lo permite (LEFT JOIN semantics)
 */
export function useStudentHistory(): UseStudentHistoryReturn {
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [logs, setLogs] = useState<WorkoutSetLog[]>([])

  const fetchHistory = useCallback(async (studentId: string) => {
    setLoadingHistory(true)
    try {
      // Traer sesiones del alumno (sin requerir que la rutina sea del entrenador)
      const { data: sessionsData, error: sessErr } = await supabase
        .from('workout_session')
        .select('id, performer_id, routine_id, started_at, completed_at, notes, routines(id, name, owner_id)')
        .eq('performer_id', studentId)
        .order('started_at', { ascending: false })
        .limit(50)

      if (sessErr) throw sessErr

      const sessions = (sessionsData || []).map((s: any) => ({
        id: s.id,
        performer_id: s.performer_id,
        routine_id: s.routine_id,
        started_at: s.started_at,
        completed_at: s.completed_at,
        notes: s.notes,
        routine: s.routines || null
      }))

      let logs: WorkoutSetLog[] = []
      if (sessions.length) {
        const sessionIds = sessions.map((s: WorkoutSession) => s.id)
        const { data: logsData, error: logsErr } = await supabase
          .from('workout_set_log')
          .select('id, session_id, exercise_id, set_index, reps, weight, rpe, duration_sec, rest_seconds, notes')
          .in('session_id', sessionIds)

        if (logsErr) throw logsErr

        const exerciseIds = [...new Set((logsData || []).map((l: any) => l.exercise_id))]
        let nameMap = new Map<string, string>()
        if (exerciseIds.length) {
          const { data: exData, error: exErr } = await supabase
            .from('exercises')
            .select('id, name')
            .in('id', exerciseIds)
          if (!exErr && exData) {
            nameMap = new Map(exData.map((e: any) => [e.id, e.name || '']))
          }
        }

        logs = (logsData || []).map((l: any) => ({
          id: l.id,
          session_id: l.session_id,
          exercise_id: l.exercise_id,
          exercise_name: nameMap.get(l.exercise_id) || 'Ejercicio',
          set_index: l.set_index,
            reps: l.reps,
            weight: l.weight,
            rpe: l.rpe,
            duration_sec: l.duration_sec,
            rest_seconds: l.rest_seconds,
            notes: l.notes,
        }))
      }

      setSessions(sessions)
      setLogs(logs)
      return { sessions, logs }
    } catch (error: any) {
      console.error('❌ fetchHistory error:', error)
      toast({ title: 'Error', description: 'No se pudo cargar el historial del alumno.', variant: 'destructive' })
      setSessions([])
      setLogs([])
      return { sessions: [], logs: [] }
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  const clearHistory = () => {
    setSessions([])
    setLogs([])
  }

  return { loadingHistory, sessions, logs, fetchHistory, clearHistory }
}
