"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { TrainerLayout } from "@/components/layout/TrainerLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, ArrowLeft, User, History, ClipboardList, RefreshCw } from "lucide-react"
import { useAuth } from "@/features/auth/services/auth-context"
import { supabase } from "@/services/database"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { WorkoutCard } from "@/features/dashboard/components/WorkoutCard"
import { useStudentFeed } from "@/features/dashboard/hooks/useStudentFeed"

export default function AlumnoDetailsPage() {
  const router = useRouter()
  const { loading, isAuthenticated, customUser } = useAuth()
  const params = useParams<{ studentId: string }>()
  const studentId = params.studentId

  const [studentData, setStudentData] = useState<{
    name: string | null
    email: string | null
    avatar_url: string | null
    joinDate?: string
  } | null>(null)
  const [loadingStudent, setLoadingStudent] = useState(true)

  const { sessions, loading: loadingHistory, refresh } = useStudentFeed(studentId)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/auth?redirect=/alumnos/${encodeURIComponent(studentId)}`)
    }
  }, [loading, isAuthenticated, router, studentId])

  useEffect(() => {
    let cancelled = false

    const loadStudentData = async () => {
      if (!customUser?.id) return

      try {
        setLoadingStudent(true)

        // Get student profile
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("name, email, avatar_url")
          .eq("id", studentId)
          .maybeSingle()

        if (!cancelled && !profileError && profileData) {
          // Get join date from trainer_student relationship
          const { data: relationData } = await supabase
            .from("trainer_student")
            .select("joined_at")
            .eq("trainer_id", customUser.id)
            .eq("student_id", studentId)
            .maybeSingle()

          setStudentData({
            ...profileData,
            joinDate: relationData?.joined_at
          })
        } else if (!cancelled && profileError) {
          console.error("Error loading student profile:", profileError)
        } else if (!cancelled && !profileData) {
          console.warn("No profile data found for student:", studentId)
        }
      } catch (error) {
        console.error("Error loading student data:", error)
      } finally {
        if (!cancelled) {
          setLoadingStudent(false)
        }
      }
    }

    if (isAuthenticated && customUser?.id) {
      loadStudentData()
    }

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, studentId, customUser?.id])

  if (loading || loadingStudent) {
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

  // Obtener el nombre del alumno: primero intentar de studentData, 
  // si no está disponible, usar el nombre del performer del primer workout
  const displayName = studentData?.name || sessions[0]?.performer?.name || "Alumno"
  const avatarUrl = studentData?.avatar_url || sessions[0]?.performer?.avatar_url || null
  const avatarFallback = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <TrainerLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/alumnos")}
            className="hover:bg-accent"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Detalles del Alumno</h1>
          </div>
        </div>

        {/* Student Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="text-lg">
                  {avatarFallback || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold">{displayName}</h2>
                {studentData?.email && (
                  <p className="text-muted-foreground">{studentData.email}</p>
                )}
                {studentData?.joinDate && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Unido el{" "}
                    {new Date(studentData.joinDate).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs with different sections */}
        <Tabs defaultValue="historial" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="historial" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Historial
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Información
            </TabsTrigger>
          </TabsList>

          {/* Historial Tab */}
          <TabsContent value="historial" className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Historial de Entrenamientos
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={loadingHistory}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loadingHistory ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
            </div>

            {loadingHistory ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : sessions.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hay entrenamientos registrados aún</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <WorkoutCard
                    key={session.id}
                    session={session}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Info Tab */}
          <TabsContent value="info" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del Alumno</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Nombre
                    </label>
                    <p className="mt-1">{displayName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <p className="mt-1">{studentData?.email || "—"}</p>
                  </div>
                  {studentData?.joinDate && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Fecha de unión
                      </label>
                      <p className="mt-1">
                        {new Date(studentData.joinDate).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Total de entrenamientos
                    </label>
                    <p className="mt-1">{sessions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TrainerLayout>
  )
}
