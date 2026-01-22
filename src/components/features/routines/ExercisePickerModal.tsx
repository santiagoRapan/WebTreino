"use client"

import type React from "react"
import { useEffect, useRef } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type { Exercise } from "@/features/exercises"

type ExerciseSearchHook = {
  searchTerm: string
  setSearchTerm: (term: string) => void
  exercises: Exercise[]
  loading: boolean
  error: string | null
  hasMore?: boolean
  loadMore?: () => void
}

interface ExercisePickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: React.ReactNode
  exerciseSearch: ExerciseSearchHook
  title?: string
  description?: string
  onSelect: (exercise: Exercise) => void
}

export function ExercisePickerModal({
  open,
  onOpenChange,
  trigger,
  exerciseSearch,
  title = "Agregar ejercicio",
  description = "Busca y selecciona un ejercicio para agregarlo a la rutina.",
  onSelect,
}: ExercisePickerModalProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const restoreScrollTopRef = useRef<number | null>(null)
  const loadMoreLockRef = useRef(false)
  const prevCountRef = useRef(0)

  useEffect(() => {
    const needsRestore = restoreScrollTopRef.current
    if (needsRestore == null) return

    const el = scrollRef.current
    if (!el) return

    // Restore on next paint to avoid jump-to-top after DOM changes.
    requestAnimationFrame(() => {
      if (!scrollRef.current) return
      scrollRef.current.scrollTop = needsRestore
      restoreScrollTopRef.current = null
    })
  }, [exerciseSearch.exercises.length])

  useEffect(() => {
    // Release loadMore lock after new items arrive.
    const currentCount = exerciseSearch.exercises.length
    if (currentCount > prevCountRef.current) {
      loadMoreLockRef.current = false
      prevCountRef.current = currentCount
    }
  }, [exerciseSearch.exercises.length])

  const handleScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
    const el = e.currentTarget
    const distanceToBottom = el.scrollHeight - (el.scrollTop + el.clientHeight)
    if (distanceToBottom < 120) {
      if (
        exerciseSearch.hasMore &&
        exerciseSearch.loadMore &&
        !exerciseSearch.loading &&
        !loadMoreLockRef.current
      ) {
        loadMoreLockRef.current = true
        restoreScrollTopRef.current = el.scrollTop
        exerciseSearch.loadMore()
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
    <DialogContent className="max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={exerciseSearch.searchTerm}
              onChange={(e) => exerciseSearch.setSearchTerm(e.target.value)}
              placeholder="Buscar ejercicio..."
              className="pl-9"
            />
          </div>

          {exerciseSearch.error ? (
            <div className="text-sm text-destructive">{exerciseSearch.error}</div>
          ) : null}

          {/* Always render a fixed-size, scrollable container to avoid layout jumps */}
          <div className="rounded-md border bg-card relative" style={{ height: 420 }}>
            <div
              ref={scrollRef}
              className="h-full overflow-y-auto p-3 pb-20"
              onScroll={handleScroll}
            >
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4" style={{ minHeight: 396 }}>
                {exerciseSearch.exercises.map((ex) => (
                  <button
                    key={String(ex.id)}
                    type="button"
                    className="rounded-md border p-2 text-left hover:bg-muted/50 transition-colors"
                    onClick={() => onSelect(ex)}
                  >
                    <div className="aspect-square w-full overflow-hidden rounded-md bg-muted">
                      {ex.gif_URL ? (
                        <img
                          src={ex.gif_URL}
                          alt={ex.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                          Sin gif
                        </div>
                      )}
                    </div>
                    <div className="mt-2 line-clamp-2 text-xs font-medium">{ex.name}</div>
                  </button>
                ))}

                {!exerciseSearch.loading && exerciseSearch.exercises.length === 0 ? (
                  <div className="col-span-2 md:col-span-4 flex items-center justify-center text-sm text-muted-foreground">
                    No hay resultados
                  </div>
                ) : null}

                {exerciseSearch.hasMore === false && exerciseSearch.exercises.length > 0 ? (
                  <div className="col-span-2 md:col-span-4 flex items-center justify-center text-xs text-muted-foreground">
                    Fin de resultados
                  </div>
                ) : null}

                {/* Extra padding at bottom so last row isn't glued to edge */}
                <div aria-hidden className="col-span-2 md:col-span-4 h-1" />
              </div>
            </div>

            {/* Loading overlay keeps size and avoids blank list */}
            {exerciseSearch.loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div
                    className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin"
                    aria-hidden
                  />
                  <span>Cargando…</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
