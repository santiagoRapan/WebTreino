"use client"

import { useState, useEffect } from "react"

export interface UseUIStateReturn {
  // Main UI State
  activeTab: string
  setActiveTab: (tab: string) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  theme: "dark" | "light"
  setTheme: (theme: "dark" | "light") => void
  
  // Search and Filter States
  searchTerm: string
  setSearchTerm: (term: string) => void
  clientFilter: "all" | "active" | "pending"
  setClientFilter: (filter: "all" | "active" | "pending") => void
  
  // Dialog States
  isEditDialogOpen: boolean
  setIsEditDialogOpen: (open: boolean) => void
  isNewClientDialogOpen: boolean
  setIsNewClientDialogOpen: (open: boolean) => void
  isNewChatDialogOpen: boolean
  setIsNewChatDialogOpen: (open: boolean) => void
  isAddEventDialogOpen: boolean
  setIsAddEventDialogOpen: (open: boolean) => void
  isEventDetailsOpen: boolean
  setIsEventDetailsOpen: (open: boolean) => void
  isCreateExerciseDialogOpen: boolean
  setIsCreateExerciseDialogOpen: (open: boolean) => void
  
  // UI Interaction States
  expandedClientIds: Set<number>
  setExpandedClientIds: (ids: Set<number>) => void
  showArchived: boolean
  setShowArchived: (show: boolean) => void
  showEmojiPicker: boolean
  setShowEmojiPicker: (show: boolean) => void
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