"use client"

import { createContext, useContext, Dispatch, SetStateAction } from "react"
import type {
  CalendarEvent,
  Chat,
  Client,
  DashboardStat,
  EventFormState,
  Exercise,
  ExerciseFilterState,
  ExerciseFormState,
  ExerciseInputsState,
  RoutineFolder,
  RoutineTemplate,
  UpcomingSession,
  RecentClient,
} from "@/types/trainer"

export type PendingExerciseState = { exercise: Exercise; blockId: number } | null

export interface TrainerDashboardState {
  activeTab: string
  sidebarCollapsed: boolean
  theme: "dark" | "light"
  searchTerm: string
  clientFilter: "all" | "active" | "pending"
  isEditDialogOpen: boolean
  editingClient: Client | null
  expandedClientIds: Set<number>
  chatSearchTerm: string
  chatFilter: "all" | "unread" | "favorites"
  selectedChat: Chat | null
  chatMessage: string
  showEmojiPicker: boolean
  isNewClientDialogOpen: boolean
  isNewChatDialogOpen: boolean
  newChatSearchTerm: string
  showArchived: boolean
  isAddEventDialogOpen: boolean
  selectedEvent: CalendarEvent | null
  isEventDetailsOpen: boolean
  isCreateExerciseDialogOpen: boolean
  calendarEvents: CalendarEvent[]
  selectedDate: string
  currentMonth: number
  currentYear: number
  newEventForm: EventFormState
  newExerciseForm: ExerciseFormState
  exercisesCatalog: Exercise[]
  loadingExercises: boolean
  routineFolders: RoutineFolder[]
  selectedFolderId: number | null
  routineSearch: string
  exerciseFilter: ExerciseFilterState
  editingRoutine: RoutineTemplate | null
  isRoutineEditorOpen: boolean
  isExerciseSelectorOpen: boolean
  selectedBlockId: number | null
  exerciseSearchTerm: string
  expandedBlocks: Set<number>
  viewingRoutine: RoutineTemplate | null
  isRoutineViewerOpen: boolean
  showNewFolderInput: boolean
  newFolderName: string
  showExerciseCatalog: boolean
  catalogSearch: string
  restInput: string
  restBlockId: number | null
  exerciseInputs: ExerciseInputsState
  pendingExercise: PendingExerciseState
  showNewRoutineInput: boolean
  newRoutineName: string
  newBlockName: string
  chatConversations: Chat[]
}

export interface TrainerDashboardData {
  stats: DashboardStat[]
  upcomingSessions: UpcomingSession[]
  recentClients: RecentClient[]
  allClients: Client[]
  filteredClients: Client[]
  filteredChats: Chat[]
  dedupedNewChatResults: Client[]
  loadingClients: boolean
  clientsError: string | null
}

