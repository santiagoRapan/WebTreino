"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
          <div className="mt-4 border-t pt-4">
            {/* Column headers */}
            <div className="grid grid-cols-[50px_80px_100px_100px_40px] gap-2 mb-2 px-2 text-xs font-medium text-muted-foreground">
              <div>Serie</div>
              <div>{translations.reps}</div>
              <div>{translations.load}</div>
              <div>{translations.unit}</div>
              <div></div>
            </div>

            {/* Set rows */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {localSets.map((set, setIdx) => (
                <div 
                  key={setIdx} 
                  className="grid grid-cols-[50px_80px_100px_100px_40px] gap-2 p-2 rounded-md bg-muted/30 hover:bg-muted/40 transition-colors border border-border/40 group"
                >
                  <div className="flex items-center justify-center text-sm font-medium">
                    {set.set_index}
                  </div>

                  {/* Reps */}
                  <Input
                    type="text"
                    placeholder="10"
                    value={set.reps || ''}
                    onChange={(e) => handleSetChange(setIdx, 'reps', e.target.value)}
                    className="h-9 bg-background/60 border-border"
                  />

                  {/* Load */}
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="0"
                    value={set.load_kg || ''}
                    onChange={(e) => handleSetChange(setIdx, 'load_kg', e.target.value ? parseFloat(e.target.value) : null)}
                    className="h-9 bg-background/60 border-border"
                  />

                  {/* Unit */}
                  <Select
                    value={set.unit || 'kg'}
                    onValueChange={(value) => handleSetChange(setIdx, 'unit', value)}
                  >
                    <SelectTrigger className="h-9 bg-background/60 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="lb">lb</SelectItem>
                      <SelectItem value="bw">BW</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Delete button */}
                  {localSets.length > 1 && (
                    <div className="flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSet(setIdx)}
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Set Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddSet}
              className="w-full mt-3"
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

