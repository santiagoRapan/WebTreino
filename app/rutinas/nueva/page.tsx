"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { TrainerLayout } from "@/components/layout/TrainerLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useExerciseSearch, type Exercise } from "@/features/exercises"
import { createRoutine } from "@/features/routines/services/routineHandlersV2"
import { RoutineExerciseCard } from "@/features/routines/components/RoutineExerciseCard"
import {
  buildMissingRepsLabels,
  ensurePerSet,
  getIncompleteRoutineToast,
  getMissingRepsToast,
  getSafeSets,
  getSessionRequiredToast,
  isMissingReps,
  isValidRest,
  type RoutineExerciseDraft,
} from "@/features/routines/shared/routineFormUtils"
import { supabase } from "@/services/database"
import { toast } from "@/hooks/use-toast"
import { ExercisePickerModal } from "@/components/features/routines/ExercisePickerModal"

const DRAFT_STORAGE_KEY = "rutina-nueva-draft"
const DEFAULT_SETS = 3

function createEmptyExercise(): RoutineExerciseDraft {
  return {
    id: `ex-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    exerciseId: null,
    exerciseName: "",
    exerciseGifUrl: "",
    sets: DEFAULT_SETS,
    reps: "10",
    weight: "",
    rpe: "",
    notes: "",
    rest: "",
    seriesMode: "iguales",
    repsMode: "single",
  }
}

function createExerciseFromDb(ex: Exercise): RoutineExerciseDraft {
  return {
    id: `ex-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    exerciseId: String(ex.id),
    exerciseName: ex.name || "",
    exerciseGifUrl: ex.gif_URL || "",
    sets: DEFAULT_SETS,
    reps: "",
    weight: "",
    rpe: "",
    notes: "",
    rest: "",
    seriesMode: "iguales",
    repsMode: "single",
  }
}

function loadDraftFromStorage(): {
  routineName: string
  routineDescription: string
  items: RoutineExerciseDraft[]
} | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(DRAFT_STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored) as {
      routineName: string
      routineDescription: string
      items: RoutineExerciseDraft[]
    }
  } catch {
    return null
  }
}

function saveDraftToStorage(draft: {
  routineName: string
  routineDescription: string
  items: RoutineExerciseDraft[]
}): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
  } catch {
    // ignore storage errors
  }
}

function clearDraftFromStorage(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY)
  } catch {
    // ignore storage errors
  }
}

