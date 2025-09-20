"use client"

import { useTrainerDashboard } from "@/hooks/trainer/useTrainerDashboard"
import { TrainerDashboardProvider } from "./TrainerDashboardContext"
import { Sidebar } from "./Sidebar"
import { TrainerHeader } from "./TrainerHeader"
import { DashboardTab } from "./DashboardTab"
import { ClientsTab } from "./ClientsTab"
import { ScheduleTab } from "./ScheduleTab"
import { RoutinesTab } from "./RoutinesTab"
import { ChatTab } from "./ChatTab"
import { SettingsTab } from "./SettingsTab"

export default function TrainerDashboard() {
  // Use the master hook that provides all state and handlers
  const trainerData = useTrainerDashboard()

  // Create the context value that matches the existing interface
  const contextValue = {
    state: {
      // UI State
      activeTab: trainerData.activeTab,
      sidebarCollapsed: trainerData.sidebarCollapsed,
      theme: trainerData.theme,
      searchTerm: trainerData.searchTerm,
      clientFilter: trainerData.clientFilter,
      isEditDialogOpen: trainerData.isEditDialogOpen,
      isNewClientDialogOpen: trainerData.isNewClientDialogOpen,
      isNewChatDialogOpen: trainerData.isNewChatDialogOpen,
      isAddEventDialogOpen: trainerData.isAddEventDialogOpen,
      isEventDetailsOpen: trainerData.isEventDetailsOpen,
      isCreateExerciseDialogOpen: trainerData.isCreateExerciseDialogOpen,
      isHistoryDialogOpen: trainerData.isHistoryDialogOpen,
      expandedClientIds: trainerData.expandedClientIds,
      showArchived: trainerData.showArchived,
      showEmojiPicker: trainerData.showEmojiPicker,

      // Client State
      editingClient: trainerData.editingClient,

      // Chat State
      chatSearchTerm: trainerData.chatSearchTerm,
      chatFilter: trainerData.chatFilter,
      selectedChat: trainerData.selectedChat,
      chatMessage: trainerData.chatMessage,
      newChatSearchTerm: trainerData.newChatSearchTerm,
      chatConversations: trainerData.chatConversations,

      // Calendar State
      calendarEvents: trainerData.calendarEvents,
      selectedEvent: trainerData.selectedEvent,
      selectedDate: trainerData.selectedDate,
      currentMonth: trainerData.currentMonth,
      currentYear: trainerData.currentYear,
      newEventForm: trainerData.newEventForm,

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
      showNewRoutineInput: trainerData.showNewRoutineInput,
      newRoutineName: trainerData.newRoutineName,
      newBlockName: trainerData.newBlockName,
      historySessions: trainerData.historySessions,
      historyLogs: trainerData.historyLogs,
    },
    actions: {
      // UI Actions
      setActiveTab: trainerData.setActiveTab,
      setSidebarCollapsed: trainerData.setSidebarCollapsed,
      setTheme: trainerData.setTheme,
      setSearchTerm: trainerData.setSearchTerm,
      setClientFilter: trainerData.setClientFilter,
      setIsEditDialogOpen: trainerData.setIsEditDialogOpen,
      setIsNewClientDialogOpen: trainerData.setIsNewClientDialogOpen,
      setIsNewChatDialogOpen: trainerData.setIsNewChatDialogOpen,
      setIsAddEventDialogOpen: trainerData.setIsAddEventDialogOpen,
      setIsEventDetailsOpen: trainerData.setIsEventDetailsOpen,
      setIsCreateExerciseDialogOpen: trainerData.setIsCreateExerciseDialogOpen,
      setIsHistoryDialogOpen: trainerData.setIsHistoryDialogOpen,
      setExpandedClientIds: trainerData.setExpandedClientIds,
      setShowArchived: trainerData.setShowArchived,
      setShowEmojiPicker: trainerData.setShowEmojiPicker,

      // Client Actions
      setEditingClient: trainerData.setEditingClient,
      setClients: trainerData.setClients,
      acceptLinkRequest: trainerData.acceptLinkRequest,
      rejectLinkRequest: trainerData.rejectLinkRequest,
      cancelLinkRequest: trainerData.cancelLinkRequest,

      // Chat Actions
      setChatSearchTerm: trainerData.setChatSearchTerm,
      setChatFilter: trainerData.setChatFilter,
      setSelectedChat: trainerData.setSelectedChat,
      setChatMessage: trainerData.setChatMessage,
      setNewChatSearchTerm: trainerData.setNewChatSearchTerm,
      setChatConversations: trainerData.setChatConversations,

      // Calendar Actions
      setCalendarEvents: trainerData.setCalendarEvents,
      setSelectedEvent: trainerData.setSelectedEvent,
      setSelectedDate: trainerData.setSelectedDate,
      setCurrentMonth: trainerData.setCurrentMonth,
      setCurrentYear: trainerData.setCurrentYear,
      setNewEventForm: trainerData.setNewEventForm,

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
      setShowNewRoutineInput: trainerData.setShowNewRoutineInput,
      setNewRoutineName: trainerData.setNewRoutineName,
      setNewBlockName: trainerData.setNewBlockName,
      setHistorySessions: trainerData.setHistorySessions,
      setHistoryLogs: trainerData.setHistoryLogs,

      // All Handler Functions
      handleEditClient: trainerData.handleEditClient,
      handleDeleteClient: trainerData.handleDeleteClient,
      handleMarkAsActive: trainerData.handleMarkAsActive,
      handleNewClient: trainerData.handleNewClient,
      handleScheduleSession: trainerData.handleScheduleSession,
      handleViewAllClients: trainerData.handleViewAllClients,
      handleChatFromClient: trainerData.handleChatFromClient,
      acceptLinkRequest: trainerData.acceptLinkRequest,
      rejectLinkRequest: trainerData.rejectLinkRequest,
      cancelLinkRequest: trainerData.cancelLinkRequest,
      openStudentHistory: trainerData.openStudentHistory,

      handleSendMessage: trainerData.handleSendMessage,
      handleEmojiPicker: trainerData.handleEmojiPicker,
      addEmoji: trainerData.addEmoji,
      handleStartChat: trainerData.handleStartChat,
      handleFileAttachment: trainerData.handleFileAttachment,
      handleImageAttachment: trainerData.handleImageAttachment,

      handleAddEvent: trainerData.handleAddEvent,
      handleEventClick: trainerData.handleEventClick,
      handleEditEvent: trainerData.handleEditEvent,
      handleDeleteEvent: trainerData.handleDeleteEvent,
      handleCompleteEvent: trainerData.handleCompleteEvent,
      handleCreateEvent: trainerData.handleCreateEvent,
      handleUpdateEvent: trainerData.handleUpdateEvent,
      handleGoToRoutines: trainerData.handleGoToRoutines,
      handleAddSession: trainerData.handleAddSession,

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
      handleScheduleAppointment: trainerData.handleScheduleAppointment,
      handleRegisterPayment: trainerData.handleRegisterPayment,
    },
    data: {
      stats: trainerData.stats,
      upcomingSessions: trainerData.upcomingSessions,
      recentClients: trainerData.recentClients,
      allClients: trainerData.clients,
      filteredClients: trainerData.filteredClients,
      filteredChats: trainerData.filteredChats,
      dedupedNewChatResults: trainerData.dedupedNewChatResults,
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

          {/* Tab Content - Scrollable */}
          <div className="flex-1 overflow-auto">
            {trainerData.activeTab === "dashboard" && <DashboardTab />}
            {trainerData.activeTab === "clients" && <ClientsTab />}
            {trainerData.activeTab === "schedule" && <ScheduleTab />}
            {trainerData.activeTab === "routines" && <RoutinesTab />}
            {trainerData.activeTab === "chat" && <ChatTab />}
            {trainerData.activeTab === "settings" && <SettingsTab />}
          </div>
        </main>
      </div>
    </TrainerDashboardProvider>
  )
}