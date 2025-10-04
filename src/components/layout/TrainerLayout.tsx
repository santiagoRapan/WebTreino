"use client"

import { useTrainerDashboard } from "@/hooks/trainer/useTrainerDashboard"
import { TrainerDashboardProvider } from "@/lib/context/TrainerDashboardContext"
import { Sidebar } from "./Sidebar"
import { TrainerHeader } from "./TrainerHeader"

interface TrainerLayoutProps {
  children: React.ReactNode
}

export function TrainerLayout({ children }: TrainerLayoutProps) {
  // Use the master hook that provides all state and handlers
  const trainerData = useTrainerDashboard()

  // Create the context value that matches the existing interface
  const contextValue = {
    state: {
      // UI State
      activeTab: trainerData.activeTab,
      sidebarCollapsed: trainerData.sidebarCollapsed,
      searchTerm: trainerData.searchTerm,
      clientFilter: trainerData.clientFilter,
      isEditDialogOpen: trainerData.isEditDialogOpen,
      isNewClientDialogOpen: trainerData.isNewClientDialogOpen,
      isCreateExerciseDialogOpen: trainerData.isCreateExerciseDialogOpen,
      isHistoryDialogOpen: trainerData.isHistoryDialogOpen,
      expandedClientIds: trainerData.expandedClientIds,
      showArchived: trainerData.showArchived,

      // Client State
      editingClient: trainerData.editingClient,

      // Routine State
      newExerciseForm: trainerData.newExerciseForm,
      exercisesCatalog: trainerData.exercisesCatalog,
      loadingExercises: trainerData.loadingExercises,
      routineFolders: trainerData.routineFolders,
      selectedFolderId: trainerData.selectedFolderId,
      routineSearch: trainerData.routineSearch,
      exerciseFilter: trainerData.exerciseFilter,
      editingRoutine: trainerData.editingRoutine,
      isRoutineEditorOpen: trainerData.isRoutineEditorOpen,
      isExerciseSelectorOpen: trainerData.isExerciseSelectorOpen,
      selectedBlockId: trainerData.selectedBlockId,
      exerciseSearchTerm: trainerData.exerciseSearchTerm,
      expandedBlocks: trainerData.expandedBlocks,
      viewingRoutine: trainerData.viewingRoutine,
      isRoutineViewerOpen: trainerData.isRoutineViewerOpen,
      showNewFolderInput: trainerData.showNewFolderInput,
      newFolderName: trainerData.newFolderName,
      showExerciseCatalog: trainerData.showExerciseCatalog,
      catalogSearch: trainerData.catalogSearch,
      restInput: trainerData.restInput,
      restBlockId: trainerData.restBlockId,
      exerciseInputs: trainerData.exerciseInputs,
      pendingExercise: trainerData.pendingExercise,
      newRoutineName: trainerData.newRoutineName,
      newBlockName: trainerData.newBlockName,
      historySessions: trainerData.historySessions,
      historyLogs: trainerData.historyLogs,
    },
    actions: {
      // UI Actions
      setActiveTab: trainerData.setActiveTab,
      setSidebarCollapsed: trainerData.setSidebarCollapsed,
      setSearchTerm: trainerData.setSearchTerm,
      setClientFilter: trainerData.setClientFilter,
      setIsEditDialogOpen: trainerData.setIsEditDialogOpen,
      setIsNewClientDialogOpen: trainerData.setIsNewClientDialogOpen,
      setIsCreateExerciseDialogOpen: trainerData.setIsCreateExerciseDialogOpen,
      setIsHistoryDialogOpen: trainerData.setIsHistoryDialogOpen,
      setExpandedClientIds: trainerData.setExpandedClientIds,
      setShowArchived: trainerData.setShowArchived,

      // Client Actions
      setEditingClient: trainerData.setEditingClient,
      setClients: trainerData.setClients,
      acceptLinkRequest: trainerData.acceptLinkRequest,
      rejectLinkRequest: trainerData.rejectLinkRequest,
      cancelLinkRequest: trainerData.cancelLinkRequest,

      // Routine Actions
      setNewExerciseForm: trainerData.setNewExerciseForm,
      setExercisesCatalog: trainerData.setExercisesCatalog,
      setRoutineFolders: trainerData.setRoutineFolders,
      setSelectedFolderId: trainerData.setSelectedFolderId,
      setRoutineSearch: trainerData.setRoutineSearch,
      setExerciseFilter: trainerData.setExerciseFilter,
      setEditingRoutine: trainerData.setEditingRoutine,
      setIsRoutineEditorOpen: trainerData.setIsRoutineEditorOpen,
      setIsExerciseSelectorOpen: trainerData.setIsExerciseSelectorOpen,
      setSelectedBlockId: trainerData.setSelectedBlockId,
      setExerciseSearchTerm: trainerData.setExerciseSearchTerm,
      setExpandedBlocks: trainerData.setExpandedBlocks,
      setViewingRoutine: trainerData.setViewingRoutine,
      setIsRoutineViewerOpen: trainerData.setIsRoutineViewerOpen,
      setShowNewFolderInput: trainerData.setShowNewFolderInput,
      setNewFolderName: trainerData.setNewFolderName,
      setShowExerciseCatalog: trainerData.setShowExerciseCatalog,
      setCatalogSearch: trainerData.setCatalogSearch,
      setRestInput: trainerData.setRestInput,
      setRestBlockId: trainerData.setRestBlockId,
      setExerciseInputs: trainerData.setExerciseInputs,
      setPendingExercise: trainerData.setPendingExercise,
      setNewRoutineName: trainerData.setNewRoutineName,
      setNewBlockName: trainerData.setNewBlockName,
      setHistorySessions: trainerData.setHistorySessions,
      setHistoryLogs: trainerData.setHistoryLogs,

      // All Handler Functions
      handleEditClient: trainerData.handleEditClient,
      handleDeleteClient: trainerData.handleDeleteClient,
      handleMarkAsActive: trainerData.handleMarkAsActive,
      handleNewClient: trainerData.handleNewClient,
      handleViewAllClients: trainerData.handleViewAllClients,
      openStudentHistory: trainerData.openStudentHistory,

      handleCreateRoutine: trainerData.handleCreateRoutine,
      handleCreateExercise: trainerData.handleCreateExercise,
      handleCreateFolder: trainerData.handleCreateFolder,
      handleDeleteTemplate: trainerData.handleDeleteTemplate,
      handleMoveTemplate: trainerData.handleMoveTemplate,
      handleCreateTemplate: trainerData.handleCreateTemplate,
      handleAssignTemplateToClient: trainerData.handleAssignTemplateToClient,
      assignRoutineToClient: trainerData.assignRoutineToClient,
      handleEditRoutine: trainerData.handleEditRoutine,
      handleAddBlock: trainerData.handleAddBlock,
      handleAddExerciseToBlock: trainerData.handleAddExerciseToBlock,
      handleAddRest: trainerData.handleAddRest,
      handleSelectExercise: trainerData.handleSelectExercise,
      confirmAddExercise: trainerData.confirmAddExercise,
      cancelAddExercise: trainerData.cancelAddExercise,
      handleSaveRoutine: trainerData.handleSaveRoutine,
      handleDeleteExercise: trainerData.handleDeleteExercise,
      handleDeleteBlock: trainerData.handleDeleteBlock,
      toggleBlockExpansion: trainerData.toggleBlockExpansion,
      handleExportRoutineToPDF: trainerData.handleExportRoutineToPDF,
      handleExportRoutineToExcel: trainerData.handleExportRoutineToExcel,
      
      // Additional context handlers
      handleRegisterPayment: trainerData.handleRegisterPayment,
    },
    data: {
      stats: trainerData.stats,
      recentClients: trainerData.recentClients,
      allClients: trainerData.clients,
      filteredClients: trainerData.filteredClients,
      loadingClients: trainerData.loadingClients,
      clientsError: trainerData.clientsError,
    },
  }

  return (
    <TrainerDashboardProvider value={contextValue as any}>
      <div className="h-screen w-full bg-background">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area - Positioned to account for fixed sidebar */}
        <main className={`${trainerData.sidebarCollapsed ? "ml-20" : "ml-64"} transition-all duration-300 h-full flex flex-col`}>
          {/* Header - Full Width of main area */}
          <TrainerHeader />

          {/* Page Content - Scrollable */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </TrainerDashboardProvider>
  )
}
