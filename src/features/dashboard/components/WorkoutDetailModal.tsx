import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Clock, Dumbbell, Layers, Play, Maximize2 } from "lucide-react"
import Image from "next/image"
import { FeedWorkoutSession, getSessionDetails, SessionExerciseDetail } from "../services/feedService"

interface WorkoutDetailModalProps {
  session: FeedWorkoutSession
  isOpen: boolean
  onClose: () => void
}

export function WorkoutDetailModal({ session, isOpen, onClose }: WorkoutDetailModalProps) {
  const [details, setDetails] = useState<SessionExerciseDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMedia, setSelectedMedia] = useState<{ url: string, type: 'image' | 'video' } | null>(null)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      setError(null)
      getSessionDetails(session.id)
        .then(setDetails)
        .catch((err) => {
          console.error("Error fetching session details:", err)
          setError("Error al cargar los detalles del entrenamiento")
        })
        .finally(() => setLoading(false))
    }
  }, [isOpen, session.id])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) return "Hoy"
    
    return new Intl.DateTimeFormat('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    }).format(date)
  }

  const title = session.title || session.routine?.name || "Entrenamiento sin título"

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={session.performer.avatar_url || undefined} />
              <AvatarFallback>
                {session.performer.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <div className="flex justify-between items-start">
                <p className="font-semibold text-sm">{session.performer.name}</p>
                <span className="text-xs text-muted-foreground font-normal">
                  {formatDate(session.completed_at || session.started_at)}
                </span>
              </div>
              <p className="text-sm font-medium">{title}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full w-full rounded-b-lg">
            <div className="p-6 pt-2 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 py-4 border-y border-border/50">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Duración</p>
                <div className="flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-lg font-semibold">{session.stats.duration}</span>
                </div>
              </div>
              <div className="text-center border-l border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Ejercicios</p>
                <div className="flex items-center justify-center gap-1">
                  <Dumbbell className="w-4 h-4 text-primary" />
                  <span className="text-lg font-semibold">{session.stats.exerciseCount}</span>
                </div>
              </div>
              <div className="text-center border-l border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Series</p>
                <div className="flex items-center justify-center gap-1">
                  <Layers className="w-4 h-4 text-primary" />
                  <span className="text-lg font-semibold">{session.stats.setCount}</span>
                </div>
              </div>
            </div>

            {/* Media Preview (if any) */}
            {session.media.length > 0 && (
              <div className="grid grid-cols-2 gap-2 h-40">
                {session.media.slice(0, 2).map((item, index) => (
                  <div 
                    key={index} 
                    className="relative rounded-md overflow-hidden bg-muted h-full cursor-pointer group"
                    onClick={() => item.public_url && setSelectedMedia({ url: item.public_url, type: item.media_type })}
                  >
                    <div className="absolute inset-0 z-20 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Maximize2 className="w-6 h-6 text-white drop-shadow-md" />
                    </div>

                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs relative">
                       {item.public_url ? (
                          item.media_type === 'video' ? (
                            <div className="relative w-full h-full">
                              <video 
                                src={item.public_url} 
                                className="w-full h-full object-cover pointer-events-none"
                                muted
                                playsInline
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
                                <div className="bg-background/80 rounded-full p-1.5">
                                  <Play className="w-4 h-4 fill-foreground text-foreground" />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <Image 
                              src={item.public_url} 
                              alt="Workout media" 
                              fill 
                              className="object-cover"
                            />
                          )
                       ) : (
                          <div className="flex flex-col items-center gap-1">
                            {item.media_type === 'video' ? 'Video' : 'Imagen'}
                          </div>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Exercises Detail */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="text-center text-destructive py-4">{error}</div>
              ) : (
                details.map((exercise) => (
                  <div key={exercise.exerciseId} className="bg-card rounded-lg border p-4 space-y-4">
                    <div className="flex items-center gap-4">
                      {exercise.gifUrl ? (
                        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted shrink-0">
                          <Image 
                            src={exercise.gifUrl} 
                            alt={exercise.name} 
                            fill 
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center shrink-0">
                          <Dumbbell className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-sm">{exercise.name}</h4>
                        <p className="text-xs text-muted-foreground">{exercise.sets.length} series</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-4 text-xs text-muted-foreground px-2">
                        <div>Serie</div>
                        <div>Peso</div>
                        <div>Reps</div>
                        <div>RPE</div>
                      </div>
                      {exercise.sets.map((set) => (
                        <div key={set.id} className="grid grid-cols-4 text-sm px-2 py-1 border-t border-border/50">
                          <div className="font-medium">{set.setIndex}</div>
                          <div>{set.weight !== null ? `${set.weight} kg` : '-'}</div>
                          <div>{set.reps !== null ? set.reps : '-'}</div>
                          <div>{set.rpe !== null ? set.rpe : '-'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          </ScrollArea>
        </div>
      </DialogContent>

      <Dialog open={!!selectedMedia} onOpenChange={(open) => !open && setSelectedMedia(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none sm:max-w-[80vw] sm:max-h-[80vh] flex items-center justify-center z-[60]">
          <DialogTitle className="sr-only">Media Preview</DialogTitle>
          {selectedMedia && (
            selectedMedia.type === 'video' ? (
               <video 
                 src={selectedMedia.url} 
                 className="w-full h-full max-h-[80vh] object-contain" 
                 controls 
                 autoPlay 
               />
            ) : (
               <div className="relative w-full h-[80vh]">
                 <Image 
                   src={selectedMedia.url} 
                   alt="Full size media" 
                   fill 
                   className="object-contain" 
                 />
               </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
