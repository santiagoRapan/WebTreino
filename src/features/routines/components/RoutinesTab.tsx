"use client"

import { useState } from "react"
import { useTrainerDashboard } from "@/lib/context/TrainerDashboardContext"
import { useTranslation } from "@/lib/i18n/LanguageProvider"
import { useExerciseSearch } from "@/features/exercises"
import { RoutinesHeader } from "./RoutinesHeader"
import { RoutinesFoldersList } from "./RoutinesFoldersList"
import { RoutinesTemplatesList } from "./RoutinesTemplatesList"
import { ExerciseCatalog } from "./ExerciseCatalog"
import { CreateExerciseDialog } from "./CreateExerciseDialog"
import { ExerciseSelectorDialog } from "./ExerciseSelectorDialog"
import { RoutineEditorDialog } from "./RoutineEditorDialog"

export function RoutinesTab() {
  const { t } = useTranslation()
  
  // Optimized exercise search hook for exercise selector dialog
  const exerciseSearch = useExerciseSearch({ 
    debounceMs: 300,
    pageSize: 50,
  })
  
  // Separate hook for exercise catalog
  const catalogExerciseSearch = useExerciseSearch({
    debounceMs: 300,
    pageSize: 50,
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
      expandedBlocks,
      showExerciseCatalog,
      exerciseInputs,
      pendingExercise,
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
      setShowExerciseCatalog,
      setExerciseInputs,
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
      confirmAddExercise,
      cancelAddExercise,
      handleSelectExercise,
      handleSaveRoutine,
      handleDeleteExercise,
      handleDeleteBlock,
      toggleBlockExpansion,
      handleExportRoutineToExcel,
      setNewBlockName,
    },
  } = useTrainerDashboard()

  const [isSaving, setIsSaving] = useState(false)

  const currentFolder = routineFolders.find((f) => f.id === selectedFolderId) || routineFolders[0]

  const saveRoutine = async () => {
    setIsSaving(true)
    try {
      await handleSaveRoutine()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="p-4 space-y-4">
      {/* Header Section */}
      <RoutinesHeader
        title={t("routines.title")}
        subtitle={t("routines.subtitle")}
        showNewFolderInput={showNewFolderInput}
        newFolderName={newFolderName}
        showNewRoutineInput={showNewRoutineInput}
        newRoutineName={newRoutineName}
        onFolderNameChange={setNewFolderName}
        onRoutineNameChange={setNewRoutineName}
        onCreateFolder={handleCreateFolder}
        onCreateRoutine={handleCreateTemplate}
        onToggleNewFolder={() => setShowNewFolderInput(true)}
        onToggleNewRoutine={() => setShowNewRoutineInput(true)}
        onCancelNewFolder={() => {
                  setShowNewFolderInput(false)
                  setNewFolderName("")
                }}
        onCancelNewRoutine={() => {
                  setShowNewRoutineInput(false)
                  setNewRoutineName("")
                }}
        translations={{
          newFolder: t("routines.actions.newFolder"),
          newRoutine: t("routines.actions.newRoutine"),
          create: t("routines.actions.create"),
          cancel: t("routines.actions.cancel"),
          folderPlaceholder: t("routines.placeholders.folderName"),
          routinePlaceholder: t("routines.placeholders.routineName"),
        }}
      />

      {/* Folders and Templates Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RoutinesFoldersList
          folders={routineFolders}
          selectedFolderId={selectedFolderId}
          onFolderSelect={(folderId) => setSelectedFolderId(folderId)}
          foldersTitle="Carpetas"
          foldersDescription={t("routines.folders.description")}
        />

        <RoutinesTemplatesList
          currentFolder={currentFolder}
          templates={currentFolder?.templates || []}
          allFolders={routineFolders}
          searchTerm={routineSearch}
          onSearchChange={setRoutineSearch}
          onEditRoutine={handleEditRoutine}
          onMoveTemplate={handleMoveTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          onExportToExcel={handleExportRoutineToExcel}
          onAssignToClient={handleAssignTemplateToClient}
          onSendToClient={assignRoutineToClient}
          allClients={allClients}
          loadingClients={loadingClients}
          clientsError={clientsError}
          translations={{
            templatesTitle: t("routines.templates.title"),
            templatesSubtitle: "Selecciona o edita una rutina base",
            searchPlaceholder: t("routines.placeholders.searchTemplates"),
            defaultDescription: t("routines.templates.defaultDescription"),
            blocks: "Bloques",
            totalExercises: t("routines.templates.totalExercises"),
            edit: t("routines.actions.edit"),
            exportExcel: "Exportar a Excel (XLSX)",
            moveToFolder: "Mover a",
            deleteRoutine: t("routines.actions.deleteRoutine"),
            assignToStudent: t("routines.assignments.assignToStudent"),
            sendTo: t("routines.assignments.sendTo"),
            selectStudent: t("routines.assignments.selectStudent"),
            saveBeforeSending: t("routines.assignments.saveBeforeSending"),
            loadingStudents: t("routines.assignments.loadingStudents"),
            errorLoadingStudents: t("routines.assignments.errorLoadingStudents"),
            noStudentsRegistered: t("routines.assignments.noStudentsRegistered"),
            noTemplatesInFolder: t("routines.templates.noTemplatesInFolder"),
          }}
        />
      </div>

      {/* Exercise Catalog Section */}
      <ExerciseCatalog
        showCatalog={showExerciseCatalog}
        onToggleCatalog={() => setShowExerciseCatalog((prev) => !prev)}
        onCreateExercise={() => {
                  setIsExerciseSelectorOpen(false)
                  setIsCreateExerciseDialogOpen(true)
                }}
        exerciseSearch={catalogExerciseSearch}
        translations={{
          catalogTitle: t("routines.exercises.catalogTitle"),
          catalogDescription: t("routines.exercises.catalogDescription"),
          newExercise: t("routines.exercises.newExercise"),
          hideCatalog: "Ocultar Catálogo",
          showCatalog: "Mostrar Catálogo",
          searchPlaceholder: t("routines.exercises.searchPlaceholder"),
          allCategories: "Todas las categorías",
          category: "Categoría",
          allEquipments: "Todos los equipos",
          equipment: "Equipamiento",
          edit: t("routines.actions.edit"),
          delete: "Eliminar",
          editFeatureSoon: t("routines.exercises.editFeatureSoon"),
          deleteFeatureSoon: "Funcionalidad de eliminar ejercicio estará disponible próximamente",
          loadingMore: "Cargando más ejercicios...",
          noResults: "No se encontraron ejercicios",
          scrollForMore: "Haz scroll para cargar más ejercicios",
        }}
      />

      {/* Create Exercise Dialog */}
      <CreateExerciseDialog
        open={isCreateExerciseDialogOpen}
        onOpenChange={setIsCreateExerciseDialogOpen}
        exerciseForm={newExerciseForm}
        onFormChange={setNewExerciseForm}
        onCreateExercise={handleCreateExercise}
        translations={{
          title: t("routines.dialogs.createExercise.title"),
          description: t("routines.dialogs.createExercise.description"),
          exerciseName: t("routines.forms.exerciseName"),
          exerciseNamePlaceholder: t("routines.forms.exerciseNamePlaceholder"),
          targetMuscles: t("routines.forms.targetMuscles"),
          equipment: t("routines.forms.equipment"),
          category: t("routines.forms.category"),
          selectCategory: t("routines.forms.selectCategory"),
          descriptionPlaceholder: t("routines.forms.descriptionPlaceholder"),
          cancel: t("routines.actions.cancel"),
          createExercise: t("routines.actions.createExercise"),
          select: t("routines.actions.select"),
          hide: t("routines.actions.hide"),
        }}
      />

      {/* Exercise Selector Dialog */}
      <ExerciseSelectorDialog
        open={isExerciseSelectorOpen}
        onOpenChange={setIsExerciseSelectorOpen}
        exerciseSearch={exerciseSearch}
        pendingExercise={pendingExercise}
        exerciseInputs={exerciseInputs}
        onExerciseInputsChange={setExerciseInputs}
        onSelectExercise={handleSelectExercise}
        onConfirmAdd={confirmAddExercise}
        onCancelAdd={cancelAddExercise}
        translations={{
          title: t("routines.dialogs.selectExercise.title"),
          description: t("routines.dialogs.selectExercise.description"),
          searchPlaceholder: "Buscar ejercicios...",
          filterByCategory: "Filtrar por categoría",
          allCategories: "Todas las categorías",
          filterByEquipment: "Filtrar por equipo",
          allEquipments: "Todos los equipos",
          configureExercise: "Configurar Ejercicio",
          sets: t("routines.forms.sets"),
          repetitions: t("routines.forms.repetitions"),
          rest: t("routines.forms.rest"),
          confirmAdd: t("routines.actions.confirmAdd"),
          cancel: "Cancelar",
          close: t("routines.actions.close"),
          loadingMore: "Cargando más ejercicios...",
          noResults: "No se encontraron ejercicios",
          scrollForMore: "Haz scroll para cargar más ejercicios",
        }}
      />

      {/* Routine Editor Dialog */}
      <RoutineEditorDialog
        open={isRoutineEditorOpen}
        onOpenChange={setIsRoutineEditorOpen}
        routine={editingRoutine}
        onRoutineChange={setEditingRoutine}
        newBlockName={newBlockName}
        onNewBlockNameChange={setNewBlockName}
        expandedBlocks={expandedBlocks}
        onToggleBlockExpansion={toggleBlockExpansion}
        onAddBlock={handleAddBlock}
        onDeleteBlock={handleDeleteBlock}
        onAddExerciseToBlock={handleAddExerciseToBlock}
        onDeleteExercise={handleDeleteExercise}
        onSaveRoutine={saveRoutine}
        isSaving={isSaving}
        exercises={exerciseSearch.exercises}
        translations={{
          title: t("routines.dialogs.editRoutine.title"),
          description: t("routines.dialogs.editRoutine.description"),
          routineName: t("routines.forms.routineName"),
          routineNamePlaceholder: t("routines.placeholders.routineName"),
          routineDescription: t("routines.forms.routineDescription"),
          routineDescriptionPlaceholder: t("routines.placeholders.routineDescription"),
          blocksTitle: t("routines.blocks.title"),
          newBlockNamePlaceholder: t("routines.placeholders.newBlockName"),
          addBlock: t("routines.actions.addBlock"),
          noBlocks: "No hay bloques de ejercicios",
          clickToStart: t("routines.blocks.clickToStart"),
          noExercises: t("routines.blocks.noExercises"),
          exercise: "Ejercicio",
          exercises: "ejercicio",
          sets: t("routines.forms.sets"),
          reps: t("routines.forms.reps"),
          restShort: t("routines.forms.restShort"),
          cancel: t("routines.actions.cancel"),
          saveRoutine: t("routines.actions.saveRoutine"),
          saving: t("routines.actions.saving"),
        }}
      />
    </main>
  )
}

