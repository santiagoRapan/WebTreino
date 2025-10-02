"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, Plus, Trash2, Activity } from "lucide-react"
import type { RoutineTemplate, Exercise } from "@/features/routines/types"

interface RoutineEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  routine: RoutineTemplate | null
  onRoutineChange: (routine: RoutineTemplate) => void
  newBlockName: string
  onNewBlockNameChange: (name: string) => void
  expandedBlocks: Set<number>
  onToggleBlockExpansion: (blockId: number) => void
  onAddBlock: () => void
  onDeleteBlock: (blockId: number) => void
  onAddExerciseToBlock: (blockId: number) => void
  onDeleteExercise: (blockId: number, exerciseIndex: number) => void
  onSaveRoutine: () => Promise<void>
  isSaving?: boolean
  exercises: Exercise[]
  translations: {
    title: string
    description: string
    routineName: string
    routineNamePlaceholder: string
    routineDescription: string
    routineDescriptionPlaceholder: string
    blocksTitle: string
    newBlockNamePlaceholder: string
    addBlock: string
    noBlocks: string
    clickToStart: string
    noExercises: string
    exercise: string
    exercises: string
    sets: string
    reps: string
    restShort: string
    cancel: string
    saveRoutine: string
    saving: string
  }
}

export function RoutineEditorDialog({
  open,
  onOpenChange,
  routine,
  onRoutineChange,
  newBlockName,
  onNewBlockNameChange,
  expandedBlocks,
  onToggleBlockExpansion,
  onAddBlock,
  onDeleteBlock,
  onAddExerciseToBlock,
  onDeleteExercise,
  onSaveRoutine,
  isSaving = false,
  exercises,
  translations,
}: RoutineEditorDialogProps) {
  if (!routine) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {translations.title}: {routine.name}
          </DialogTitle>
          <DialogDescription>{translations.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Routine Name */}
          <div className="space-y-2">
            <Label htmlFor="routine-name">{translations.routineName}</Label>
            <Input
              id="routine-name"
              value={routine.name}
              onChange={(e) => onRoutineChange({ ...routine, name: e.target.value })}
              placeholder={translations.routineNamePlaceholder}
            />
          </div>

          {/* Routine Description */}
          <div className="space-y-2">
            <Label htmlFor="routine-description">{translations.routineDescription}</Label>
            <Textarea
              id="routine-description"
              value={routine.description || ""}
              onChange={(e) => onRoutineChange({ ...routine, description: e.target.value })}
              placeholder={translations.routineDescriptionPlaceholder}
              className="min-h-20"
            />
          </div>

          {/* Blocks Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{translations.blocksTitle}</h3>
            </div>

            {/* Add Block Section */}
            <div className="flex gap-2 items-center">
              <Input
                value={newBlockName}
                onChange={(e) => onNewBlockNameChange(e.target.value)}
                placeholder={translations.newBlockNamePlaceholder}
                className="flex-1"
              />
              <Button
                onClick={onAddBlock}
                size="sm"
                className="bg-primary hover:bg-primary/90"
                disabled={!newBlockName.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                {translations.addBlock}
              </Button>
            </div>

            {routine.blocks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{translations.noBlocks}</p>
                <p className="text-sm">{translations.clickToStart}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {routine.blocks.map((block) => (
                  <Card key={block.id} className="border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onToggleBlockExpansion(block.id)}
                            className="p-1 h-auto"
                          >
                            {expandedBlocks.has(block.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>
                          <CardTitle className="text-base">{block.name}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {block.exercises.length} {translations.exercise}
                            {block.exercises.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAddExerciseToBlock(block.id)}
                            className="text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            {translations.exercise}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDeleteBlock(block.id)}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    {expandedBlocks.has(block.id) && (
                      <CardContent className="pt-0">
                        {block.exercises.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground">
                            <p className="text-sm">{translations.noExercises}</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {block.exercises.map((exercise, idx) => {
                              // Try to find exercise in loaded exercises from search
                              const exerciseData = exercises.find(
                                (e) => e.id.toString() === exercise.exerciseId.toString()
                              )

                              return (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                                >
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">
                                      {exerciseData?.name || `Ejercicio ID: ${exercise.exerciseId}`}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {exercise.sets} {translations.sets.toLowerCase()} ×{" "}
                                      {exercise.reps} {translations.reps} · {exercise.restSec}s{" "}
                                      {translations.restShort}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onDeleteExercise(block.id, idx)}
                                    className="text-red-600 hover:text-red-700 p-1 h-auto"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {translations.cancel}
          </Button>
          <Button
            type="button"
            onClick={onSaveRoutine}
            className="bg-primary hover:bg-primary/90"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="loader mr-2"></span> {translations.saving}
              </>
            ) : (
              translations.saveRoutine
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

