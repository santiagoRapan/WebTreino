import { useTrainerFeed } from "../hooks/useTrainerFeed"
import { WorkoutCard } from "./WorkoutCard"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function StudentWorkoutsFeed() {
  const { sessions, loading, error, refresh } = useTrainerFeed()

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={refresh} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </Button>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
        <p>No hay entrenamientos recientes de tus alumnos.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Entrenamientos de alumnos</h2>
        <Button variant="ghost" size="sm" onClick={refresh} className="h-8 w-8 p-0">
          <RefreshCw className="w-4 h-4" />
          <span className="sr-only">Actualizar</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session) => (
          <WorkoutCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  )
}
