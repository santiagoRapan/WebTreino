"use client"

import { useState, useEffect, Dispatch, SetStateAction } from "react"

export interface UseUIStateReturn {
  // Main UI State
  activeTab: string
  setActiveTab: Dispatch<SetStateAction<string>>
  sidebarCollapsed: boolean
  setSidebarCollapsed: Dispatch<SetStateAction<boolean>>
  theme: "dark" | "light"
  setTheme: Dispatch<SetStateAction<"dark" | "light">>
  
  // Search and Filter States
  searchTerm: string
  setSearchTerm: Dispatch<SetStateAction<string>>
  clientFilter: "all" | "active" | "pending"
  setClientFilter: Dispatch<SetStateAction<"all" | "active" | "pending">>
  
  // Dialog States
  isEditDialogOpen: boolean
  setIsEditDialogOpen: Dispatch<SetStateAction<boolean>>
  isNewClientDialogOpen: boolean
  setIsNewClientDialogOpen: Dispatch<SetStateAction<boolean>>
  // chat dialog removed
  // calendar dialogs removed
  isCreateExerciseDialogOpen: boolean
  setIsCreateExerciseDialogOpen: Dispatch<SetStateAction<boolean>>
  // History dialog
  isHistoryDialogOpen: boolean
  setIsHistoryDialogOpen: Dispatch<SetStateAction<boolean>>
  
  // UI Interaction States
  expandedClientIds: Set<number>
  setExpandedClientIds: Dispatch<SetStateAction<Set<number>>>
  showArchived: boolean
  setShowArchived: Dispatch<SetStateAction<boolean>>
  // emoji picker removed (chat)
}

export function useUIState(): UseUIStateReturn {
  // Main UI State
  const [activeTab, setActiveTab] = useState<string>("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false)
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [clientFilter, setClientFilter] = useState<"all" | "active" | "pending">("all")

  // Dialog States
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false)
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState<boolean>(false)
  // chat dialog state removed
  // calendar dialogs removed
  const [isCreateExerciseDialogOpen, setIsCreateExerciseDialogOpen] = useState<boolean>(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState<boolean>(false)

  // UI Interaction States
  const [expandedClientIds, setExpandedClientIds] = useState<Set<number>>(new Set())
  const [showArchived, setShowArchived] = useState<boolean>(false)
  // emoji picker state removed

  // Theme Effect
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.remove("light")
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
      document.documentElement.classList.add("light")
    }
  }, [theme])

  return {
    activeTab,
    setActiveTab,
    sidebarCollapsed,
    setSidebarCollapsed,
    theme,
    setTheme,
    searchTerm,
    setSearchTerm,
    clientFilter,
    setClientFilter,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isNewClientDialogOpen,
    setIsNewClientDialogOpen,
  // chat dialog removed
    // calendar dialogs removed
    isCreateExerciseDialogOpen,
    setIsCreateExerciseDialogOpen,
    isHistoryDialogOpen,
    setIsHistoryDialogOpen,
    expandedClientIds,
    setExpandedClientIds,
    showArchived,
    setShowArchived,
    // emoji picker removed
  }
}