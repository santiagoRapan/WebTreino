"use client"

import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@/features/auth"
import { useToast } from "@/hooks/use-toast"
import type { FeedWorkoutSession } from "../services/feedService"
import { getWorkoutsForStudent } from "../services/feedService"

export function useStudentFeed(studentId: string) {
  const { authUser, session } = useAuth()
  const { toast } = useToast()
  const [sessions, setSessions] = useState<FeedWorkoutSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = useCallback(async () => {
    if (!authUser?.id || !studentId || !session?.access_token) return

    try {
      setLoading(true)
      setError(null)
      const data = await getWorkoutsForStudent(authUser.id, studentId, session.access_token)
      setSessions(data)
    } catch (err) {
      console.error("Error fetching student history workouts:", err)
      setError("Error al cargar el historial del alumno")
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar el historial del alumno.",
      })
    } finally {
      setLoading(false)
    }
  }, [authUser?.id, studentId, session?.access_token, toast])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  return {
    sessions,
    loading,
    error,
    refresh: fetchSessions,
  }
}
