"use client"

import { useState, useEffect } from "react"
import {
  BarChart3,
  Users,
  Calendar,
  Activity,
  DollarSign,
  MessageSquare,
  Settings,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Phone,
  CalendarIcon,
  UserCheck,
  FileText,
  ChevronRight,
  ChevronDown,
  Sun,
  Moon,
  Dumbbell,
  Check,
  CheckCheck,
  Send,
  Paperclip,
  ImageIcon,
  Smile,
  Mic,
  Video,
  Star,
  VolumeX,
  User,
  Archive,
  X,
  TrendingUp,
  Bell,
  Target,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Types
type Client = {
  id: number
  name: string
  email: string
  phone: string
  status: "Activo" | "Pendiente" | "Inactivo"
  joinDate: string
  lastSession: string
  nextSession: string
  progress: number
  goal: string
  avatar: string
  sessionsCompleted: number
  totalSessions: number
  plan: string
}

type ChatMessage = {
  id: number
  message: string
  timestamp: string
  isTrainer: boolean
  isRead: boolean
  senderId?: number | "trainer"
  senderName?: string
}

type Chat = {
  id: number
  clientId: number
  clientName: string
  clientAvatar: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isOnline: boolean
  messages: ChatMessage[]
  isFavorite?: boolean
  isArchived?: boolean
}

// Routines types
type Exercise = {
  id: number
  name: string
  category: "Tren superior" | "Tren inferior" | "Core" | "Cardio"
  equipment: "Máquinas" | "Pesas" | "Bandas" | "Sin elementos"
  description?: string
}

type RoutineBlock = {
  id: number
  name: string
  exercises: {
    exerciseId: number
    sets: number
    reps: number
    restSec: number
  }[]
  repetitions: number
  restBetweenRepetitions: number
  restAfterBlock: number
}

type RoutineTemplate = {
  id: number
  name: string
  description?: string
  blocks: RoutineBlock[]
}

type RoutineFolder = {
  id: number
  name: string
  templates: RoutineTemplate[]
}

export default function TrainerDashboard() {
  const [activeTab, setActiveTab] = useState<string>("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false)
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.remove("light")
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
      document.documentElement.classList.add("light")
    }
  }, [theme])

  const [searchTerm, setSearchTerm] = useState<string>("")
  const [clientFilter, setClientFilter] = useState<"all" | "active" | "pending">("all")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [expandedClientIds, setExpandedClientIds] = useState<Set<number>>(new Set())
  const [chatSearchTerm, setChatSearchTerm] = useState<string>("")
  const [chatFilter, setChatFilter] = useState<"all" | "unread" | "favorites">("all")
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [chatMessage, setChatMessage] = useState<string>("")
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false)
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState<boolean>(false)
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState<boolean>(false)
  const [newChatSearchTerm, setNewChatSearchTerm] = useState<string>("")
  const [showArchived, setShowArchived] = useState<boolean>(false)

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
  }

  const upcomingSessions = [
    {
      id: 1,
      client: "María González",
      time: "09:00",
      type: "Entrenamiento Personal",
      avatar: "/fit-woman-outdoors.png",
    },
    { id: 2, client: "Carlos Ruiz", time: "10:30", type: "Rutina de Fuerza", avatar: "/fit-man-gym.png" },
    { id: 3, client: "Ana López", time: "14:00", type: "Cardio + Tonificación", avatar: "/woman-workout.png" },
  ]

  const allClients: Client[] = [
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
      joinDate: "8 Feb 2024",
      lastSession: "1 día",
      nextSession: "Hoy 10:30",
      progress: 92,
      goal: "Ganancia muscular",
      avatar: "/fit-man-gym.png",
      sessionsCompleted: 18,
      totalSessions: 20,
      plan: "Básico",
    },
    {
      id: 3,
      name: "Ana López",
      email: "ana.lopez@email.com",
      phone: "+34 634 567 890",
      status: "Pendiente",
      joinDate: "22 Mar 2024",
      lastSession: "5 días",
      nextSession: "Por agendar",
      progress: 67,
      goal: "Tonificación",
      avatar: "/woman-workout.png",
      sessionsCompleted: 12,
      totalSessions: 16,
      plan: "Premium",
    },
    {
      id: 4,
      name: "Luis Martín",
      email: "luis.martin@email.com",
      phone: "+34 645 678 901",
      status: "Activo",
      joinDate: "5 Abr 2024",
      lastSession: "1 día",
      nextSession: "Mañana 16:00",
      progress: 78,
      goal: "Resistencia",
      avatar: "/man-gym.png",
      sessionsCompleted: 15,
      totalSessions: 20,
      plan: "Básico",
    },
    {
      id: 5,
      name: "Carmen Silva",
      email: "carmen.silva@email.com",
      phone: "+34 656 789 012",
      status: "Activo",
      joinDate: "12 May 2024",
      lastSession: "3 días",
      nextSession: "Viernes 11:00",
      progress: 73,
      goal: "Rehabilitación",
      avatar: "/fit-woman-outdoors.png",
      sessionsCompleted: 8,
      totalSessions: 12,
      plan: "Premium",
    },
    {
      id: 6,
      name: "Diego Morales",
      email: "diego.morales@email.com",
      phone: "+34 667 890 123",
      status: "Inactivo",
      joinDate: "28 Jun 2024",
      lastSession: "2 semanas",
      nextSession: "Sin agendar",
      progress: 45,
      goal: "Pérdida de peso",
      avatar: "/fit-man-gym.png",
      sessionsCompleted: 6,
      totalSessions: 16,
      plan: "Básico",
    },
  ]

  const filteredClients = allClients.filter((client: Client) => {
    const normalizedSearchTerm = normalizeText(searchTerm)
    const normalizedName = normalizeText(client.name)
    const normalizedEmail = normalizeText(client.email)

    const matchesText =
      normalizedName.includes(normalizedSearchTerm) || normalizedEmail.includes(normalizedSearchTerm)

    const matchesStatus =
      clientFilter === "all" ||
      (clientFilter === "active" && client.status === "Activo") ||
      (clientFilter === "pending" && client.status === "Pendiente")

    return matchesText && matchesStatus
  })

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setIsEditDialogOpen(true)
  }

  const handleDeleteClient = (clientId: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
      console.log("[v0] Deleting client:", clientId)
      // Here you would implement the actual delete logic
    }
  }

  const handleMarkAsActive = (clientId: number) => {
    console.log("[v0] Marking client as active:", clientId)
    // Here you would implement the status update logic
  }

  const handleViewHistory = (clientId: number) => {
    console.log("[v0] Viewing client history:", clientId)
    // Here you would implement navigation to client history
  }

  const handleScheduleSession = (clientId: number) => {
    console.log("[v0] Scheduling session for client:", clientId)
    // Here you would implement session scheduling logic
  }

  const stats = [
    { title: "Clientes Activos", value: "24", change: "+3", icon: Users, color: "text-primary" },
    { title: "Sesiones Hoy", value: "8", change: "+2", icon: Calendar, color: "text-primary" },
    { title: "Ingresos Mes", value: "$4,250", change: "+12%", icon: DollarSign, color: "text-primary" },
    { title: "Progreso Promedio", value: "82%", change: "+5%", icon: TrendingUp, color: "text-primary" },
  ]

  // Mock exercises catalog
  const exercisesCatalog: Exercise[] = [
    { id: 1, name: "Press banca", category: "Tren superior", equipment: "Pesas" },
    { id: 2, name: "Dominadas", category: "Tren superior", equipment: "Sin elementos" },
    { id: 3, name: "Sentadillas", category: "Tren inferior", equipment: "Pesas" },
    { id: 4, name: "Prensa de piernas", category: "Tren inferior", equipment: "Máquinas" },
    { id: 5, name: "Plancha", category: "Core", equipment: "Sin elementos" },
    { id: 6, name: "Crunches", category: "Core", equipment: "Sin elementos" },
    { id: 7, name: "Cinta trote", category: "Cardio", equipment: "Máquinas" },
    { id: 8, name: "Remo con mancuerna", category: "Tren superior", equipment: "Pesas" },
    { id: 9, name: "Estocadas", category: "Tren inferior", equipment: "Pesas" },
  ]

  // Mock routine folders and templates
  const [routineFolders, setRoutineFolders] = useState<RoutineFolder[]>([
    {
      id: 1,
      name: "Hipertrofia",
      templates: [
        {
          id: 101,
          name: "Pecho-Espalda A",
          description: "Enfasis en básicos",
          blocks: [
            {
              id: 1011,
              name: "Press banca",
              exercises: [{ exerciseId: 1, sets: 4, reps: 8, restSec: 120 }],
              repetitions: 3,
              restBetweenRepetitions: 60,
              restAfterBlock: 90,
            },
            {
              id: 1012,
              name: "Dominadas",
              exercises: [{ exerciseId: 2, sets: 4, reps: 10, restSec: 90 }],
              repetitions: 3,
              restBetweenRepetitions: 60,
              restAfterBlock: 90,
            },
            {
              id: 1013,
              name: "Plancha",
              exercises: [{ exerciseId: 5, sets: 3, reps: 45, restSec: 60 }],
              repetitions: 3,
              restBetweenRepetitions: 60,
              restAfterBlock: 90,
            },
          ],
        },
        {
          id: 102,
          name: "Piernas Base",
          blocks: [
            {
              id: 1021,
              name: "Entrada en calor",
              exercises: [{ exerciseId: 3, sets: 5, reps: 5, restSec: 150 }],
              repetitions: 3,
              restBetweenRepetitions: 60,
              restAfterBlock: 90,
            },
            {
              id: 1022,
              name: "Bloque 1",
              exercises: [{ exerciseId: 4, sets: 4, reps: 12, restSec: 120 }],
              repetitions: 3,
              restBetweenRepetitions: 60,
              restAfterBlock: 90,
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Funcional",
      templates: [
        {
          id: 201,
          name: "Fullbody 30min",
          blocks: [
            {
              id: 2011,
              name: "Entrada en calor",
              exercises: [{ exerciseId: 2, sets: 3, reps: 6, restSec: 90 }],
              repetitions: 3,
              restBetweenRepetitions: 60,
              restAfterBlock: 90,
            },
            {
              id: 2012,
              name: "Bloque 1",
              exercises: [{ exerciseId: 9, sets: 3, reps: 12, restSec: 60 }],
              repetitions: 3,
              restBetweenRepetitions: 60,
              restAfterBlock: 90,
            },
            {
              id: 2013,
              name: "Bloque 2",
              exercises: [{ exerciseId: 6, sets: 3, reps: 20, restSec: 45 }],
              repetitions: 3,
              restBetweenRepetitions: 60,
              restAfterBlock: 90,
            },
          ],
        },
      ],
    },
  ])

  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(1)
  const [routineSearch, setRoutineSearch] = useState("")
  const [exerciseFilter, setExerciseFilter] = useState<{ category?: Exercise["category"]; equipment?: Exercise["equipment"] }>({} as { category?: Exercise["category"]; equipment?: Exercise["equipment"] })
  
  // Editor de rutinas
  const [editingRoutine, setEditingRoutine] = useState<RoutineTemplate | null>(null)
  const [isRoutineEditorOpen, setIsRoutineEditorOpen] = useState(false)
  const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false)
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null)
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState("")
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set())

  const currentFolder = routineFolders.find((f) => f.id === selectedFolderId) || routineFolders[0]
  const filteredTemplates = (currentFolder?.templates || []).filter((t) => t.name.toLowerCase().includes(routineSearch.toLowerCase()))

  const handleCreateFolder = () => {
    const name = prompt("Nombre de la carpeta")
    if (!name) return
    setRoutineFolders((prev) => [...prev, { id: Date.now(), name, templates: [] }])
  }

  const handleCreateTemplate = () => {
    const name = prompt("Nombre de la rutina")
    if (!name || !currentFolder) return
    const newTemplate: RoutineTemplate = { id: Date.now(), name, blocks: [] }
    setRoutineFolders((prev) => prev.map((f) => (f.id === currentFolder.id ? { ...f, templates: [newTemplate, ...f.templates] } : f)))
  }

  const handleAssignTemplateToClient = (template: RoutineTemplate, client: Client) => {
    alert(`Asignada la rutina "${template.name}" a ${client.name} (mock)`) // scheduling UI vendrá luego
  }

  const handleEditRoutine = (template: RoutineTemplate) => {
    setEditingRoutine(template)
    setIsRoutineEditorOpen(true)
  }

  const handleAddBlock = () => {
    if (!editingRoutine) return
    const blockName = prompt("Nombre del bloque (ej: Entrada en calor, Bloque 1)")
    if (!blockName) return
    
    const newBlock: RoutineBlock = {
      id: Date.now(),
      name: blockName,
      exercises: [],
      repetitions: 1,
      restBetweenRepetitions: 60,
      restAfterBlock: 90,
    }
    
    setEditingRoutine({
      ...editingRoutine,
      blocks: [...editingRoutine.blocks, newBlock]
    })
  }

  const handleAddExerciseToBlock = (blockId: number) => {
    setSelectedBlockId(blockId)
    setIsExerciseSelectorOpen(true)
  }

  const handleAddRest = (blockId: number) => {
    if (!editingRoutine) return
    const restTime = prompt("Tiempo de descanso en segundos")
    if (!restTime || isNaN(Number(restTime))) return
    
    // Agregar descanso como un ejercicio especial
    const newRestExercise = {
      exerciseId: -1, // ID especial para descanso
      sets: 1,
      reps: Number(restTime),
      restSec: 0,
    }
    
    setEditingRoutine({
      ...editingRoutine,
      blocks: editingRoutine.blocks.map(block => 
        block.id === blockId 
          ? { ...block, exercises: [...block.exercises, newRestExercise] }
          : block
      )
    })
  }

  const handleSelectExercise = (exercise: Exercise) => {
    if (!editingRoutine || !selectedBlockId) return
    
    const sets = prompt("Número de series")
    const reps = prompt("Repeticiones por serie")
    const rest = prompt("Tiempo de descanso entre series (segundos)")
    
    if (!sets || !reps || !rest || isNaN(Number(sets)) || isNaN(Number(reps)) || isNaN(Number(rest))) return
    
    const newExercise = {
      exerciseId: exercise.id,
      sets: Number(sets),
      reps: Number(reps),
      restSec: Number(rest),
    }
    
    setEditingRoutine({
      ...editingRoutine,
      blocks: editingRoutine.blocks.map(block => 
        block.id === selectedBlockId 
          ? { ...block, exercises: [...block.exercises, newExercise] }
          : block
      )
    })
    
    setIsExerciseSelectorOpen(false)
    setSelectedBlockId(null)
  }

  const handleSaveRoutine = () => {
    if (!editingRoutine) return
    
    setRoutineFolders(prev => prev.map(folder => ({
      ...folder,
      templates: folder.templates.map(template => 
        template.id === editingRoutine.id ? editingRoutine : template
      )
    })))
    
    setIsRoutineEditorOpen(false)
    setEditingRoutine(null)
  }

  const handleDeleteExercise = (blockId: number, exerciseIndex: number) => {
    if (!editingRoutine) return
    
    setEditingRoutine({
      ...editingRoutine,
      blocks: editingRoutine.blocks.map(block => 
        block.id === blockId 
          ? { ...block, exercises: block.exercises.filter((_, idx) => idx !== exerciseIndex) }
          : block
      )
    })
  }

  const handleDeleteBlock = (blockId: number) => {
    if (!editingRoutine) return
    
    setEditingRoutine({
      ...editingRoutine,
      blocks: editingRoutine.blocks.filter(block => block.id !== blockId)
    })
  }

  const toggleBlockExpansion = (blockId: number) => {
    setExpandedBlocks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(blockId)) {
        newSet.delete(blockId)
      } else {
        newSet.add(blockId)
      }
      return newSet
    })
  }

  const recentClients = [
    {
      id: 1,
      name: "María González",
      status: "Activo",
      lastSession: "2 días",
      progress: 85,
      avatar: "/fit-woman-outdoors.png",
    },
    {
      id: 2,
      name: "Carlos Ruiz",
      status: "Activo",
      lastSession: "1 día",
      progress: 92,
      avatar: "/fit-man-gym.png",
    },
    {
      id: 3,
      name: "Ana López",
      status: "Pendiente",
      lastSession: "5 días",
      progress: 67,
      avatar: "/woman-workout.png",
    },
    {
      id: 4,
      name: "Luis Martín",
      status: "Activo",
      lastSession: "1 día",
      progress: 78,
      avatar: "/man-gym.png",
    },
  ]

  const [chatConversations, setChatConversations] = useState<Chat[]>([
    {
      id: 1,
      clientId: 1,
      clientName: "María González",
      clientAvatar: "/fit-woman-outdoors.png",
      lastMessage: "¡Perfecto! Nos vemos mañana a las 9",
      lastMessageTime: "10:30",
      unreadCount: 0,
      isOnline: true,
      messages: [
        {
          id: 1,
          senderId: 1,
          senderName: "María González",
          message: "Hola! ¿Podemos cambiar la rutina de mañana?",
          timestamp: "09:15",
          isRead: true,
          isTrainer: false,
        },
        {
          id: 2,
          senderId: "trainer",
          senderName: "Trainer",
          message: "¡Hola María! Por supuesto, ¿qué te gustaría cambiar?",
          timestamp: "09:18",
          isRead: true,
          isTrainer: true,
        },
        {
          id: 3,
          senderId: 1,
          senderName: "María González",
          message: "Me gustaría enfocarme más en cardio esta semana",
          timestamp: "09:20",
          isRead: true,
          isTrainer: false,
        },
        {
          id: 4,
          senderId: "trainer",
          senderName: "Trainer",
          message: "Perfecto! Vamos a hacer 30 min de cardio y 15 min de fuerza. ¿Te parece bien a las 9:00 AM?",
          timestamp: "09:25",
          isRead: true,
          isTrainer: true,
        },
        {
          id: 5,
          senderId: 1,
          senderName: "María González",
          message: "¡Perfecto! Nos vemos mañana a las 9",
          timestamp: "10:30",
          isRead: true,
          isTrainer: false,
        },
      ],
      isFavorite: true,
    },
    {
      id: 2,
      clientId: 2,
      clientName: "Carlos Ruiz",
      clientAvatar: "/fit-man-gym.png",
      lastMessage: "¿Puedes enviarme la rutina de hoy?",
      lastMessageTime: "08:45",
      unreadCount: 2,
      isOnline: false,
      messages: [
        {
          id: 1,
          senderId: 2,
          senderName: "Carlos Ruiz",
          message: "Buenos días! ¿Cómo estás?",
          timestamp: "08:30",
          isRead: false,
          isTrainer: false,
        },
        {
          id: 2,
          senderId: 2,
          senderName: "Carlos Ruiz",
          message: "¿Puedes enviarme la rutina de hoy?",
          timestamp: "08:45",
          isRead: false,
          isTrainer: false,
        },
      ],
      isFavorite: false,
    },
    {
      id: 3,
      clientId: 3,
      clientName: "Ana López",
      clientAvatar: "/woman-workout.png",
      lastMessage: "Gracias por la sesión de ayer",
      lastMessageTime: "Ayer",
      unreadCount: 0,
      isOnline: false,
      messages: [
        {
          id: 1,
          senderId: 3,
          senderName: "Ana López",
          message: "Gracias por la sesión de ayer, me siento genial!",
          timestamp: "Ayer 18:30",
          isRead: true,
          isTrainer: false,
        },
        {
          id: 2,
          senderId: "trainer",
          senderName: "Trainer",
          message: "¡Me alegra escuchar eso! Sigue así 💪",
          timestamp: "Ayer 19:00",
          isRead: true,
          isTrainer: true,
        },
      ],
      isFavorite: false,
    },
    {
      id: 4,
      clientId: 4,
      clientName: "Luis Martín",
      clientAvatar: "/man-gym.png",
      lastMessage: "¿A qué hora es mañana?",
      lastMessageTime: "2 días",
      unreadCount: 1,
      isOnline: true,
      messages: [
        {
          id: 1,
          senderId: 4,
          senderName: "Luis Martín",
          message: "Hola, ¿a qué hora es la sesión de mañana?",
          timestamp: "2 días",
          isRead: false,
          isTrainer: false,
        },
      ],
      isFavorite: false,
    },
  ])

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !selectedChat) return

    const newMessage = {
      id: Date.now(),
      message: chatMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isTrainer: true,
      isRead: false,
    }

    setSelectedChat((prev) => {
      if (!prev) return prev
      const updated: Chat = {
      ...prev,
      messages: [...prev.messages, newMessage],
      lastMessage: chatMessage,
      lastMessageTime: "Ahora",
      }
      return updated
    })

    setChatMessage("")
  }

  const filteredChats = chatConversations.filter((chat: Chat) => {
    const normalizeText = (text: string) => {
      return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
    }

    const matchesSearch = normalizeText(chat.clientName).includes(normalizeText(chatSearchTerm))
    const matchesArchived = showArchived ? !!chat.isArchived : !chat.isArchived

    switch (chatFilter) {
      case "unread":
        return matchesArchived && matchesSearch && chat.unreadCount > 0
      case "favorites":
        return matchesArchived && matchesSearch && !!chat.isFavorite
      default:
        return matchesArchived && matchesSearch
    }
  })

  const emojis = [
    "😊",
    "👍",
    "💪",
    "🔥",
    "⚡",
    "🎯",
    "✅",
    "❤️",
    "👏",
    "🙌",
    "💯",
    "🏆",
    "⭐",
    "🎉",
    "💪🏻",
    "🏃‍♂️",
    "🏋️‍♀️",
    "🥇",
  ]

  const handleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker)
  }

  const addEmoji = (emoji: string) => {
    setChatMessage((prev) => prev + emoji)
  }

  const clientsWithChats = new Set(chatConversations.map((c) => c.clientId))
  const normalizedNewChatSearch = normalizeText(newChatSearchTerm)
  const baseNewChatList = allClients.filter((c) => !clientsWithChats.has(c.id))
  const searchedExtraClients =
    newChatSearchTerm.trim().length > 0
      ? allClients.filter((c) => normalizeText(c.name).includes(normalizedNewChatSearch))
      : []
  const dedupedNewChatResults = [
    ...baseNewChatList,
    ...searchedExtraClients.filter((c) => !baseNewChatList.some((b) => b.id === c.id)),
  ]

  const handleStartChat = (client: Client) => {
    const existing = chatConversations.find((c: Chat) => c.clientId === client.id)
    if (existing) {
      setSelectedChat(existing)
      setActiveTab("chat")
      setIsNewChatDialogOpen(false)
      return
    }
    const newChat = {
      id: Date.now(),
      clientId: client.id,
      clientName: client.name,
      clientAvatar: client.avatar,
      lastMessage: "Nueva conversación",
      lastMessageTime: "Ahora",
      unreadCount: 0,
      isOnline: false,
      messages: [],
    }
    setChatConversations((prev) => [newChat, ...prev])
    setSelectedChat(newChat)
    setActiveTab("chat")
    setIsNewChatDialogOpen(false)
  }

  const handleFileAttachment = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".pdf,.doc,.docx,.txt"
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement | null
      const file = target?.files?.[0]
      if (file) {
        alert(`Archivo "${file.name}" adjuntado correctamente`)
      }
    }
    input.click()
  }

  const handleImageAttachment = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement | null
      const file = target?.files?.[0]
      if (file) {
        alert(`Imagen "${file.name}" adjuntada correctamente`)
      }
    }
    input.click()
  }

  const handleChatFromClient = (clientName: string) => {
    const chatToSelect = chatConversations.find((chat: Chat) => chat.clientName === clientName)
    if (chatToSelect) {
      setSelectedChat(chatToSelect)
      setActiveTab("chat")
    }
  }

  const handleViewAllClients = () => {
    setActiveTab("clients")
  }

  const handleAddSession = () => {
    alert("Funcionalidad de agendar sesión estará disponible cuando implementemos la sección de agenda")
  }

  const handleNewClient = () => {
    setIsNewClientDialogOpen(true)
  }

  const handleCreateRoutine = () => {
    alert("Funcionalidad de crear rutina estará disponible cuando implementemos la sección de rutinas")
  }

  const handleScheduleAppointment = () => {
    alert("Funcionalidad de agendar cita estará disponible cuando implementemos la sección de agenda")
  }

  const handleRegisterPayment = () => {
    alert("Funcionalidad de registrar pago estará disponible cuando implementemos la sección de pagos")
  }

  return (
    <div className={`min-h-screen ${theme === "dark" ? "dark" : ""}`}>
      {/* Theme Toggle moved to header actions */}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 ${sidebarCollapsed ? "w-20" : "w-64"} bg-sidebar border-r border-sidebar-border transition-all duration-300`}
      >
        <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
            >
              <Dumbbell className="w-5 h-5 text-primary-foreground" />
            </button>
            {!sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="text-xl font-bold text-sidebar-foreground hover:text-primary transition-colors"
              >
                Treino
              </button>
            )}
          </div>
          {sidebarCollapsed && (
            <button onClick={() => setSidebarCollapsed(false)} className="ml-2 p-1 hover:bg-sidebar-accent rounded">
              <ChevronRight className="w-4 h-4 text-sidebar-foreground" />
            </button>
          )}
        </div>

        <nav className="p-4 space-y-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: BarChart3 },
            { id: "clients", label: "Clientes", icon: Users },
            { id: "schedule", label: "Agenda", icon: Calendar },
            { id: "routines", label: "Rutinas", icon: Activity },
            { id: "payments", label: "Pagos", icon: DollarSign },
            { id: "chat", label: "Chat", icon: MessageSquare },
            { id: "settings", label: "Configuración", icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === item.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon className={`flex-shrink-0 ${sidebarCollapsed ? "w-4 h-4" : "w-5 h-5"}`} />
              {!sidebarCollapsed && item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className={`${sidebarCollapsed ? "ml-20" : "ml-64"} transition-all duration-300`}>
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-foreground">
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "clients" && "Gestión de Clientes"}
              {activeTab === "schedule" && "Agenda"}
              {activeTab === "routines" && "Rutinas"}
              {activeTab === "payments" && "Pagos"}
              {activeTab === "chat" && "Chat"}
              {activeTab === "settings" && "Configuración"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon">
              <Bell className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="bg-background border-border"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Avatar>
              <AvatarImage src="/trainer-profile.png" />
              <AvatarFallback>TR</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Dashboard Content */}
        {activeTab === "dashboard" && (
          <main className="p-6 space-y-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Bienvenido de vuelta, entrenador</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
                        <p className="text-sm text-primary">{stat.change}</p>
                      </div>
                      <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Sessions */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Próximas Sesiones</CardTitle>
                  <CardDescription>Entrenamientos programados para hoy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <Avatar>
                        <AvatarImage src={session.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {session.client
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-card-foreground">{session.client}</p>
                        <p className="text-sm text-muted-foreground">{session.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary">{session.time}</p>
                        <Badge variant="outline" className="text-xs">
                          Hoy
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full bg-transparent hover:bg-orange-500 hover:text-white transition-colors" variant="outline" onClick={handleAddSession}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agendar Sesión
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Clients */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Clientes Recientes</CardTitle>
                  <CardDescription>Actividad y progreso de tus clientes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentClients.map((client) => (
                    <div key={client.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <Avatar>
                        <AvatarImage src={client.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {client.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-card-foreground">{client.name}</p>
                        <p className="text-sm text-muted-foreground">Última sesión: {client.lastSession}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={client.status === "Activo" ? "default" : "secondary"}>{client.status}</Badge>
                        <p className="text-sm text-primary mt-1">{client.progress}% progreso</p>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full bg-transparent hover:bg-orange-500 hover:text-white transition-colors" variant="outline" onClick={handleViewAllClients}>
                    Ver Todos los Clientes
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Acciones Rápidas</CardTitle>
                <CardDescription>Herramientas frecuentemente utilizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button className="h-20 flex-col gap-2 bg-transparent hover:bg-orange-500 hover:text-white transition-colors" variant="outline" onClick={handleNewClient}>
                    <Users className="w-6 h-6" />
                    <span className="text-sm">Nuevo Cliente</span>
                  </Button>
                  <Button
                    className="h-20 flex-col gap-2 bg-transparent hover:bg-orange-500 hover:text-white transition-colors"
                    variant="outline"
                    onClick={handleCreateRoutine}
                  >
                    <Activity className="w-6 h-6" />
                    <span className="text-sm">Crear Rutina</span>
                  </Button>
                  <Button
                    className="h-20 flex-col gap-2 bg-transparent hover:bg-orange-500 hover:text-white transition-colors"
                    variant="outline"
                    onClick={handleScheduleAppointment}
                  >
                    <Calendar className="w-6 h-6" />
                    <span className="text-sm">Agendar Cita</span>
                  </Button>
                  <Button
                    className="h-20 flex-col gap-2 bg-transparent hover:bg-orange-500 hover:text-white transition-colors"
                    variant="outline"
                    onClick={handleRegisterPayment}
                  >
                    <DollarSign className="w-6 h-6" />
                    <span className="text-sm">Registrar Pago</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        )}

        {/* Clients Content */}
        {activeTab === "clients" && (
          <main className="p-6 space-y-6">
            {/* Clients Header with Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Mis Clientes</h2>
                <p className="text-muted-foreground">Gestiona y supervisa el progreso de tus clientes</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleNewClient} className="hover:bg-orange-500 transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Cliente
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar clientes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={clientFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setClientFilter("all")}
                    >
                      Todos ({allClients.length})
                    </Button>
                    <Button
                      variant={clientFilter === "active" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setClientFilter("active")}
                    >
                      Activos ({allClients.filter((c) => c.status === "Activo").length})
                    </Button>
                    <Button
                      variant={clientFilter === "pending" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setClientFilter("pending")}
                    >
                      Pendientes ({allClients.filter((c) => c.status === "Pendiente").length})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clients Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Clientes</p>
                      <p className="text-2xl font-bold text-card-foreground">{allClients.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Clientes Activos</p>
                      <p className="text-2xl font-bold text-card-foreground">
                        {allClients.filter((c) => c.status === "Activo").length}
                      </p>
                    </div>
                    <UserCheck className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Progreso Promedio</p>
                      <p className="text-2xl font-bold text-card-foreground">
                        {Math.round(allClients.reduce((acc, client) => acc + client.progress, 0) / allClients.length)}%
                      </p>
                    </div>
                    <Activity className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Clients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map((client) => (
                <Card key={client.id} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={client.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {client.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-card-foreground">{client.name}</h3>
                          <p className="text-sm text-muted-foreground">{client.goal}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            client.status === "Activo"
                              ? "default"
                              : client.status === "Pendiente"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {client.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleEditClient(client)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar información
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewHistory(client.id)}>
                              <FileText className="w-4 h-4 mr-2" />
                              Ver historial
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleScheduleSession(client.id)}>
                              <CalendarIcon className="w-4 h-4 mr-2" />
                              Agendar sesión
                            </DropdownMenuItem>
                            {client.status !== "Activo" && (
                              <DropdownMenuItem onClick={() => handleMarkAsActive(client.id)}>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Marcar como activo
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClient(client.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar cliente
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <button
                      className="w-full text-left p-3 rounded bg-muted/40 hover:bg-muted/60 transition-colors"
                      onClick={() => {
                        setExpandedClientIds((prev) => {
                          const copy = new Set(prev)
                          if (copy.has(client.id)) copy.delete(client.id)
                          else copy.add(client.id)
                          return copy
                        })
                      }}
                    >
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Plan</p>
                          <p className="text-card-foreground">{client.plan}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Próxima sesión</p>
                          <p className="text-card-foreground">{client.nextSession}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Sesiones completadas</p>
                          <p className="text-card-foreground">{client.sessionsCompleted}/{client.totalSessions}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Progreso</p>
                          <p className="text-card-foreground">{client.progress}%</p>
                        </div>
                      </div>
                      {expandedClientIds.has(client.id) && (
                        <div className="mt-3 border-t border-border pt-3 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Email</p>
                            <p className="text-card-foreground">{client.email}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Teléfono</p>
                            <p className="text-card-foreground">{client.phone}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Alta</p>
                            <p className="text-card-foreground">{client.joinDate}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Última sesión</p>
                            <p className="text-card-foreground">{client.lastSession}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-muted-foreground">Tipo de entrenamiento</p>
                            <p className="text-card-foreground">{client.goal} + Fuerza (3x semana)</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-muted-foreground">Pagos</p>
                            <p className="text-card-foreground">$50.000/mes - Último pago hace 10 días</p>
                          </div>
                        </div>
                      )}
                    </button>

                    <div className="mt-4 pt-4 border-t border-border flex gap-2">
                      <Button size="sm" className="flex-1" onClick={() => handleChatFromClient(client.name)}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                                                  <Button size="sm" variant="outline" className="flex-1 bg-transparent hover:bg-orange-500 hover:text-white transition-colors">
                              <Calendar className="w-4 h-4 mr-2" />
                              Agendar
                            </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Edit Client Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                  <DialogTitle>Editar información del cliente</DialogTitle>
                  <DialogDescription>Actualiza los datos y guarda los cambios.</DialogDescription>
                </DialogHeader>
                {editingClient && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-name" className="text-right">Nombre</Label>
                      <Input id="edit-name" value={editingClient.name} onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-email" className="text-right">Email</Label>
                      <Input id="edit-email" value={editingClient.email} onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-phone" className="text-right">Teléfono</Label>
                      <Input id="edit-phone" value={editingClient.phone} onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Plan</Label>
                      <Select value={editingClient.plan} onValueChange={(v) => setEditingClient({ ...editingClient, plan: v })}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Seleccionar plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Básico">Básico - 2 sesiones/semana</SelectItem>
                          <SelectItem value="Estándar">Estándar - 3 sesiones/semana</SelectItem>
                          <SelectItem value="Premium">Premium - 4 sesiones/semana</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Estado</Label>
                      <Select value={editingClient.status} onValueChange={(v) => setEditingClient({ ...editingClient, status: v as Client["status"] })}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Activo">Activo</SelectItem>
                          <SelectItem value="Pendiente">Pendiente</SelectItem>
                          <SelectItem value="Inactivo">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="hover:bg-orange-500 hover:text-white transition-colors">Cancelar</Button>
                  <Button onClick={() => { alert("Datos guardados (temporal, sin base de datos)"); setIsEditDialogOpen(false) }}>Guardar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </main>
        )}

        {/* Routines Content */}
        {activeTab === "routines" && (
          <main className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Rutinas</h2>
                <p className="text-muted-foreground">Carpetas y plantillas para asignar a alumnos</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCreateFolder} className="bg-transparent hover:bg-orange-500 hover:text-white transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva carpeta
                </Button>
                <Button onClick={handleCreateTemplate} className="hover:bg-orange-500 transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva rutina
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Folders list */}
              <Card className="bg-card border-border lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Carpetas</CardTitle>
                  <CardDescription>Organiza tus plantillas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(routineFolders || []).map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => setSelectedFolderId(folder.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        folder.id === currentFolder?.id ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted/70"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{folder.name}</span>
                        <Badge variant={folder.id === currentFolder?.id ? "secondary" : "outline"}>
                          {folder.templates.length}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Templates and actions */}
              <Card className="bg-card border-border lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Plantillas: {currentFolder?.name}</CardTitle>
                  <CardDescription>Selecciona o edita una rutina base</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar plantillas..."
                        value={routineSearch}
                        onChange={(e) => setRoutineSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredTemplates.map((tpl) => (
                      <div key={tpl.id} className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-medium text-card-foreground">{tpl.name}</h4>
                            {tpl.description && (
                              <p className="text-sm text-muted-foreground">{tpl.description}</p>
                            )}
                            <div className="mt-3 space-y-3">
                              <div className="space-y-2">
                                {tpl.blocks.map((block, idx) => (
                                  <div key={idx} className="p-2 bg-muted/20 rounded border-l-2 border-primary/50">
                                    <div className="font-medium text-xs text-card-foreground mb-1">
                                      {block.name} ({block.repetitions} repeticiones)
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {block.exercises.length} ejercicios
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="pt-2 border-t border-border">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full hover:bg-orange-500 hover:text-white transition-colors"
                                  onClick={() => {
                                    setEditingRoutine(tpl)
                                    setIsRoutineEditorOpen(true)
                                  }}
                                >
                                  Ver rutina completa
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 min-w-[180px]">
                            <Select onValueChange={(clientId) => {
                              const client = allClients.find((c) => String(c.id) === clientId)
                              if (client) handleAssignTemplateToClient(tpl, client)
                            }}>
                              <SelectTrigger>
                                <SelectValue placeholder="Asignar a alumno" />
                              </SelectTrigger>
                              <SelectContent>
                                {allClients.map((c) => (
                                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button variant="outline" className="bg-transparent" onClick={() => handleEditRoutine(tpl)}>Editar</Button>
                            <Button>Enviar ahora</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredTemplates.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">No hay plantillas en esta carpeta.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Exercise catalog */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-card-foreground">Catálogo de ejercicios</CardTitle>
                    <CardDescription>Gestiona tu biblioteca de ejercicios</CardDescription>
                  </div>
                  <Button onClick={() => alert("Funcionalidad de crear ejercicio estará disponible próximamente")} className="hover:bg-orange-500 transition-colors">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo ejercicio
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-1">
                    <Select 
                      value={exerciseFilter.category || "all"} 
                      onValueChange={(v) => setExerciseFilter(prev => ({ 
                        ...prev, 
                        category: v === "all" ? undefined : v as Exercise["category"] 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">TODOS</SelectItem>
                        <SelectItem value="Tren superior">Tren superior</SelectItem>
                        <SelectItem value="Tren inferior">Tren inferior</SelectItem>
                        <SelectItem value="Core">Core</SelectItem>
                        <SelectItem value="Cardio">Cardio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-1">
                    <Select 
                      value={exerciseFilter.equipment || "all"} 
                      onValueChange={(v) => setExerciseFilter(prev => ({ 
                        ...prev, 
                        equipment: v === "all" ? undefined : v as Exercise["equipment"] 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Equipamiento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">TODOS</SelectItem>
                        <SelectItem value="Máquinas">Máquinas</SelectItem>
                        <SelectItem value="Pesas">Pesas</SelectItem>
                        <SelectItem value="Bandas">Bandas</SelectItem>
                        <SelectItem value="Sin elementos">Sin elementos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  {exercisesCatalog
                    .filter((e) => !exerciseFilter.category || e.category === exerciseFilter.category)
                    .filter((e) => !exerciseFilter.equipment || e.equipment === exerciseFilter.equipment)
                    .map((ex) => (
                      <div key={ex.id} className="p-3 rounded bg-muted/50 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-card-foreground">{ex.name}</p>
                          <p className="text-xs text-muted-foreground">{ex.category} • {ex.equipment}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => alert("Funcionalidad de editar ejercicio estará disponible próximamente")}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => alert("Funcionalidad de eliminar ejercicio estará disponible próximamente")}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </main>
        )}

        {/* Chat Content */}
        {activeTab === "chat" && (
          <main className="p-6 h-[calc(100vh-4rem)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              {/* Chat List */}
              <div className="lg:col-span-1 relative">
                <Card className="bg-card border-border h-full flex flex-col">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-card-foreground">Conversaciones</CardTitle>
                      <Badge variant="secondary">
                        {chatConversations.reduce((acc, chat) => acc + chat.unreadCount, 0)} nuevos
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Button
                        variant={chatFilter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setChatFilter("all")}
                        className="text-xs"
                      >
                        Todos ({chatConversations.length})
                      </Button>
                      <Button
                        variant={chatFilter === "unread" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setChatFilter("unread")}
                        className="text-xs"
                      >
                        No leídos ({chatConversations.filter((c) => c.unreadCount > 0).length})
                      </Button>
                      <Button
                        variant={chatFilter === "favorites" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setChatFilter("favorites")}
                        className="text-xs"
                      >
                        <Star className="w-3 h-3 mr-1" />
                        Favoritos ({chatConversations.filter((c) => c.isFavorite).length})
                      </Button>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Buscar conversaciones..."
                        value={chatSearchTerm}
                        onChange={(e) => setChatSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button
                        variant={showArchived ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowArchived((v) => !v)}
                        className="text-xs"
                      >
                        Archivados ({chatConversations.filter((c) => c.isArchived).length})
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-0">
                    <div className="space-y-1">
                      {filteredChats.length > 0 ? (
                        filteredChats.map((chat) => (
                          <div
                            key={chat.id}
                            onClick={() => setSelectedChat(chat)}
                            className={`p-4 cursor-pointer transition-colors border-b border-border hover:bg-muted/50 ${
                              selectedChat?.id === chat.id ? "bg-muted" : ""
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar>
                                  <AvatarImage src={chat.clientAvatar || "/placeholder.svg"} />
                                  <AvatarFallback>
                                    {chat.clientName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                {chat.isOnline && (
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-card-foreground truncate">{chat.clientName}</h4>
                                    {(chat.clientName === "María González" || chat.clientName === "Ana López") && (
                                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">{chat.lastMessageTime}</span>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                              </div>
                              {chat.unreadCount > 0 && (
                                <Badge variant="default" className="min-w-[20px] h-5 text-xs">
                                  {chat.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No se encontraron conversaciones</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Intenta cambiar el filtro o el término de búsqueda
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <button
                  onClick={() => setIsNewChatDialogOpen(true)}
                  className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90"
                  title="Nueva conversación"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Window */}
              <div className="lg:col-span-2">
                {selectedChat ? (
                  <Card className="bg-card border-border h-full flex flex-col">
                    {/* Chat Header */}
                    <CardHeader className="pb-4 border-b border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={selectedChat.clientAvatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {selectedChat.clientName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            {selectedChat.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-card-foreground">{selectedChat.clientName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {selectedChat.isOnline ? "En línea" : "Desconectado"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" onClick={() => alert("Iniciando llamada...")} className="hover:bg-orange-500 hover:text-white transition-colors">
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => alert("Iniciando videollamada...")} className="hover:bg-orange-500 hover:text-white transition-colors">
                            <Video className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="icon" className="hover:bg-orange-500 hover:text-white transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => alert("Marcado como favorito")}>
                                <Star className="w-4 h-4 mr-2" />
                                Marcar como favorito
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                if (!selectedChat) return
                                setChatConversations((prev) => prev.map((c) => c.id === selectedChat.id ? { ...c, isFavorite: !c.isFavorite } : c))
                                alert("Favoritos actualizado")
                              }}>
                                <Star className="w-4 h-4 mr-2" />
                                {selectedChat?.isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => alert("Chat silenciado por 1 hora")}>
                                <VolumeX className="w-4 h-4 mr-2" />
                                Silenciar por 1 hora
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => alert("Chat silenciado por 8 horas")}>
                                <VolumeX className="w-4 h-4 mr-2" />
                                Silenciar por 8 horas
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  const client = allClients.find((c) => c.name === selectedChat.clientName)
                                  if (client) {
                                    setActiveTab("clients")
                                    // Scroll to client would be implemented here
                                    alert(`Navegando al perfil de ${selectedChat.clientName}`)
                                  }
                                }}
                              >
                                <User className="w-4 h-4 mr-2" />
                                Ver perfil del cliente
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => {
                                if (!selectedChat) return
                                setChatConversations((prev) => prev.map((c) => c.id === selectedChat.id ? { ...c, isArchived: !c.isArchived } : c))
                                alert("Archivado actualizado")
                              }}>
                                <Archive className="w-4 h-4 mr-2" />
                                {selectedChat?.isArchived ? "Desarchivar" : "Archivar"} conversación
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>

                    {/* Messages */}
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                      {selectedChat.messages.map((message) => (
                        <div key={message.id} className={`flex ${message.isTrainer ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.isTrainer
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <span className="text-xs opacity-70">{message.timestamp}</span>
                              {message.isTrainer && (
                                <div className="text-xs opacity-70">
                                  {message.isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>

                    {/* Message Input */}
                    <div className="p-4 border-t border-border">
                      {showEmojiPicker && (
                        <div className="mb-4 p-4 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Seleccionar emoji</span>
                            <Button variant="ghost" size="icon" onClick={() => setShowEmojiPicker(false)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-9 gap-2">
                            {emojis.map((emoji, index) => (
                              <button
                                key={index}
                                onClick={() => addEmoji(emoji)}
                                className="p-2 hover:bg-background rounded text-lg transition-colors"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <Textarea
                            placeholder="Escribe un mensaje..."
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            className="min-h-[40px] max-h-[120px] resize-none"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                handleSendMessage()
                              }
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="icon" onClick={handleFileAttachment} title="Adjuntar archivo" className="hover:bg-orange-500 hover:text-white transition-colors">
                            <Paperclip className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={handleImageAttachment} title="Adjuntar imagen" className="hover:bg-orange-500 hover:text-white transition-colors">
                            <ImageIcon className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={handleEmojiPicker} title="Agregar emoji" className="hover:bg-orange-500 hover:text-white transition-colors">
                            <Smile className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => alert("Grabando audio...")}
                            title="Grabar audio"
                            className="hover:bg-orange-500 hover:text-white transition-colors"
                          >
                            <Mic className="w-4 h-4" />
                          </Button>
                                            <Button onClick={handleSendMessage} disabled={!chatMessage.trim()} className="hover:bg-orange-500 transition-colors">
                    <Send className="w-4 h-4" />
                  </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="bg-card border-border h-full flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-card-foreground mb-2">Selecciona una conversación</h3>
                      <p className="text-muted-foreground">Elige un cliente de la lista para comenzar a chatear</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </main>
        )}

        {/* Other tabs content placeholders */}
        {activeTab !== "dashboard" && activeTab !== "clients" && activeTab !== "chat" && (
          <main className="p-6">
            <Card className="bg-card border-border">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Sección en Desarrollo</h3>
                <p className="text-muted-foreground">Esta funcionalidad estará disponible próximamente.</p>
              </CardContent>
            </Card>
          </main>
        )}
      </div>

      <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
            <DialogDescription>
              Completa la información del nuevo cliente. Los campos marcados con * son obligatorios.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre *
              </Label>
              <Input id="name" placeholder="Nombre completo" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email *
              </Label>
              <Input id="email" type="email" placeholder="email@ejemplo.com" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Teléfono
              </Label>
              <Input id="phone" placeholder="+54 9 11 1234-5678" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="goal" className="text-right">
                Objetivo
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar objetivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight-loss">Pérdida de peso</SelectItem>
                  <SelectItem value="muscle-gain">Ganancia muscular</SelectItem>
                  <SelectItem value="endurance">Resistencia</SelectItem>
                  <SelectItem value="strength">Fuerza</SelectItem>
                  <SelectItem value="general">Fitness general</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plan" className="text-right">
                Plan
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Básico - 2 sesiones/semana</SelectItem>
                  <SelectItem value="standard">Estándar - 3 sesiones/semana</SelectItem>
                  <SelectItem value="premium">Premium - 4 sesiones/semana</SelectItem>
                  <SelectItem value="unlimited">Ilimitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewClientDialogOpen(false)} className="hover:bg-orange-500 hover:text-white transition-colors">
              Cancelar
            </Button>
            <Button
              onClick={() => {
                alert("Cliente agregado correctamente (funcionalidad completa disponible con base de datos)")
                setIsNewClientDialogOpen(false)
              }}
              className="hover:bg-orange-500 transition-colors"
            >
              Agregar Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewChatDialogOpen} onOpenChange={setIsNewChatDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Nueva conversación</DialogTitle>
            <DialogDescription>Elige un cliente para iniciar un chat o busca uno existente.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
                value={newChatSearchTerm}
                onChange={(e) => setNewChatSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="max-h-80 overflow-auto space-y-2">
              {dedupedNewChatResults.map((client) => {
                const existing = chatConversations.find((c) => c.clientId === client.id)
                const isInDefaultList = !clientsWithChats.has(client.id)
                const shouldShow = isInDefaultList || (!!newChatSearchTerm && !!existing)
                if (!shouldShow) return null
                return (
                  <div key={client.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={client.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {client.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-card-foreground">{client.name}</p>
                        <p className="text-xs text-muted-foreground">{client.email}</p>
                      </div>
                    </div>
                    {existing ? (
                      <Button variant="outline" onClick={() => { setSelectedChat(existing); setActiveTab("chat"); setIsNewChatDialogOpen(false) }} className="hover:bg-orange-500 hover:text-white transition-colors">Ir al chat</Button>
                    ) : (
                                              <Button onClick={() => handleStartChat(client)} className="hover:bg-orange-500 transition-colors">Iniciar chat</Button>
                    )}
                  </div>
                )
              })}
              {dedupedNewChatResults.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No se encontraron clientes.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Editor de Rutinas */}
      <Dialog open={isRoutineEditorOpen} onOpenChange={setIsRoutineEditorOpen}>
        <DialogContent className="w-[96vw] sm:max-w-none md:max-w-[1200px] max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Rutina: {editingRoutine?.name}</DialogTitle>
            <DialogDescription>Organiza los bloques y ejercicios de tu rutina</DialogDescription>
          </DialogHeader>
          
          {editingRoutine && (
            <div className="space-y-8">
              {/* Información de la rutina */}
              <div className="grid grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg">
                <div>
                  <Label htmlFor="routine-name" className="text-sm font-medium">Nombre de la rutina</Label>
                  <Input 
                    id="routine-name" 
                    value={editingRoutine.name} 
                    onChange={(e) => setEditingRoutine({...editingRoutine, name: e.target.value})}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="routine-description" className="text-sm font-medium">Descripción</Label>
                  <Input 
                    id="routine-description" 
                    value={editingRoutine.description || ""} 
                    onChange={(e) => setEditingRoutine({...editingRoutine, description: e.target.value})}
                    placeholder="Descripción opcional"
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Bloques */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Bloques de la rutina</h3>
                  <Button onClick={handleAddBlock} variant="outline" className="hover:bg-orange-500 hover:text-white transition-colors">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar bloque
                  </Button>
                </div>

                {editingRoutine.blocks.map((block, blockIndex) => (
                  <div key={block.id} className="border-2 border-primary/100 rounded-xl p-6 space-y-6 bg-gradient-to-r from-muted/20 to-muted/10">
                    {/* Header del bloque */}
                    <div className="flex items-center justify-between border-b border-primary/50 pb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                            {blockIndex + 1}
                          </div>
                          <Input 
                            value={block.name}
                            onChange={(e) => {
                              const updatedBlocks = [...editingRoutine.blocks]
                              updatedBlocks[blockIndex] = {...block, name: e.target.value}
                              setEditingRoutine({...editingRoutine, blocks: updatedBlocks})
                            }}
                            className="w-64 text-lg font-medium"
                            placeholder="Nombre del bloque"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAddExerciseToBlock(block.id)}
                          className="hover:bg-orange-500 hover:text-white transition-colors"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar ejercicio
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAddRest(block.id)}
                          className="hover:bg-orange-500 hover:text-white transition-colors"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar descanso
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteBlock(block.id)}
                          className="hover:bg-red-600 hover:text-white transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Configuración del bloque */}
                    <div className="grid grid-cols-3 gap-6 p-4 bg-muted/20 rounded-lg">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Repeticiones del bloque</Label>
                        <Input 
                          type="number" 
                          value={block.repetitions}
                          onChange={(e) => {
                            const updatedBlocks = [...editingRoutine.blocks]
                            updatedBlocks[blockIndex] = {...block, repetitions: Number(e.target.value)}
                            setEditingRoutine({...editingRoutine, blocks: updatedBlocks})
                          }}
                          min="1"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Descanso entre repeticiones (seg)</Label>
                        <Input 
                          type="number" 
                          value={block.restBetweenRepetitions}
                          onChange={(e) => {
                            const updatedBlocks = [...editingRoutine.blocks]
                            updatedBlocks[blockIndex] = {...block, restBetweenRepetitions: Number(e.target.value)}
                            setEditingRoutine({...editingRoutine, blocks: updatedBlocks})
                          }}
                          min="0"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Descanso después del bloque (seg)</Label>
                        <Input 
                          type="number" 
                          value={block.restAfterBlock}
                          onChange={(e) => {
                            const updatedBlocks = [...editingRoutine.blocks]
                            updatedBlocks[blockIndex] = {...block, restAfterBlock: Number(e.target.value)}
                            setEditingRoutine({...editingRoutine, blocks: updatedBlocks})
                          }}
                          min="0"
                          className="mt-2"
                        />
                      </div>
                    </div>

                    {/* Botón para expandir/colapsar ejercicios */}
                    <div className="flex justify-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleBlockExpansion(block.id)}
                        className="w-12 h-12 rounded-full hover:bg-orange-500 hover:text-white transition-colors"
                      >
                        <ChevronDown className={`w-5 h-5 transition-transform ${expandedBlocks.has(block.id) ? 'rotate-180' : ''}`} />
                      </Button>
                    </div>

                    {/* Ejercicios del bloque (colapsables) */}
                    {expandedBlocks.has(block.id) && (
                      <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-primary">Ejercicios del bloque:</h4>
                      {block.exercises.map((exercise, exerciseIndex) => {
                        const ex = exercisesCatalog.find(e => e.id === exercise.exerciseId)
                        const isRest = exercise.exerciseId === -1
                        
                        return (
                          <div key={exerciseIndex} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center gap-6">
                              {isRest ? (
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 dark:text-blue-400 text-lg font-bold">D</span>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">Descanso</span>
                                    <p className="text-sm text-muted-foreground">{exercise.reps} segundos</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                    <span className="text-green-600 dark:text-green-400 text-lg font-bold">E</span>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-foreground">{ex?.name}</span>
                                    <p className="text-sm text-muted-foreground">
                                      {exercise.sets} series × {exercise.reps} repeticiones • {exercise.restSec}s descanso
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteExercise(block.id, exerciseIndex)}
                              className="hover:bg-red-600 hover:text-white transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )
                      })}
                      {block.exercises.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/30">
                          <p className="text-lg">No hay ejercicios en este bloque</p>
                          <p className="text-sm mt-1">Agrega ejercicios o descansos para comenzar</p>
                        </div>
                      )}
                    </div>
                    )}
                  </div>
                ))}

                {editingRoutine.blocks.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/30">
                    <p className="text-xl">No hay bloques en esta rutina</p>
                    <p className="text-sm mt-2">Agrega bloques para comenzar a construir tu rutina</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="border-t pt-6">
            <Button variant="outline" onClick={() => setIsRoutineEditorOpen(false)} className="hover:bg-orange-500 hover:text-white transition-colors">
              Cancelar
            </Button>
            <Button onClick={handleSaveRoutine} className="hover:bg-orange-500 transition-colors">
              Guardar rutina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Selector de Ejercicios */}
      <Dialog open={isExerciseSelectorOpen} onOpenChange={setIsExerciseSelectorOpen}>
        <DialogContent className="max-w-4xl w-[90vw]">
          <DialogHeader>
            <DialogTitle>Seleccionar Ejercicio</DialogTitle>
            <DialogDescription>Elige un ejercicio del catálogo para agregar al bloque</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Filtros */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-sm font-medium">Categoría</Label>
                <Select 
                  value={exerciseFilter.category || "all"} 
                  onValueChange={(v) => setExerciseFilter(prev => ({ 
                    ...prev, 
                    category: v === "all" ? undefined : v as Exercise["category"] 
                  }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">TODOS</SelectItem>
                    <SelectItem value="Tren superior">Tren superior</SelectItem>
                    <SelectItem value="Tren inferior">Tren inferior</SelectItem>
                    <SelectItem value="Core">Core</SelectItem>
                    <SelectItem value="Cardio">Cardio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Equipamiento</Label>
                <Select 
                  value={exerciseFilter.equipment || "all"} 
                  onValueChange={(v) => setExerciseFilter(prev => ({ 
                    ...prev, 
                    equipment: v === "all" ? undefined : v as Exercise["equipment"] 
                  }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Equipamiento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">TODOS</SelectItem>
                    <SelectItem value="Máquinas">Máquinas</SelectItem>
                    <SelectItem value="Pesas">Pesas</SelectItem>
                    <SelectItem value="Bandas">Bandas</SelectItem>
                    <SelectItem value="Sin elementos">Sin elementos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Búsqueda</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar ejercicios..."
                    value={exerciseSearchTerm}
                    onChange={(e) => setExerciseSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Lista de ejercicios */}
            <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-2">
              {exercisesCatalog
                .filter(ex => 
                  (!exerciseFilter.category || ex.category === exerciseFilter.category) &&
                  (!exerciseFilter.equipment || ex.equipment === exerciseFilter.equipment) &&
                  (exerciseSearchTerm === "" || 
                    ex.name.toLowerCase().includes(exerciseSearchTerm.toLowerCase()) ||
                    ex.category.toLowerCase().includes(exerciseSearchTerm.toLowerCase()) ||
                    ex.equipment.toLowerCase().includes(exerciseSearchTerm.toLowerCase())
                  )
                )
                .map(ex => (
                  <div 
                    key={ex.id} 
                    className="p-3 rounded border cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSelectExercise(ex)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{ex.name}</p>
                        <p className="text-sm text-muted-foreground">{ex.category} • {ex.equipment}</p>
                      </div>
                      <Button variant="outline" size="sm" className="hover:bg-orange-500 hover:text-white transition-colors">
                        Seleccionar
                      </Button>
                    </div>
                  </div>
                ))}
              
              {exercisesCatalog.filter(ex => 
                (!exerciseFilter.category || ex.category === exerciseFilter.category) &&
                (!exerciseFilter.equipment || ex.equipment === exerciseFilter.equipment) &&
                (exerciseSearchTerm === "" || 
                  ex.name.toLowerCase().includes(exerciseSearchTerm.toLowerCase()) ||
                  ex.category.toLowerCase().includes(exerciseSearchTerm.toLowerCase()) ||
                  ex.equipment.toLowerCase().includes(exerciseSearchTerm.toLowerCase())
                )
              ).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No se encontraron ejercicios con los filtros aplicados</p>
                  <p className="text-sm mt-1">Intenta cambiar los filtros o el término de búsqueda</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
