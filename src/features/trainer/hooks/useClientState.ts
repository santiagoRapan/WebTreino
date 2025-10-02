"use client"

import { useState, useEffect, Dispatch, SetStateAction } from "react"
import { useStudents } from "@/features/students"
import type { Client } from "../types"

export interface UseClientStateReturn {
  // Client State
  editingClient: Client | null
  setEditingClient: Dispatch<SetStateAction<Client | null>>
  
  // Client Data (loaded from database)
  clients: Client[]
  setClients: Dispatch<SetStateAction<Client[]>>
  loadingClients: boolean
  clientsError: string | null
  refreshClients: () => Promise<void>
  
  // Computed helper for filtered clients
  getFilteredClients: (searchTerm: string, filter: "all" | "active" | "pending") => Client[]
  // data loaders
  fetchStudentSessions: (studentId: string) => Promise<{ sessions: any[]; logs: any[] }>
  // History state
  historySessions: any[]
  setHistorySessions: Dispatch<SetStateAction<any[]>>
  historyLogs: any[]
  setHistoryLogs: Dispatch<SetStateAction<any[]>>
}

// Removed fallback clients: client list now always reflects database state

export function useClientState(): UseClientStateReturn {
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [historySessions, setHistorySessions] = useState<any[]>([])
  const [historyLogs, setHistoryLogs] = useState<any[]>([])
  
  // Use real students data from database
  const { students, loading: loadingClients, error: clientsError, refreshStudents, fetchStudentSessions } = useStudents()
  const [clients, setClients] = useState<Client[]>([])

  // Update clients when students are loaded
  useEffect(() => {
    // Always use database-driven list (roster + pending). No global fallback.
    setClients(students)
  }, [students, loadingClients])

  const getFilteredClients = (searchTerm: string, filter: "all" | "active" | "pending"): Client[] => {
    const normalizeText = (text: string) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    const normalizedSearchTerm = normalizeText(searchTerm)
    
    return clients.filter((client) => {
      const matchesSearch = normalizeText(client.name).includes(normalizedSearchTerm) ||
        normalizeText(client.email).includes(normalizedSearchTerm) ||
        normalizeText(client.goal).includes(normalizedSearchTerm)

      const matchesFilter = 
        filter === "all" ||
        (filter === "active" && client.status === "active") ||
        (filter === "pending" && client.status === "pending")

      return matchesSearch && matchesFilter
    })
  }

  return {
    editingClient,
    setEditingClient,
    clients,
    setClients,
    loadingClients,
    clientsError,
    refreshClients: refreshStudents,
    getFilteredClients,
    fetchStudentSessions,
    historySessions,
    setHistorySessions,
    historyLogs,
    setHistoryLogs,
  }
}