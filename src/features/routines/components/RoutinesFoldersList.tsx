"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { RoutineFolder } from "@/features/routines/types"

interface RoutinesFoldersListProps {
  folders: RoutineFolder[]
  selectedFolderId: number | null
  onFolderSelect: (folderId: number) => void
  foldersTitle: string
  foldersDescription: string
}

export function RoutinesFoldersList({
  folders,
  selectedFolderId,
  onFolderSelect,
  foldersTitle,
  foldersDescription,
}: RoutinesFoldersListProps) {
  const currentFolder = folders.find((f) => f.id === selectedFolderId) || folders[0]

  return (
    <Card className="bg-card border-border lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-card-foreground">{foldersTitle}</CardTitle>
        <CardDescription>{foldersDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => onFolderSelect(folder.id)}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              folder.id === currentFolder?.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 hover:bg-muted/70"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{folder.name}</span>
              <Badge variant={folder.id === currentFolder?.id ? "secondary" : "outline"}>
                {folder.templates.length}
              </Badge>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}

