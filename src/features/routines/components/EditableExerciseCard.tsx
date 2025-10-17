"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, ChevronUp, Trash2, Plus, GripVertical, Activity } from "lucide-react"
import type { Exercise, SetInputV2 } from "@/features/routines/types"

interface EditableExerciseCardProps {
  exercise: {
    exerciseId: string
    sets: number | null
    reps: string | null
    rest_seconds: number | null
    load_target?: string | null
  }
  exerciseData?: Exercise
  index: number
  setsData: SetInputV2[] // V2 sets data
  onDelete: (index: number) => void
  onUpdateSets: (index: number, sets: SetInputV2[]) => void
  translations: {
    sets: string
    reps: string
    load: string
    unit: string
    notes: string
    addSet: string
    delete: string
    noGifAvailable: string
  }
}

export function EditableExerciseCard({
  exercise,
  exerciseData,
  index,
  setsData,
  onDelete,
  onUpdateSets,
  translations
}: EditableExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localSets, setLocalSets] = useState<SetInputV2[]>(setsData)

  const handleSetChange = (setIndex: number, field: keyof SetInputV2, value: any) => {
    const newSets = localSets.map((set, idx) => 
      idx === setIndex ? { ...set, [field]: value } : set
    )
    setLocalSets(newSets)
    onUpdateSets(index, newSets)
  }

  const handleAddSet = () => {
    const lastSet = localSets[localSets.length - 1]
    const newSet: SetInputV2 = {
      set_index: localSets.length + 1,
      reps: lastSet?.reps || '10',
      load_kg: lastSet?.load_kg || null,
      unit: lastSet?.unit || 'kg',
      notes: undefined
    }
    const newSets = [...localSets, newSet]
    setLocalSets(newSets)
    onUpdateSets(index, newSets)
  }

  const handleRemoveSet = (setIndex: number) => {
    if (localSets.length <= 1) return
    
    const newSets = localSets
      .filter((_, idx) => idx !== setIndex)
      .map((set, idx) => ({ ...set, set_index: idx + 1 }))
    
    setLocalSets(newSets)
    onUpdateSets(index, newSets)
  }

  return (
    <Card className="relative">
      <CardContent className="p-4">
        {/* Exercise Header */}
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <div className="mt-2 cursor-move opacity-50 hover:opacity-100">
            <GripVertical className="w-5 h-5" />
          </div>

          {/* Exercise Image */}
          <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
            {exerciseData?.gif_URL ? (
              <img
                src={exerciseData.gif_URL}
                alt={exerciseData.name}
                className="w-full h-full object-cover rounded-md"
              />
            ) : (
              <Activity className="w-6 h-6 text-muted-foreground" />
            )}
          </div>

          {/* Exercise Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">
              {exerciseData?.name || `Exercise ${exercise.exerciseId}`}
            </h4>
            <p className="text-sm text-muted-foreground">
              {localSets.length} {localSets.length === 1 ? 'serie' : 'series'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(index)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Expanded Sets Editor */}
        {isExpanded && (
          <div className="mt-4 space-y-3 border-t pt-4">
            {localSets.map((set, setIdx) => (
              <Card key={setIdx} className="bg-muted/30">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-medium text-sm">Serie {set.set_index}</span>
                    {localSets.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSet(setIdx)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {/* Reps */}
                    <div>
                      <Label htmlFor={`reps-${index}-${setIdx}`} className="text-xs">
                        {translations.reps}
                      </Label>
                      <Input
                        id={`reps-${index}-${setIdx}`}
                        type="text"
                        placeholder="10"
                        value={set.reps || ''}
                        onChange={(e) => handleSetChange(setIdx, 'reps', e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>

                    {/* Load */}
                    <div>
                      <Label htmlFor={`load-${index}-${setIdx}`} className="text-xs">
                        {translations.load}
                      </Label>
                      <Input
                        id={`load-${index}-${setIdx}`}
                        type="number"
                        step="0.5"
                        placeholder="0"
                        value={set.load_kg || ''}
                        onChange={(e) => handleSetChange(setIdx, 'load_kg', e.target.value ? parseFloat(e.target.value) : null)}
                        className="h-8 text-sm"
                      />
                    </div>

                    {/* Unit */}
                    <div>
                      <Label htmlFor={`unit-${index}-${setIdx}`} className="text-xs">
                        {translations.unit}
                      </Label>
                      <Select
                        value={set.unit || 'kg'}
                        onValueChange={(value) => handleSetChange(setIdx, 'unit', value)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="lb">lb</SelectItem>
                          <SelectItem value="bw">BW</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mt-2">
                    <Input
                      placeholder={translations.notes}
                      value={set.notes || ''}
                      onChange={(e) => handleSetChange(setIdx, 'notes', e.target.value)}
                      className="h-7 text-xs"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add Set Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddSet}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {translations.addSet}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

