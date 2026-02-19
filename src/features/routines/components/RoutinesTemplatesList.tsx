"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MoreVertical, FileText, ChevronRight, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import type { RoutineTemplate, RoutineFolder } from "@/features/routines/types"
import type { Client } from "@/features/trainer/types"

interface RoutinesTemplatesListProps {
  currentFolder: RoutineFolder | undefined
  templates: RoutineTemplate[]
  allFolders: RoutineFolder[]
  searchTerm: string
  onSearchChange: (search: string) => void
  onEditRoutine: (template: RoutineTemplate) => void
  onMoveTemplate: (templateId: string | number, folderId: string | number) => void
  onDeleteTemplate: (templateId: string | number) => void
  onExportToExcel: (template: RoutineTemplate) => void
  onSaveAssignments: (templateId: string | number, selectedClientIds: string[]) => Promise<void>
  allClients: Client[]
  loadingClients: boolean
  clientsError: string | null
  assignedCounts: Record<string, number>
  assignedStudentUserIdsByRoutine: Record<string, string[]>
  translations: {
    templatesTitle: string
    templatesSubtitle: string
    searchPlaceholder: string
    defaultDescription: string
    blocks: string
    totalExercises: string
    edit: string
    exportExcel: string
    moveToFolder: string
    deleteRoutine: string
    assignToStudent: string
    sendTo: string
    selectStudent: string
    saveBeforeSending: string
    loadingStudents: string
    errorLoadingStudents: string
    noStudentsRegistered: string
    noTemplatesInFolder: string
  }
}

