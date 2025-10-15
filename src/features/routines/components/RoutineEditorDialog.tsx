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
import { Plus, Activity } from "lucide-react"
import type { RoutineTemplate, Exercise } from "@/features/routines/types"
import { ExerciseListItem } from "./ExerciseListItem"

interface RoutineEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  routine: RoutineTemplate | null
  onRoutineChange: (routine: RoutineTemplate) => void
  onAddExercise: () => void
  onDeleteExercise: (exerciseIndex: number) => void
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
    exercisesTitle: string
    addExercise: string
    noExercises: string
    clickToStart: string
    sets: string
    reps: string
    restShort: string
    cancel: string
    saveRoutine: string
    saving: string
    noGifAvailable: string
  }
}

export function RoutineEditorDialog({
  open,
  onOpenChange,
  routine,
  onRoutineChange,
  onAddExercise,
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

          {/* Exercises Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{translations.exercisesTitle}</h3>
              <Button
                onClick={onAddExercise}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                {translations.addExercise}
              </Button>
            </div>

            {routine.exercises.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{translations.noExercises}</p>
                <p className="text-sm">{translations.clickToStart}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {routine.exercises.map((exercise, idx) => {
                  // Try to find exercise in loaded exercises
                  const exerciseData = exercises.find(
                    (e) => e.id.toString() === exercise.exerciseId.toString()
                  )

                  return (
                    <ExerciseListItem
                      key={idx}
                      exercise={exercise}
                      exerciseData={exerciseData}
                      index={idx}
                      onDelete={onDeleteExercise}
                      translations={{
                        sets: translations.sets,
                        reps: translations.reps,
                        restShort: translations.restShort,
                        noGifAvailable: translations.noGifAvailable,
                      }}
                    />
                  )
                })}
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
