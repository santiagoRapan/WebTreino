"use client"

import { useState, useEffect } from "react"
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
import { Search, Activity, Trash2, Plus } from "lucide-react"
import { useInfiniteScroll } from "../hooks/useInfiniteScroll"
import type { Exercise, PendingExercise, SetInputV2 } from "@/features/routines/types"

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

interface ExerciseInputsV2 {
  numSets: number
  sets: SetInputV2[]
}

interface ExerciseSelectorDialogV2Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  exerciseSearch: ExerciseSearchHook
  pendingExercise: PendingExercise | null
  exerciseInputs: ExerciseInputsV2
  onExerciseInputsChange: (inputs: ExerciseInputsV2) => void
  onSelectExercise: (exercise: Exercise) => void
  onConfirmAdd: () => void
  onCancelAdd: () => void
  onClearPendingExercise?: () => void
  translations: {
    title: string
    description: string
    searchPlaceholder: string
    filterByCategory: string
    allCategories: string
    filterByEquipment: string
    allEquipments: string
    configureExercise: string
    numberOfSets: string
    sets: string
    repetitions: string
    load: string
    unit: string
    notes: string
    confirmAdd: string
    cancel: string
    close: string
    loadingMore: string
    noResults: string
    scrollForMore: string
    addSet: string
    removeSet: string
    clickToChange: string
  }
}

export function ExerciseSelectorDialogV2({
  open,
  onOpenChange,
  exerciseSearch,
  pendingExercise,
  exerciseInputs,
  onExerciseInputsChange,
  onSelectExercise,
  onConfirmAdd,
  onCancelAdd,
  onClearPendingExercise,
  translations,
}: ExerciseSelectorDialogV2Props) {
  const { containerRef, handleScroll } = useInfiniteScroll({
    hasMore: exerciseSearch.hasMore,
    loading: exerciseSearch.loading,
    onLoadMore: exerciseSearch.loadMore,
  })

  // Update sets array when numSets changes
  const handleNumSetsChange = (num: number) => {
    const currentSets = exerciseInputs.sets
    let newSets: SetInputV2[]

    if (num > currentSets.length) {
      // Add new sets
      const lastSet = currentSets[currentSets.length - 1]
      newSets = [
        ...currentSets,
        ...Array.from({ length: num - currentSets.length }, (_, i) => ({
          set_index: currentSets.length + i + 1,
          reps: lastSet?.reps || '10',
          load_kg: lastSet?.load_kg || null,
          unit: lastSet?.unit || 'kg'
        }))
      ]
    } else {
      // Remove sets
      newSets = currentSets.slice(0, num)
    }

    onExerciseInputsChange({
      numSets: num,
      sets: newSets
    })
  }

  const handleSetChange = (index: number, field: keyof SetInputV2, value: any) => {
    const newSets = [...exerciseInputs.sets]
    newSets[index] = {
      ...newSets[index],
      [field]: value
    }
    onExerciseInputsChange({
      ...exerciseInputs,
      sets: newSets
    })
  }

  const addSet = () => {
    const lastSet = exerciseInputs.sets[exerciseInputs.sets.length - 1]
    const newSet: SetInputV2 = {
      set_index: exerciseInputs.sets.length + 1,
      reps: lastSet?.reps || '10',
      load_kg: lastSet?.load_kg || null,
      unit: lastSet?.unit || 'kg'
    }
    onExerciseInputsChange({
      numSets: exerciseInputs.numSets + 1,
      sets: [...exerciseInputs.sets, newSet]
    })
  }

  const removeSet = (index: number) => {
    if (exerciseInputs.sets.length <= 1) return
    
    const newSets = exerciseInputs.sets
      .filter((_, i) => i !== index)
      .map((set, i) => ({ ...set, set_index: i + 1 }))
    
    onExerciseInputsChange({
      numSets: exerciseInputs.numSets - 1,
      sets: newSets
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{translations.title}</DialogTitle>
          <DialogDescription>{translations.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!pendingExercise ? (
            <>
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
            </>
          ) : (
            <div className="space-y-4">
              {/* Selected Exercise Card - Clickable to go back */}
              <Card 
                className="bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors border-2 border-primary/20 hover:border-primary/40"
                onClick={onClearPendingExercise || onCancelAdd}
                title={translations.clickToChange}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                      {pendingExercise.exercise.gif_URL ? (
                        <img
                          src={pendingExercise.exercise.gif_URL}
                          alt={pendingExercise.exercise.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <Activity className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{pendingExercise.exercise.name}</h4>
                      <div className="flex gap-2 mt-1">
                        {pendingExercise.exercise.target_muscles?.slice(0, 3).map((muscle) => (
                          <Badge key={muscle} variant="secondary" className="text-xs">
                            {muscle}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        {translations.clickToChange}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Exercise Configuration Form - V2 with per-set config */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">{translations.configureExercise}</h4>
                
                {/* Number of sets selector */}
                <div className="mb-4">
                  <Label htmlFor="numSets">{translations.numberOfSets}</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      id="numSets"
                      type="number"
                      min="1"
                      max="20"
                      value={exerciseInputs.numSets}
                      onChange={(e) => handleNumSetsChange(parseInt(e.target.value) || 1)}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">
                      {exerciseInputs.numSets} {exerciseInputs.numSets === 1 ? 'serie' : 'series'}
                    </span>
                  </div>
                </div>

                {/* Individual set configurations */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {exerciseInputs.sets.map((set, index) => (
                    <Card key={index} className="bg-muted/20">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <span className="font-medium text-sm">Serie {set.set_index}</span>
                          {exerciseInputs.sets.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSet(index)}
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                          {/* Reps */}
                          <div>
                            <Label htmlFor={`reps-${index}`} className="text-xs">
                              {translations.repetitions}
                            </Label>
                            <Input
                              id={`reps-${index}`}
                              type="text"
                              placeholder="10"
                              value={set.reps}
                              onChange={(e) => handleSetChange(index, 'reps', e.target.value)}
                              className="h-9"
                            />
                          </div>

                          {/* Load */}
                          <div>
                            <Label htmlFor={`load-${index}`} className="text-xs">
                              {translations.load}
                            </Label>
                            <Input
                              id={`load-${index}`}
                              type="number"
                              step="0.5"
                              placeholder="0"
                              value={set.load_kg || ''}
                              onChange={(e) => handleSetChange(index, 'load_kg', e.target.value ? parseFloat(e.target.value) : null)}
                              className="h-9"
                            />
                          </div>

                          {/* Unit */}
                          <div>
                            <Label htmlFor={`unit-${index}`} className="text-xs">
                              {translations.unit}
                            </Label>
                            <Select
                              value={set.unit || 'kg'}
                              onValueChange={(value) => handleSetChange(index, 'unit', value)}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kg">kg</SelectItem>
                                <SelectItem value="lb">lb</SelectItem>
                                <SelectItem value="bw">Peso corporal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Notes (optional) */}
                        <div className="mt-3">
                          <Input
                            placeholder={translations.notes}
                            value={set.notes || ''}
                            onChange={(e) => handleSetChange(index, 'notes', e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Add set button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addSet}
                  className="w-full mt-3"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {translations.addSet}
                </Button>

                {/* Action buttons */}
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={onConfirmAdd}
                    disabled={exerciseInputs.sets.length === 0 || !exerciseInputs.sets.every(s => s.reps)}
                    className="flex-1"
                  >
                    {translations.confirmAdd}
                  </Button>
                  <Button variant="outline" onClick={onCancelAdd}>
                    {translations.cancel}
                  </Button>
                </div>
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

