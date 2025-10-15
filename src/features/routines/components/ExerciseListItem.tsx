"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Image as ImageIcon } from "lucide-react"
import type { Exercise, RoutineExercise } from "../types"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ExerciseListItemProps {
  exercise: RoutineExercise
  exerciseData?: Exercise // Full exercise data with name and gif
  index: number
  onDelete: (index: number) => void
  translations: {
    sets: string
    reps: string
    restShort: string
    noGifAvailable: string
  }
}

export function ExerciseListItem({
  exercise,
  exerciseData,
  index,
  onDelete,
  translations,
}: ExerciseListItemProps) {
  const [showGifModal, setShowGifModal] = useState(false)

  const exerciseName = exerciseData?.name || `Ejercicio ID: ${exercise.exerciseId}`
  const hasGif = exerciseData?.gif_URL && exerciseData.gif_URL.trim() !== ""

  return (
    <>
      <div className="border rounded-lg overflow-hidden bg-background">
        <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3 flex-1">
            {/* Exercise Number */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
              {index + 1}
            </div>

            {/* Small GIF Thumbnail */}
            {hasGif ? (
              <button
                onClick={() => setShowGifModal(true)}
                className="relative w-12 h-12 rounded-md overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-colors shrink-0 cursor-pointer bg-black/5"
                title="Click to view full size"
              >
                <Image
                  src={exerciseData.gif_URL!}
                  alt={exerciseName}
                  fill
                  className="object-cover"
                  unoptimized // GIFs need unoptimized flag
                />
              </button>
            ) : (
              <div className="w-12 h-12 rounded-md border-2 border-dashed border-muted-foreground/20 flex items-center justify-center shrink-0 bg-muted/30">
                <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
              </div>
            )}

            {/* Exercise Name and Details */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{exerciseName}</p>
              <p className="text-xs text-muted-foreground">
                {exercise.sets} {translations.sets.toLowerCase()} × {exercise.reps}{" "}
                {translations.reps} · {exercise.rest_seconds}s {translations.restShort}
              </p>
            </div>
          </div>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(index)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 h-auto shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* GIF Modal */}
      {hasGif && (
        <Dialog open={showGifModal} onOpenChange={setShowGifModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{exerciseName}</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center py-4">
              <div className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden bg-black/5">
                <Image
                  src={exerciseData.gif_URL!}
                  alt={exerciseName}
                  fill
                  className="object-contain"
                  unoptimized // GIFs need unoptimized flag
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
