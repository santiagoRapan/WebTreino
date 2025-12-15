"use client"

import { createContext, useContext, Dispatch, SetStateAction } from "react"
import type { Client, DashboardStat, RecentClient } from "@/features/trainer/types"
import type {
  Exercise,
  ExerciseFilterState,
  ExerciseFormState,
  ExerciseInputsState,
  RoutineFolder,
  RoutineTemplate,
} from "@/features/routines/types"

export type PendingExerciseState = { exercise: Exercise; blockId: string } | null

export interface TrainerDashboardState {
  activeTab: string
  sidebarCollapsed: boolean
<<<<<<< HEAD
=======
  sidebarMobileOpen: boolean
  theme: "dark" | "light"
>>>>>>> agent2.0
  searchTerm: string
  clientFilter: "all" | "active" | "pending"
  isEditDialogOpen: boolean
  editingClient: Client | null
  expandedClientIds: Set<string>
  // chat removed
  isNewClientDialogOpen: boolean
  // History dialog
  isHistoryDialogOpen: boolean
  // chat dialog removed
  showArchived: boolean
  // calendar state removed
  isCreateExerciseDialogOpen: boolean
  // calendar state removed
  newExerciseForm: ExerciseFormState
  exercisesCatalog: Exercise[]
  loadingExercises: boolean
  routineFolders: RoutineFolder[]
  selectedFolderId: string | null
  routineSearch: string
  exerciseFilter: ExerciseFilterState
  editingRoutine: RoutineTemplate | null
  isRoutineEditorOpen: boolean
  isExerciseSelectorOpen: boolean
  exerciseSearchTerm: string
  viewingRoutine: RoutineTemplate | null
  isRoutineViewerOpen: boolean
  showNewFolderInput: boolean
  newFolderName: string
  showExerciseCatalog: boolean
  catalogSearch: string
  exerciseInputs: ExerciseInputsState
  pendingExercise: PendingExerciseState
  newRoutineName: string
  // chatConversations removed
  // history state
  historySessions: any[]
  historyLogs: any[]
}

export interface TrainerDashboardData {
  stats: DashboardStat[]
  recentClients: RecentClient[]
  allClients: Client[]
  filteredClients: Client[]
  // chat data removed
  loadingClients: boolean
  clientsError: string | null
}

export interface TrainerDashboardActions {
  setActiveTab: Dispatch<SetStateAction<string>>
  setSidebarCollapsed: Dispatch<SetStateAction<boolean>>
<<<<<<< HEAD
=======
  setSidebarMobileOpen: Dispatch<SetStateAction<boolean>>
  setTheme: Dispatch<SetStateAction<"dark" | "light">>
>>>>>>> agent2.0
  setSearchTerm: Dispatch<SetStateAction<string>>
  setClientFilter: Dispatch<SetStateAction<"all" | "active" | "pending">>
  setIsEditDialogOpen: Dispatch<SetStateAction<boolean>>
  setEditingClient: Dispatch<SetStateAction<Client | null>>
  setExpandedClientIds: Dispatch<SetStateAction<Set<string>>>
  // chat setters removed
  setIsNewClientDialogOpen: Dispatch<SetStateAction<boolean>>
  // History dialog setter
  setIsHistoryDialogOpen: Dispatch<SetStateAction<boolean>>
  // chat dialog setters removed
  setShowArchived: Dispatch<SetStateAction<boolean>>
  // calendar actions removed
  setIsCreateExerciseDialogOpen: Dispatch<SetStateAction<boolean>>
  // calendar actions removed
  setNewExerciseForm: Dispatch<SetStateAction<ExerciseFormState>>
  setExercisesCatalog: Dispatch<SetStateAction<Exercise[]>>
  setRoutineFolders: Dispatch<SetStateAction<RoutineFolder[]>>
  setSelectedFolderId: Dispatch<SetStateAction<string | null>>
  setRoutineSearch: Dispatch<SetStateAction<string>>
  setExerciseFilter: Dispatch<SetStateAction<ExerciseFilterState>>
  setEditingRoutine: Dispatch<SetStateAction<RoutineTemplate | null>>
  setIsRoutineEditorOpen: Dispatch<SetStateAction<boolean>>
  setIsExerciseSelectorOpen: Dispatch<SetStateAction<boolean>>
  setExerciseSearchTerm: Dispatch<SetStateAction<string>>
  setViewingRoutine: Dispatch<SetStateAction<RoutineTemplate | null>>
  setIsRoutineViewerOpen: Dispatch<SetStateAction<boolean>>
  setShowNewFolderInput: Dispatch<SetStateAction<boolean>>
  setNewFolderName: Dispatch<SetStateAction<string>>
  setShowExerciseCatalog: Dispatch<SetStateAction<boolean>>
  setCatalogSearch: Dispatch<SetStateAction<string>>
  setExerciseInputs: Dispatch<SetStateAction<ExerciseInputsState>>
  setPendingExercise: Dispatch<SetStateAction<PendingExerciseState>>
  setNewRoutineName: Dispatch<SetStateAction<string>>
  // setChatConversations removed
  // history setters
  setHistorySessions: Dispatch<SetStateAction<any[]>>
  setHistoryLogs: Dispatch<SetStateAction<any[]>>
  handleEditClient: (client: Client) => void
  handleDeleteClient: (clientId: string) => Promise<void>
  handleUpdateStatus: (client: Client, newStatus: "active" | "inactive" | "pending") => Promise<void>
  handleNewClient: () => void
  handleCreateRoutine: () => void
  // schedule handlers removed
  handleRegisterPayment: () => void
  // calendar handlers removed
  handleCreateExercise: () => Promise<void>
  handleExportRoutineToPDF: (template: RoutineTemplate) => Promise<void>
  handleExportRoutineToExcel: (template: RoutineTemplate) => Promise<void>
  handleCreateFolder: () => void
  handleDeleteTemplate: (templateId: number | string) => Promise<void>
  handleMoveTemplate: (templateId: number | string, targetFolderId: string | number) => void
  handleCreateTemplate: () => void
  handleAssignTemplateToClient: (template: RoutineTemplate, client: Client) => void
  assignRoutineToClient: (routineId: number | string, traineeId: number | string) => Promise<void>
  handleEditRoutine: (template: RoutineTemplate) => void
  handleAddExerciseToRoutine: () => void
  handleSelectExercise: (exercise: Exercise) => void
  confirmAddExercise: () => void
  cancelAddExercise: () => void
  clearPendingExercise: () => void
  handleSaveRoutine: () => Promise<void>
  handleDeleteExercise: (exerciseIndex: number) => void
  handleViewAllClients: () => void
  // calendar handlers removed
  handleGoToRoutines: (clientName: string) => void
  // chat handlers removed
  acceptLinkRequest: (client: Client) => Promise<void>
  rejectLinkRequest: (client: Client) => Promise<void>
  cancelLinkRequest: (client: Client) => Promise<void>
  openStudentHistory: (client: Client) => Promise<void>
  refreshClients: () => Promise<void>
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
