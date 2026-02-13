"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Trash2 } from "lucide-react"
import {
  buildRepsRange,
  ensurePerSet,
  getRepsRangeParts,
  getSafeSets,
  getSingleRepsValue,
  isValidRest,
  normalizeRepsRange,
  sanitizeDigits,
  type RoutineExerciseDraft,
} from "@/features/routines/shared/routineFormUtils"

const DEFAULT_SETS = 3

interface RoutineExerciseCardProps {
  item: RoutineExerciseDraft
  index: number
  onUpdate: (id: string, updater: (item: RoutineExerciseDraft) => RoutineExerciseDraft) => void
  onDelete: (id: string) => void
  restTouched: Record<string, boolean>
  perSetRestTouched: Record<string, Record<number, boolean>>
  onRestTouched: (id: string) => void
  onPerSetRestTouched: (id: string, setIdx: number) => void
}

export function RoutineExerciseCard({
  item,
  index,
  onUpdate,
  onDelete,
  restTouched,
  perSetRestTouched,
  onRestTouched,
  onPerSetRestTouched,
}: RoutineExerciseCardProps) {
  const itemForRender = item.seriesMode === "distintas" ? ensurePerSet(item) : item
  const setsCount = Math.max(1, itemForRender.sets)
  const perSet = itemForRender.perSet ?? []

  const handleUpdate = (updater: (item: RoutineExerciseDraft) => RoutineExerciseDraft) => {
    onUpdate(item.id, updater)
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      {/* Header con imagen del ejercicio */}
      <div className="flex items-center gap-3 border-b bg-muted/30 p-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(item.id)}
          aria-label="Eliminar ejercicio"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded border bg-background shadow-sm">
          {item.exerciseGifUrl ? (
            <img
              src={item.exerciseGifUrl}
              alt={item.exerciseName || "Ejercicio"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
              GIF
            </div>
          )}
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold leading-tight">
            {item.exerciseName?.trim()
              ? item.exerciseName
              : index === 0
                ? "Selecciona un ejercicio"
                : "Ejercicio"}
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <div className="flex items-center rounded-md border bg-background shadow-sm">
            <button
              type="button"
              className="px-2.5 py-1.5 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              onClick={() => {
                const nextSets = Math.max(1, itemForRender.sets - 1)
                handleUpdate((p) => {
                  const updated = { ...p, sets: nextSets }
                  return p.seriesMode === "distintas" ? ensurePerSet(updated) : updated
                })
              }}
            >
              −
            </button>
            <span className="min-w-[2.5rem] px-3 py-1.5 text-center text-sm font-semibold">
              {itemForRender.sets}
            </span>
            <button
              type="button"
              className="px-2.5 py-1.5 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              onClick={() => {
                const nextSets = itemForRender.sets + 1
                handleUpdate((p) => {
                  const updated = { ...p, sets: nextSets }
                  return p.seriesMode === "distintas" ? ensurePerSet(updated) : updated
                })
              }}
            >
              +
            </button>
          </div>
          <button
            type="button"
            className="rounded-md border bg-background px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground transition-colors"
            onClick={() =>
              handleUpdate((p) => {
                if (p.seriesMode === "iguales") {
                  return ensurePerSet({ ...p, seriesMode: "distintas" })
                }
                return { ...p, seriesMode: "iguales" }
              })
            }
          >
            {item.seriesMode === "iguales" ? "=" : "≠"}
          </button>
        </div>
      </div>

      {/* Tabla de series estilo Excel */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b bg-muted/20 text-xs font-medium text-muted-foreground">
              <th className="p-2 text-center w-12">#</th>
              <th className="p-2 text-left min-w-32">
                <div className="flex items-center gap-1.5">
                  <span>Reps</span>
                  <button
                    type="button"
                    className="rounded border bg-background px-1.5 py-0.5 text-[10px] hover:bg-muted/80 transition-colors"
                    onClick={() =>
                      handleUpdate((p) => {
                        const current = p.repsMode ?? "single"
                        if (current === "range") {
                          if (p.seriesMode === "distintas") {
                            const normalized = ensurePerSet(p)
                            const perSetUpdated = (normalized.perSet ?? []).map((set) => ({
                              ...set,
                              reps: getSingleRepsValue(set.reps),
                            }))
                            return { ...normalized, repsMode: "single", perSet: perSetUpdated }
                          }
                          return { ...p, repsMode: "single", reps: getSingleRepsValue(p.reps) }
                        }
                        return { ...p, repsMode: "range" }
                      })
                    }
                  >
                    {item.repsMode === "range" ? "rango" : "single"}
                  </button>
                </div>
              </th>
              <th className="p-2 text-left w-24">Peso (kg)</th>
              <th className="p-2 text-left w-20">RPE</th>
              <th className="p-2 text-left w-24">Descanso</th>
              {item.seriesMode === "iguales" && <th className="p-2 text-left min-w-40">Notas</th>}
            </tr>
          </thead>
          <tbody>
            {item.seriesMode === "iguales" ? (
              <tr className="border-b last:border-0 hover:bg-muted/5 transition-colors">
                <td className="p-2 text-center text-sm font-medium text-muted-foreground">
                  1-{itemForRender.sets}
                </td>
                <td className="p-2">
                  {((repsMode) => {
                    if (repsMode === "range") {
                      const { min, max } = getRepsRangeParts(item.reps)
                      return (
                        <div className="flex items-center gap-1.5">
                          <Input
                            value={min}
                            onChange={(e) =>
                              handleUpdate((p) => {
                                const cleaned = sanitizeDigits(e.target.value, 4)
                                const parts = getRepsRangeParts(p.reps)
                                return { ...p, reps: buildRepsRange(cleaned, parts.max) }
                              })
                            }
                            placeholder="10"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={4}
                            className="h-9 w-16 text-center"
                          />
                          <span className="text-xs text-muted-foreground">-</span>
                          <Input
                            value={max}
                            onChange={(e) =>
                              handleUpdate((p) => {
                                const cleaned = sanitizeDigits(e.target.value, 4)
                                const parts = getRepsRangeParts(p.reps)
                                const next = normalizeRepsRange(parts.min, cleaned)
                                return { ...p, reps: buildRepsRange(next.min, next.max) }
                              })
                            }
                            placeholder="12"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={4}
                            className="h-9 w-16 text-center"
                          />
                        </div>
                      )
                    }
                    return (
                      <Input
                        value={item.reps}
                        onChange={(e) =>
                          handleUpdate((p) => ({ ...p, reps: sanitizeDigits(e.target.value, 4) }))
                        }
                        placeholder="10"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        className="h-9 w-20"
                      />
                    )
                  })(item.repsMode ?? "single")}
                </td>
                <td className="p-2">
                  <Input
                    value={item.weight}
                    onChange={(e) =>
                      handleUpdate((p) => ({ ...p, weight: sanitizeDigits(e.target.value, 4) }))
                    }
                    placeholder="0"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    className="h-9 w-20"
                  />
                </td>
                <td className="p-2">
                  <Input
                    value={item.rpe}
                    onChange={(e) =>
                      handleUpdate((p) => ({ ...p, rpe: sanitizeDigits(e.target.value, 3) }))
                    }
                    placeholder="-"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={3}
                    className="h-9 w-16"
                  />
                </td>
                <td className="p-2">
                  {(() => {
                    const restInvalid = !isValidRest(item.rest)
                    const showRestError = restInvalid && restTouched[item.id]
                    return (
                      <div className="space-y-1">
                        <Input
                          value={item.rest}
                          onChange={(e) => handleUpdate((p) => ({ ...p, rest: e.target.value }))}
                          placeholder="-"
                          maxLength={5}
                          className={`h-9 w-20 ${showRestError ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
                          onBlur={() => onRestTouched(item.id)}
                        />
                        {showRestError && (
                          <div className="text-[10px] text-destructive">Formato: 2:00</div>
                        )}
                      </div>
                    )
                  })()}
                </td>
                <td className="p-2">
                  <Textarea
                    value={item.notes}
                    onChange={(e) => {
                      e.target.style.height = "auto"
                      e.target.style.height = e.target.scrollHeight + "px"
                      handleUpdate((p) => ({ ...p, notes: e.target.value }))
                    }}
                    onFocus={(e) => {
                      e.target.style.height = "auto"
                      e.target.style.height = e.target.scrollHeight + "px"
                    }}
                    placeholder="-"
                    className="min-h-[36px] w-full resize-none overflow-hidden text-sm"
                    rows={1}
                    maxLength={90}
                  />
                </td>
              </tr>
            ) : (
              Array.from({ length: setsCount }).map((_, setIdx) => (
                <tr
                  key={`${item.id}-set-${setIdx}`}
                  className="border-b last:border-0 hover:bg-muted/5 transition-colors"
                >
                  <td className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {setIdx + 1}
                  </td>
                  <td className="p-2">
                    {((repsMode) => {
                      const currentValue = perSet[setIdx]?.reps ?? ""
                      if (repsMode === "range") {
                        const { min, max } = getRepsRangeParts(currentValue)
                        return (
                          <div className="flex items-center gap-1.5">
                            <Input
                              value={min}
                              onChange={(e) =>
                                handleUpdate((p) => {
                                  const next = ensurePerSet(p)
                                  const cleaned = sanitizeDigits(e.target.value, 4)
                                  const parts = getRepsRangeParts(next.perSet![setIdx]?.reps ?? "")
                                  next.perSet![setIdx] = {
                                    ...next.perSet![setIdx],
                                    reps: buildRepsRange(cleaned, parts.max),
                                  }
                                  return { ...next }
                                })
                              }
                              placeholder="10"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={4}
                              className="h-9 w-16 text-center"
                            />
                            <span className="text-xs text-muted-foreground">-</span>
                            <Input
                              value={max}
                              onChange={(e) =>
                                handleUpdate((p) => {
                                  const next = ensurePerSet(p)
                                  const cleaned = sanitizeDigits(e.target.value, 4)
                                  const parts = getRepsRangeParts(next.perSet![setIdx]?.reps ?? "")
                                  const range = normalizeRepsRange(parts.min, cleaned)
                                  next.perSet![setIdx] = {
                                    ...next.perSet![setIdx],
                                    reps: buildRepsRange(range.min, range.max),
                                  }
                                  return { ...next }
                                })
                              }
                              placeholder="12"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={4}
                              className="h-9 w-16 text-center"
                            />
                          </div>
                        )
                      }
                      return (
                        <Input
                          value={currentValue}
                          onChange={(e) =>
                            handleUpdate((p) => {
                              const next = ensurePerSet(p)
                              next.perSet![setIdx] = {
                                ...next.perSet![setIdx],
                                reps: sanitizeDigits(e.target.value, 4),
                              }
                              return { ...next }
                            })
                          }
                          placeholder={item.reps || "10"}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={4}
                          className="h-9 w-20"
                        />
                      )
                    })(item.repsMode ?? "single")}
                  </td>
                  <td className="p-2">
                    <Input
                      value={perSet[setIdx]?.weight ?? ""}
                      onChange={(e) =>
                        handleUpdate((p) => {
                          const next = ensurePerSet(p)
                          next.perSet![setIdx] = {
                            ...next.perSet![setIdx],
                            weight: sanitizeDigits(e.target.value, 4),
                          }
                          return { ...next }
                        })
                      }
                      placeholder={item.weight || "0"}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      className="h-9 w-20"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      value={perSet[setIdx]?.rpe ?? ""}
                      onChange={(e) =>
                        handleUpdate((p) => {
                          const next = ensurePerSet(p)
                          next.perSet![setIdx] = {
                            ...next.perSet![setIdx],
                            rpe: sanitizeDigits(e.target.value, 3),
                          }
                          return { ...next }
                        })
                      }
                      placeholder={item.rpe || "-"}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={3}
                      className="h-9 w-16"
                    />
                  </td>
                  <td className="p-2">
                    {(() => {
                      const restInvalid = !isValidRest(perSet[setIdx]?.rest ?? "")
                      const showRestError = restInvalid && perSetRestTouched[item.id]?.[setIdx]
                      return (
                        <div className="space-y-1">
                          <Input
                            value={perSet[setIdx]?.rest ?? ""}
                            onChange={(e) =>
                              handleUpdate((p) => {
                                const next = ensurePerSet(p)
                                next.perSet![setIdx] = {
                                  ...next.perSet![setIdx],
                                  rest: e.target.value,
                                }
                                return { ...next }
                              })
                            }
                            placeholder="-"
                            maxLength={5}
                            className={`h-9 w-20 ${showRestError ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
                            onBlur={() => onPerSetRestTouched(item.id, setIdx)}
                          />
                          {showRestError && (
                            <div className="text-[10px] text-destructive">Formato: 2:00</div>
                          )}
                        </div>
                      )
                    })()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