export interface TrainerDashboardActions {
  setActiveTab: Dispatch<SetStateAction<string>>
  setSidebarCollapsed: Dispatch<SetStateAction<boolean>>
  setTheme: Dispatch<SetStateAction<"dark" | "light">>
  setSearchTerm: Dispatch<SetStateAction<string>>
  setClientFilter: Dispatch<SetStateAction<"all" | "active" | "pending">>
  setIsEditDialogOpen: Dispatch<SetStateAction<boolean>>
  setEditingClient: Dispatch<SetStateAction<Client | null>>
  setExpandedClientIds: Dispatch<SetStateAction<Set<number>>>
  setChatSearchTerm: Dispatch<SetStateAction<string>>
  setChatFilter: Dispatch<SetStateAction<"all" | "unread" | "favorites">>
  setSelectedChat: Dispatch<SetStateAction<Chat | null>>
  setChatMessage: Dispatch<SetStateAction<string>>
  setShowEmojiPicker: Dispatch<SetStateAction<boolean>>
  setIsNewClientDialogOpen: Dispatch<SetStateAction<boolean>>
  setIsNewChatDialogOpen: Dispatch<SetStateAction<boolean>>
  setNewChatSearchTerm: Dispatch<SetStateAction<string>>
  setShowArchived: Dispatch<SetStateAction<boolean>>
  setIsAddEventDialogOpen: Dispatch<SetStateAction<boolean>>
  setSelectedEvent: Dispatch<SetStateAction<CalendarEvent | null>>
  setIsEventDetailsOpen: Dispatch<SetStateAction<boolean>>
  setIsCreateExerciseDialogOpen: Dispatch<SetStateAction<boolean>>
  setCalendarEvents: Dispatch<SetStateAction<CalendarEvent[]>>
  setSelectedDate: Dispatch<SetStateAction<string>>
  setCurrentMonth: Dispatch<SetStateAction<number>>
  setCurrentYear: Dispatch<SetStateAction<number>>
  setNewEventForm: Dispatch<SetStateAction<EventFormState>>
  setNewExerciseForm: Dispatch<SetStateAction<ExerciseFormState>>
  setExercisesCatalog: Dispatch<SetStateAction<Exercise[]>>
  setRoutineFolders: Dispatch<SetStateAction<RoutineFolder[]>>
  setSelectedFolderId: Dispatch<SetStateAction<number | null>>
  setRoutineSearch: Dispatch<SetStateAction<string>>
  setExerciseFilter: Dispatch<SetStateAction<ExerciseFilterState>>
  setEditingRoutine: Dispatch<SetStateAction<RoutineTemplate | null>>
  setIsRoutineEditorOpen: Dispatch<SetStateAction<boolean>>
  setIsExerciseSelectorOpen: Dispatch<SetStateAction<boolean>>
  setSelectedBlockId: Dispatch<SetStateAction<number | null>>
  setExerciseSearchTerm: Dispatch<SetStateAction<string>>
  setExpandedBlocks: Dispatch<SetStateAction<Set<number>>>
  setViewingRoutine: Dispatch<SetStateAction<RoutineTemplate | null>>
  setIsRoutineViewerOpen: Dispatch<SetStateAction<boolean>>
  setShowNewFolderInput: Dispatch<SetStateAction<boolean>>
  setNewFolderName: Dispatch<SetStateAction<string>>
  setShowExerciseCatalog: Dispatch<SetStateAction<boolean>>
  setCatalogSearch: Dispatch<SetStateAction<string>>
  setRestInput: Dispatch<SetStateAction<string>>
  setRestBlockId: Dispatch<SetStateAction<number | null>>
  setExerciseInputs: Dispatch<SetStateAction<ExerciseInputsState>>
  setPendingExercise: Dispatch<SetStateAction<PendingExerciseState>>
  setShowNewRoutineInput: Dispatch<SetStateAction<boolean>>
  setNewRoutineName: Dispatch<SetStateAction<string>>
  setNewBlockName: Dispatch<SetStateAction<string>>
  setChatConversations: Dispatch<SetStateAction<Chat[]>>
  handleEditClient: (client: Client) => void
  handleDeleteClient: (clientId: number) => void
  handleMarkAsActive: (clientId: number) => void
  handleViewHistory: (clientId: number) => void
  handleSendMessage: () => void
  handleEmojiPicker: () => void
  addEmoji: (emoji: string) => void
  handleStartChat: (client: Client) => void
  handleNewClient: () => void
  handleCreateRoutine: () => void
  handleScheduleAppointment: () => void
  handleScheduleSession: (clientId: number) => void
  handleRegisterPayment: () => void
  handleAddEvent: () => void
  handleCreateEvent: (eventData: EventFormState & { clientName?: string }) => void
  handleCreateExercise: () => void
  handleExportRoutineToPDF: (template: RoutineTemplate) => Promise<void>
  handleExportRoutineToExcel: (template: RoutineTemplate) => Promise<void>
  handleCreateFolder: () => void
  handleDeleteTemplate: (templateId: number | string) => void
  handleMoveTemplate: (templateId: number | string, targetFolderId: number) => void
  handleCreateTemplate: () => void
  handleAssignTemplateToClient: (template: RoutineTemplate, client: Client) => void
  assignRoutineToClient: (routineId: number | string, traineeId: number | string) => Promise<void>
  handleEditRoutine: (template: RoutineTemplate) => void
  handleAddBlock: () => void
  handleAddExerciseToBlock: (blockId: number) => void
  handleAddRest: (blockId: number) => void
  handleSelectExercise: (exercise: Exercise) => void
  confirmAddExercise: () => void
  cancelAddExercise: () => void
  handleSaveRoutine: () => void
  handleDeleteExercise: (blockId: number, exerciseIndex: number) => void
  handleDeleteBlock: (blockId: number) => void
  toggleBlockExpansion: (blockId: number) => void
  handleViewAllClients: () => void
  handleAddSession: () => void
  handleEventClick: (event: CalendarEvent) => void
  handleEditEvent: (event: CalendarEvent) => void
  handleDeleteEvent: (eventId: number) => void
  handleUpdateEvent: (eventData: EventFormState & { clientName?: string }) => void
  handleCompleteEvent: (eventId: number) => void
  handleGoToRoutines: (clientName: string) => void
  handleFileAttachment: () => void
  handleImageAttachment: () => void
  handleChatFromClient: (clientName: string) => void

}

export interface TrainerDashboardContextValue {
  state: TrainerDashboardState
  actions: TrainerDashboardActions
  data: TrainerDashboardData
}

const TrainerDashboardContext = createContext<TrainerDashboardContextValue | undefined>(
  undefined
)

export const TrainerDashboardProvider = TrainerDashboardContext.Provider

export function useTrainerDashboard() {
  const context = useContext(TrainerDashboardContext)
  if (!context) {
    throw new Error("useTrainerDashboard must be used within a TrainerDashboardProvider")
  }
  return context
}
