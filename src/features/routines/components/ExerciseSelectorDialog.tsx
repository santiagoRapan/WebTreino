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
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Activity } from "lucide-react"
import { useInfiniteScroll } from "../hooks/useInfiniteScroll"
import type { Exercise, PendingExercise } from "@/features/routines/types"

interface ExerciseSearchHook {
  searchTerm: string
  setSearchTerm: (term: string) => void
  category?: string
  setCategory: (category: string | undefined) => void
  equipment?: string
  setEquipment: (equipment: string | undefined) => void
  exercises: Exercise[]
  loading: boolean
  hasMore: boolean
  loadMore: () => void
  uniqueCategories: string[]
  uniqueEquipments: string[]
}

interface ExerciseInputs {
  sets: string
  reps: string
  restSec: string
}

interface ExerciseSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exerciseSearch: ExerciseSearchHook
  pendingExercise: PendingExercise
  exerciseInputs: ExerciseInputs
  onExerciseInputsChange: (inputs: ExerciseInputs) => void
  onSelectExercise: (exercise: Exercise) => void
  onConfirmAdd: () => void
  onCancelAdd: () => void
  translations: {
    title: string
    description: string
    searchPlaceholder: string
    filterByCategory: string
    allCategories: string
    filterByEquipment: string
    allEquipments: string
    configureExercise: string
    sets: string
    repetitions: string
    rest: string
    confirmAdd: string
    cancel: string
    close: string
    loadingMore: string
    noResults: string
    scrollForMore: string
  }
}

export function ExerciseSelectorDialog({
  open,
  onOpenChange,
  exerciseSearch,
  pendingExercise,
  exerciseInputs,
  onExerciseInputsChange,
  onSelectExercise,
  onConfirmAdd,
  onCancelAdd,
  translations,
}: ExerciseSelectorDialogProps) {
  const { containerRef, handleScroll } = useInfiniteScroll({
    hasMore: exerciseSearch.hasMore,
    loading: exerciseSearch.loading,
    onLoadMore: exerciseSearch.loadMore,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{translations.title}</DialogTitle>
          <DialogDescription>{translations.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={translations.searchPlaceholder}
              value={exerciseSearch.searchTerm}
              onChange={(e) => exerciseSearch.setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <Select
              value={exerciseSearch.category || "all-categories"}
              onValueChange={(value) =>
                exerciseSearch.setCategory(value === "all-categories" ? undefined : value)
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder={translations.filterByCategory} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-categories">{translations.allCategories}</SelectItem>
                {exerciseSearch.uniqueCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={exerciseSearch.equipment || "all-equipments"}
              onValueChange={(value) =>
                exerciseSearch.setEquipment(value === "all-equipments" ? undefined : value)
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder={translations.filterByEquipment} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-equipments">{translations.allEquipments}</SelectItem>
                {exerciseSearch.uniqueEquipments.map((eq) => (
                  <SelectItem key={eq} value={eq}>
                    {eq}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Exercise List with infinite scroll */}
          <div
            ref={containerRef}
            className="grid gap-3 max-h-96 overflow-y-auto"
            onScroll={handleScroll}
          >
            {exerciseSearch.exercises.map((exercise) => (
              <Card
                key={exercise.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onSelectExercise(exercise)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                      {exercise.gif_URL ? (
                        <img
                          src={exercise.gif_URL}
                          alt={exercise.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <Activity className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{exercise.name}</h4>
                      <div className="flex gap-2 mt-1">
                        {exercise.target_muscles?.slice(0, 2).map((muscle) => (
                          <Badge key={muscle} variant="secondary" className="text-xs">
                            {muscle}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {exercise.category || exercise.body_parts?.[0]}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Loading indicator */}
            {exerciseSearch.loading && (
              <div className="text-center py-4 text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                  {translations.loadingMore}
                </div>
              </div>
            )}

            {/* No results */}
            {!exerciseSearch.loading && exerciseSearch.exercises.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{translations.noResults}</p>
              </div>
            )}

            {/* Load more hint */}
            {!exerciseSearch.loading &&
              exerciseSearch.hasMore &&
              exerciseSearch.exercises.length > 0 && (
                <div className="text-center py-2 text-xs text-muted-foreground">
                  {translations.scrollForMore}
                </div>
              )}
          </div>

          {pendingExercise && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">{translations.configureExercise}</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="sets">{translations.sets}</Label>
                  <Input
                    id="sets"
                    type="number"
                    placeholder="4"
                    value={exerciseInputs.sets}
                    onChange={(e) =>
                      onExerciseInputsChange({ ...exerciseInputs, sets: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="reps">{translations.repetitions}</Label>
                  <Input
                    id="reps"
                    type="number"
                    placeholder="12"
                    value={exerciseInputs.reps}
                    onChange={(e) =>
                      onExerciseInputsChange({ ...exerciseInputs, reps: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="rest">{translations.rest}</Label>
                  <Input
                    id="rest"
                    type="number"
                    placeholder="90"
                    value={exerciseInputs.restSec}
                    onChange={(e) =>
                      onExerciseInputsChange({ ...exerciseInputs, restSec: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={onConfirmAdd}
                  disabled={
                    !exerciseInputs.sets || !exerciseInputs.reps || !exerciseInputs.restSec
                  }
                  className="flex-1"
                >
                  {translations.confirmAdd}
                </Button>
                <Button variant="outline" onClick={onCancelAdd}>
                  {translations.cancel}
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {translations.close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