export default function NuevaRutinaPage() {
  const router = useRouter()

  const [routineName, setRoutineName] = useState("")
  const [routineDescription, setRoutineDescription] = useState("")
  const [items, setItems] = useState<RoutineExerciseDraft[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const [restTouched, setRestTouched] = useState<Record<string, boolean>>({})
  const [perSetRestTouched, setPerSetRestTouched] = useState<Record<string, Record<number, boolean>>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const draft = loadDraftFromStorage()
    if (draft) {
      setRoutineName(draft.routineName)
      setRoutineDescription(draft.routineDescription)
      setItems(draft.items)
    }
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    saveDraftToStorage({ routineName, routineDescription, items })
  }, [routineName, routineDescription, items, isHydrated])

  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false)
  const exerciseSearch = useExerciseSearch({ debounceMs: 250, pageSize: 8 })

  const totalSets = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number.isFinite(item.sets) ? item.sets : 0), 0)
  }, [items])

  const hasInvalidRest = useMemo(() => {
    return items.some((item) => {
      if (item.seriesMode === "distintas") {
        return (item.perSet ?? []).some((set) => !isValidRest(set.rest))
      }
      return !isValidRest(item.rest)
    })
  }, [items])

  const canSave = routineName.trim().length > 0 && items.length > 0 && !hasInvalidRest && !isSaving

  const handleSaveRoutine = async () => {
    if (isSaving) return
    const trimmedName = routineName.trim()
    if (!trimmedName) return

    const validItems = items.filter((item) => item.exerciseId)
    if (validItems.length === 0) {
      toast(getIncompleteRoutineToast())
      return
    }

    const missingRepsItems = validItems.filter((item) => {
      const repsMode = item.repsMode ?? "single"
      if (item.seriesMode === "distintas") {
        const normalized = ensurePerSet({ ...item, sets: getSafeSets(item.sets, DEFAULT_SETS) })
        return (normalized.perSet ?? []).some((set) => isMissingReps(set.reps || "", repsMode))
      }
      return isMissingReps(item.reps || "", repsMode)
    })

    if (missingRepsItems.length > 0) {
      const labels = buildMissingRepsLabels(items, missingRepsItems)
      toast(getMissingRepsToast(labels))
      return
    }

    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast(getSessionRequiredToast())
        return
      }

      const exercisesPayload = validItems.map((item, index) => {
        const display_order = index + 1
        const exercise_id = item.exerciseId as string
        const notes = item.notes || undefined

        const setsCount = getSafeSets(item.sets, DEFAULT_SETS)

        if (item.seriesMode === "distintas") {
          const normalized = ensurePerSet({ ...item, sets: setsCount })
          const setsPayload = (normalized.perSet ?? []).map((set, setIndex) => {
            const loadValue = set.weight ? Number(set.weight) : null
            return {
              set_index: setIndex + 1,
              reps: set.reps || undefined,
              load_kg: Number.isFinite(loadValue) ? loadValue : null,
              unit: loadValue ? "kg" : undefined,
              notes: undefined,
            }
          })

          return {
            block_id: "",
            exercise_id,
            display_order,
            notes,
            sets: setsPayload,
          }
        }

        const loadValue = item.weight ? Number(item.weight) : null
        const repsValue = item.reps || undefined
        const setsPayload = Array.from({ length: Math.max(1, setsCount) }).map((_, setIndex) => ({
          set_index: setIndex + 1,
          reps: repsValue,
          load_kg: Number.isFinite(loadValue) ? loadValue : null,
          unit: loadValue ? "kg" : undefined,
          notes: undefined,
        }))

        return {
          block_id: "",
          exercise_id,
          display_order,
          notes,
          sets: setsPayload,
        }
      })

      const routineId = await createRoutine(
        trimmedName,
        routineDescription.trim() || null,
        user.id,
        [
          {
            name: "Rutina",
            block_order: 1,
            notes: null,
            exercises: exercisesPayload,
          },
        ]
      )

      if (routineId) {
        clearDraftFromStorage()
        window.dispatchEvent(new CustomEvent('treino:routine-created', {
          detail: { routineId }
        }))
        router.push('/rutinas')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <TrainerLayout>
      <div className="mx-auto w-full space-y-4 p-4 md:p-6 lg:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Nueva rutina</h1>
            <p className="text-sm text-muted-foreground">
              Completa los ejercicios y luego guarda la rutina.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
          {/* Left: Exercises */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Datos de la rutina</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="grid gap-2">
                  <div className="text-sm font-medium">Nombre</div>
                  <Input
                    value={routineName}
                    onChange={(e) => setRoutineName(e.target.value)}
                    placeholder="Nombre de la rutina"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="text-sm font-medium">Descripción (opcional)</div>
                  <Textarea
                    value={routineDescription}
                    onChange={(e) => setRoutineDescription(e.target.value)}
                    placeholder="Notas generales de la rutina"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ejercicios</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {items.map((item, idx) => (
                  <RoutineExerciseCard
                    key={item.id}
                    item={item}
                    index={idx}
                    onUpdate={(id, updater) =>
                      setItems((prev) => prev.map((p) => (p.id === id ? updater(p) : p)))
                    }
                    onDelete={(id) => setItems((prev) => prev.filter((p) => p.id !== id))}
                    restTouched={restTouched}
                    perSetRestTouched={perSetRestTouched}
                    onRestTouched={(id) =>
                      setRestTouched((prev) => ({
                        ...prev,
                        [id]: true,
                      }))
                    }
                    onPerSetRestTouched={(id, setIdx) =>
                      setPerSetRestTouched((prev) => ({
                        ...prev,
                        [id]: {
                          ...prev[id],
                          [setIdx]: true,
                        },
                      }))
                    }
                  />
                ))}

                <div className="pt-2">
                  <ExercisePickerModal
                    open={isExerciseModalOpen}
                    onOpenChange={setIsExerciseModalOpen}
                    trigger={<Button variant="outline">Agregar ejercicio +</Button>}
                    exerciseSearch={exerciseSearch}
                    onSelect={(ex: Exercise) => {
                      setItems((prev) => [...prev, createExerciseFromDb(ex)])
                      setIsExerciseModalOpen(false)
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Sidebar */}
          <aside className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Series totales</div>
                  <div className="text-lg font-semibold">{totalSets}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full"
                  disabled={!canSave}
                  onClick={handleSaveRoutine}
                >
                  {isSaving ? "Guardando..." : "Guardar"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    clearDraftFromStorage()
                    router.push('/rutinas')
                  }}
                >
                  Cancelar
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </TrainerLayout>
  )
}
