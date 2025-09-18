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
  isNewChatDialogOpen: boolean
  setIsNewChatDialogOpen: Dispatch<SetStateAction<boolean>>
  isAddEventDialogOpen: boolean
  setIsAddEventDialogOpen: Dispatch<SetStateAction<boolean>>
  isEventDetailsOpen: boolean
  setIsEventDetailsOpen: Dispatch<SetStateAction<boolean>>
  isCreateExerciseDialogOpen: boolean
  setIsCreateExerciseDialogOpen: Dispatch<SetStateAction<boolean>>
  
  // UI Interaction States
  expandedClientIds: Set<number>
  setExpandedClientIds: Dispatch<SetStateAction<Set<number>>>
  showArchived: boolean
  setShowArchived: Dispatch<SetStateAction<boolean>>
  showEmojiPicker: boolean
  setShowEmojiPicker: Dispatch<SetStateAction<boolean>>
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
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState<boolean>(false)
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState<boolean>(false)
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState<boolean>(false)
  const [isCreateExerciseDialogOpen, setIsCreateExerciseDialogOpen] = useState<boolean>(false)

  // UI Interaction States
  const [expandedClientIds, setExpandedClientIds] = useState<Set<number>>(new Set())
  const [showArchived, setShowArchived] = useState<boolean>(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false)

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
    isNewChatDialogOpen,
    setIsNewChatDialogOpen,
    isAddEventDialogOpen,
    setIsAddEventDialogOpen,
    isEventDetailsOpen,
    setIsEventDetailsOpen,
    isCreateExerciseDialogOpen,
    setIsCreateExerciseDialogOpen,
    expandedClientIds,
    setExpandedClientIds,
    showArchived,
    setShowArchived,
    showEmojiPicker,
    setShowEmojiPicker,
  }
}