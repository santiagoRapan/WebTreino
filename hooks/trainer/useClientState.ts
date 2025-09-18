"use client"

import { useState, Dispatch, SetStateAction } from "react"
import type { Client } from "@/types/trainer"

export interface UseClientStateReturn {
  // Client State
  editingClient: Client | null
  setEditingClient: Dispatch<SetStateAction<Client | null>>
  
  // Client Data (this would typically come from a database)
  clients: Client[]
  setClients: Dispatch<SetStateAction<Client[]>>
  
  // Computed helper for filtered clients
  getFilteredClients: (searchTerm: string, filter: "all" | "active" | "pending") => Client[]
}

export function useClientState(): UseClientStateReturn {
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  
  // Mock client data - in a real app, this would come from an API/database
  const [clients, setClients] = useState<Client[]>([
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
  ])

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
    getFilteredClients,
  }
}