export function RoutinesTemplatesList({
  currentFolder,
  templates,
  allFolders,
  searchTerm,
  onSearchChange,
  onEditRoutine,
  onMoveTemplate,
  onDeleteTemplate,
  onExportToExcel,
  onSaveAssignments,
  allClients,
  loadingClients,
  clientsError,
  assignedCounts,
  assignedStudentUserIdsByRoutine,
  translations,
}: RoutinesTemplatesListProps) {
  const [assignmentDialogRoutine, setAssignmentDialogRoutine] =
    useState<RoutineTemplate | null>(null)
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([])
  const [savingRoutineId, setSavingRoutineId] = useState<string | null>(null)

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleClientSelection = (clientId: string, checked: boolean) => {
    setSelectedClientIds((prev) =>
      checked ? Array.from(new Set([...prev, clientId])) : prev.filter((id) => id !== clientId)
    )
  }

  const openAssignmentsDialog = (template: RoutineTemplate) => {
    const assignedUserIds = assignedStudentUserIdsByRoutine[String(template.id)] || []
    const initialClientIds = allClients
      .filter((client) => assignedUserIds.includes(client.userId))
      .map((client) => client.id)

    setAssignmentDialogRoutine(template)
    setSelectedClientIds(initialClientIds)
  }

  return (
    <Card className="bg-card border-border lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-card-foreground">
          {translations.templatesTitle}: {currentFolder?.name}
        </CardTitle>
        <CardDescription>{translations.templatesSubtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={translations.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          {filteredTemplates.map((tpl) => (
            <div key={tpl.id} className="p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-lg font-semibold">
                      {tpl.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-card-foreground">{tpl.name}</h3>
                      <p className="text-sm text-muted-foreground max-w-[360px]">
                        {tpl.description || translations.defaultDescription}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <div className="p-3 rounded border border-border bg-background/80 shadow-sm">
                      <p className="text-xs text-muted-foreground">{translations.totalExercises}</p>
                      <p className="text-lg font-semibold text-card-foreground">
                        {tpl.exercises?.length || 0}
                      </p>
                    </div>
                    <div className="p-3 rounded border border-border bg-background/80 shadow-sm">
                      <p className="text-xs text-muted-foreground">Asignada a</p>
                      <p className="text-lg font-semibold text-card-foreground">
                        {assignedCounts[String(tpl.id)] || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 min-w-[220px]">
                  <Button
                    variant="outline"
                    className="bg-transparent"
                    disabled={loadingClients || !!clientsError || allClients.length === 0}
                    onClick={() => openAssignmentsDialog(tpl)}
                  >
                    Asignar rutina
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="bg-transparent flex-1"
                      onClick={() => onEditRoutine(tpl)}
                    >
                      {translations.edit}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={() => onExportToExcel(tpl)}>
                          <FileText className="w-4 h-4 mr-2 text-green-500" />
                          {translations.exportExcel}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {allFolders
                          .filter((f) => f.id !== currentFolder?.id)
                          .map((folder) => (
                            <DropdownMenuItem
                              key={folder.id}
                              onClick={() => onMoveTemplate(tpl.id, folder.id)}
                            >
                              <ChevronRight className="w-4 h-4 mr-2" />
                              {translations.moveToFolder}: {folder.name}
                            </DropdownMenuItem>
                          ))}
                        {allFolders.filter((f) => f.id !== currentFolder?.id).length > 0 && (
                          <DropdownMenuSeparator />
                        )}
                        <DropdownMenuItem
                          onClick={() => onDeleteTemplate(tpl.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {translations.deleteRoutine}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredTemplates.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              {translations.noTemplatesInFolder}
            </div>
          )}
        </div>

        <Dialog
          open={!!assignmentDialogRoutine}
          onOpenChange={(open) => {
            if (!open) {
              setAssignmentDialogRoutine(null)
              setSelectedClientIds([])
            }
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Asignar rutina {assignmentDialogRoutine ? `"${assignmentDialogRoutine.name}"` : ""}
              </DialogTitle>
              <DialogDescription>
                Selecciona los alumnos y pulsa "Listo" para guardar los cambios.
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-80 overflow-y-auto rounded-md border border-border">
              {loadingClients ? (
                <div className="p-4 text-sm text-muted-foreground">{translations.loadingStudents}</div>
              ) : clientsError ? (
                <div className="p-4 text-sm text-destructive">Error: {clientsError}</div>
              ) : allClients.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">
                  {translations.noStudentsRegistered}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {allClients.map((client) => {
                    const checked = selectedClientIds.includes(client.id)
                    return (
                      <label
                        key={client.id}
                        className="flex cursor-pointer items-center gap-3 p-3 hover:bg-muted/40"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) =>
                            toggleClientSelection(client.id, value === true)
                          }
                        />
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-card-foreground">
                            {client.name || "Alumno"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {client.email || "Sin email"}
                          </span>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setAssignmentDialogRoutine(null)
                  setSelectedClientIds([])
                }}
              >
                Cancelar
              </Button>
              <Button
                disabled={!assignmentDialogRoutine || savingRoutineId === String(assignmentDialogRoutine?.id)}
                onClick={async () => {
                  if (!assignmentDialogRoutine) return
                  if (
                    typeof assignmentDialogRoutine.id === "string" &&
                    assignmentDialogRoutine.id.startsWith("temp-")
                  ) {
                    toast({
                      title: "Rutina no guardada",
                      description: translations.saveBeforeSending,
                      variant: "destructive",
                    })
                    return
                  }

                  const routineId = String(assignmentDialogRoutine.id)
                  setSavingRoutineId(routineId)
                  try {
                    await onSaveAssignments(assignmentDialogRoutine.id, selectedClientIds)
                    setAssignmentDialogRoutine(null)
                    setSelectedClientIds([])
                  } catch (error) {
                    console.error("Error guardando asignaciones:", error)
                    toast({
                      title: "Error",
                      description: "No se pudieron guardar los cambios de asignación.",
                      variant: "destructive",
                    })
                  } finally {
                    setSavingRoutineId(null)
                  }
                }}
              >
                {savingRoutineId === String(assignmentDialogRoutine?.id) ? "Guardando..." : "Listo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

