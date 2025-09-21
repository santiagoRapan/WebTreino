"use client"

import { createContext, useContext, Dispatch, SetStateAction } from "react"
import type {
  Client,
  DashboardStat,
  Exercise,
  ExerciseFilterState,
  ExerciseFormState,
  ExerciseInputsState,
  RoutineFolder,
  RoutineTemplate,
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
  setTheme: Dispatch<SetStateAction<"dark" | "light">>
  setSearchTerm: Dispatch<SetStateAction<string>>
  setClientFilter: Dispatch<SetStateAction<"all" | "active" | "pending">>
  setIsEditDialogOpen: Dispatch<SetStateAction<boolean>>
  setEditingClient: Dispatch<SetStateAction<Client | null>>
  setExpandedClientIds: Dispatch<SetStateAction<Set<number>>>
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
  // setChatConversations removed
  // history setters
  setHistorySessions: Dispatch<SetStateAction<any[]>>
  setHistoryLogs: Dispatch<SetStateAction<any[]>>
  handleEditClient: (client: Client) => void
  handleDeleteClient: (clientId: number) => void
  handleMarkAsActive: (clientId: number) => void
  handleNewClient: () => void
  handleCreateRoutine: () => void
  // schedule handlers removed
  handleRegisterPayment: () => void
  // calendar handlers removed
  handleCreateExercise: () => void
  handleExportRoutineToPDF: (template: RoutineTemplate) => Promise<void>
  handleExportRoutineToExcel: (template: RoutineTemplate) => Promise<void>
  handleCreateFolder: () => void
  handleDeleteTemplate: (templateId: number | string) => Promise<void>
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
  handleSaveRoutine: () => Promise<void>
  handleDeleteExercise: (blockId: number, exerciseIndex: number) => void
  handleDeleteBlock: (blockId: number) => void
  toggleBlockExpansion: (blockId: number) => void
  handleViewAllClients: () => void
  // calendar handlers removed
  handleGoToRoutines: (clientName: string) => void
  // chat handlers removed
  acceptLinkRequest: (client: Client) => Promise<void>
  rejectLinkRequest: (client: Client) => Promise<void>
  cancelLinkRequest: (client: Client) => Promise<void>
  openStudentHistory: (client: Client) => Promise<void>

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
