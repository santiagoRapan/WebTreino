"use client"

import { useState } from "react"
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
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronDown } from "lucide-react"
import type { ExerciseFormState } from "@/features/routines/types"
import {
  MUSCLE_LABELS,
  SECONDARY_MUSCLE_LABELS,
  BODY_PART_LABELS,
  EQUIPMENT_LABELS,
} from "@/features/exercises"

interface CreateExerciseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exerciseForm: ExerciseFormState
  onFormChange: (form: ExerciseFormState) => void
  onCreateExercise: () => void
  translations: {
    title: string
    description: string
    exerciseName: string
    exerciseNamePlaceholder: string
    targetMuscles: string
    secondaryMuscles: string
    bodyParts: string
    equipment: string
    category: string
    selectCategory: string
    instructions: string
    instructionsPlaceholder: string
    cancel: string
    createExercise: string
    select: string
    hide: string
  }
}

// Use mapped constants from exerciseMappings
const MUSCLES = MUSCLE_LABELS
const SECONDARY_MUSCLES = SECONDARY_MUSCLE_LABELS
const BODY_PARTS = BODY_PART_LABELS
const EQUIPMENTS = EQUIPMENT_LABELS

const CATEGORIES = ["Fuerza", "Cardio", "Flexibilidad", "Funcional", "Rehabilitación"]

