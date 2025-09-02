"use client"

import { useState, useEffect } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
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

// Calendar Event types
type CalendarEvent = {
  id: number
  title: string
  description: string
  date: string
  time: string
  type: "training" | "routine_send" | "payment" | "custom"
  clientId?: number
  clientName?: string
  isPresential?: boolean
  status: "pending" | "completed" | "cancelled"
  color: string
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
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState<boolean>(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState<boolean>(false)
  const [isCreateExerciseDialogOpen, setIsCreateExerciseDialogOpen] = useState<boolean>(false)
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    { id: 1, title: "Entrenamiento con María González", description: "Sesión presencial de fuerza y cardio", date: "2024-01-15", time: "09:00", type: "training", clientId: 1, clientName: "María González", isPresential: true, status: "pending", color: "bg-blue-500" },
    { id: 2, title: "Enviar rutina a Carlos Ruiz", description: "Nueva rutina de hipertrofia", date: "2024-01-15", time: "14:00", type: "routine_send", clientId: 2, clientName: "Carlos Ruiz", status: "pending", color: "bg-green-500" },
    { id: 3, title: "Pago mensual - Ana López", description: "Renovación de plan mensual", date: "2024-01-16", time: "10:00", type: "payment", clientId: 3, clientName: "Ana López", status: "pending", color: "bg-orange-500" },
    { id: 4, title: "Entrenamiento con Carlos Ruiz", description: "Sesión de cardio por su cuenta", date: "2024-01-16", time: "16:00", type: "training", clientId: 2, clientName: "Carlos Ruiz", isPresential: false, status: "pending", color: "bg-purple-500" }
  ])
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear())
  
  // Form state for new event
  const [newEventForm, setNewEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'training' as CalendarEvent['type'],
    clientId: undefined as number | undefined,
    isPresential: undefined as boolean | undefined,
    status: 'pending' as CalendarEvent['status'],
    color: '#3b82f6'
  })

  // Form state for new exercise
  const [newExerciseForm, setNewExerciseForm] = useState({
    name: '',
    category: 'Tren superior' as Exercise['category'],
    equipment: 'Sin elementos' as Exercise['equipment'],
    description: ''
  })

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
    if (confirm("¿Estás seguro de que quieres eliminar este alumno?")) {
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



  const stats = [
    { title: "Alumnos Activos", value: "24", change: "+3", icon: Users, color: "text-primary" },
    { title: "Sesiones Hoy", value: "8", change: "+2", icon: Calendar, color: "text-primary" },
    { title: "Ingresos Mes", value: "$4,250", change: "+12%", icon: DollarSign, color: "text-primary" },
    { title: "Progreso Promedio", value: "82%", change: "+5%", icon: TrendingUp, color: "text-primary" },
  ]

  // Mock exercises catalog
  const [exercisesCatalog, setExercisesCatalog] = useState<Exercise[]>([
    { id: 1, name: "Press banca", category: "Tren superior", equipment: "Pesas" },
    { id: 2, name: "Dominadas", category: "Tren superior", equipment: "Sin elementos" },
    { id: 3, name: "Sentadillas", category: "Tren inferior", equipment: "Pesas" },
    { id: 4, name: "Prensa de piernas", category: "Tren inferior", equipment: "Máquinas" },
    { id: 5, name: "Plancha", category: "Core", equipment: "Sin elementos" },
    { id: 6, name: "Crunches", category: "Core", equipment: "Sin elementos" },
    { id: 7, name: "Cinta trote", category: "Cardio", equipment: "Máquinas" },
    { id: 8, name: "Remo con mancuerna", category: "Tren superior", equipment: "Pesas" },
    { id: 9, name: "Estocadas", category: "Tren inferior", equipment: "Pesas" },
  ])

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
  const [viewingRoutine, setViewingRoutine] = useState<RoutineTemplate | null>(null)
  const [isRoutineViewerOpen, setIsRoutineViewerOpen] = useState(false)

  const currentFolder = routineFolders.find((f) => f.id === selectedFolderId) || routineFolders[0]
  const filteredTemplates = (currentFolder?.templates || []).filter((t) => t.name.toLowerCase().includes(routineSearch.toLowerCase()))

  const handleCreateFolder = () => {
    const name = prompt("Nombre de la carpeta")
    if (!name) return
    setRoutineFolders((prev) => [...prev, { id: Date.now(), name, templates: [] }])
  }

  const handleDeleteTemplate = (templateId: number) => {
    if (!currentFolder) return
    const confirmDelete = confirm("¿Eliminar esta rutina?")
    if (!confirmDelete) return
    setRoutineFolders(prev => prev.map(folder =>
      folder.id === currentFolder.id
        ? { ...folder, templates: folder.templates.filter(t => t.id !== templateId) }
        : folder
    ))
  }

  const handleMoveTemplate = (templateId: number, targetFolderId: number) => {
    if (!currentFolder || currentFolder.id === targetFolderId) return
    setRoutineFolders(prev => {
      const sourceFolder = prev.find(f => f.id === currentFolder.id)
      const targetFolder = prev.find(f => f.id === targetFolderId)
      if (!sourceFolder || !targetFolder) return prev
      const templateToMove = sourceFolder.templates.find(t => t.id === templateId)
      if (!templateToMove) return prev
      return prev.map(f => {
        if (f.id === sourceFolder.id) {
          return { ...f, templates: f.templates.filter(t => t.id !== templateId) }
        }
        if (f.id === targetFolder.id) {
          return { ...f, templates: [templateToMove, ...f.templates] }
        }
        return f
      })
    })
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
    // Open the add event dialog for scheduling a session
    setNewEventForm({
      title: '',
      description: '',
      date: '',
      time: '',
      type: 'training',
      clientId: undefined,
      isPresential: true,
      status: 'pending',
      color: '#3b82f6'
    })
    setIsAddEventDialogOpen(true)
  }

  const handleNewClient = () => {
    setIsNewClientDialogOpen(true)
  }

  const handleCreateRoutine = () => {
    // Navigate to routines tab and create a new routine
    setActiveTab("routines")
    // Trigger the create routine function
    setTimeout(() => {
      const name = prompt("Nombre de la nueva rutina")
      if (!name || !currentFolder) return
      const newTemplate: RoutineTemplate = { id: Date.now(), name, blocks: [] }
      setRoutineFolders((prev) => prev.map((f) => (f.id === currentFolder.id ? { ...f, templates: [newTemplate, ...f.templates] } : f)))
    }, 100)
  }

  const handleScheduleAppointment = () => {
    // Open the add event dialog for scheduling an appointment
    setNewEventForm({
      title: '',
      description: '',
      date: '',
      time: '',
      type: 'custom',
      clientId: undefined,
      isPresential: undefined,
      status: 'pending',
      color: '#3b82f6'
    })
    setIsAddEventDialogOpen(true)
  }

  const handleScheduleSession = (clientId: number) => {
    const client = allClients.find(c => c.id === clientId)
    if (!client) return
    
    // Pre-fill the form with client information
    setNewEventForm({
      title: `Entrenamiento con ${client.name}`,
      description: `Sesión de entrenamiento con ${client.name}`,
      date: '',
      time: '',
      type: 'training',
      clientId: clientId,
      isPresential: true,
      status: 'pending',
      color: '#3b82f6'
    })
    
    setIsAddEventDialogOpen(true)
  }

  const handleRegisterPayment = () => {
    alert("Funcionalidad de registrar pago estará disponible cuando implementemos la sección de pagos")
  }

  // Calendar/Agenda handlers
  const handleAddEvent = () => {
    setIsAddEventDialogOpen(true)
  }

  const handleCreateEvent = (eventData: {
    title: string
    description: string
    date: string
    time: string
    type: CalendarEvent['type']
    clientId?: number
    clientName?: string
    isPresential?: boolean
    status: CalendarEvent['status']
    color: string
  }) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Date.now()
    }
    setCalendarEvents(prev => [...prev, newEvent])
    setIsAddEventDialogOpen(false)
  }

  const handleCreateExercise = () => {
    if (!newExerciseForm.name.trim()) {
      alert("Por favor ingresa el nombre del ejercicio")
      return
    }

    const newExercise: Exercise = {
      id: Date.now(),
      name: newExerciseForm.name.trim(),
      category: newExerciseForm.category,
      equipment: newExerciseForm.equipment,
      description: newExerciseForm.description.trim() || undefined
    }

    setExercisesCatalog(prev => [...prev, newExercise])
    
    // Reset form
    setNewExerciseForm({
      name: '',
      category: 'Tren superior',
      equipment: 'Sin elementos',
      description: ''
    })
    
    setIsCreateExerciseDialogOpen(false)
    alert(`Ejercicio "${newExercise.name}" creado exitosamente`)
  }

  const handleExportRoutineToPDF = async (template: RoutineTemplate) => {
    try {
      // Create a temporary div to render the routine content
      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.top = '0'
      tempDiv.style.width = '800px'
      tempDiv.style.padding = '40px'
      tempDiv.style.backgroundColor = 'white'
      tempDiv.style.color = 'black'
      tempDiv.style.fontFamily = 'Arial, sans-serif'
      tempDiv.style.fontSize = '14px'
      tempDiv.style.lineHeight = '1.6'
      
      // Build the routine content with better formatting
      let content = `
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #f97316; padding-bottom: 20px;">
          <h1 style="color: #f97316; font-size: 32px; margin: 0; font-weight: bold;">RUTINA DE ENTRENAMIENTO</h1>
          <h2 style="color: #333; font-size: 24px; margin: 10px 0;">${template.name}</h2>
          ${template.description ? `<p style="color: #666; font-size: 16px; margin: 10px 0; font-style: italic;">${template.description}</p>` : ''}
        </div>
      `
      
      template.blocks.forEach((block, blockIndex) => {
        content += `
          <div style="margin-bottom: 30px; page-break-inside: avoid;">
            <h3 style="color: #333; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #f97316; padding-bottom: 8px; background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
              BLOQUE ${blockIndex + 1}: ${block.name}
            </h3>
            <p style="color: #666; margin-bottom: 20px; font-weight: bold; font-size: 16px;">
              Repeticiones del bloque: ${block.repetitions}
            </p>
        `
        
        block.exercises.forEach((exercise, exerciseIndex) => {
          const exerciseData = exercisesCatalog.find(ex => ex.id === exercise.exerciseId)
          if (exerciseData) {
            content += `
              <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: #fafafa;">
                <h4 style="color: #333; font-size: 18px; margin: 0 0 10px 0; font-weight: bold;">
                  ${exerciseIndex + 1}. ${exerciseData.name}
                </h4>
                <div style="display: flex; gap: 20px; margin-bottom: 8px; flex-wrap: wrap;">
                  <span style="background-color: #e3f2fd; padding: 4px 8px; border-radius: 4px; font-weight: bold;">
                    Series: ${exercise.sets}
                  </span>
                  <span style="background-color: #f3e5f5; padding: 4px 8px; border-radius: 4px; font-weight: bold;">
                    Repeticiones: ${exercise.reps}
                  </span>
                  <span style="background-color: #e8f5e8; padding: 4px 8px; border-radius: 4px; font-weight: bold;">
                    Descanso: ${exercise.restSec}s
                  </span>
                </div>
                <div style="color: #666; font-size: 14px; margin-top: 8px;">
                  <strong>Categoría:</strong> ${exerciseData.category} | 
                  <strong>Equipamiento:</strong> ${exerciseData.equipment}
                  ${exerciseData.description ? `<br><strong>Descripción:</strong> ${exerciseData.description}` : ''}
                </div>
              </div>
            `
          }
        })
        
        content += `</div>`
      })
      
      tempDiv.innerHTML = content
      document.body.appendChild(tempDiv)
      
      // Generate PDF using html2canvas and jsPDF
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: tempDiv.scrollHeight
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      
      let position = 0
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      
      // Clean up
      document.body.removeChild(tempDiv)
      
      // Download the PDF
      const fileName = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_rutina.pdf`
      pdf.save(fileName)
      
      alert('Rutina exportada como PDF exitosamente')
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error al generar el PDF. Inténtalo de nuevo.')
    }
  }

  const handleExportRoutineToExcel = (template: RoutineTemplate) => {
    try {
      // Create a proper Excel file using XLSX library
      const workbook = XLSX.utils.book_new()
      
      // Create main routine sheet with better formatting
      const routineData = [
        ['RUTINA DE ENTRENAMIENTO'],
        [''],
        ['Nombre de la Rutina:', template.name],
        ['Descripción:', template.description || 'Sin descripción'],
        ['Fecha de Creación:', new Date().toLocaleDateString('es-ES')],
        [''],
        ['RESUMEN DE BLOQUES'],
        [''],
        ['Bloque', 'Nombre del Bloque', 'Repeticiones', 'Número de Ejercicios']
      ]
      
      template.blocks.forEach((block, blockIndex) => {
        routineData.push([
          `Bloque ${blockIndex + 1}`,
          block.name,
          String(block.repetitions),
          String(block.exercises.length)
        ])
      })
      
      // Add empty rows for better formatting
      routineData.push([''])
      routineData.push(['DETALLE COMPLETO DE EJERCICIOS'])
      routineData.push([''])
      routineData.push([
        'Bloque',
        'Nombre del Ejercicio',
        'Categoría',
        'Equipamiento',
        'Series',
        'Repeticiones',
        'Descanso (segundos)',
        'Descripción del Ejercicio'
      ])
      
      template.blocks.forEach((block, blockIndex) => {
        block.exercises.forEach((exercise) => {
          const exerciseData = exercisesCatalog.find(ex => ex.id === exercise.exerciseId)
          if (exerciseData) {
            routineData.push([
              `Bloque ${blockIndex + 1}: ${block.name}`,
              exerciseData.name,
              exerciseData.category,
              exerciseData.equipment,
              String(exercise.sets),
              String(exercise.reps),
              String(exercise.restSec),
              exerciseData.description || 'Sin descripción'
            ])
          }
        })
      })
      
      // Create the worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(routineData)
      
      // Set column widths for better formatting
      const columnWidths = [
        { wch: 25 }, // Bloque
        { wch: 30 }, // Nombre del Ejercicio
        { wch: 15 }, // Categoría
        { wch: 15 }, // Equipamiento
        { wch: 8 },  // Series
        { wch: 12 }, // Repeticiones
        { wch: 15 }, // Descanso
        { wch: 40 }  // Descripción
      ]
      worksheet['!cols'] = columnWidths
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Rutina Completa')
      
      // Create a separate sheet for just the exercise list
      const exerciseListData = [
        ['LISTA DE EJERCICIOS'],
        [''],
        ['Ejercicio', 'Categoría', 'Equipamiento', 'Descripción']
      ]
      
      // Get unique exercises from the routine
      const uniqueExercises = new Map()
      template.blocks.forEach((block) => {
        block.exercises.forEach((exercise) => {
          const exerciseData = exercisesCatalog.find(ex => ex.id === exercise.exerciseId)
          if (exerciseData && !uniqueExercises.has(exerciseData.id)) {
            uniqueExercises.set(exerciseData.id, exerciseData)
          }
        })
      })
      
      uniqueExercises.forEach((exerciseData) => {
        exerciseListData.push([
          exerciseData.name,
          exerciseData.category,
          exerciseData.equipment,
          exerciseData.description || 'Sin descripción'
        ])
      })
      
      const exerciseListSheet = XLSX.utils.aoa_to_sheet(exerciseListData)
      exerciseListSheet['!cols'] = [
        { wch: 30 }, // Ejercicio
        { wch: 15 }, // Categoría
        { wch: 15 }, // Equipamiento
        { wch: 40 }  // Descripción
      ]
      
      XLSX.utils.book_append_sheet(workbook, exerciseListSheet, 'Lista de Ejercicios')
      
      // Save the file
      const fileName = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_rutina.xlsx`
      XLSX.writeFile(workbook, fileName)
      
      alert('Rutina exportada como archivo CSV exitosamente')
    } catch (error) {
      console.error('Error exporting routine:', error)
      alert('Error al exportar la rutina. Inténtalo de nuevo.')
    }
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsEventDetailsOpen(true)
    
    // Si es un evento de enviar rutina, mostrar opción para ir a rutinas
    if (event.type === 'routine_send' && event.clientName) {
      const goToRoutines = confirm(`¿Quieres ir a la sección de rutinas para enviar una rutina a ${event.clientName}?`)
      if (goToRoutines) {
        handleGoToRoutines(event.clientName)
      }
    }
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setNewEventForm({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      type: event.type,
      clientId: event.clientId,
      isPresential: event.isPresential,
      status: event.status,
      color: event.color.replace('bg-', '#').replace('-500', '')
    })
    setIsEventDetailsOpen(false)
    setIsAddEventDialogOpen(true)
  }

  const handleDeleteEvent = (eventId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      setCalendarEvents(prev => prev.filter(e => e.id !== eventId))
      setIsEventDetailsOpen(false)
    }
  }

  const handleUpdateEvent = (eventData: {
    title: string 
    description: string
    date: string
    time: string
    type: CalendarEvent['type']
    clientId?: number
    clientName?: string
    isPresential?: boolean
    status: CalendarEvent['status']
    color: string
  }) => {
    if (selectedEvent) {
      const updatedEvent: CalendarEvent = {
        ...selectedEvent,
        ...eventData,
        color: `bg-[${eventData.color}]`
      }
      setCalendarEvents(prev => prev.map(e => e.id === selectedEvent.id ? updatedEvent : e))
      setIsAddEventDialogOpen(false)
      setSelectedEvent(null)
    }
  }

  const handleCompleteEvent = (eventId: number) => {
    setCalendarEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, status: 'completed' as const } : event
    ))
    setIsEventDetailsOpen(false)
  }



  const handleGoToRoutines = (clientName: string) => {
    setActiveTab("routines")
    // Here you could also set a filter to show the specific client's routines
    alert(`Redirigiendo a rutinas para ${clientName}`)
  }

  const getEventsForDate = (date: string) => {
    return calendarEvents.filter(event => event.date === date)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11)
        setCurrentYear(prev => prev - 1)
      } else {
        setCurrentMonth(prev => prev - 1)
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0)
        setCurrentYear(prev => prev + 1)
      } else {
        setCurrentMonth(prev => prev + 1)
      }
    }
  }

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const formatDate = (day: number, month: number, year: number) => {
    return new Date(year, month, day).toISOString().split('T')[0]
  }

  const getMonthName = (month: number) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    return months[month]
  }

  const getEventTypeLabel = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'training': return 'Entrenamiento'
      case 'routine_send': return 'Enviar Rutina'
      case 'payment': return 'Pago'
      case 'custom': return 'Personalizado'
      default: return type
    }
  }

  const getEventTypeIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'training': return '🏋️'
      case 'routine_send': return '📤'
      case 'payment': return '💰'
      case 'custom': return '📝'
      default: return '📅'
    }
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
            { id: "clients", label: "Alumnos", icon: Users },
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
              {activeTab === "clients" && "Gestión de Alumnos"}
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
                  <Button className="w-full bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors" variant="outline" onClick={handleAddSession}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agendar Sesión
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Clients */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Alumnos Recientes</CardTitle>
                  <CardDescription>Actividad y progreso de tus alumnos</CardDescription>
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
                  <Button className="w-full bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors" variant="outline" onClick={handleViewAllClients}>
                    Ver Todos los Alumnos
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
                  <Button className="h-20 flex-col gap-2 bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors" variant="outline" onClick={handleNewClient}>
                    <Users className="w-6 h-6" />
                    <span className="text-sm">Nuevo Alumno</span>
                  </Button>
                  <Button
                    className="h-20 flex-col gap-2 bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors"
                    variant="outline"
                    onClick={handleCreateRoutine}
                  >
                    <Activity className="w-6 h-6" />
                    <span className="text-sm">Crear Rutina</span>
                  </Button>
                  <Button
                    className="h-20 flex-col gap-2 bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors"
                    variant="outline"
                    onClick={handleScheduleAppointment}
                  >
                    <Calendar className="w-6 h-6" />
                    <span className="text-sm">Agendar Cita</span>
                  </Button>
                  <Button
                    className="h-20 flex-col gap-2 bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors"
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
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Listado de Alumnos</h2>
        <p className="text-muted-foreground">Visualiza y gestiona todos tus alumnos en una sola vista</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleNewClient} className="hover:bg-accent hover:text-accent-foreground transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Alumno
        </Button>
      </div>
    </div>
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar alumnos por nombre, email o teléfono..."
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
              className="hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Todos ({allClients.length})
            </Button>
            <Button
              variant={clientFilter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setClientFilter("active")}
              className="hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Activos ({allClients.filter((c) => c.status === "Activo").length})
            </Button>
            <Button
              variant={clientFilter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setClientFilter("pending")}
              className="hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Pendientes ({allClients.filter((c) => c.status === "Pendiente").length})
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-muted/40 text-muted-foreground">
                <th className="px-3 py-2 text-left">Nombre</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Teléfono</th>
                <th className="px-3 py-2 text-left">Estado</th>
                <th className="px-3 py-2 text-left">Progreso</th>
                <th className="px-3 py-2 text-left">Próxima sesión</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id} className="border-b border-border hover:bg-muted/30 transition-colors items-center">
                  <td className="px-3 py-2 font-medium flex items-center gap-2">
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={client.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {client.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    {client.name}
                  </td>
                  <td className="px-3 py-2">{client.email}</td>
                  <td className="px-3 py-2">{client.phone}</td>
                  <td className="px-3 py-2">
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
                  </td>
                  <td className="px-3 py-2 text-left align-middle">{client.progress}%</td>
                  <td className="px-3 py-2">{client.nextSession}</td>
                  <td className="w-12 px-1 py-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleChatFromClient(client.name)}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Chat
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClient(client)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleScheduleSession(client.id)}>
                          <Calendar className="w-4 h-4 mr-2" />
                          Agendar sesión
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteClient(client.id)} className="text-destructive focus:text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    No se encontraron alumnos con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

            {/* Edit Client Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                  <DialogTitle>Editar información del alumno</DialogTitle>
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
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="hover:bg-accent hover:text-accent-foreground transition-colors">Cancelar</Button>
                  <Button onClick={() => { alert("Datos guardados (temporal, sin base de datos)"); setIsEditDialogOpen(false) }}>Guardar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </main>
        )}

        {/* Schedule/Agenda Content */}
        {activeTab === "schedule" && (
          <main className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Agenda</h2>
                <p className="text-muted-foreground">Gestiona tu calendario de entrenamientos y eventos</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddEvent} className="hover:bg-orange-500 transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Evento
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-card-foreground">Calendario</CardTitle>
                    <CardDescription>Selecciona una fecha para ver los eventos</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('prev')}
                      className="hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      ←
                    </Button>
                    <div className="text-center min-w-[120px]">
                      <div className="font-medium text-card-foreground">
                        {getMonthName(currentMonth)} {currentYear}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('next')}
                      className="hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      →
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {(() => {
                    const daysInMonth = getDaysInMonth(currentMonth, currentYear)
                    const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
                    const days = []
                    
                    // Add empty cells for days before the first day of the month
                    for (let i = 0; i < firstDay; i++) {
                      days.push(
                        <div key={`empty-${i}`} className="min-h-[80px] p-1 border border-border bg-muted/30">
                        </div>
                      )
                    }
                    
                    // Add days of the current month
                    for (let day = 1; day <= daysInMonth; day++) {
                      const dateString = formatDate(day, currentMonth, currentYear)
                      const isToday = dateString === new Date().toISOString().split('T')[0]
                      const isSelected = dateString === selectedDate
                      const events = getEventsForDate(dateString)
                      
                      days.push(
                        <div
                          key={day}
                          className={`min-h-[80px] p-1 border border-border cursor-pointer hover:bg-accent/50 transition-colors ${
                            isToday ? 'ring-2 ring-primary' : ''
                          } ${isSelected ? 'bg-primary/20' : 'bg-card'}`}
                          onClick={() => setSelectedDate(dateString)}
                        >
                          <div className="text-xs text-muted-foreground mb-1">
                            {day}
                          </div>
                          <div className="space-y-1">
                            {events.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEventClick(event)
                                }}
                                className={`text-xs p-1 rounded cursor-pointer transition-colors hover:opacity-80 ${event.color}`}
                                title={`${event.title} - ${event.time}`}
                              >
                                <div className="truncate font-medium text-white">
                                  {getEventTypeIcon(event.type)} {event.title.substring(0, 15)}
                                </div>
                                <div className="text-white/80 text-[10px]">
                                  {event.time}
                                </div>
                              </div>
                            ))}
                            {events.length > 2 && (
                              <div className="text-xs text-muted-foreground text-center">
                                +{events.length - 2} más
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    }
                    
                    return days
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Selected Date Events */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">
                  Eventos del {new Date(selectedDate).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardTitle>
                <CardDescription>Detalles de los eventos programados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {getEventsForDate(selectedDate).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay eventos programados para este día</p>
                  </div>
                ) : (
                  getEventsForDate(selectedDate).map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className="p-4 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-block w-3 h-3 rounded-full ${event.color}`}></span>
                            <h4 className="font-medium text-card-foreground">{event.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {getEventTypeLabel(event.type)}
                            </Badge>
                            <Badge 
                              variant={event.status === 'completed' ? 'default' : event.status === 'cancelled' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {event.status === 'completed' ? 'Completado' : event.status === 'cancelled' ? 'Cancelado' : 'Pendiente'}
                            </Badge>
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>🕐 {event.time}</span>
                            {event.clientName && <span>👤 {event.clientName}</span>}
                            {event.type === 'training' && event.isPresential !== undefined && (
                              <Badge variant="outline" className="text-xs">
                                {event.isPresential ? 'Presencial' : 'Por su cuenta'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEventClick(event)
                          }}
                          className="hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
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
                <Button variant="outline" onClick={handleCreateFolder} className="bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors">
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
                                  className="w-full hover:bg-accent hover:text-accent-foreground transition-colors"
                                  onClick={() => {
                                    setViewingRoutine(tpl)
                                    setIsRoutineViewerOpen(true)
                                  }}
                                >
                                  Ver rutina completa
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 min-w-[220px]">
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
                            <div className="flex items-center gap-2">
                              <Button variant="outline" className="bg-transparent flex-1" onClick={() => handleEditRoutine(tpl)}>Editar</Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                  <DropdownMenuItem onClick={() => handleExportRoutineToExcel(tpl)}>
                                    <FileText className="w-4 h-4 mr-2 text-green-500" />
                                    Exportar como CSV
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {routineFolders
                                    .filter(f => f.id !== currentFolder?.id)
                                    .map(folder => (
                                      <DropdownMenuItem key={folder.id} onClick={() => handleMoveTemplate(tpl.id, folder.id)}>
                                        <ChevronRight className="w-4 h-4 mr-2" />
                                        Mover a: {folder.name}
                                      </DropdownMenuItem>
                                    ))}
                                  {routineFolders.filter(f => f.id !== currentFolder?.id).length > 0 && <DropdownMenuSeparator />}
                                  <DropdownMenuItem onClick={() => handleDeleteTemplate(tpl.id)} variant="destructive">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Eliminar rutina
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <Button className="hover:bg-orange-500 transition-colors">Enviar ahora</Button>
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
                  <Button onClick={() => {
                    setIsExerciseSelectorOpen(false)
                    setIsCreateExerciseDialogOpen(true)
                  }} className="hover:bg-orange-500 transition-colors">
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
                        <SelectItem value="all">Todos</SelectItem>
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
                        <SelectItem value="all">Todos</SelectItem>
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
                          <Button variant="outline" size="icon" onClick={() => alert("Iniciando llamada...")} className="hover:bg-accent hover:text-accent-foreground transition-colors">
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => alert("Iniciando videollamada...")} className="hover:bg-accent hover:text-accent-foreground transition-colors">
                            <Video className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="icon" className="hover:bg-accent hover:text-accent-foreground transition-colors">
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
                                Ver perfil del alumno
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
                          <Button variant="outline" size="icon" onClick={handleFileAttachment} title="Adjuntar archivo" className="hover:bg-accent hover:text-accent-foreground transition-colors">
                            <Paperclip className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={handleImageAttachment} title="Adjuntar imagen" className="hover:bg-accent hover:text-accent-foreground transition-colors">
                            <ImageIcon className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={handleEmojiPicker} title="Agregar emoji" className="hover:bg-accent hover:text-accent-foreground transition-colors">
                            <Smile className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => alert("Grabando audio...")}
                            title="Grabar audio"
                            className="hover:bg-accent hover:text-accent-foreground transition-colors"
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
                      <p className="text-muted-foreground">Elige un alumno de la lista para comenzar a chatear</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </main>
        )}

        {/* Other tabs content placeholders */}
        {activeTab !== "dashboard" && activeTab !== "clients" && activeTab !== "chat" && activeTab !== "schedule" && (
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
            <DialogTitle>Agregar Nuevo Alumno</DialogTitle>
            <DialogDescription>
              Completa la información del nuevo alumno. Los campos marcados con * son obligatorios.
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
            <Button variant="outline" onClick={() => setIsNewClientDialogOpen(false)} className="hover:bg-accent hover:text-accent-foreground transition-colors">
              Cancelar
            </Button>
            <Button
              onClick={() => {
                alert("Alumno agregado correctamente (funcionalidad completa disponible con base de datos)")
                setIsNewClientDialogOpen(false)
              }}
              className="hover:bg-orange-500 transition-colors"
            >
              Agregar Alumno
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewChatDialogOpen} onOpenChange={setIsNewChatDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Nueva conversación</DialogTitle>
            <DialogDescription>Elige un alumno para iniciar un chat o busca uno existente.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar alumno..."
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
                      <Button variant="outline" onClick={() => { setSelectedChat(existing); setActiveTab("chat"); setIsNewChatDialogOpen(false) }} className="hover:bg-accent hover:text-accent-foreground transition-colors">Ir al chat</Button>
                    ) : (
                                              <Button onClick={() => handleStartChat(client)} className="hover:bg-orange-500 transition-colors">Iniciar chat</Button>
                    )}
                  </div>
                )
              })}
              {dedupedNewChatResults.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No se encontraron alumnos.</p>
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
                  <Button onClick={handleAddBlock} variant="outline" className="hover:bg-accent hover:text-accent-foreground transition-colors">
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
                          className="hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar ejercicio
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAddRest(block.id)}
                          className="hover:bg-accent hover:text-accent-foreground transition-colors"
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
                        className="w-12 h-12 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
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
            <Button variant="outline" onClick={() => setIsRoutineEditorOpen(false)} className="hover:bg-accent hover:text-accent-foreground transition-colors">
              Cancelar
            </Button>
            <Button onClick={handleSaveRoutine} className="hover:bg-orange-500 transition-colors">
              Guardar rutina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Visor de Rutina (solo lectura) */}
      <Dialog open={isRoutineViewerOpen} onOpenChange={setIsRoutineViewerOpen}>
        <DialogContent className="w-[96vw] sm:max-w-none md:max-w-[1000px] max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rutina: {viewingRoutine?.name}</DialogTitle>
            {viewingRoutine?.description ? (
              <DialogDescription>{viewingRoutine.description}</DialogDescription>
            ) : (
              <DialogDescription>Vista de solo lectura para el alumno</DialogDescription>
            )}
          </DialogHeader>

          {viewingRoutine && (
            <div className="space-y-6">
              {viewingRoutine.blocks.map((block) => (
                <div key={block.id} className="rounded-2xl border p-4">
                  <div className="flex items-center justify-between mb-2 gap-3">
                    <h3 className="text-lg font-semibold">{block.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Repeticiones: {block.repetitions}</Badge>
                      <Badge variant="secondary">Descanso entre repeticiones: {block.restBetweenRepetitions}s</Badge>
                      <Badge variant="secondary">Descanso post bloque: {block.restAfterBlock}s</Badge>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="py-2 pr-3">Ejercicio</th>
                          <th className="py-2 pr-3">Series</th>
                          <th className="py-2 pr-3">Reps</th>
                          <th className="py-2 pr-3">Descanso</th>
                        </tr>
                      </thead>
                      <tbody>
                        {block.exercises.map((ex, idx) => {
                          const isRest = ex.exerciseId === -1;
                          const exData = exercisesCatalog.find(e => e.id === ex.exerciseId); // mapea id->nombre
                          return (
                            <tr key={idx} className="border-b last:border-0">
                              <td className="py-2 pr-3">
                                {isRest ? "Descanso" : (exData?.name ?? `Ejercicio ${ex.exerciseId}`)}
                              </td>
                              <td className="py-2 pr-3">{isRest ? "—" : ex.sets}</td>
                              <td className="py-2 pr-3">{isRest ? "—" : ex.reps}</td>
                              <td className="py-2 pr-3">{ex.restSec ? `${ex.restSec}s` : "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                    <SelectItem value="all">Todos</SelectItem>
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
                      <Button variant="outline" size="sm" className="hover:bg-accent hover:text-accent-foreground transition-colors">
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

            {/* Botón para crear nuevo ejercicio */}
            <div className="flex justify-center pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsExerciseSelectorOpen(false)
                  setIsCreateExerciseDialogOpen(true)
                }}
                className="hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Nuevo Ejercicio
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para crear nuevo ejercicio */}
      <Dialog open={isCreateExerciseDialogOpen} onOpenChange={(open) => {
        setIsCreateExerciseDialogOpen(open)
        if (!open) {
          // Reset form when dialog closes
          setNewExerciseForm({
            name: '',
            category: 'Tren superior',
            equipment: 'Sin elementos',
            description: ''
          })
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Ejercicio</DialogTitle>
            <DialogDescription>
              Completa la información del ejercicio. Los campos marcados con * son obligatorios.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="exerciseName" className="text-right">
                Nombre *
              </Label>
              <Input 
                id="exerciseName" 
                placeholder="Nombre del ejercicio" 
                className="col-span-3"
                value={newExerciseForm.name}
                onChange={(e) => setNewExerciseForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="exerciseCategory" className="text-right">
                Categoría *
              </Label>
              <Select 
                value={newExerciseForm.category} 
                onValueChange={(value) => setNewExerciseForm(prev => ({ ...prev, category: value as Exercise['category'] }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tren superior">Tren superior</SelectItem>
                  <SelectItem value="Tren inferior">Tren inferior</SelectItem>
                  <SelectItem value="Core">Core</SelectItem>
                  <SelectItem value="Cardio">Cardio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="exerciseEquipment" className="text-right">
                Equipamiento *
              </Label>
              <Select 
                value={newExerciseForm.equipment} 
                onValueChange={(value) => setNewExerciseForm(prev => ({ ...prev, equipment: value as Exercise['equipment'] }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar equipamiento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Máquinas">Máquinas</SelectItem>
                  <SelectItem value="Pesas">Pesas</SelectItem>
                  <SelectItem value="Bandas">Bandas</SelectItem>
                  <SelectItem value="Sin elementos">Sin elementos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="exerciseDescription" className="text-right">
                Descripción
              </Label>
              <Textarea 
                id="exerciseDescription" 
                placeholder="Descripción del ejercicio (opcional)" 
                className="col-span-3"
                value={newExerciseForm.description}
                onChange={(e) => setNewExerciseForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateExerciseDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateExercise} className="hover:bg-orange-500 transition-colors">
              Crear Ejercicio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddEventDialogOpen} onOpenChange={(open) => {
        setIsAddEventDialogOpen(open)
        if (!open) {
          // Reset form and selected event when dialog closes
          setNewEventForm({
            title: '',
            description: '',
            date: '',
            time: '',
            type: 'training',
            clientId: undefined,
            isPresential: undefined,
            status: 'pending',
            color: '#3b82f6'
          })
          setSelectedEvent(null)
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedEvent ? 'Editar Evento' : 'Agregar Evento'}</DialogTitle>
            <DialogDescription>
              Completa la información del evento. Los campos marcados con * son obligatorios.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
                         <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="title" className="text-right">
                 Título *
               </Label>
               <Input 
                 id="title" 
                 placeholder="Título del evento" 
                 className="col-span-3"
                 value={newEventForm.title}
                 onChange={(e) => setNewEventForm(prev => ({ ...prev, title: e.target.value }))}
               />
             </div>
             <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="description" className="text-right">
                 Descripción
               </Label>
               <Textarea 
                 id="description" 
                 placeholder="Descripción del evento" 
                 className="col-span-3"
                 value={newEventForm.description}
                 onChange={(e) => setNewEventForm(prev => ({ ...prev, description: e.target.value }))}
               />
             </div>
             <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="date" className="text-right">
                 Fecha *
               </Label>
               <Input 
                 id="date" 
                 type="date" 
                 placeholder="Fecha del evento" 
                 className="col-span-3"
                 value={newEventForm.date}
                 onChange={(e) => setNewEventForm(prev => ({ ...prev, date: e.target.value }))}
               />
             </div>
             <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="time" className="text-right">
                 Hora *
               </Label>
               <Input 
                 id="time" 
                 type="time" 
                 placeholder="Hora del evento" 
                 className="col-span-3"
                 value={newEventForm.time}
                 onChange={(e) => setNewEventForm(prev => ({ ...prev, time: e.target.value }))}
               />
             </div>
             <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="type" className="text-right">
                 Tipo *
               </Label>
               <Select value={newEventForm.type} onValueChange={(value) => setNewEventForm(prev => ({ ...prev, type: value as CalendarEvent['type'] }))}>
                 <SelectTrigger className="col-span-3">
                   <SelectValue placeholder="Seleccionar tipo" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="training">Entrenamiento</SelectItem>
                   <SelectItem value="routine_send">Enviar Rutina</SelectItem>
                   <SelectItem value="payment">Pago</SelectItem>
                   <SelectItem value="custom">Personalizado</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="clientId" className="text-right">
                 Alumno
               </Label>
               <Select value={newEventForm.clientId ? String(newEventForm.clientId) : ''} onValueChange={(value) => setNewEventForm(prev => ({ ...prev, clientId: value ? Number(value) : undefined }))}>
                 <SelectTrigger className="col-span-3">
                   <SelectValue placeholder="Seleccionar alumno" />
                 </SelectTrigger>
                 <SelectContent>
                   {allClients.map((client) => (
                     <SelectItem key={client.id} value={String(client.id)}>{client.name}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
             <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="isPresential" className="text-right">
                 Presencial
               </Label>
               <Select value={newEventForm.isPresential !== undefined ? String(newEventForm.isPresential) : ''} onValueChange={(value) => setNewEventForm(prev => ({ ...prev, isPresential: value === 'true' }))}>
                 <SelectTrigger className="col-span-3">
                   <SelectValue placeholder="Seleccionar si" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="true">Sí</SelectItem>
                   <SelectItem value="false">No</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="status" className="text-right">
                 Estado *
               </Label>
               <Select value={newEventForm.status} onValueChange={(value) => setNewEventForm(prev => ({ ...prev, status: value as CalendarEvent['status'] }))}>
                 <SelectTrigger className="col-span-3">
                   <SelectValue placeholder="Seleccionar estado" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="pending">Pendiente</SelectItem>
                   <SelectItem value="completed">Completado</SelectItem>
                   <SelectItem value="cancelled">Cancelado</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="color" className="text-right">
                 Color *
               </Label>
               <Input 
                 id="color" 
                 type="color" 
                 placeholder="Seleccionar color" 
                 className="col-span-3"
                 value={newEventForm.color}
                 onChange={(e) => setNewEventForm(prev => ({ ...prev, color: e.target.value }))}
               />
             </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEventDialogOpen(false)} className="hover:bg-accent hover:text-accent-foreground transition-colors">
              Cancelar
            </Button>
                         <Button
               onClick={() => {
                 // Validate required fields
                 const errors = []
                 if (!newEventForm.title?.trim()) errors.push("Título")
                 if (!newEventForm.date?.trim()) errors.push("Fecha")
                 if (!newEventForm.time?.trim()) errors.push("Hora")
                 
                 if (errors.length > 0) {
                   alert(`Por favor completa los siguientes campos obligatorios: ${errors.join(", ")}`)
                   return
                 }
                 
                 const clientName = newEventForm.clientId ? allClients.find(c => c.id === newEventForm.clientId)?.name : undefined
                 
                 if (selectedEvent) {
                   // Update existing event
                   handleUpdateEvent({
                     title: newEventForm.title,
                     description: newEventForm.description,
                     date: newEventForm.date,
                     time: newEventForm.time,
                     type: newEventForm.type,
                     clientId: newEventForm.clientId,
                     clientName: clientName,
                     isPresential: newEventForm.isPresential,
                     status: newEventForm.status,
                     color: newEventForm.color
                   })
                   alert("Evento actualizado correctamente")
                 } else {
                   // Create new event
                   handleCreateEvent({
                     title: newEventForm.title,
                     description: newEventForm.description,
                     date: newEventForm.date,
                     time: newEventForm.time,
                     type: newEventForm.type,
                     clientId: newEventForm.clientId,
                     clientName: clientName,
                     isPresential: newEventForm.isPresential,
                     status: newEventForm.status,
                     color: `bg-[${newEventForm.color}]`
                   })
                   alert("Evento agregado correctamente")
                 }
                 
                 // Reset form
                 setNewEventForm({
                   title: '',
                   description: '',
                   date: '',
                   time: '',
                   type: 'training',
                   clientId: undefined,
                   isPresential: undefined,
                   status: 'pending',
                   color: '#3b82f6'
                 })
                 
                 setSelectedEvent(null)
               }}
               className="hover:bg-orange-500 transition-colors"
             >
               {selectedEvent ? 'Actualizar Evento' : 'Agregar Evento'}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEventDetailsOpen} onOpenChange={setIsEventDetailsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Detalles del Evento</DialogTitle>
            <DialogDescription>
              Aquí puedes ver los detalles del evento seleccionado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-title" className="text-right">
                Título
              </Label>
              <p id="event-title" className="col-span-3">{selectedEvent?.title}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-description" className="text-right">
                Descripción
              </Label>
              <p id="event-description" className="col-span-3">{selectedEvent?.description}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-date" className="text-right">
                Fecha
              </Label>
              <p id="event-date" className="col-span-3">{selectedEvent?.date}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-time" className="text-right">
                Hora
              </Label>
              <p id="event-time" className="col-span-3">{selectedEvent?.time}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-type" className="text-right">
                Tipo
              </Label>
              <p id="event-type" className="col-span-3">{selectedEvent?.type ? getEventTypeLabel(selectedEvent.type) : ''}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-client" className="text-right">
                Alumno
              </Label>
              <p id="event-client" className="col-span-3">{selectedEvent?.clientName}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-isPresential" className="text-right">
                Presential
              </Label>
              <p id="event-isPresential" className="col-span-3">{selectedEvent?.isPresential ? "Sí" : "No"}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-status" className="text-right">
                Estado
              </Label>
              <p id="event-status" className="col-span-3">{selectedEvent?.status}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-color" className="text-right">
                Color
              </Label>
              <div id="event-color" className="col-span-3" style={{ backgroundColor: selectedEvent?.color }}></div>
            </div>
          </div>
                     <DialogFooter>
             <Button variant="outline" onClick={() => setIsEventDetailsOpen(false)} className="hover:bg-accent hover:text-accent-foreground transition-colors">
               Cerrar
             </Button>
             
             <Button
               onClick={() => {
                 if (selectedEvent) {
                   handleEditEvent(selectedEvent)
                 }
               }}
               className="hover:bg-blue-500 transition-colors"
             >
               <Edit className="w-4 h-4 mr-2" />
               Editar
             </Button>
             
             {/* Botón especial para eventos de rutina */}
             {selectedEvent?.type === 'routine_send' && selectedEvent.clientName && (
               <Button
                 onClick={() => {
                   handleGoToRoutines(selectedEvent.clientName!)
                   setIsEventDetailsOpen(false)
                 }}
                 className="hover:bg-orange-500 transition-colors"
               >
                 Ir a Rutinas
               </Button>
             )}
             
             <Button
               onClick={() => {
                 if (selectedEvent?.id) {
                   handleCompleteEvent(selectedEvent.id)
                   alert("Evento marcado como completado")
                   setIsEventDetailsOpen(false)
                 }
               }}
               className="hover:bg-green-500 transition-colors"
             >
               Marcar como Completado
             </Button>
             <Button
               onClick={() => {
                 if (selectedEvent?.id) {
                   handleDeleteEvent(selectedEvent.id)
                 }
               }}
               className="hover:bg-red-500 transition-colors"
             >
               <Trash2 className="w-4 h-4 mr-2" />
               Eliminar
             </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
