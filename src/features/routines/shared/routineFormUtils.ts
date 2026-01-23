export type SetData = {
  reps: string
  weight: string
  rpe: string
  rest: string
}

export type SeriesMode = "iguales" | "distintas"
export type RepsMode = "single" | "range"

export type RoutineExerciseDraft = {
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

export type RoutineToastPayload = {
  title: string
  description: string
  variant: "destructive"
  duration?: number
}

export const TOAST_DURATION_MS = 3000

export function sanitizeDigits(value: string, maxLength: number): string {
  const digits = value.replace(/\D/g, "")
  return digits.slice(0, maxLength)
}

export function getRepsRangeParts(value: string): { min: string; max: string } {
  const [min = "", max = ""] = value.split("-")
  return { min, max }
}

export function buildRepsRange(min: string, max: string): string {
  if (!min && !max) return ""
  return `${min}-${max}`
}

export function getSingleRepsValue(value: string): string {
  const { min } = getRepsRangeParts(value)
  return min || ""
}

export function normalizeRepsRange(min: string, max: string): { min: string; max: string } {
  if (!min || !max) return { min, max }
  const minValue = Number(min)
  const maxValue = Number(max)
  if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) return { min, max }
  if (maxValue < minValue) return { min, max: min }
  return { min, max }
}

export function getSafeSets(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value <= 0) return fallback
  return value
}

export function isValidRest(value: string): boolean {
  if (!value) return true
  return /^\d{1,2}:[0-5]\d$/.test(value)
}

export function isMissingReps(value: string, mode: RepsMode): boolean {
  if (mode === "range") {
    const { min, max } = getRepsRangeParts(value)
    return !min || !max
  }
  return !value
}

export function ensurePerSet(item: RoutineExerciseDraft): RoutineExerciseDraft {
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

export function getIncompleteRoutineToast(): RoutineToastPayload {
  return {
    title: "Rutina incompleta",
    description: "Agrega al menos un ejercicio antes de guardar.",
    variant: "destructive",
  }
}

export function getSessionRequiredToast(): RoutineToastPayload {
  return {
    title: "Sesión requerida",
    description: "Inicia sesión para guardar la rutina.",
    variant: "destructive",
  }
}

export function buildMissingRepsLabels(
  items: RoutineExerciseDraft[],
  missingItems: RoutineExerciseDraft[]
): string[] {
  return missingItems.map((item) => {
    const name = item.exerciseName?.trim()
    if (name) return name
    const index = items.findIndex((p) => p.id === item.id)
    return index >= 0 ? `Ejercicio ${index + 1}` : "Ejercicio"
  })
}

export function getMissingRepsToast(labels: string[]): RoutineToastPayload {
  return {
    title: "Faltan repeticiones",
    description: `Completa repeticiones en: ${labels.join(", ")}.`,
    variant: "destructive",
    duration: TOAST_DURATION_MS,
  }
}
