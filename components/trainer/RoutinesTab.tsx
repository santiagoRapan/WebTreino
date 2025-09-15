"use client"

import { useMemo } from "react"
import { useTrainerDashboard } from "@/components/trainer/TrainerDashboardContext"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import {
  Activity,
  ChevronDown,
  ChevronRight,
  Edit,
  FileText,
  MessageSquare,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Trash2,
} from "lucide-react"

export function RoutinesTab() {
  const {
    state: {
      routineFolders,
      selectedFolderId,
      showNewFolderInput,
      newFolderName,
      showNewRoutineInput,
      newRoutineName,
      routineSearch,
      exerciseFilter,
      editingRoutine,
      isRoutineEditorOpen,
      isExerciseSelectorOpen,
      selectedBlockId,
      exerciseSearchTerm,
      expandedBlocks,
      showExerciseCatalog,
      catalogSearch,
      exercisesCatalog,
      loadingExercises,
      restInput,
      restBlockId,
      exerciseInputs,
      pendingExercise,
      viewingRoutine,
      isRoutineViewerOpen,
    },
    data: { allClients },
    actions: {
      setSelectedFolderId,
      setShowNewFolderInput,
      setNewFolderName,
      setShowNewRoutineInput,
      setNewRoutineName,
      setRoutineSearch,
      setExerciseFilter,
      setEditingRoutine,
      setIsRoutineEditorOpen,
      setIsExerciseSelectorOpen,
      setIsCreateExerciseDialogOpen,
      setSelectedBlockId,
      setExerciseSearchTerm,
      setExpandedBlocks,
      setShowExerciseCatalog,
      setCatalogSearch,
      setRestInput,
      setRestBlockId,
      setExerciseInputs,
      setPendingExercise,
      setIsRoutineViewerOpen,
      handleCreateFolder,
      handleDeleteTemplate,
      handleMoveTemplate,
      handleCreateTemplate,
      handleAssignTemplateToClient,
      handleEditRoutine,
      handleAddBlock,
      handleAddExerciseToBlock,
      handleAddRest,
      confirmAddExercise,
      cancelAddExercise,
      handleSelectExercise,
      handleSaveRoutine,
      handleDeleteExercise,
      handleDeleteBlock,
      toggleBlockExpansion,
      handleExportRoutineToPDF,
      handleExportRoutineToExcel,
      handleStartChat,
    },
  } = useTrainerDashboard()

  const uniqueCategories = useMemo(
    () =>
      Array.from(
        new Set(
          exercisesCatalog
            .map((e) => (e.category || e.body_parts?.[0] || '').trim())
            .filter(Boolean)
        )
      ),
    [exercisesCatalog]
  )

  const uniqueEquipments = useMemo(
    () =>
      Array.from(
        new Set(
          exercisesCatalog
            .flatMap((e) => e.equipments || [])
            .map((eq) => eq.trim())
            .filter(Boolean)
        )
      ),
    [exercisesCatalog]
  )

  const currentFolder = routineFolders.find((f) => f.id === selectedFolderId) || routineFolders[0]
  const filteredTemplates = (currentFolder?.templates || []).filter((t) =>
    t.name.toLowerCase().includes(routineSearch.toLowerCase())
  )

  return (
    <main className="p-4 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Rutinas</h2>
          <p className="text-xs text-muted-foreground">Carpetas y plantillas para asignar a alumnos</p>
        </div>
        <div className="flex gap-2">
          {showNewFolderInput ? (
            <div className="flex gap-2 items-center">
              <Input
                type="text"
                placeholder="Nombre de la carpeta"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-48"
                autoFocus
              />
              <Button
                variant="outline"
                onClick={handleCreateFolder}
                className="bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors"
                disabled={!newFolderName.trim()}
              >
                Crear
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewFolderInput(false)
                  setNewFolderName("")
                }}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowNewFolderInput(true)}
              className="bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva carpeta
            </Button>
          )}
          {showNewRoutineInput ? (
            <div className="flex gap-2 items-center">
              <Input
                type="text"
                placeholder="Nombre de la rutina"
                value={newRoutineName}
                onChange={(e) => setNewRoutineName(e.target.value)}
                className="w-48"
                autoFocus
              />
              <Button
                onClick={handleCreateTemplate}
                className="hover:bg-orange-500 transition-colors"
                disabled={!newRoutineName.trim()}
              >
                Crear
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewRoutineInput(false)
                  setNewRoutineName("")
                }}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <Button onClick={() => setShowNewRoutineInput(true)} className="hover:bg-orange-500 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Nueva rutina
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-card border-border lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-card-foreground">Carpetas</CardTitle>
            <CardDescription>Organiza tus plantillas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {(routineFolders || []).map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolderId(folder.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  folder.id === currentFolder?.id ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted/70"
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

        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-card-foreground">Plantillas: {currentFolder?.name}</CardTitle>
            <CardDescription>Selecciona o edita una rutina base</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar plantillas..."
                  value={routineSearch}
                  onChange={(e) => setRoutineSearch(e.target.value)}
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
                            {tpl.description || "Plantilla predeterminada sin descripción."}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        <div className="p-3 rounded border border-border bg-background/80 shadow-sm">
                          <p className="text-xs text-muted-foreground">Bloques</p>
                          <p className="text-lg font-semibold text-card-foreground">{tpl.blocks.length}</p>
                        </div>
                        <div className="p-3 rounded border border-border bg-background/80 shadow-sm">
                          <p className="text-xs text-muted-foreground">Ejercicios totales</p>
                          <p className="text-lg font-semibold text-card-foreground">
                            {tpl.blocks.reduce((acc, block) => acc + block.exercises.length, 0)}
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
                        onValueChange={(clientId) => {
                          const client = allClients.find((c) => String(c.id) === clientId)
                          if (client) handleAssignTemplateToClient(tpl, client)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Asignar a alumno" />
                        </SelectTrigger>
                        <SelectContent>
                          {allClients.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          className="bg-transparent flex-1"
                          onClick={() => handleEditRoutine(tpl)}
                        >
                          Editar
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem onClick={() => handleExportRoutineToExcel(tpl)}>
                              <FileText className="w-4 h-4 mr-2 text-green-500" />
                              Exportar como CSV
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {routineFolders
                              .filter((f) => f.id !== currentFolder?.id)
                              .map((folder) => (
                                <DropdownMenuItem
                                  key={folder.id}
                                  onClick={() => handleMoveTemplate(tpl.id, folder.id)}
                                >
                                  <ChevronRight className="w-4 h-4 mr-2" />
                                  Mover a: {folder.name}
                                </DropdownMenuItem>
                              ))}
                            {routineFolders.filter((f) => f.id !== currentFolder?.id).length > 0 && <DropdownMenuSeparator />}
                            <DropdownMenuItem
                              onClick={() => handleDeleteTemplate(tpl.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar rutina
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <Button className="hover:bg-orange-500 transition-colors">Enviar ahora</Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredTemplates.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">No hay plantillas en esta carpeta.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-card-foreground">Catálogo de ejercicios</CardTitle>
              <CardDescription>Gestiona tu biblioteca de ejercicios</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  setIsExerciseSelectorOpen(false)
                  setIsCreateExerciseDialogOpen(true)
                }}
                className="hover:bg-orange-500 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo ejercicio
              </Button>
              <Button variant="outline" onClick={() => setShowExerciseCatalog((prev) => !prev)}>
                {showExerciseCatalog ? "Ocultar" : "Mostrar"}
              </Button>
            </div>
          </div>
        </CardHeader>
        {showExerciseCatalog && (
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar ejercicios..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-1">
                <Select
                  value={exerciseFilter.category ?? "all"}
                  onValueChange={(v) =>
                    setExerciseFilter((prev) => ({ ...prev, category: v === "all" ? undefined : v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {Array.from(new Set(exercisesCatalog.map((e) => e.category || e.body_parts?.[0] || "")))
                      .filter(Boolean)
                      .map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-1">
                <Select
                  value={exerciseFilter.equipment ?? "all"}
                  onValueChange={(v) =>
                    setExerciseFilter((prev) => ({ ...prev, equipment: v === "all" ? undefined : v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Equipamiento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {Array.from(new Set(exercisesCatalog.flatMap((e) => e.equipments || [])))
                      .filter(Boolean)
                      .map((eq) => (
                        <SelectItem key={eq} value={eq}>
                          {eq}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              {exercisesCatalog
                .filter((e) => !catalogSearch || e.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                .filter(
                  (e) =>
                    !exerciseFilter.category ||
                    (e.category || e.body_parts?.[0] || "").toLowerCase() === exerciseFilter.category?.toLowerCase()
                )
                .filter(
                  (e) =>
                    !exerciseFilter.equipment ||
                    (e.equipments || []).some((eq) => eq.toLowerCase() === exerciseFilter.equipment?.toLowerCase())
                )
                .map((ex) => (
                  <div key={ex.id} className="p-3 rounded bg-muted/50 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-card-foreground">{ex.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {ex.target_muscles.join(", ")} • {ex.equipments.join(", ")}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => toast({ title: "Funcionalidad de editar ejercicio estará disponible próximamente" })}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toast({ title: "Funcionalidad de eliminar ejercicio estará disponible próximamente" })}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              {!loadingExercises && exercisesCatalog.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No se encontraron ejercicios. Agrega uno nuevo para comenzar.
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* ...dialogs like editor, viewer, exercise selector remain to be wired here later... */}
    </main>
  )
}
