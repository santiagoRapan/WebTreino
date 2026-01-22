"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { TrainerLayout } from "@/components/layout/TrainerLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useExerciseSearch, type Exercise } from "@/features/exercises"
import { Trash2 } from "lucide-react"
import { ExercisePickerModal } from "@/components/features/routines/ExercisePickerModal"

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
}

function createEmptyExercise(): RoutineExerciseDraft {
  return {
    id: `ex-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    exerciseId: null,
    exerciseName: "",
    exerciseGifUrl: "",
    sets: 3,
    reps: "10",
    weight: "",
    rpe: "",
    notes: "",
    rest: "",
  }
}

function createExerciseFromDb(ex: Exercise): RoutineExerciseDraft {
  return {
    id: `ex-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    exerciseId: String(ex.id),
    exerciseName: ex.name || "",
    exerciseGifUrl: ex.gif_URL || "",
    sets: 3,
    reps: "10",
    weight: "",
    rpe: "",
    notes: "",
    rest: "",
  }
}

export default function NuevaRutinaPage() {
  const router = useRouter()

  const [routineName, setRoutineName] = useState("")
  const [routineDescription, setRoutineDescription] = useState("")
  const [items, setItems] = useState<RoutineExerciseDraft[]>([createEmptyExercise()])

  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false)
  // Carga por páginas: suficiente para scrollear fluido sin pedir demasiado.
  const exerciseSearch = useExerciseSearch({ debounceMs: 250, pageSize: 24 })

  const totalSets = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number.isFinite(item.sets) ? item.sets : 0), 0)
  }, [items])

  const canSave = routineName.trim().length > 0 && items.length > 0

  return (
    <TrainerLayout>
      <div className="mx-auto w-full max-w-7xl space-y-4 p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Nueva rutina</h1>
            <p className="text-sm text-muted-foreground">
              Completa los ejercicios y luego guarda la rutina.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
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
                {/* Header row */}
                <div className="hidden grid-cols-[28px_160px_70px_110px_90px_70px_1fr_90px] items-center gap-2 text-xs text-muted-foreground md:grid">
                  <div />
                  <div>Ejercicio</div>
                  <div>Series</div>
                  <div>Repeticiones</div>
                  <div>Peso</div>
                  <div>RPE</div>
                  <div>Notas</div>
                  <div>Descanso</div>
                </div>

                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 gap-3 rounded-md border p-3 md:grid-cols-[28px_160px_70px_110px_90px_70px_1fr_90px] md:items-center md:gap-2"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => setItems((prev) => prev.filter((p) => p.id !== item.id))}
                      aria-label="Eliminar ejercicio"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="space-y-2">
                      <div className="text-sm font-medium md:hidden">Ejercicio</div>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-md border bg-muted flex items-center justify-center">
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
                        <div className="min-w-0">
                          <div className="truncate text-sm">
                            {item.exerciseName?.trim()
                              ? item.exerciseName
                              : idx === 0
                                ? "Selecciona un ejercicio"
                                : "Ejercicio"}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {item.exerciseId ? `ID: ${item.exerciseId}` : "Sin seleccionar"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Input
                      type="number"
                      min={1}
                      value={item.sets}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((p) =>
                            p.id === item.id ? { ...p, sets: Math.max(1, Number(e.target.value || 1)) } : p
                          )
                        )
                      }
                    />

                    <Input
                      value={item.reps}
                      onChange={(e) =>
                        setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, reps: e.target.value } : p)))
                      }
                      placeholder="10"
                    />

                    <Input
                      value={item.weight}
                      onChange={(e) =>
                        setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, weight: e.target.value } : p)))
                      }
                      placeholder="100kg"
                    />

                    <Input
                      value={item.rpe}
                      onChange={(e) =>
                        setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, rpe: e.target.value } : p)))
                      }
                      placeholder="-"
                    />

                    <Input
                      value={item.notes}
                      onChange={(e) =>
                        setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, notes: e.target.value } : p)))
                      }
                      placeholder="Notas"
                    />

                    <Input
                      value={item.rest}
                      onChange={(e) =>
                        setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, rest: e.target.value } : p)))
                      }
                      placeholder="1:30"
                    />
                  </div>
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
                  onClick={() => {
                    // Placeholder: save logic will be added next iterations
                    router.push('/rutinas')
                  }}
                >
                  Guardar
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
