"use client"

import { useState, useEffect, Dispatch, SetStateAction } from "react"
import { useStudents } from "@/hooks/useStudents"
import type { Client } from "@/types/trainer"

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

// Fallback clients data if no students in database
const FALLBACK_CLIENTS: Client[] = [
  {
    id: 1,
    name: "María González",
    email: "maria.gonzalez@email.com",
    phone: "+34 612 345 678",
    status: "Activo",
    joinDate: "15 Ene 2024",
    lastSession: "2 días",
    nextSession: "Mañana 09:00",
    progress: 85,
    goal: "Pérdida de peso",
    avatar: "/fit-woman-outdoors.png",
    sessionsCompleted: 24,
    totalSessions: 30,
    plan: "Premium",
  },
  {
    id: 2,
    name: "Carlos Ruiz",
    email: "carlos.ruiz@email.com",
    phone: "+34 623 456 789",
    status: "Activo",
    joinDate: "20 Ene 2024",
    lastSession: "1 día",
    nextSession: "Hoy 16:00",
    progress: 72,
    goal: "Ganancia muscular",
    avatar: "/fit-man-gym.png",
    sessionsCompleted: 18,
    totalSessions: 24,
    plan: "Estándar",
  },
  {
    id: 3,
    name: "Ana López",
    email: "ana.lopez@email.com",
    phone: "+34 634 567 890",
    status: "Pendiente",
    joinDate: "25 Ene 2024",
    lastSession: "5 días",
    nextSession: "Pendiente",
    progress: 45,
    goal: "Tonificación",
    avatar: "/woman-workout.png",
    sessionsCompleted: 8,
    totalSessions: 12,
    plan: "Básico",
  },
]

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
        (filter === "active" && client.status === "Activo") ||
        (filter === "pending" && client.status === "Pendiente")

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