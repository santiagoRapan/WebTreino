"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

import { TrainerLayout } from "@/components/layout/TrainerLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useExerciseSearch, type Exercise } from "@/features/exercises"
import { loadRoutineV2, updateRoutineV2 } from "@/features/routines/services/routineHandlersV2"
import { supabase } from "@/services/database"
import { toast } from "@/hooks/use-toast"
import { Trash2 } from "lucide-react"
import { ExercisePickerModal } from "@/components/features/routines/ExercisePickerModal"

const DEFAULT_BLOCK_NAME = "Rutina"

type SetData = {
  reps: string
  weight: string
  rpe: string
  rest: string
}

type SeriesMode = "iguales" | "distintas"

type RepsMode = "single" | "range"

type RoutineExerciseDraft = {
  id: string
  exerciseId: string | null
  exerciseName: string
  exerciseGifUrl: string
  sets: number
  reps: string
  weight: string
  rpe: string
  notes: string
  rest: string
  seriesMode: SeriesMode
  repsMode?: RepsMode
  perSet?: SetData[]
}

function sanitizeDigits(value: string, maxLength: number): string {
  const digits = value.replace(/\D/g, "")
  return digits.slice(0, maxLength)
}

function getRepsRangeParts(value: string): { min: string; max: string } {
  const [min = "", max = ""] = value.split("-")
  return { min, max }
}

function buildRepsRange(min: string, max: string): string {
  if (!min && !max) return ""
  return `${min}-${max}`
}

function getSingleRepsValue(value: string): string {
  const { min } = getRepsRangeParts(value)
  return min || ""
}

function getSafeSets(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1
  return value
}
 
function isMissingReps(value: string, mode: RepsMode): boolean {
  if (mode === "range") {
    const { min, max } = getRepsRangeParts(value)
    return !min || !max
  }
  return !value
}

function isValidRest(value: string): boolean {
  if (!value) return true
  return /^\d{1,2}:[0-5]\d$/.test(value)
}

function ensurePerSet(item: RoutineExerciseDraft): RoutineExerciseDraft {
  const targetCount = Math.max(1, item.sets)
  const current = item.perSet ?? []
  const lastSet: SetData = current.length > 0
    ? current[current.length - 1]
    : { reps: item.reps || "", weight: item.weight || "", rpe: item.rpe || "", rest: item.rest || "" }

  if (current.length === targetCount) return item

  const newPerSet: SetData[] = []
  for (let i = 0; i < targetCount; i++) {
    newPerSet.push(current[i] ?? { ...lastSet })
  }
  return { ...item, perSet: newPerSet }
}

