"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import type { RoutineTemplate, RoutineFolder } from "@/features/routines/types"

interface Client {
  id: string
  userId: string
  name: string
  email: string
}

interface RoutinesTemplatesListProps {
  currentFolder: RoutineFolder | undefined
  templates: RoutineTemplate[]
  allFolders: RoutineFolder[]
  searchTerm: string
  onSearchChange: (search: string) => void
  onEditRoutine: (template: RoutineTemplate) => void
  onMoveTemplate: (templateId: string | number, folderId: number) => void
  onDeleteTemplate: (templateId: string | number) => void
  onExportToExcel: (template: RoutineTemplate) => void
  onAssignToClient: (template: RoutineTemplate, client: Client) => void
  onSendToClient: (templateId: string | number, clientId: string) => Promise<void>
  allClients: Client[]
  loadingClients: boolean
  clientsError: string | null
  assignedCounts: Record<string, number>
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
  onAssignToClient,
  onSendToClient,
  allClients,
  loadingClients,
  clientsError,
  assignedCounts,
  translations,
}: RoutinesTemplatesListProps) {
  const [routineAssignments, setRoutineAssignments] = useState<Record<string, string>>({})

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                      <p className="text-xs text-muted-foreground">{translations.blocks}</p>
                      <p className="text-lg font-semibold text-card-foreground">
                        {tpl.blocks.length}
                      </p>
                    </div>
                    <div className="p-3 rounded border border-border bg-background/80 shadow-sm">
                      <p className="text-xs text-muted-foreground">{translations.totalExercises}</p>
                      <p className="text-lg font-semibold text-card-foreground">
                        {tpl.blocks.reduce((acc, block) => acc + block.exercises.length, 0)}
                      </p>
                    </div>
                    <div className="p-3 rounded border border-border bg-background/80 shadow-sm">
                      <p className="text-xs text-muted-foreground">Asignada a</p>
                      <p className="text-lg font-semibold text-card-foreground">
                        {assignedCounts[String(tpl.id)] || 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tpl.blocks.map((block) => (
                      <Badge key={block.id} variant="outline">
                        {block.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 min-w-[220px]">
                  <Select
                    key={`${String(tpl.id)}:${routineAssignments[String(tpl.id)] ?? ""}`}
                    value={routineAssignments[String(tpl.id)] ?? undefined}
                    onValueChange={(clientId) => {
                      setRoutineAssignments((prev) => ({
                        ...prev,
                        [String(tpl.id)]: clientId,
                      }))
                      const client = allClients.find((c) => String(c.userId) === clientId)
                      if (client) {
                        onAssignToClient(tpl, client)
                      }
                    }}
                  >
                    <SelectTrigger disabled={loadingClients}>
                      <SelectValue
                        placeholder={
                          loadingClients
                            ? translations.loadingStudents
                            : clientsError
                              ? translations.errorLoadingStudents
                              : allClients.length === 0
                                ? translations.noStudentsRegistered
                                : translations.assignToStudent
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingClients ? (
                        <SelectItem value="loading" disabled>
                          {translations.loadingStudents}
                        </SelectItem>
                      ) : clientsError ? (
                        <SelectItem value="error" disabled>
                          Error: {clientsError}
                        </SelectItem>
                      ) : allClients.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          {translations.noStudentsRegistered}
                        </SelectItem>
                      ) : (
                        allClients.map((c) => (
                          <SelectItem key={c.id} value={String(c.userId)}>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                                {c.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium">{c.name}</span>
                                <span className="text-xs text-muted-foreground">{c.email}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
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
                  <Button
                    className="hover:bg-orange-500 transition-colors"
                    title={
                      typeof tpl.id === "string" && tpl.id.startsWith("temp-")
                        ? "Guarda la rutina antes de enviarla"
                        : undefined
                    }
                    disabled={
                      !routineAssignments[String(tpl.id)] ||
                      (typeof tpl.id === "string" && tpl.id.startsWith("temp-"))
                    }
                    onClick={async () => {
                      if (typeof tpl.id === "string" && tpl.id.startsWith("temp-")) {
                        toast({
                          title: "Rutina no guardada",
                          description: translations.saveBeforeSending,
                          variant: "destructive",
                        })
                        return
                      }
                      const selectedClientId = routineAssignments[String(tpl.id)]
                      if (selectedClientId) {
                        try {
                          await onSendToClient(tpl.id, selectedClientId)
                          const selectedClient = allClients.find(
                            (c) => String(c.userId) === selectedClientId
                          )
                          toast({
                            title: "Rutina enviada",
                            description: `La rutina "${tpl.name}" ha sido enviada a ${selectedClient?.name}.`,
                          })
                          setRoutineAssignments((prev) => {
                            const next = { ...prev }
                            delete next[String(tpl.id)]
                            return next
                          })
                        } catch (error) {
                          console.error("Error al enviar rutina:", error)
                          toast({
                            title: "Error",
                            description: "No se pudo enviar la rutina. Inténtalo de nuevo.",
                            variant: "destructive",
                          })
                        }
                      }
                    }}
                  >
                    {(() => {
                      if (typeof tpl.id === "string" && tpl.id.startsWith("temp-")) {
                        return "Guarda la rutina primero"
                      }
                      const selectedClientId = routineAssignments[String(tpl.id)]
                      const selectedClient = selectedClientId
                        ? allClients.find((c) => String(c.userId) === selectedClientId)
                        : null
                      return selectedClient
                        ? `${translations.sendTo} ${selectedClient.name}`
                        : translations.selectStudent
                    })()}
                  </Button>
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
      </CardContent>
    </Card>
  )
}

