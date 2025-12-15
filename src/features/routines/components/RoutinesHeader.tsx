"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

interface RoutinesHeaderProps {
  title: string
  subtitle: string
  showNewFolderInput: boolean
  newFolderName: string
  showNewRoutineInput: boolean // Kept for compatibility but won't be used
  newRoutineName: string // Kept for compatibility but won't be used
  onFolderNameChange: (name: string) => void
  onRoutineNameChange: (name: string) => void // Kept for compatibility but won't be used
  onCreateFolder: () => void
  onCreateRoutine: () => void // Now directly opens dialog
  onToggleNewFolder: () => void
  onToggleNewRoutine: () => void // Now directly opens dialog
  onCancelNewFolder: () => void
  onCancelNewRoutine: () => void // Kept for compatibility but won't be used
  translations: {
    newFolder: string
    newRoutine: string
    create: string
    cancel: string
    folderPlaceholder: string
    routinePlaceholder: string // Kept for compatibility but won't be used
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
        {/* New Routine Button - Always just a button that opens dialog */}
        <Button
          onClick={onToggleNewRoutine}
          className="hover:bg-orange-500 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          {translations.newRoutine}
        </Button>
      </div>
    </div>
  )
}