export default function EditRutinaPage() {
  const router = useRouter()
  const params = useParams()
  const routineId = params?.routineId as string | undefined

  const [routineName, setRoutineName] = useState("")
  const [routineDescription, setRoutineDescription] = useState("")
  const [items, setItems] = useState<RoutineExerciseDraft[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [restTouched, setRestTouched] = useState<Record<string, boolean>>({})
  const [perSetRestTouched, setPerSetRestTouched] = useState<Record<string, Record<number, boolean>>>({})

  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false)
  const exerciseSearch = useExerciseSearch({ debounceMs: 250, pageSize: 8 })

  useEffect(() => {
    let isMounted = true

    const loadRoutine = async () => {
      if (!routineId) return
      setIsLoading(true)
      try {
        const routine = await loadRoutineV2(routineId)
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
          setPerSetRestTouched({})
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadRoutine()

    return () => {
      isMounted = false
    }
  }, [routineId, router])

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
    if (isSaving || !routineId) return
    const trimmedName = routineName.trim()
    if (!trimmedName) return

    const validItems = items.filter((item) => item.exerciseId)
    if (validItems.length === 0) {
      toast({
        title: "Rutina incompleta",
        description: "Agrega al menos un ejercicio antes de guardar.",
        variant: "destructive",
      })
      return
    }

    const missingRepsItems = validItems.filter((item) => {
      const repsMode = item.repsMode ?? "single"
      if (item.seriesMode === "distintas") {
        const normalized = ensurePerSet({ ...item, sets: getSafeSets(item.sets) })
        return (normalized.perSet ?? []).some((set) => isMissingReps(set.reps || "", repsMode))
      }
      return isMissingReps(item.reps || "", repsMode)
    })

    if (missingRepsItems.length > 0) {
      const labels = missingRepsItems.map((item) => {
        const name = item.exerciseName?.trim()
        if (name) return name
        const index = items.findIndex((p) => p.id === item.id)
        return index >= 0 ? `Ejercicio ${index + 1}` : "Ejercicio"
      })

      toast({
        title: "Faltan repeticiones",
        description: `Completa repeticiones en: ${labels.join(", ")}.`,
        variant: "destructive",
        duration: 4000,
      })
      return
    }

    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Sesión requerida",
          description: "Inicia sesión para guardar la rutina.",
          variant: "destructive",
        })
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

      const updated = await updateRoutineV2(
        routineId,
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
    } finally {
      setIsSaving(false)
    }
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
            <h1 className="text-2xl font-semibold tracking-tight">Editar rutina</h1>
            <p className="text-sm text-muted-foreground">
              Modifica los ejercicios y luego guarda los cambios.
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

                {items.map((item, idx) => {
                  const itemForRender = item.seriesMode === "distintas" ? ensurePerSet(item) : item
                  const setsCount = Math.max(1, itemForRender.sets)
                  const perSet = itemForRender.perSet ?? []

                  return (
                    <div key={item.id} className="rounded-md border">
                      <div className="flex flex-col gap-3 p-3 md:flex-row md:items-start md:gap-3">
                        {/* Delete button - aligned with gif center (h-20 = 80px, so mt-6 = 24px to center 32px button) */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground shrink-0 md:mt-6"
                          onClick={() => setItems((prev) => prev.filter((p) => p.id !== item.id))}
                          aria-label="Eliminar ejercicio"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        {/* Exercise cell (gif + name) */}
                        <div className="flex items-center gap-3 w-56 shrink-0">
                          <div className="h-20 w-20 overflow-hidden rounded-md border bg-muted flex items-center justify-center shrink-0">
                            {item.exerciseGifUrl ? (
                              <img
                                src={item.exerciseGifUrl}
                                alt={item.exerciseName || "Ejercicio"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="text-[10px] text-muted-foreground">GIF</div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium leading-tight">
                              {item.exerciseName?.trim()
                                ? item.exerciseName
                                : idx === 0
                                  ? "Selecciona"
                                  : "Ejercicio"}
                            </div>
                          </div>
                        </div>

                        {/* Detail area */}
                        <div className="flex-1 space-y-2">
                          {item.seriesMode === "iguales" ? (
                            <div className="space-y-2">
                              {/* Header for iguales mode */}
                              <div className="hidden md:grid grid-cols-6 gap-2 text-xs text-muted-foreground">
                                <div>Series</div>
                                <div className="flex items-center gap-1">
                                  <span>Reps</span>
                                  <button
                                    type="button"
                                    className="rounded-md border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                    onClick={() =>
                                      setItems((prev) =>
                                        prev.map((p) => {
                                          if (p.id !== item.id) return p
                                          const current = p.repsMode ?? "single"
                                          if (current === "range") {
                                            return { ...p, repsMode: "single", reps: getSingleRepsValue(p.reps) }
                                          }
                                          return { ...p, repsMode: "range" }
                                        })
                                      )
                                    }
                                  >
                                    {item.repsMode === "range" ? "rango" : "simple"}
                                  </button>
                                </div>
                                <div>Peso</div>
                                <div>RPE</div>
                                <div>Descanso</div>
                                <div>Notas</div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 md:grid-cols-6 md:items-center">
                              <div>
                                <div className="text-xs text-muted-foreground md:hidden mb-1">Series</div>
                                <div className="flex items-center gap-1">
                                  <div className="flex items-center rounded-md border bg-background">
                                    <button
                                      type="button"
                                      className="px-2 py-1 text-lg font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-l-md"
                                      onClick={() => {
                                        const nextSets = Math.max(1, itemForRender.sets - 1)
                                        setItems((prev) =>
                                          prev.map((p) => {
                                            if (p.id !== item.id) return p
                                            const updated = { ...p, sets: nextSets }
                                            return p.seriesMode === "distintas" ? ensurePerSet(updated) : updated
                                          })
                                        )
                                      }}
                                    >
                                      −
                                    </button>
                                    <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                                      {itemForRender.sets}
                                    </span>
                                    <button
                                      type="button"
                                      className="px-2 py-1 text-lg font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-r-md"
                                      onClick={() => {
                                        const nextSets = itemForRender.sets + 1
                                        setItems((prev) =>
                                          prev.map((p) => {
                                            if (p.id !== item.id) return p
                                            const updated = { ...p, sets: nextSets }
                                            return p.seriesMode === "distintas" ? ensurePerSet(updated) : updated
                                          })
                                        )
                                      }}
                                    >
                                      +
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    className="rounded-md border bg-background px-2 py-1 text-[11px] hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                    onClick={() =>
                                      setItems((prev) =>
                                        prev.map((p) => {
                                          if (p.id !== item.id) return p
                                          if (p.seriesMode === "iguales") {
                                            return ensurePerSet({ ...p, seriesMode: "distintas" })
                                          }
                                          return { ...p, seriesMode: "iguales" }
                                        })
                                      )
                                    }
                                  >
                                    {item.seriesMode === "iguales" ? "iguales" : "diferentes"}
                                  </button>
                                </div>
                              </div>
                              <div className={item.repsMode === "range" ? "w-24" : "w-20"}>
                                <div className="text-xs text-muted-foreground md:hidden mb-1">Reps</div>
                                {((repsMode) => {
                                  if (repsMode === "range") {
                                    const { min, max } = getRepsRangeParts(item.reps)
                                    return (
                                      <div className="flex items-center gap-1">
                                        <Input
                                          value={min}
                                          onChange={(e) =>
                                            setItems((prev) =>
                                              prev.map((p) => {
                                                if (p.id !== item.id) return p
                                                const cleaned = sanitizeDigits(e.target.value, 4)
                                                const parts = getRepsRangeParts(p.reps)
                                                return { ...p, reps: buildRepsRange(cleaned, parts.max) }
                                              })
                                            )
                                          }
                                          placeholder="10"
                                          inputMode="numeric"
                                          pattern="[0-9]*"
                                          maxLength={4}
                                          className="w-20 text-center"
                                        />
                                        <span className="text-xs text-muted-foreground">-</span>
                                        <Input
                                          value={max}
                                          onChange={(e) =>
                                            setItems((prev) =>
                                              prev.map((p) => {
                                                if (p.id !== item.id) return p
                                                const cleaned = sanitizeDigits(e.target.value, 4)
                                                const parts = getRepsRangeParts(p.reps)
                                                return { ...p, reps: buildRepsRange(parts.min, cleaned) }
                                              })
                                            )
                                          }
                                          placeholder="12"
                                          inputMode="numeric"
                                          pattern="[0-9]*"
                                          maxLength={4}
                                          className="w-20 text-center"
                                        />
                                      </div>
                                    )
                                  }
                                  return (
                                    <Input
                                      value={item.reps}
                                      onChange={(e) =>
                                        setItems((prev) =>
                                          prev.map((p) =>
                                            p.id === item.id
                                              ? { ...p, reps: sanitizeDigits(e.target.value, 4) }
                                              : p
                                          )
                                        )
                                      }
                                      placeholder="10"
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                      maxLength={4}
                                    />
                                  )
                                })(item.repsMode ?? "single")}
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground md:hidden mb-1">Peso</div>
                                <div className="relative w-20">
                                  <Input
                                    value={item.weight}
                                    onChange={(e) =>
                                      setItems((prev) =>
                                        prev.map((p) =>
                                          p.id === item.id
                                            ? { ...p, weight: sanitizeDigits(e.target.value, 4) }
                                            : p
                                        )
                                      )
                                    }
                                    placeholder="0"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={4}
                                    className="pr-9"
                                  />
                                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                    kg
                                  </span>
                                </div>
                              </div>
                              <div className="w-20">
                                <div className="text-xs text-muted-foreground md:hidden mb-1">RPE</div>
                                <Input
                                  value={item.rpe}
                                  onChange={(e) =>
                                    setItems((prev) =>
                                      prev.map((p) =>
                                        p.id === item.id
                                          ? { ...p, rpe: sanitizeDigits(e.target.value, 3) }
                                          : p
                                      )
                                    )
                                  }
                                  placeholder="-"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  maxLength={3}
                                />
                              </div>
                              <div className="w-20">
                                <div className="text-xs text-muted-foreground md:hidden mb-1">Descanso</div>
                                {(() => {
                                  const restInvalid = !isValidRest(item.rest)
                                  const showRestError = restInvalid && restTouched[item.id]
                                  return (
                                    <div className="space-y-1">
                                      <Input
                                        value={item.rest}
                                        onChange={(e) =>
                                          setItems((prev) =>
                                            prev.map((p) =>
                                              p.id === item.id
                                                ? { ...p, rest: e.target.value }
                                                : p
                                            )
                                          )
                                        }
                                        placeholder="-"
                                        maxLength={5}
                                        className={showRestError ? "border-destructive focus-visible:ring-destructive/40" : ""}
                                        onBlur={() =>
                                          setRestTouched((prev) => ({
                                            ...prev,
                                            [item.id]: true,
                                          }))
                                        }
                                      />
                                      {showRestError ? (
                                        <div className="text-[11px] text-destructive">
                                          Formato Incorrecto
                                          <br />
                                          Ejemplos: 2:00, 1:30, 0:45
                                        </div>
                                      ) : null}
                                    </div>
                                  )
                                })()}
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground md:hidden mb-1">Notas</div>
                                <Textarea
                                  value={item.notes}
                                  onChange={(e) => {
                                    e.target.style.height = 'auto'
                                    e.target.style.height = e.target.scrollHeight + 'px'
                                    setItems((prev) =>
                                      prev.map((p) => (p.id === item.id ? { ...p, notes: e.target.value } : p))
                                    )
                                  }}
                                  onFocus={(e) => {
                                    e.target.style.height = 'auto'
                                    e.target.style.height = e.target.scrollHeight + 'px'
                                  }}
                                  placeholder="-"
                                  className="min-h-[38px] resize-none overflow-hidden"
                                  rows={1}
                                  maxLength={90}
                                />
                              </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {/* Header for per-set rows */}
                              <div className="hidden md:grid grid-cols-[1fr_40px_1fr_1fr_1fr_1fr] gap-2 text-xs text-muted-foreground">
                                <div>Series</div>
                                <div>#</div>
                                <div className="flex items-center gap-1">
                                  <span>Reps</span>
                                  <button
                                    type="button"
                                    className="rounded-md border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                    onClick={() =>
                                      setItems((prev) =>
                                        prev.map((p) => {
                                          if (p.id !== item.id) return p
                                          const current = p.repsMode ?? "single"
                                          if (current === "range") {
                                            const normalized = ensurePerSet(p)
                                            const perSet = (normalized.perSet ?? []).map((set) => ({
                                              ...set,
                                              reps: getSingleRepsValue(set.reps),
                                            }))
                                            return { ...normalized, repsMode: "single", perSet }
                                          }
                                          return { ...p, repsMode: "range" }
                                        })
                                      )
                                    }
                                  >
                                    {item.repsMode === "range" ? "rango" : "simple"}
                                  </button>
                                </div>
                                <div>Peso</div>
                                <div>RPE</div>
                                <div>Descanso</div>
                              </div>

                              {/* Per-set rows */}
                              {Array.from({ length: setsCount }).map((_, setIdx) => (
                                <div
                                  key={`${item.id}-set-${setIdx}`}
                                  className="grid grid-cols-[40px_1fr] gap-2 rounded-md border p-2 md:grid-cols-[1fr_40px_1fr_1fr_1fr_1fr] md:items-center md:border-0 md:p-0"
                                >
                                  {/* Series input + toggle only on first row */}
                                  {setIdx === 0 ? (
                                    <div className="flex items-center gap-1 row-span-1">
                                      <div className="flex items-center rounded-md border bg-background">
                                        <button
                                          type="button"
                                          className="px-2 py-1 text-lg font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-l-md"
                                          onClick={() => {
                                            const nextSets = Math.max(1, itemForRender.sets - 1)
                                            setItems((prev) =>
                                              prev.map((p) => {
                                                if (p.id !== item.id) return p
                                                const updated = { ...p, sets: nextSets }
                                                return p.seriesMode === "distintas" ? ensurePerSet(updated) : updated
                                              })
                                            )
                                          }}
                                        >
                                          −
                                        </button>
                                        <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                                          {itemForRender.sets}
                                        </span>
                                        <button
                                          type="button"
                                          className="px-2 py-1 text-lg font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-r-md"
                                          onClick={() => {
                                            const nextSets = itemForRender.sets + 1
                                            setItems((prev) =>
                                              prev.map((p) => {
                                                if (p.id !== item.id) return p
                                                const updated = { ...p, sets: nextSets }
                                                return p.seriesMode === "distintas" ? ensurePerSet(updated) : updated
                                              })
                                            )
                                          }}
                                        >
                                          +
                                        </button>
                                      </div>
                                      <button
                                        type="button"
                                        className="rounded-md border bg-background px-2 py-1 text-[11px] hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                        onClick={() =>
                                          setItems((prev) =>
                                            prev.map((p) => {
                                              if (p.id !== item.id) return p
                                              if (p.seriesMode === "iguales") {
                                                return ensurePerSet({ ...p, seriesMode: "distintas" })
                                              }
                                              return { ...p, seriesMode: "iguales" }
                                            })
                                          )
                                        }
                                      >
                                        {item.seriesMode === "iguales" ? "iguales" : "diferentes"}
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="hidden md:block" />
                                  )}
                                  <div className="text-sm font-medium text-muted-foreground">{setIdx + 1}</div>
                                  <div className="grid grid-cols-2 gap-2 md:contents">
                                    <div className={item.repsMode === "range" ? "w-32" : "w-20"}>
                                      {((repsMode) => {
                                        const currentValue = perSet[setIdx]?.reps ?? ""
                                        if (repsMode === "range") {
                                          const { min, max } = getRepsRangeParts(currentValue)
                                          return (
                                            <div className="flex items-center gap-1">
                                              <Input
                                                value={min}
                                                onChange={(e) =>
                                                  setItems((prev) =>
                                                    prev.map((p) => {
                                                      if (p.id !== item.id) return p
                                                      const next = ensurePerSet(p)
                                                      const cleaned = sanitizeDigits(e.target.value, 4)
                                                      const parts = getRepsRangeParts(next.perSet![setIdx]?.reps ?? "")
                                                      next.perSet![setIdx] = {
                                                        ...next.perSet![setIdx],
                                                        reps: buildRepsRange(cleaned, parts.max),
                                                      }
                                                      return { ...next }
                                                    })
                                                  )
                                                }
                                                placeholder="10"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                maxLength={4}
                                                className="w-20 text-center"
                                              />
                                              <span className="text-xs text-muted-foreground">-</span>
                                              <Input
                                                value={max}
                                                onChange={(e) =>
                                                  setItems((prev) =>
                                                    prev.map((p) => {
                                                      if (p.id !== item.id) return p
                                                      const next = ensurePerSet(p)
                                                      const cleaned = sanitizeDigits(e.target.value, 4)
                                                      const parts = getRepsRangeParts(next.perSet![setIdx]?.reps ?? "")
                                                      next.perSet![setIdx] = {
                                                        ...next.perSet![setIdx],
                                                        reps: buildRepsRange(parts.min, cleaned),
                                                      }
                                                      return { ...next }
                                                    })
                                                  )
                                                }
                                                placeholder="12"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                maxLength={4}
                                                className="w-20 text-center"
                                              />
                                            </div>
                                          )
                                        }
                                        return (
                                          <Input
                                            value={currentValue}
                                            onChange={(e) =>
                                              setItems((prev) =>
                                                prev.map((p) => {
                                                  if (p.id !== item.id) return p
                                                  const next = ensurePerSet(p)
                                                  next.perSet![setIdx] = {
                                                    ...next.perSet![setIdx],
                                                    reps: sanitizeDigits(e.target.value, 4),
                                                  }
                                                  return { ...next }
                                                })
                                              )
                                            }
                                            placeholder={item.reps || "10"}
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={4}
                                          />
                                        )
                                      })(item.repsMode ?? "single")}
                                    </div>
                                    <div className="relative w-20">
                                      <Input
                                        value={perSet[setIdx]?.weight ?? ""}
                                        onChange={(e) =>
                                          setItems((prev) =>
                                            prev.map((p) => {
                                              if (p.id !== item.id) return p
                                              const next = ensurePerSet(p)
                                              next.perSet![setIdx] = {
                                                ...next.perSet![setIdx],
                                                weight: sanitizeDigits(e.target.value, 4),
                                              }
                                              return { ...next }
                                            })
                                          )
                                        }
                                        placeholder={item.weight || "0"}
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={4}
                                        className="pr-9"
                                      />
                                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                        kg
                                      </span>
                                    </div>
                                    <div className="w-20">
                                      <Input
                                        value={perSet[setIdx]?.rpe ?? ""}
                                        onChange={(e) =>
                                          setItems((prev) =>
                                            prev.map((p) => {
                                              if (p.id !== item.id) return p
                                              const next = ensurePerSet(p)
                                              next.perSet![setIdx] = {
                                                ...next.perSet![setIdx],
                                                rpe: sanitizeDigits(e.target.value, 3),
                                              }
                                              return { ...next }
                                            })
                                          )
                                        }
                                        placeholder={item.rpe || "-"}
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={3}
                                      />
                                    </div>
                                    <div className="w-24 space-y-1">
                                      {(() => {
                                        const restInvalid = !isValidRest(perSet[setIdx]?.rest ?? "")
                                        const showRestError = restInvalid && perSetRestTouched[item.id]?.[setIdx]
                                        return (
                                          <>
                                      <Input
                                        value={perSet[setIdx]?.rest ?? ""}
                                        onChange={(e) =>
                                          setItems((prev) =>
                                            prev.map((p) => {
                                              if (p.id !== item.id) return p
                                              const next = ensurePerSet(p)
                                              next.perSet![setIdx] = {
                                                ...next.perSet![setIdx],
                                                rest: e.target.value,
                                              }
                                              return { ...next }
                                            })
                                          )
                                        }
                                        placeholder="-"
                                        maxLength={5}
                                        className={showRestError ? "border-destructive focus-visible:ring-destructive/40" : ""}
                                        onBlur={() =>
                                          setPerSetRestTouched((prev) => ({
                                            ...prev,
                                            [item.id]: {
                                              ...prev[item.id],
                                              [setIdx]: true,
                                            },
                                          }))
                                        }
                                      />
                                      {showRestError ? (
                                        <div className="text-[11px] text-destructive">
                                          Formato Incorrecto
                                          <br />
                                          Ejemplos: 2:00, 1:30, 0:45
                                        </div>
                                      ) : null}
                                          </>
                                        )
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {/* Notes always single field */}
                              <div className="pt-2">
                                <div className="text-xs text-muted-foreground mb-1">Notas</div>
                                <Textarea
                                  value={item.notes}
                                  onChange={(e) => {
                                    e.target.style.height = 'auto'
                                    e.target.style.height = e.target.scrollHeight + 'px'
                                    setItems((prev) =>
                                      prev.map((p) => (p.id === item.id ? { ...p, notes: e.target.value } : p))
                                    )
                                  }}
                                  onFocus={(e) => {
                                    e.target.style.height = 'auto'
                                    e.target.style.height = e.target.scrollHeight + 'px'
                                  }}
                                  placeholder="-"
                                  className="min-h-[38px] resize-none overflow-hidden"
                                  rows={1}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}

                <div className="pt-2">
                  <ExercisePickerModal
                    open={isExerciseModalOpen}
                    onOpenChange={setIsExerciseModalOpen}
                    trigger={<Button variant="outline">Agregar ejercicio +</Button>}
                    exerciseSearch={exerciseSearch}
                    onSelect={(ex: Exercise) => {
                      setItems((prev) => [...prev, {
                        id: `ex-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                        exerciseId: String(ex.id),
                        exerciseName: ex.name || "",
                        exerciseGifUrl: ex.gif_URL || "",
                        sets: 3,
                        reps: "",
                        weight: "",
                        rpe: "",
                        notes: "",
                        rest: "",
                        seriesMode: "iguales",
                        repsMode: "single",
                      }])
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
                  onClick={() => router.push('/rutinas')}
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
