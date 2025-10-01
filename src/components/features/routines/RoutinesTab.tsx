"use client"

import { useMemo, useState, useRef, useCallback } from "react"
import { useTrainerDashboard } from "@/lib/context/TrainerDashboardContext"
import { useTranslation } from "@/lib/i18n/LanguageProvider"
import { useExerciseSearch } from "@/hooks/useExerciseSearch"
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
  const { t } = useTranslation()
  
  // Optimized exercise search hook for exercise selector dialog
  const exerciseSearch = useExerciseSearch({ 
    debounceMs: 300,
    pageSize: 50 
  })
  
  // Separate hook for exercise catalog
  const catalogExerciseSearch = useExerciseSearch({
    debounceMs: 300,
    pageSize: 50
  })
  
  const {
    state: {
      routineFolders,
      selectedFolderId,
      showNewFolderInput,
      newFolderName,
      showNewRoutineInput,
      newRoutineName,
      routineSearch,
      editingRoutine,
      isRoutineEditorOpen,
      isExerciseSelectorOpen,
      isCreateExerciseDialogOpen,
      selectedBlockId,
      expandedBlocks,
      showExerciseCatalog,
      catalogSearch,
      loadingExercises,
      restInput,
      restBlockId,
      exerciseInputs,
      pendingExercise,
      viewingRoutine,
      isRoutineViewerOpen,
      newExerciseForm,
      newBlockName,
    },
    data: { allClients, loadingClients, clientsError },
    actions: {
      setSelectedFolderId,
      setShowNewFolderInput,
      setNewFolderName,
      setShowNewRoutineInput,
      setNewRoutineName,
      setRoutineSearch,
      setEditingRoutine,
      setIsRoutineEditorOpen,
      setIsExerciseSelectorOpen,
      setIsCreateExerciseDialogOpen,
      setSelectedBlockId,
      setExpandedBlocks,
      setShowExerciseCatalog,
      setCatalogSearch,
      setRestInput,
      setRestBlockId,
      setExerciseInputs,
      setPendingExercise,
      setIsRoutineViewerOpen,
      setNewExerciseForm,
      handleCreateExercise,
      handleCreateFolder,
      handleDeleteTemplate,
      handleMoveTemplate,
      handleCreateTemplate,
      handleAssignTemplateToClient,
      assignRoutineToClient,
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
      setNewBlockName,
    },
  } = useTrainerDashboard()

  // Local state for expandable selectors
  const [showMusclesSelector, setShowMusclesSelector] = useState(false)
  const [showEquipmentSelector, setShowEquipmentSelector] = useState(false)
  
  // Estado para trackear asignaciones de clientes por rutina
  const [routineAssignments, setRoutineAssignments] = useState<Record<string, string>>({})

  // Scroll container refs for infinite scroll
  const exerciseListRef = useRef<HTMLDivElement>(null)
  const catalogListRef = useRef<HTMLDivElement>(null)

  // Handle scroll to load more exercises in dialog
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const scrollPercentage = (target.scrollTop + target.clientHeight) / target.scrollHeight
    
    // Load more when user scrolls to 80% of the content
    if (scrollPercentage > 0.8 && exerciseSearch.hasMore && !exerciseSearch.loading) {
      exerciseSearch.loadMore()
    }
  }, [exerciseSearch])

  // Handle scroll to load more exercises in catalog
  const handleCatalogScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const scrollPercentage = (target.scrollTop + target.clientHeight) / target.scrollHeight
    
    // Load more when user scrolls to 80% of the content
    if (scrollPercentage > 0.8 && catalogExerciseSearch.hasMore && !catalogExerciseSearch.loading) {
      catalogExerciseSearch.loadMore()
    }
  }, [catalogExerciseSearch])

  const currentFolder = routineFolders.find((f) => f.id === selectedFolderId) || routineFolders[0]
  const filteredTemplates = (currentFolder?.templates || []).filter((t) =>
    t.name.toLowerCase().includes(routineSearch.toLowerCase())
  )

  const [isSaving, setIsSaving] = useState(false);

  const saveRoutine = async () => {
    setIsSaving(true);
    try {
      await handleSaveRoutine();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="p-4 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{t('routines.title')}</h2>
          <p className="text-xs text-muted-foreground">{t('routines.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          {showNewFolderInput ? (
            <div className="flex gap-2 items-center">
              <Input
                type="text"
                placeholder={t('routines.placeholders.folderName')}
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
                {t('routines.actions.create')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewFolderInput(false)
                  setNewFolderName("")
                }}
              >
                {t('routines.actions.cancel')}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowNewFolderInput(true)}
              className="bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('routines.actions.newFolder')}
            </Button>
          )}
          {showNewRoutineInput ? (
            <div className="flex gap-2 items-center">
              <Input
                type="text"
                placeholder={t('routines.placeholders.routineName')}
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
                {t('routines.actions.create')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewRoutineInput(false)
                  setNewRoutineName("")
                }}
              >
                {t('routines.actions.cancel')}
              </Button>
            </div>
          ) : (
            <Button onClick={() => setShowNewRoutineInput(true)} className="hover:bg-orange-500 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              {t('routines.actions.newRoutine')}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-card border-border lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-card-foreground">Carpetas</CardTitle>
            <CardDescription>{t('routines.folders.description')}</CardDescription>
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
            <CardTitle className="text-card-foreground">{t('routines.templates.title')}: {currentFolder?.name}</CardTitle>
            <CardDescription>Selecciona o edita una rutina base</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('routines.placeholders.searchTemplates')}
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
                            {tpl.description || t('routines.templates.defaultDescription')}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        <div className="p-3 rounded border border-border bg-background/80 shadow-sm">
                          <p className="text-xs text-muted-foreground">Bloques</p>
                          <p className="text-lg font-semibold text-card-foreground">{tpl.blocks.length}</p>
                        </div>
                        <div className="p-3 rounded border border-border bg-background/80 shadow-sm">
                          <p className="text-xs text-muted-foreground">{t('routines.templates.totalExercises')}</p>
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
                        key={`${String(tpl.id)}:${routineAssignments[String(tpl.id)] ?? ''}`}
                        value={routineAssignments[String(tpl.id)] ?? undefined}
                        onValueChange={(clientId) => {
                          setRoutineAssignments(prev => ({
                            ...prev,
                            [String(tpl.id)]: clientId
                          }))
                          const client = allClients.find((c) => String(c.userId) === clientId)
                          if (client) {
                            handleAssignTemplateToClient(tpl, client)
                          }
                        }}
                      >
                        <SelectTrigger disabled={loadingClients}>
                          <SelectValue 
                            placeholder={
                              loadingClients 
                                ? t('routines.assignments.loadingStudents')
                                : clientsError 
                                  ? t('routines.assignments.errorLoadingStudents')
                                  : allClients.length === 0
                                    ? t('routines.assignments.noStudentsRegistered')
                                    : t('routines.assignments.assignToStudent')
                            } 
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingClients ? (
                            <SelectItem value="loading" disabled>
                              {t('routines.assignments.loadingStudents')}
                            </SelectItem>
                          ) : clientsError ? (
                            <SelectItem value="error" disabled>
                              Error: {clientsError}
                            </SelectItem>
                          ) : allClients.length === 0 ? (
                            <SelectItem value="empty" disabled>
                              {t('routines.assignments.noStudentsRegistered')}
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
                          onClick={() => handleEditRoutine(tpl)}
                        >
                          {t('routines.actions.edit')}
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
                              Exportar a Excel (XLSX)
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
                              {t('routines.actions.deleteRoutine')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <Button
                        className="hover:bg-orange-500 transition-colors"
                        title={typeof tpl.id === 'string' && tpl.id.startsWith('temp-') ? 'Guarda la rutina antes de enviarla' : undefined}
                        disabled={
                          !routineAssignments[String(tpl.id)] ||
                          (typeof tpl.id === 'string' && tpl.id.startsWith('temp-'))
                        }
                        onClick={async () => {
                          if (typeof tpl.id === 'string' && tpl.id.startsWith('temp-')) {
                            toast({
                              title: 'Rutina no guardada',
                              description: t('routines.assignments.saveBeforeSending'),
                              variant: 'destructive'
                            })
                            return
                          }
                          const selectedClientId = routineAssignments[String(tpl.id)]
                          if (selectedClientId) {
                            try {
                              await assignRoutineToClient(tpl.id, selectedClientId)
                              const selectedClient = allClients.find(c => String(c.userId) === selectedClientId)
                              toast({
                                title: 'Rutina enviada',
                                description: `La rutina "${tpl.name}" ha sido enviada a ${selectedClient?.name}.`,
                              })
                              setRoutineAssignments(prev => {
                                const next = { ...prev }
                                delete next[String(tpl.id)]
                                return next
                              })
                            } catch (error) {
                              console.error('Error al enviar rutina:', error)
                              toast({
                                title: 'Error',
                                description: 'No se pudo enviar la rutina. Inténtalo de nuevo.',
                                variant: 'destructive'
                              })
                            }
                          }
                        }}
                      >
                        {(() => {
                          if (typeof tpl.id === 'string' && tpl.id.startsWith('temp-')) {
                            return 'Guarda la rutina primero'
                          }
                          const selectedClientId = routineAssignments[String(tpl.id)]
                          const selectedClient = selectedClientId ? allClients.find(c => String(c.userId) === selectedClientId) : null
                          return selectedClient ? `${t('routines.assignments.sendTo')} ${selectedClient.name}` : t('routines.assignments.selectStudent')
                        })()}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredTemplates.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">{t('routines.templates.noTemplatesInFolder')}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-card-foreground">{t('routines.exercises.catalogTitle')}</CardTitle>
              <CardDescription>{t('routines.exercises.catalogDescription')}</CardDescription>
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
                {t('routines.exercises.newExercise')}
              </Button>
              <Button variant="outline" onClick={() => setShowExerciseCatalog((prev) => !prev)}>
                {showExerciseCatalog ? "Ocultar Catálogo" : "Mostrar Catálogo"}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Exercise Catalog with Infinite Scroll */}
        {showExerciseCatalog && (
          <CardContent className="space-y-4">
            {/* Search Bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('routines.exercises.searchPlaceholder')}
                  value={catalogExerciseSearch.searchTerm}
                  onChange={(e) => catalogExerciseSearch.setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-1">
                <Select
                  value={catalogExerciseSearch.category ?? "all"}
                  onValueChange={(v) =>
                    catalogExerciseSearch.setCategory(v === "all" ? undefined : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {catalogExerciseSearch.uniqueCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-1">
                <Select
                  value={catalogExerciseSearch.equipment ?? "all"}
                  onValueChange={(v) =>
                    catalogExerciseSearch.setEquipment(v === "all" ? undefined : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Equipamiento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los equipos</SelectItem>
                    {catalogExerciseSearch.uniqueEquipments.map((eq) => (
                      <SelectItem key={eq} value={eq}>
                        {eq}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Exercise List with Infinite Scroll */}
            <div 
              ref={catalogListRef}
              className="space-y-2 max-h-[500px] overflow-y-auto"
              onScroll={handleCatalogScroll}
            >
              {catalogExerciseSearch.exercises.map((ex) => (
                <div key={ex.id} className="p-3 rounded bg-muted/50 flex items-center justify-between hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                      {ex.gif_URL ? (
                        <img 
                          src={ex.gif_URL} 
                          alt={ex.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <Activity className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-card-foreground">{ex.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {ex.target_muscles.slice(0, 2).join(", ")} • {ex.equipments.slice(0, 2).join(", ")}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => toast({ title: t('routines.exercises.editFeatureSoon') })}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {t('routines.actions.edit')}
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

              {/* Loading indicator */}
              {catalogExerciseSearch.loading && (
                <div className="text-center py-4 text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                    Cargando más ejercicios...
                  </div>
                </div>
              )}

              {/* No results */}
              {!catalogExerciseSearch.loading && catalogExerciseSearch.exercises.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No se encontraron ejercicios</p>
                </div>
              )}

              {/* Load more hint */}
              {!catalogExerciseSearch.loading && catalogExerciseSearch.hasMore && catalogExerciseSearch.exercises.length > 0 && (
                <div className="text-center py-2 text-xs text-muted-foreground">
                  Haz scroll para cargar más ejercicios
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Create Exercise Dialog */}
      <Dialog open={isCreateExerciseDialogOpen} onOpenChange={setIsCreateExerciseDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('routines.dialogs.createExercise.title')}</DialogTitle>
            <DialogDescription>
              {t('routines.dialogs.createExercise.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Exercise Name */}
            <div className="space-y-2">
                            <Label htmlFor="exercise-name">{t('routines.forms.exerciseName')}</Label>
              <Input
                id="exercise-name"
                placeholder={t('routines.forms.exerciseNamePlaceholder')}
                value={newExerciseForm.name}
                onChange={(e) => setNewExerciseForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            {/* Target Muscles */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                                <Label>{t('routines.forms.targetMuscles')}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMusclesSelector(!showMusclesSelector)}
                >
                  {showMusclesSelector ? t('routines.actions.hide') : t('routines.actions.select')}
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showMusclesSelector ? "rotate-180" : ""}`} />
                </Button>
              </div>
              
              {/* Selected muscles display */}
              {newExerciseForm.target_muscles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newExerciseForm.target_muscles.map((muscle) => (
                    <Badge key={muscle} variant="secondary" className="text-xs">
                      {muscle}
                      <button
                        type="button"
                        onClick={() => setNewExerciseForm(prev => ({
                          ...prev,
                          target_muscles: prev.target_muscles.filter(m => m !== muscle)
                        }))}
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
                  {["Pectorales", "Bíceps", "Tríceps", "Dorsales", "Deltoides", "Cuádriceps", "Isquiotibiales", "Glúteos", "Gemelos", "Abdominales", "Lumbares", "Trapecio", "Romboides", "Antebrazos"].map((muscle) => (
                    <label key={muscle} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newExerciseForm.target_muscles.includes(muscle)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewExerciseForm(prev => ({
                              ...prev,
                              target_muscles: [...prev.target_muscles, muscle]
                            }))
                          } else {
                            setNewExerciseForm(prev => ({
                              ...prev,
                              target_muscles: prev.target_muscles.filter(m => m !== muscle)
                            }))
                          }
                        }}
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
                <Label>{t('routines.forms.equipment')}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEquipmentSelector(!showEquipmentSelector)}
                >
                  {showEquipmentSelector ? t('routines.actions.hide') : t('routines.actions.select')}
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showEquipmentSelector ? "rotate-180" : ""}`} />
                </Button>
              </div>
              
              {/* Selected equipment display */}
              {newExerciseForm.equipments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newExerciseForm.equipments.map((equipment) => (
                    <Badge key={equipment} variant="secondary" className="text-xs">
                      {equipment}
                      <button
                        type="button"
                        onClick={() => setNewExerciseForm(prev => ({
                          ...prev,
                          equipments: prev.equipments.filter(eq => eq !== equipment)
                        }))}
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
                  {["Barra", "Mancuernas", "Máquina", "Cable", "Peso Corporal", "Kettlebell", "Banda Elástica", "TRX", "Pelota Medicinal", "Bosu", "Foam Roller", "Ninguno"].map((equipment) => (
                    <label key={equipment} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newExerciseForm.equipments.includes(equipment)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewExerciseForm(prev => ({
                              ...prev,
                              equipments: [...prev.equipments, equipment]
                            }))
                          } else {
                            setNewExerciseForm(prev => ({
                              ...prev,
                              equipments: prev.equipments.filter(eq => eq !== equipment)
                            }))
                          }
                        }}
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
              <Label htmlFor="exercise-category">{t('routines.forms.category')}</Label>
              <Select
                value={newExerciseForm.category || ""}
                onValueChange={(value) => setNewExerciseForm(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('routines.forms.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fuerza">Fuerza</SelectItem>
                  <SelectItem value="Cardio">Cardio</SelectItem>
                  <SelectItem value="Flexibilidad">Flexibilidad</SelectItem>
                  <SelectItem value="Funcional">Funcional</SelectItem>
                  <SelectItem value="Rehabilitación">Rehabilitación</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="exercise-description">{t('routines.forms.description')}</Label>
              <Textarea
                id="exercise-description"
                placeholder={t('routines.forms.descriptionPlaceholder')}
                value={newExerciseForm.description || ""}
                onChange={(e) => setNewExerciseForm(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-24"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateExerciseDialogOpen(false)}
            >
              {t('routines.actions.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleCreateExercise}
              disabled={!newExerciseForm.name.trim() || newExerciseForm.target_muscles.length === 0 || newExerciseForm.equipments.length === 0}
            >
              {t('routines.actions.createExercise')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exercise Selector Dialog */}
      <Dialog open={isExerciseSelectorOpen} onOpenChange={setIsExerciseSelectorOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('routines.dialogs.selectExercise.title')}</DialogTitle>
            <DialogDescription>
              {t('routines.dialogs.selectExercise.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar ejercicios..."
                value={exerciseSearch.searchTerm}
                onChange={(e) => exerciseSearch.setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <Select
                value={exerciseSearch.category || "all-categories"}
                onValueChange={(value) => exerciseSearch.setCategory(value === "all-categories" ? undefined : value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-categories">Todas las categorías</SelectItem>
                  {exerciseSearch.uniqueCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={exerciseSearch.equipment || "all-equipments"}
                onValueChange={(value) => exerciseSearch.setEquipment(value === "all-equipments" ? undefined : value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por equipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-equipments">Todos los equipos</SelectItem>
                  {exerciseSearch.uniqueEquipments.map((eq) => (
                    <SelectItem key={eq} value={eq}>
                      {eq}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Exercise List with infinite scroll */}
            <div 
              ref={exerciseListRef}
              className="grid gap-3 max-h-96 overflow-y-auto"
              onScroll={handleScroll}
            >
              {exerciseSearch.exercises.map((exercise) => (
                <Card
                  key={exercise.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSelectExercise(exercise)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                        {exercise.gif_URL ? (
                          <img 
                            src={exercise.gif_URL} 
                            alt={exercise.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <Activity className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{exercise.name}</h4>
                        <div className="flex gap-2 mt-1">
                          {exercise.target_muscles?.slice(0, 2).map((muscle) => (
                            <Badge key={muscle} variant="secondary" className="text-xs">
                              {muscle}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {exercise.category || exercise.body_parts?.[0]}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Loading indicator */}
              {exerciseSearch.loading && (
                <div className="text-center py-4 text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                    Cargando más ejercicios...
                  </div>
                </div>
              )}

              {/* No results */}
              {!exerciseSearch.loading && exerciseSearch.exercises.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No se encontraron ejercicios</p>
                </div>
              )}

              {/* Load more hint */}
              {!exerciseSearch.loading && exerciseSearch.hasMore && exerciseSearch.exercises.length > 0 && (
                <div className="text-center py-2 text-xs text-muted-foreground">
                  Haz scroll para cargar más ejercicios
                </div>
              )}
            </div>

            {pendingExercise && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Configurar Ejercicio</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="sets">{t('routines.forms.sets')}</Label>
                    <Input
                      id="sets"
                      type="number"
                      placeholder="4"
                      value={exerciseInputs.sets}
                      onChange={(e) => setExerciseInputs(prev => ({ ...prev, sets: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reps">{t('routines.forms.repetitions')}</Label>
                    <Input
                      id="reps"
                      type="number"
                      placeholder="12"
                      value={exerciseInputs.reps}
                      onChange={(e) => setExerciseInputs(prev => ({ ...prev, reps: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rest">{t('routines.forms.rest')}</Label>
                    <Input
                      id="rest"
                      type="number"
                      placeholder="90"
                      value={exerciseInputs.restSec}
                      onChange={(e) => setExerciseInputs(prev => ({ ...prev, restSec: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={confirmAddExercise}
                    disabled={!exerciseInputs.sets || !exerciseInputs.reps || !exerciseInputs.restSec}
                    className="flex-1"
                  >
                    {t('routines.actions.confirmAdd')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={cancelAddExercise}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsExerciseSelectorOpen(false)}
            >
              {t('routines.actions.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Routine Editor Dialog */}
      <Dialog open={isRoutineEditorOpen} onOpenChange={setIsRoutineEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('routines.dialogs.editRoutine.title')}: {editingRoutine?.name}</DialogTitle>
            <DialogDescription>
              {t('routines.dialogs.editRoutine.description')}
            </DialogDescription>
          </DialogHeader>

          {editingRoutine && (
            <div className="space-y-4">
              {/* Routine Name */}
              <div className="space-y-2">
                <Label htmlFor="routine-name">{t('routines.forms.routineName')}</Label>
                <Input
                  id="routine-name"
                  value={editingRoutine.name}
                  onChange={(e) => setEditingRoutine({ ...editingRoutine, name: e.target.value })}
                  placeholder={t('routines.placeholders.routineName')}
                />
              </div>

              {/* Routine Description */}
              <div className="space-y-2">
                <Label htmlFor="routine-description">{t('routines.forms.routineDescription')}</Label>
                <Textarea
                  id="routine-description"
                  value={editingRoutine.description || ""}
                  onChange={(e) => setEditingRoutine({ ...editingRoutine, description: e.target.value })}
                  placeholder={t('routines.placeholders.routineDescription')}
                  className="min-h-20"
                />
              </div>

              {/* Blocks Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{t('routines.blocks.title')}</h3>
                </div>

                {/* Add Block Section */}
                <div className="flex gap-2 items-center">
                  <Input
                    value={newBlockName}
                    onChange={(e) => setNewBlockName(e.target.value)}
                    placeholder={t('routines.placeholders.newBlockName')}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleAddBlock}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                    disabled={!newBlockName.trim()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('routines.actions.addBlock')}
                  </Button>
                </div>

                {editingRoutine.blocks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay bloques de ejercicios</p>
                    <p className="text-sm">{t('routines.blocks.clickToStart')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {editingRoutine.blocks.map((block) => (
                      <Card key={block.id} className="border">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleBlockExpansion(block.id)}
                                className="p-1 h-auto"
                              >
                                {expandedBlocks.has(block.id) ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </Button>
                              <CardTitle className="text-base">{block.name}</CardTitle>
                              <Badge variant="outline" className="text-xs">
                                {block.exercises.length} ejercicio{block.exercises.length !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddExerciseToBlock(block.id)}
                                className="text-xs"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Ejercicio
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteBlock(block.id)}
                                className="text-xs text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        {expandedBlocks.has(block.id) && (
                          <CardContent className="pt-0">
                            {block.exercises.length === 0 ? (
                              <div className="text-center py-4 text-muted-foreground">
                                <p className="text-sm">{t('routines.blocks.noExercises')}</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {block.exercises.map((exercise, idx) => {
                                  // Try to find exercise in loaded exercises from search
                                  const exerciseData = exerciseSearch.exercises.find(e => 
                                    e.id.toString() === exercise.exerciseId.toString()
                                  );
                                  
                                  return (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                                    >
                                      <div className="flex-1">
                                        <p className="font-medium text-sm">
                                          {exerciseData?.name || `Ejercicio ID: ${exercise.exerciseId}`}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {exercise.sets} {t('routines.forms.sets').toLowerCase()} × {exercise.reps} {t('routines.forms.reps')} · {exercise.restSec}s {t('routines.forms.restShort')}
                                        </p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteExercise(block.id, idx)}
                                        className="text-red-600 hover:text-red-700 p-1 h-auto"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRoutineEditorOpen(false)}
            >
              {t('routines.actions.cancel')}
            </Button>
            <Button
              type="button"
              onClick={saveRoutine}
              className="bg-primary hover:bg-primary/90"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="loader mr-2"></span> {t('routines.actions.saving')}
                </>
              ) : (
                t('routines.actions.saveRoutine')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
