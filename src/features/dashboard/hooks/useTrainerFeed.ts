import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/features/auth"
import { getStudentWorkouts, FeedWorkoutSession } from "../services/feedService"
import { useToast } from "@/hooks/use-toast"

export function useTrainerFeed() {
  const { authUser, session } = useAuth()
  const { toast } = useToast()
  const [sessions, setSessions] = useState<FeedWorkoutSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = useCallback(async () => {
    if (!authUser?.id || !session?.access_token) return

    try {
      setLoading(true)
      setError(null)
      const data = await getStudentWorkouts(authUser.id, session.access_token)
      setSessions(data)
    } catch (err) {
      console.error("Error fetching student workouts:", err)
      setError("Error al cargar los entrenamientos")
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los entrenamientos recientes.",
      })
    } finally {
      setLoading(false)
    }
  }, [authUser?.id, session?.access_token, toast])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  return {
    sessions,
    loading,
    error,
    refresh: fetchSessions
  }
}
