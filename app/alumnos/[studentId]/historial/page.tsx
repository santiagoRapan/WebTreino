"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { TrainerLayout } from "@/components/layout/TrainerLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ArrowLeft, RefreshCw } from "lucide-react"
import { useAuth } from "@/features/auth/services/auth-context"
import { supabase } from "@/services/database"
import { WorkoutCard } from "@/features/dashboard/components/WorkoutCard"
import { useStudentFeed } from "@/features/dashboard/hooks/useStudentFeed"

export default function AlumnoHistorialPage() {
  const router = useRouter()
  const { loading, isAuthenticated } = useAuth()
  const params = useParams<{ studentId: string }>()
  const studentId = params.studentId

  const { sessions, loading: loadingHistory, error, refresh } = useStudentFeed(studentId)
  const [studentName, setStudentName] = useState<string>(studentId)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/auth?redirect=/alumnos/${encodeURIComponent(studentId)}/historial`)
    }
  }, [loading, isAuthenticated, router, studentId])

  useEffect(() => {
    let cancelled = false

    const loadStudentName = async () => {
      // Best-effort (RLS might restrict direct access)
      const { data, error } = await supabase
        .from("users")
        .select("name")
        .eq("id", studentId)
        .maybeSingle()

      if (!cancelled && !error && data?.name) {
        setStudentName(data.name)
      }
    }

    if (isAuthenticated) {
      loadStudentName()
    }

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, studentId])

  const titleName = useMemo(() => studentName || studentId, [studentName, studentId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Cargando...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <TrainerLayout>
      <main className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="gap-2" onClick={() => router.push("/alumnos")}
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={refresh} className="h-9 w-9 p-0">
            <RefreshCw className="w-4 h-4" />
            <span className="sr-only">Actualizar</span>
          </Button>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-4 md:p-6 space-y-4">
            <div>
              <h1 className="text-lg md:text-xl font-semibold">Historial de {titleName}</h1>
              <p className="text-sm text-muted-foreground">Sesiones de entrenamiento y multimedia del alumno.</p>
            </div>

            {loadingHistory ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="space-y-3">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" onClick={refresh} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Reintentar
                </Button>
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-muted-foreground">No hay sesiones registradas para este alumno.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessions.map((session) => (
                  <WorkoutCard key={session.id} session={session} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </TrainerLayout>
  )
}
