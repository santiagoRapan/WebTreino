"use client"

import { useState } from "react"
import type { Chat, ChatMessage } from "@/lib/types/trainer"

export interface UseChatStateReturn {
  // Chat State
  chatSearchTerm: string
  setChatSearchTerm: (term: string) => void
  chatFilter: "all" | "unread" | "favorites"
  setChatFilter: (filter: "all" | "unread" | "favorites") => void
  selectedChat: Chat | null
  setSelectedChat: (chat: Chat | null) => void
  chatMessage: string
  setChatMessage: (message: string) => void
  newChatSearchTerm: string
  setNewChatSearchTerm: (term: string) => void
  
  // Chat Data
  chatConversations: Chat[]
  setChatConversations: (conversations: Chat[]) => void
  
  // Computed helpers
  getFilteredChats: (searchTerm: string, filter: "all" | "unread" | "favorites") => Chat[]
}

export function useChatState(): UseChatStateReturn {
  const [chatSearchTerm, setChatSearchTerm] = useState<string>("")
  const [chatFilter, setChatFilter] = useState<"all" | "unread" | "favorites">("all")
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [chatMessage, setChatMessage] = useState<string>("")
  const [newChatSearchTerm, setNewChatSearchTerm] = useState<string>("")

  // Mock chat data - in a real app, this would come from an API/database
  const [chatConversations, setChatConversations] = useState<Chat[]>([
    {
      id: 1,
      clientId: 1,
      clientName: "María González",
      clientAvatar: "/fit-woman-outdoors.png",
      lastMessage: "¡Gracias por la rutina! Me está ayudando mucho",
      lastMessageTime: "10:30",
      unreadCount: 2,
      isOnline: true,
      isFavorite: true,
      messages: [
        { id: 1, message: "Hola, ¿cómo va todo?", timestamp: "2024-01-15T09:00:00Z", isTrainer: true, isRead: true },
        { id: 2, message: "¡Muy bien! Completé la rutina de ayer", timestamp: "2024-01-15T09:15:00Z", isTrainer: false, isRead: true },
        { id: 3, message: "¡Excelente! ¿Cómo te sentiste?", timestamp: "2024-01-15T09:16:00Z", isTrainer: true, isRead: true },
        { id: 4, message: "Un poco cansada pero muy bien. ¿Puedes enviarme la próxima rutina?", timestamp: "2024-01-15T09:30:00Z", isTrainer: false, isRead: true },
        { id: 5, message: "¡Claro! Te la envío ahora", timestamp: "2024-01-15T09:31:00Z", isTrainer: true, isRead: true },
        { id: 6, message: "¡Gracias por la rutina! Me está ayudando mucho", timestamp: "2024-01-15T10:30:00Z", isTrainer: false, isRead: false },
      ]
    },
    {
      id: 2,
      clientId: 2,
      clientName: "Carlos Ruiz",
      clientAvatar: "/fit-man-gym.png",
      lastMessage: "¿Podemos cambiar el horario de mañana?",
      lastMessageTime: "Ayer",
      unreadCount: 0,
      isOnline: false,
      isFavorite: false,
      messages: [
        { id: 1, message: "Hola Carlos, ¿cómo va el entrenamiento?", timestamp: "2024-01-14T14:00:00Z", isTrainer: true, isRead: true },
        { id: 2, message: "Muy bien, pero tengo una consulta", timestamp: "2024-01-14T14:15:00Z", isTrainer: false, isRead: true },
        { id: 3, message: "¿Podemos cambiar el horario de mañana?", timestamp: "2024-01-14T14:16:00Z", isTrainer: false, isRead: true },
      ]
    },
  ])

  const getFilteredChats = (searchTerm: string, filter: "all" | "unread" | "favorites"): Chat[] => {
    const normalizeText = (text: string) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    const normalizedSearchTerm = normalizeText(searchTerm)
    
    return chatConversations.filter((chat) => {
      const matchesSearch = normalizeText(chat.clientName).includes(normalizedSearchTerm) ||
        normalizeText(chat.lastMessage).includes(normalizedSearchTerm)

      const matchesFilter =
        filter === "all" ||
        (filter === "unread" && chat.unreadCount > 0) ||
        (filter === "favorites" && chat.isFavorite)

      return matchesSearch && matchesFilter
    })
  }

  return {
    chatSearchTerm,
    setChatSearchTerm,
    chatFilter,
    setChatFilter,
    selectedChat,
    setSelectedChat,
    chatMessage,
    setChatMessage,
    newChatSearchTerm,
    setNewChatSearchTerm,
    chatConversations,
    setChatConversations,
    getFilteredChats,
  }
}