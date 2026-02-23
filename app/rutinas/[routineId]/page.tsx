"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

import { TrainerLayout } from "@/components/layout/TrainerLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useExerciseSearch, type Exercise } from "@/features/exercises"
import { loadRoutine, updateRoutine, createRoutine } from "@/features/routines/services/routineHandlersV2"
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

const DEFAULT_BLOCK_NAME = "Rutina"
const DRAFT_STORAGE_KEY = "rutina-nueva-draft"
const DEFAULT_SETS = 3

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

export default function RutinaFormPage() {
  const router = useRouter()
  const params = useParams()
  const routineId = params?.routineId as string | undefined
  const isNew = routineId === "nueva"

  const initialSnapshotRef = useRef<{
    routineName: string
    routineDescription: string
    items: RoutineExerciseDraft[]
  } | null>(null)

  const [routineName, setRoutineName] = useState("")
  const [routineDescription, setRoutineDescription] = useState("")
  const [items, setItems] = useState<RoutineExerciseDraft[]>([])
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [restTouched, setRestTouched] = useState<Record<string, boolean>>({})

  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false)
  const exerciseSearch = useExerciseSearch({ debounceMs: 250, pageSize: 8 })

  // Load draft when creating new routine
  useEffect(() => {
    if (!isNew) return
    const draft = loadDraftFromStorage()
    if (draft) {
      setRoutineName(draft.routineName)
      setRoutineDescription(draft.routineDescription)
      setItems(draft.items)
    }
    setIsHydrated(true)
  }, [isNew])

  // Save draft when creating new routine
  useEffect(() => {
    if (!isNew || !isHydrated) return
    saveDraftToStorage({ routineName, routineDescription, items })
  }, [isNew, routineName, routineDescription, items, isHydrated])

  // Load routine when editing
  useEffect(() => {
    if (isNew) return
    let isMounted = true

    const loadRoutineData = async () => {
      if (!routineId) return
      setIsLoading(true)
      try {
        const routine = await loadRoutine(routineId)
        if (!routine) {
          toast({
            title: "No encontrada",
            description: "No pudimos cargar la rutina.",
            variant: "destructive",
          })
          router.push("/rutinas")
          return
        }

        const blocks = routine.blocks ?? []
        const blockExercises = blocks
          .flatMap((block) => block.exercises ?? [])
          .sort((a, b) => a.display_order - b.display_order)

        const exerciseIds = Array.from(new Set(blockExercises.map((ex) => ex.exercise_id)))
        const { data: exerciseData } = await supabase
          .from("exercises")
          .select("id, name, gif_URL")
          .in("id", exerciseIds)

        const exerciseMap = new Map(
          (exerciseData ?? []).map((ex) => [String(ex.id), ex])
        )

        const mappedItems: RoutineExerciseDraft[] = blockExercises.map((exercise, index) => {
          const sets = exercise.sets ?? []
          const repsList = sets.map((set) => set.reps ?? "")
          const weightList = sets.map((set) => (set.load_kg ?? "").toString())
          const repsHasRange = repsList.some((rep) => rep.includes("-"))

          const uniqueReps = new Set(repsList)
          const uniqueWeight = new Set(weightList)
          const hasDistinct = uniqueReps.size > 1 || uniqueWeight.size > 1

          const repsValue = repsList[0] ?? ""
          const weightValue = weightList[0] ?? ""

          const perSet = sets.map((set) => ({
            reps: set.reps ?? "",
            weight: set.load_kg != null ? String(set.load_kg) : "",
            rpe: "",
            rest: "",
          }))

          const exerciseMeta = exerciseMap.get(exercise.exercise_id)
          const displayName = exerciseMeta?.name ?? exercise.exercises?.name ?? ""
          const gifUrl = exerciseMeta?.gif_URL ?? ""

          return {
            id: `ex-${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`,
            exerciseId: exercise.exercise_id,
            exerciseName: displayName,
            exerciseGifUrl: gifUrl,
            sets: Math.max(1, sets.length || 1),
            reps: repsValue,
            weight: weightValue,
            rpe: "",
            notes: exercise.notes ?? "",
            rest: "",
            seriesMode: hasDistinct ? "distintas" : "iguales",
            repsMode: repsHasRange ? "range" : "single",
            perSet: hasDistinct ? perSet : undefined,
          }
        })

        if (isMounted) {
          setRoutineName(routine.name)
          setRoutineDescription(routine.description ?? "")
          setItems(mappedItems)
          setRestTouched({})
          initialSnapshotRef.current = {
            routineName: routine.name,
            routineDescription: routine.description ?? "",
            items: mappedItems,
          }
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadRoutineData()

    return () => {
      isMounted = false
    }
  }, [isNew, routineId, router])

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

  const canSave = routineName.trim().length > 0 && items.length > 0 && !hasInvalidRest && !isSaving && !!routineId

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

        if (item.seriesMode === "distintas") {
          const normalized = ensurePerSet(item)
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
        const setsPayload = Array.from({ length: Math.max(1, item.sets) }).map((_, setIndex) => ({
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

      if (isNew) {
        // Create new routine
        const newRoutineId = await createRoutine(
          trimmedName,
          routineDescription.trim() || null,
          user.id,
          [
            {
              name: DEFAULT_BLOCK_NAME,
              block_order: 1,
              notes: null,
              exercises: exercisesPayload,
            },
          ]
        )

        if (newRoutineId) {
          clearDraftFromStorage()
          window.dispatchEvent(new CustomEvent('treino:routine-created', {
            detail: { routineId: newRoutineId }
          }))
          router.push('/rutinas')
        }
      } else {
        // Update existing routine
        const updated = await updateRoutine(
          routineId!,
          trimmedName,
          routineDescription.trim() || null,
          user.id,
          [
            {
              name: DEFAULT_BLOCK_NAME,
              block_order: 1,
              notes: null,
              exercises: exercisesPayload,
            },
          ]
        )

        if (updated) {
          window.dispatchEvent(new CustomEvent('treino:routine-created', {
            detail: { routineId }
          }))
          router.push('/rutinas')
        }
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () =>{
    if (isNew) {
      clearDraftFromStorage()
    } else if (initialSnapshotRef.current) {
      setRoutineName(initialSnapshotRef.current.routineName)
      setRoutineDescription(initialSnapshotRef.current.routineDescription)
      setItems(initialSnapshotRef.current.items)
      setRestTouched({})
    }
    router.push('/rutinas')
  }

  if (isLoading) {
    return (
      <TrainerLayout>
        <div className="mx-auto w-full p-6 text-sm text-muted-foreground">Cargando rutina...</div>
      </TrainerLayout>
    )
  }

  return (
    <TrainerLayout>
      <div className="mx-auto w-full space-y-4 p-4 md:p-6 lg:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {isNew ? "Nueva rutina" : "Editar rutina"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isNew
                ? "Completa los ejercicios y luego guarda la rutina."
                : "Modifica los ejercicios y luego guarda los cambios."}
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
                    onRestTouched={(id) =>
                      setRestTouched((prev) => ({
                        ...prev,
                        [id]: true,
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
                      setItems((prev) => [
                        ...prev,
                        {
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
                        },
                      ])
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
                  onClick={handleCancel}
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
