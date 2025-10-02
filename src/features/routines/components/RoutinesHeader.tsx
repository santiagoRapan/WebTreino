"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

interface RoutinesHeaderProps {
  title: string
  subtitle: string
  showNewFolderInput: boolean
  newFolderName: string
  showNewRoutineInput: boolean
  newRoutineName: string
  onFolderNameChange: (name: string) => void
  onRoutineNameChange: (name: string) => void
  onCreateFolder: () => void
  onCreateRoutine: () => void
  onToggleNewFolder: () => void
  onToggleNewRoutine: () => void
  onCancelNewFolder: () => void
  onCancelNewRoutine: () => void
  translations: {
    newFolder: string
    newRoutine: string
    create: string
    cancel: string
    folderPlaceholder: string
    routinePlaceholder: string
  }
}

export function RoutinesHeader({
  title,
  subtitle,
  showNewFolderInput,
  newFolderName,
  showNewRoutineInput,
  newRoutineName,
  onFolderNameChange,
  onRoutineNameChange,
  onCreateFolder,
  onCreateRoutine,
  onToggleNewFolder,
  onToggleNewRoutine,
  onCancelNewFolder,
  onCancelNewRoutine,
  translations,
}: RoutinesHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex gap-2">
        {showNewFolderInput ? (
          <div className="flex gap-2 items-center">
            <Input
              type="text"
              placeholder={translations.folderPlaceholder}
              value={newFolderName}
              onChange={(e) => onFolderNameChange(e.target.value)}
              className="w-48"
              autoFocus
            />
            <Button
              variant="outline"
              onClick={onCreateFolder}
              className="bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors"
              disabled={!newFolderName.trim()}
            >
              {translations.create}
            </Button>
            <Button variant="outline" onClick={onCancelNewFolder}>
              {translations.cancel}
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={onToggleNewFolder}
            className="bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {translations.newFolder}
          </Button>
        )}
        {showNewRoutineInput ? (
          <div className="flex gap-2 items-center">
            <Input
              type="text"
              placeholder={translations.routinePlaceholder}
              value={newRoutineName}
              onChange={(e) => onRoutineNameChange(e.target.value)}
              className="w-48"
              autoFocus
            />
            <Button
              onClick={onCreateRoutine}
              className="hover:bg-orange-500 transition-colors"
              disabled={!newRoutineName.trim()}
            >
              {translations.create}
            </Button>
            <Button variant="outline" onClick={onCancelNewRoutine}>
              {translations.cancel}
            </Button>
          </div>
        ) : (
          <Button
            onClick={onToggleNewRoutine}
            className="hover:bg-orange-500 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {translations.newRoutine}
          </Button>
        )}
      </div>
    </div>
  )
}