export function CreateExerciseDialog({
  open,
  onOpenChange,
  exerciseForm,
  onFormChange,
  onCreateExercise,
  translations,
}: CreateExerciseDialogProps) {
  const [showMusclesSelector, setShowMusclesSelector] = useState(false)
  const [showSecondaryMusclesSelector, setShowSecondaryMusclesSelector] = useState(false)
  const [showBodyPartsSelector, setShowBodyPartsSelector] = useState(false)
  const [showEquipmentSelector, setShowEquipmentSelector] = useState(false)

  const toggleMuscle = (muscle: string) => {
    const muscles = exerciseForm.target_muscles.includes(muscle)
      ? exerciseForm.target_muscles.filter((m) => m !== muscle)
      : [...exerciseForm.target_muscles, muscle]
    onFormChange({ ...exerciseForm, target_muscles: muscles })
  }

  const removeMuscle = (muscle: string) => {
    onFormChange({
      ...exerciseForm,
      target_muscles: exerciseForm.target_muscles.filter((m) => m !== muscle),
    })
  }

  const toggleEquipment = (equipment: string) => {
    const equipments = exerciseForm.equipments.includes(equipment)
      ? exerciseForm.equipments.filter((eq) => eq !== equipment)
      : [...exerciseForm.equipments, equipment]
    onFormChange({ ...exerciseForm, equipments })
  }

  const removeEquipment = (equipment: string) => {
    onFormChange({
      ...exerciseForm,
      equipments: exerciseForm.equipments.filter((eq) => eq !== equipment),
    })
  }

  const toggleSecondaryMuscle = (muscle: string) => {
    const muscles = exerciseForm.secondary_muscles.includes(muscle)
      ? exerciseForm.secondary_muscles.filter((m) => m !== muscle)
      : [...exerciseForm.secondary_muscles, muscle]
    onFormChange({ ...exerciseForm, secondary_muscles: muscles })
  }

  const removeSecondaryMuscle = (muscle: string) => {
    onFormChange({
      ...exerciseForm,
      secondary_muscles: exerciseForm.secondary_muscles.filter((m) => m !== muscle),
    })
  }

  const toggleBodyPart = (bodyPart: string) => {
    const bodyParts = exerciseForm.body_parts.includes(bodyPart)
      ? exerciseForm.body_parts.filter((bp) => bp !== bodyPart)
      : [...exerciseForm.body_parts, bodyPart]
    onFormChange({ ...exerciseForm, body_parts: bodyParts })
  }

  const removeBodyPart = (bodyPart: string) => {
    onFormChange({
      ...exerciseForm,
      body_parts: exerciseForm.body_parts.filter((bp) => bp !== bodyPart),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{translations.title}</DialogTitle>
          <DialogDescription>{translations.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Exercise Name */}
          <div className="space-y-2">
            <Label htmlFor="exercise-name">{translations.exerciseName}</Label>
            <Input
              id="exercise-name"
              placeholder={translations.exerciseNamePlaceholder}
              value={exerciseForm.name}
              onChange={(e) => onFormChange({ ...exerciseForm, name: e.target.value })}
            />
          </div>

          {/* Target Muscles */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{translations.targetMuscles}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowMusclesSelector(!showMusclesSelector)}
              >
                {showMusclesSelector ? translations.hide : translations.select}
                <ChevronDown
                  className={`w-4 h-4 ml-2 transition-transform ${showMusclesSelector ? "rotate-180" : ""}`}
                />
              </Button>
            </div>

            {/* Selected muscles display */}
            {exerciseForm.target_muscles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {exerciseForm.target_muscles.map((muscle) => (
                  <Badge key={muscle} variant="secondary" className="text-xs">
                    {muscle}
                    <button
                      type="button"
                      onClick={() => removeMuscle(muscle)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {showMusclesSelector && (
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                {MUSCLES.map((muscle) => (
                  <label key={muscle} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exerciseForm.target_muscles.includes(muscle)}
                      onChange={() => toggleMuscle(muscle)}
                      className="rounded border-border"
                    />
                    <span className="text-sm">{muscle}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Equipment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{translations.equipment}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowEquipmentSelector(!showEquipmentSelector)}
              >
                {showEquipmentSelector ? translations.hide : translations.select}
                <ChevronDown
                  className={`w-4 h-4 ml-2 transition-transform ${showEquipmentSelector ? "rotate-180" : ""}`}
                />
              </Button>
            </div>

            {/* Selected equipment display */}
            {exerciseForm.equipments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {exerciseForm.equipments.map((equipment) => (
                  <Badge key={equipment} variant="secondary" className="text-xs">
                    {equipment}
                    <button
                      type="button"
                      onClick={() => removeEquipment(equipment)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {showEquipmentSelector && (
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                {EQUIPMENTS.map((equipment) => (
                  <label key={equipment} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exerciseForm.equipments.includes(equipment)}
                      onChange={() => toggleEquipment(equipment)}
                      className="rounded border-border"
                    />
                    <span className="text-sm">{equipment}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="exercise-category">{translations.category}</Label>
            <Select
              value={exerciseForm.category || ""}
              onValueChange={(value) => onFormChange({ ...exerciseForm, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={translations.selectCategory} />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Secondary Muscles */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{translations.secondaryMuscles}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowSecondaryMusclesSelector(!showSecondaryMusclesSelector)}
              >
                {showSecondaryMusclesSelector ? translations.hide : translations.select}
                <ChevronDown
                  className={`w-4 h-4 ml-2 transition-transform ${showSecondaryMusclesSelector ? "rotate-180" : ""}`}
                />
              </Button>
            </div>

            {/* Selected secondary muscles display */}
            {exerciseForm.secondary_muscles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {exerciseForm.secondary_muscles.map((muscle) => (
                  <Badge key={muscle} variant="outline" className="text-xs">
                    {muscle}
                    <button
                      type="button"
                      onClick={() => removeSecondaryMuscle(muscle)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {showSecondaryMusclesSelector && (
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                {SECONDARY_MUSCLES.map((muscle) => (
                  <label key={muscle} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exerciseForm.secondary_muscles.includes(muscle)}
                      onChange={() => toggleSecondaryMuscle(muscle)}
                      className="rounded border-border"
                    />
                    <span className="text-sm">{muscle}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Body Parts */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{translations.bodyParts}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowBodyPartsSelector(!showBodyPartsSelector)}
              >
                {showBodyPartsSelector ? translations.hide : translations.select}
                <ChevronDown
                  className={`w-4 h-4 ml-2 transition-transform ${showBodyPartsSelector ? "rotate-180" : ""}`}
                />
              </Button>
            </div>

            {/* Selected body parts display */}
            {exerciseForm.body_parts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {exerciseForm.body_parts.map((bodyPart) => (
                  <Badge key={bodyPart} variant="outline" className="text-xs">
                    {bodyPart}
                    <button
                      type="button"
                      onClick={() => removeBodyPart(bodyPart)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {showBodyPartsSelector && (
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                {BODY_PARTS.map((bodyPart) => (
                  <label key={bodyPart} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exerciseForm.body_parts.includes(bodyPart)}
                      onChange={() => toggleBodyPart(bodyPart)}
                      className="rounded border-border"
                    />
                    <span className="text-sm">{bodyPart}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="exercise-instructions">{translations.instructions}</Label>
            <Textarea
              id="exercise-instructions"
              placeholder={translations.instructionsPlaceholder}
              value={exerciseForm.instructions || ""}
              onChange={(e) => onFormChange({ ...exerciseForm, instructions: e.target.value })}
              className="min-h-24"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {translations.cancel}
          </Button>
          <Button
            type="button"
            onClick={onCreateExercise}
            disabled={
              !exerciseForm.name.trim() ||
              exerciseForm.target_muscles.length === 0 ||
              exerciseForm.body_parts.length === 0 ||
              exerciseForm.equipments.length === 0
            }
          >
            {translations.createExercise}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

