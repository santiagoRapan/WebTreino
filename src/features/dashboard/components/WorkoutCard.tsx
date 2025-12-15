"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FeedWorkoutSession } from "../services/feedService"
import { ChevronLeft, ChevronRight, Clock, Dumbbell, Layers, Maximize2, Play } from "lucide-react"
import Image from "next/image"
import { WorkoutDetailModal } from "./WorkoutDetailModal"

interface WorkoutCardProps {
  session: FeedWorkoutSession
}

export function WorkoutCard({ session }: WorkoutCardProps) {
  const [selectedMedia, setSelectedMedia] = useState<{ url: string, type: 'image' | 'video' } | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const mediaStripRef = useRef<HTMLDivElement | null>(null)
  const [mediaScroll, setMediaScroll] = useState({
    hasOverflow: false,
    canScrollLeft: false,
    canScrollRight: false,
  })

  const updateMediaScrollState = useCallback(() => {
    const el = mediaStripRef.current
    if (!el) return

    const hasOverflow = el.scrollWidth > el.clientWidth + 1
    const canScrollLeft = hasOverflow && el.scrollLeft > 1
    const canScrollRight =
      hasOverflow && el.scrollLeft + el.clientWidth < el.scrollWidth - 1

    setMediaScroll({ hasOverflow, canScrollLeft, canScrollRight })
  }, [])

  useEffect(() => {
    const el = mediaStripRef.current
    if (!el) return

    updateMediaScrollState()

    const onScroll = () => updateMediaScrollState()
    el.addEventListener("scroll", onScroll, { passive: true })

    const ro = new ResizeObserver(() => updateMediaScrollState())
    ro.observe(el)

    return () => {
      el.removeEventListener("scroll", onScroll)
      ro.disconnect()
    }
  }, [updateMediaScrollState])

  const scrollMediaBy = useCallback((direction: -1 | 1) => {
    const el = mediaStripRef.current
    if (!el) return
    el.scrollBy({ left: direction * Math.max(120, el.clientWidth * 0.8), behavior: "smooth" })
  }, [])

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
  const description = session.description || ""

  return (
    <>
      <Card 
        className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setIsDetailOpen(true)}
      >
        <CardContent className="p-4 space-y-4">
          {/* Header */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={session.performer.avatar_url || undefined} />
            <AvatarFallback>
              {session.performer.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm truncate">{session.performer.name}</p>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDate(session.completed_at || session.started_at)}
              </span>
            </div>
            <p className="text-sm font-medium truncate">{title}</p>
          </div>
        </div>

        {/* Description */}
        <div className="min-h-[2.5em] flex items-center">
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/50">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Duración</p>
            <div className="flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-primary" />
              <span className="text-sm font-semibold">{session.stats.duration}</span>
            </div>
          </div>
          <div className="text-center border-l border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Ejercicios</p>
            <div className="flex items-center justify-center gap-1">
              <Dumbbell className="w-3 h-3 text-primary" />
              <span className="text-sm font-semibold">{session.stats.exerciseCount}</span>
            </div>
          </div>
          <div className="text-center border-l border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Series</p>
            <div className="flex items-center justify-center gap-1">
              <Layers className="w-3 h-3 text-primary" />
              <span className="text-sm font-semibold">{session.stats.setCount}</span>
            </div>
          </div>
        </div>

        {/* Media Preview */}
        {session.media.length > 0 && (
          <div className="relative mt-2 h-32">
            {mediaScroll.hasOverflow && mediaScroll.canScrollLeft && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute left-1 top-1/2 z-30 h-7 w-7 -translate-y-1/2 rounded-full bg-background"
                onClick={(e) => {
                  e.stopPropagation()
                  scrollMediaBy(-1)
                }}
                aria-label="Ver multimedia anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}

            {mediaScroll.hasOverflow && mediaScroll.canScrollRight && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute right-1 top-1/2 z-30 h-7 w-7 -translate-y-1/2 rounded-full bg-background"
                onClick={(e) => {
                  e.stopPropagation()
                  scrollMediaBy(1)
                }}
                aria-label="Ver más multimedia"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}

            <div
              ref={mediaStripRef}
              className="flex h-32 gap-2 overflow-x-auto scroll-smooth"
              onClick={(e) => e.stopPropagation()}
            >
              {session.media.map((item, index) => (
                <div
                  key={index}
                  className="relative h-full w-44 shrink-0 rounded-md overflow-hidden bg-muted cursor-pointer group"
                  onClick={() => {
                    item.public_url && setSelectedMedia({ url: item.public_url, type: item.media_type })
                  }}
                >
                  <div className="absolute inset-0 z-20 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Maximize2 className="w-6 h-6 text-white drop-shadow-md" />
                  </div>

                  <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs relative">
                    {item.public_url ? (
                      item.media_type === "video" ? (
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
                        {item.media_type === "video" ? "Video" : "Imagen"}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Dialog open={!!selectedMedia} onOpenChange={(open) => !open && setSelectedMedia(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none sm:max-w-[80vw] sm:max-h-[80vh] flex items-center justify-center">
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
      </CardContent>
    </Card>

    <WorkoutDetailModal 
      session={session} 
      isOpen={isDetailOpen} 
      onClose={() => setIsDetailOpen(false)} 
    />
    </>
  )
}
