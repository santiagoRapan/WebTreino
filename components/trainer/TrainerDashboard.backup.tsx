// @ts-nocheck
// Legacy backup of TrainerDashboard (chat version) intentionally neutralized.
// Keeping the file to preserve history but prevent compilation issues.
// If you don't need this file, it's safe to delete it from the repository.

export {};

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import ExcelJS from "exceljs"
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
import { toast } from "@/hooks/use-toast"
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
import { Sidebar } from "@/components/trainer/Sidebar"
import { TrainerHeader } from "@/components/trainer/TrainerHeader"
import { DashboardTab } from "@/components/trainer/DashboardTab"
import { ClientsTab } from "@/components/trainer/ClientsTab"
import { ScheduleTab } from "@/components/trainer/ScheduleTab"
import { RoutinesTab } from "@/components/trainer/RoutinesTab"
//import { ChatTab } from "@/components/trainer/ChatTab"
import {
  CalendarEvent,
  Chat,
  ChatMessage,
  Client,
  EventFormState,
  Exercise,
  ExerciseFilterState,
  ExerciseFormState,
  ExerciseInputsState,
  DashboardStat,
  UpcomingSession,
  RecentClient,
  RoutineBlock,
  RoutineFolder,
  RoutineTemplate,
} from "@/types/trainer"
import {
  formatDate,
  getDaysInMonth,
  getEventTypeIcon,
  getEventTypeLabel,
  getFirstDayOfMonth,
  getMonthName,
  normalizeText,
} from "@/lib/trainer-utils"
import {
  TrainerDashboardProvider,
  TrainerDashboardContextValue,
  TrainerDashboardState,
  TrainerDashboardActions,
  TrainerDashboardData,
  PendingExerciseState,
} from "@/components/trainer/TrainerDashboardContext"

const FALLBACK_EXERCISES: Exercise[] = [
  {
    id: "push-up",
    name: "Push Up",
    target_muscles: ["Pectorales"],
    body_parts: ["Torso"],
    equipments: [],
    secondary_muscles: ["Tríceps", "Hombros"],
    description: "Flexiones clásicas utilizando el peso corporal.",
  },
  {
    id: "squat",
    name: "Sentadilla",
    target_muscles: ["Cuádriceps"],
    body_parts: ["Piernas"],
    equipments: ["Peso corporal"],
    secondary_muscles: ["Glúteos", "Isquiotibiales"],
    description: "Sentadilla básica manteniendo la espalda recta.",
  },
  {
    id: "plank",
    name: "Plancha",
    target_muscles: ["Core"],
    body_parts: ["Abdomen"],
    equipments: [],
    secondary_muscles: ["Hombros"],
    description: "Plancha isométrica para fortalecer el core.",
  },
]

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
  const [newEventForm, setNewEventForm] = useState<EventFormState>({
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

  // Form state for new exercise
  const [newExerciseForm, setNewExerciseForm] = useState<ExerciseFormState>({
    name: '',
    gif_URL: '',
    target_muscles: [],
    body_parts: [],
    equipments: [],
    secondary_muscles: [],
  })

  const upcomingSessions: UpcomingSession[] = [
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



  const stats: DashboardStat[] = [
    { title: "Alumnos Activos", value: "24", change: "+3", icon: Users, color: "text-primary" },
    { title: "Sesiones Hoy", value: "8", change: "+2", icon: Calendar, color: "text-primary" },
    { title: "Ingresos Mes", value: "$4,250", change: "+12%", icon: DollarSign, color: "text-primary" },
    { title: "Progreso Promedio", value: "82%", change: "+5%", icon: TrendingUp, color: "text-primary" },
  ]

  // Exercises catalog from Supabase
  const [exercisesCatalog, setExercisesCatalog] = useState<Exercise[]>(FALLBACK_EXERCISES)
  const [loadingExercises, setLoadingExercises] = useState<boolean>(true)

  // Derivados para filtros
  const uniqueCategories = Array.from(new Set(
    exercisesCatalog
      .map(e => (e.category || e.body_parts?.[0] || '').trim())
      .filter(Boolean)
  ))
  const uniqueEquipments = Array.from(new Set(
    exercisesCatalog
      .flatMap(e => e.equipments || [])
      .map(s => s.trim())
      .filter(Boolean)
  ))

  // Fetch exercises from Supabase on mount
  useEffect(() => {
    const fetchExercises = async () => {
      setLoadingExercises(true)
      try {
        const { data, error } = await supabase
          .from('Exercises')
          .select('*')

        if (error) {
          throw error
        }

        if (data && data.length > 0) {
          setExercisesCatalog(data)
        } else {
          setExercisesCatalog(FALLBACK_EXERCISES)
        }
      } catch (err) {
        console.warn('No se pudieron obtener los ejercicios desde Supabase, usando datos locales.', err)
        setExercisesCatalog(FALLBACK_EXERCISES)
      } finally {
        setLoadingExercises(false)
      }
    }
    fetchExercises()
  }, [])

  // Routine folders and templates (initialized after loading catalog to ensure exercise IDs exist)
  const [routineFolders, setRoutineFolders] = useState<RoutineFolder[]>([])

  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(1)
  const [routineSearch, setRoutineSearch] = useState("")
  // Unificar tipo de filtros
  const [exerciseFilter, setExerciseFilter] = useState<ExerciseFilterState>({})
  
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

  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  // Mostrar/Ocultar catálogo de ejercicios
  const [showExerciseCatalog, setShowExerciseCatalog] = useState(false)
  const [catalogSearch, setCatalogSearch] = useState("")

  // Initialize default routines using existing exercises
  useEffect(() => {
    if (routineFolders.length === 0 && exercisesCatalog.length > 0) {
      const ids = exercisesCatalog.map(e => e.id)
      const safeId = (idx: number) => ids[Math.min(idx, ids.length - 1)]
      const newFolders: RoutineFolder[] = [
        {
          id: 1,
          name: 'Hipertrofia',
          templates: [
            {
              id: 101,
              name: 'Pecho-Espalda A',
              description: 'Énfasis en básicos',
              blocks: [
                {
                  id: 1011,
                  name: exercisesCatalog[0]?.name || 'Bloque 1',
                  exercises: [{ exerciseId: safeId(0), sets: 4, reps: 8, restSec: 120 }],
                  repetitions: 3,
                  restBetweenRepetitions: 60,
                  restAfterBlock: 90,
                },
                {
                  id: 1012,
                  name: exercisesCatalog[1]?.name || 'Bloque 2',
                  exercises: [{ exerciseId: safeId(1), sets: 4, reps: 10, restSec: 90 }],
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
          name: 'Funcional',
          templates: [
            {
              id: 201,
              name: 'Fullbody 30min',
              blocks: [
                {
                  id: 2011,
                  name: exercisesCatalog[2]?.name || 'Entrada en calor',
                  exercises: [{ exerciseId: safeId(2), sets: 3, reps: 12, restSec: 60 }],
                  repetitions: 3,
                  restBetweenRepetitions: 60,
                  restAfterBlock: 90,
                },
                {
                  id: 2012,
                  name: exercisesCatalog[3]?.name || 'Bloque 2',
                  exercises: [{ exerciseId: safeId(3), sets: 3, reps: 15, restSec: 60 }],
                  repetitions: 3,
                  restBetweenRepetitions: 60,
                  restAfterBlock: 90,
                },
              ],
            },
          ],
        },
      ]
      setRoutineFolders(newFolders)
    }
  }, [exercisesCatalog])
  // Para agregar descanso
  const [restInput, setRestInput] = useState("");
  const [restBlockId, setRestBlockId] = useState<number | null>(null);
  // Para agregar ejercicio
  const [exerciseInputs, setExerciseInputs] = useState<ExerciseInputsState>({ sets: '', reps: '', restSec: '' });
  // pendingExercise ahora es solo para saber a qué bloque se está agregando el ejercicio
  const [pendingExercise, setPendingExercise] = useState<PendingExerciseState>(null);
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    setRoutineFolders((prev) => [...prev, { id: Date.now(), name: newFolderName.trim(), templates: [] }]);
    setNewFolderName("");
    setShowNewFolderInput(false);
  };

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

  const [showNewRoutineInput, setShowNewRoutineInput] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState("");
  const handleCreateTemplate = () => {
    if (!newRoutineName.trim() || !currentFolder) return;
    const newTemplate: RoutineTemplate = { id: Date.now(), name: newRoutineName.trim(), blocks: [] };
    setRoutineFolders((prev) => prev.map((f) => (f.id === currentFolder.id ? { ...f, templates: [newTemplate, ...f.templates] } : f)));
    setNewRoutineName("");
    setShowNewRoutineInput(false);
  };

  const handleAssignTemplateToClient = (template: RoutineTemplate, client: Client) => {
  toast({ title: `Asignada la rutina "${template.name}" a ${client.name} (mock)` }) // scheduling UI vendrá luego
  }

  const handleEditRoutine = (template: RoutineTemplate) => {
    setEditingRoutine(template)
    setIsRoutineEditorOpen(true)
  }

  const [newBlockName, setNewBlockName] = useState("");
  const handleAddBlock = () => {
    if (!editingRoutine) return;
    if (!newBlockName.trim()) return;
    const newBlock: RoutineBlock = {
      id: Date.now(),
      name: newBlockName.trim(),
      exercises: [],
      repetitions: 1,
      restBetweenRepetitions: 60,
      restAfterBlock: 90,
    };
    setEditingRoutine({
      ...editingRoutine,
      blocks: [...editingRoutine.blocks, newBlock],
    });
    setNewBlockName("");
  };

  const handleAddExerciseToBlock = (blockId: number) => {
    setSelectedBlockId(blockId);
    setIsExerciseSelectorOpen(true);
    setPendingExercise(null);
    setExerciseInputs({ sets: "", reps: "", restSec: "" });
  }

  const handleAddRest = (blockId: number) => {
      setRestBlockId(blockId);
  };

  const confirmAddRest = () => {
  if (!editingRoutine || restBlockId === null) return;
  if (!restInput || isNaN(Number(restInput))) return;
  const newRestExercise = {
    exerciseId: "rest",
    sets: 1,
    reps: Number(restInput),
    restSec: 0,
  };
  setEditingRoutine({
    ...editingRoutine,
    blocks: editingRoutine.blocks.map(block =>
      block.id === restBlockId
        ? { ...block, exercises: [...block.exercises, newRestExercise] }
        : block
    ),
  });
  setRestInput("");
  setRestBlockId(null);
  };
  const handleSelectExercise = (exercise: Exercise) => {
    // Agrega el ejercicio seleccionado al bloque activo de la rutina
    if (!editingRoutine || selectedBlockId == null) return;
    const updatedBlocks = editingRoutine.blocks.map(block => {
      if (block.id === selectedBlockId) {
        return {
          ...block,
          exercises: [
            ...block.exercises,
            { exerciseId: exercise.id, sets: 3, reps: 10, restSec: 60 } // valores por defecto
          ]
        }
      }
      return block
    })
    setEditingRoutine({ ...editingRoutine, blocks: updatedBlocks })
    setIsExerciseSelectorOpen(false)
    setPendingExercise(null)
  };
// Confirmar y agregar ejercicio
const confirmAddExercise = () => {
  if (!editingRoutine || !pendingExercise) return;
  const { sets, reps, restSec } = exerciseInputs;
  if (!sets || !reps || !restSec || isNaN(Number(sets)) || isNaN(Number(reps)) || isNaN(Number(restSec))) return;
  const newExercise = {
  exerciseId: "", // Ajusta aquí si necesitas un id de ejercicio real
    sets: Number(sets),
    reps: Number(reps),
  restSec: Number(restSec),
  };
  setEditingRoutine({
    ...editingRoutine,
    blocks: editingRoutine.blocks.map(block =>
      block.id === selectedBlockId
        ? { ...block, exercises: [...block.exercises, newExercise] }
        : block
    ),
  });
  setIsExerciseSelectorOpen(false);
  setSelectedBlockId(null);
  setPendingExercise(null);
  setExerciseInputs({ sets: "", reps: "", restSec: "" });
};

  // Cancelar agregar ejercicio
  const cancelAddExercise = () => {
    setPendingExercise(null);
  setExerciseInputs({ sets: "", reps: "", restSec: "" });
  };
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

  const recentClients: RecentClient[] = [
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
  toast({ title: `Archivo "${file.name}" adjuntado correctamente` })
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
  toast({ title: `Imagen "${file.name}" adjuntada correctamente` })
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
  toast({ title: "Funcionalidad de registrar pago estará disponible cuando implementemos la sección de pagos" })
  }

  // Calendar/Agenda handlers
  const handleAddEvent = () => {
    setIsAddEventDialogOpen(true)
  }

  const handleCreateEvent = (eventData: EventFormState & { clientName?: string }) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Date.now()
    }
    setCalendarEvents(prev => [...prev, newEvent])
    setIsAddEventDialogOpen(false)
  }

  const handleCreateExercise = () => {
    if (!newExerciseForm.name.trim()) {
  toast({ title: "Por favor ingresa el nombre del ejercicio" })
      return
    }

    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: newExerciseForm.name.trim(),
      gif_URL: newExerciseForm.gif_URL.trim() || undefined,
      target_muscles: newExerciseForm.target_muscles,
      body_parts: newExerciseForm.body_parts,
      equipments: newExerciseForm.equipments,
      secondary_muscles: newExerciseForm.secondary_muscles,
      description: (newExerciseForm as any).description?.trim() || undefined,
      category: (newExerciseForm as any).category || undefined
    }

    setExercisesCatalog(prev => [...prev, newExercise])
    
    // Reset form
    setNewExerciseForm({
      name: '',
      gif_URL: '',
      target_muscles: [],
      body_parts: [],
      equipments: [],
      secondary_muscles: []
    })
    
    setIsCreateExerciseDialogOpen(false)
  toast({ title: `Ejercicio "${newExercise.name}" creado exitosamente` })
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
                  <strong>Músculos objetivo:</strong> ${exerciseData.target_muscles.join(', ')} |
                  <strong>Equipamiento:</strong> ${exerciseData.equipments.join(', ')}
                  ${exerciseData.gif_URL ? `<br><strong>GIF URL:</strong> ${exerciseData.gif_URL}` : ''}
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
      
  toast({ title: 'Rutina exportada como PDF exitosamente' })
    } catch (error) {
      console.error('Error generating PDF:', error)
  toast({ title: 'Error al generar el PDF. Inténtalo de nuevo.', variant: 'destructive' })
    }
  }

  const handleExportRoutineToExcel = async (template: RoutineTemplate) => {
    try {
      const workbook = new ExcelJS.Workbook()
      workbook.creator = 'Traino'
      workbook.created = new Date()

      // ========== Sheet 1: Rutina Completa ==========
      const ws = workbook.addWorksheet('Rutina Completa', {
        properties: { defaultRowHeight: 18 },
        pageSetup: { fitToPage: true, fitToWidth: 1, orientation: 'landscape' },
      })

      // Title
      ws.mergeCells('A1:H1')
      const titleCell = ws.getCell('A1')
      titleCell.value = 'RUTINA DE ENTRENAMIENTO'
      titleCell.font = { bold: true, size: 16 }
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7E6' } }

      ws.addRow([])
      // Metadata
      const metaRows = [
        ['Nombre de la Rutina:', template.name],
        ['Descripción:', template.description || 'Sin descripción'],
        ['Fecha de Creación:', new Date().toLocaleDateString('es-ES')],
      ]
      metaRows.forEach(r => {
        const row = ws.addRow(r)
        const label = row.getCell(1)
        label.font = { bold: true }
      })

      ws.addRow([])
      // Resumen de bloques
      const resumenHeader = ws.addRow(['RESUMEN DE BLOQUES'])
      resumenHeader.getCell(1).font = { bold: true, underline: true }
      ws.addRow([])

      const resumenCols = ['Bloque', 'Nombre del Bloque', 'Repeticiones', 'Número de Ejercicios']
      const resumenHeaderRow = ws.addRow(resumenCols)
      resumenHeaderRow.eachCell(c => {
        c.font = { bold: true }
        c.alignment = { horizontal: 'center' }
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E8F5E9' } }
        c.border = { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } }
      })

      template.blocks.forEach((block, blockIndex) => {
        const row = ws.addRow([
          `Bloque ${blockIndex + 1}`,
          block.name,
          String(block.repetitions),
          String(block.exercises.length),
        ])
        row.eachCell(c => {
          c.border = { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } }
        })
      })

      ws.addRow([])
      const detalleHeader = ws.addRow(['DETALLE COMPLETO DE EJERCICIOS'])
      detalleHeader.getCell(1).font = { bold: true, underline: true }
      ws.addRow([])

      const detailCols = [
        'Bloque',
        'Nombre del Ejercicio',
        'Músculos objetivo',
        'Equipamiento',
        'Series',
        'Repeticiones',
        'Descanso (segundos)',
        'GIF URL',
      ]
      const detailHeaderRowIdx = ws.rowCount + 1
      const detailHeaderRow = ws.addRow(detailCols)
      detailHeaderRow.eachCell(c => {
        c.font = { bold: true }
        c.alignment = { horizontal: 'center' }
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E3F2FD' } }
        c.border = { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } }
      })

      // (Imagenes deshabilitadas a pedido del usuario)

      let stripe = false
      for (let blockIndex = 0; blockIndex < template.blocks.length; blockIndex++) {
        const block = template.blocks[blockIndex]
        const blockStartRow = ws.rowCount + 1
        for (let exerciseIndex = 0; exerciseIndex < block.exercises.length; exerciseIndex++) {
          const exercise = block.exercises[exerciseIndex]
          const exerciseData = exercisesCatalog.find(ex => ex.id === exercise.exerciseId)
          if (!exerciseData) continue
          stripe = !stripe
          const row = ws.addRow([
            '',
            exerciseData.name,
            exerciseData.target_muscles.join(', '),
            exerciseData.equipments.join(', '),
            String(exercise.sets),
            String(exercise.reps),
            String(exercise.restSec),
            exerciseData.gif_URL ? 'Ver Ejercicio' : 'Sin URL',
          ])
          row.eachCell((c) => {
            if (stripe) {
              c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDFD' } }
            }
            c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
            c.border = { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } }
          })
          if (exerciseData.gif_URL) {
            const cell = row.getCell(8)
            cell.value = { text: 'Ver Ejercicio', hyperlink: exerciseData.gif_URL }
            cell.font = { color: { argb: '1E88E5' }, underline: true }
          }
        }
        const blockEndRow = ws.rowCount
        if (blockEndRow >= blockStartRow) {
          ws.mergeCells(blockStartRow, 1, blockEndRow, 1)
          const mergedCell = ws.getCell(blockStartRow, 1)
          mergedCell.value = `Bloque ${blockIndex + 1}: ${block.name}`
          mergedCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
          mergedCell.border = { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } }
        }
        ws.addRow([''])
      }

      // Column widths
      ws.columns = [
        { width: 26 },
        { width: 30 },
        { width: 24 },
        { width: 20 },
        { width: 10 },
        { width: 14 },
        { width: 18 },
        { width: 22 },
      ]

      // Auto filter for detail table
      ws.autoFilter = `A${detailHeaderRowIdx}:H${ws.rowCount}`

      // Freeze panes: keep headers visible
      ws.views = [{ state: 'frozen', xSplit: 0, ySplit: Number(detailHeaderRowIdx) }]

      // Center align all cells on the main sheet
      ws.eachRow(row => {
        row.eachCell(cell => {
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
        })
      })

      // ========== Sheet 2: Lista de Ejercicios ==========
      const ws2 = workbook.addWorksheet('Lista de Ejercicios', {
        properties: { defaultRowHeight: 18 },
      })
      ws2.mergeCells('A1:D1')
      const t2 = ws2.getCell('A1')
      t2.value = 'LISTA DE EJERCICIOS'
      t2.font = { bold: true, size: 14 }
      t2.alignment = { horizontal: 'center' }
      t2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EDE7F6' } }

      ws2.addRow([])
      const listHeader = ws2.addRow(['Ejercicio', 'Categoría', 'Equipamiento', 'Descripción'])
      listHeader.eachCell(c => {
        c.font = { bold: true }
        c.alignment = { horizontal: 'center' }
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE7' } }
        c.border = { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } }
      })

      const uniqueExercises = new Map<string, Exercise>()
      template.blocks.forEach(block => {
        block.exercises.forEach(ex => {
          const data = exercisesCatalog.find(e => e.id === ex.exerciseId)
          if (data && !uniqueExercises.has(data.id)) uniqueExercises.set(data.id, data)
        })
      })
      uniqueExercises.forEach(exerciseData => {
        const row = ws2.addRow([
          exerciseData.name,
          exerciseData.category || (exerciseData.body_parts?.[0] || ''),
          (exerciseData.equipments || []).join(', '),
          exerciseData.description || 'Sin descripción',
        ])
        row.eachCell(c => {
          c.border = { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } }
        })
      })
      ws2.columns = [
        { width: 32 },
        { width: 18 },
        { width: 20 },
        { width: 60 },
      ]

      // Center align all cells on the list sheet
      ws2.eachRow(row => {
        row.eachCell(cell => {
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
        })
      })

      // Save file (browser)
      const fileName = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_rutina.xlsx`
      const buffer = await workbook.xlsx.writeBuffer()
      saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), fileName)

      toast({ title: 'Rutina exportada como archivo XLSX exitosamente' })
    } catch (error) {
      console.error('Error exporting routine:', error)
      toast({ title: 'Error al exportar la rutina. Inténtalo de nuevo.', variant: 'destructive' })
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

  const handleUpdateEvent = (eventData: EventFormState & { clientName?: string }) => {
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
  toast({ title: `Redirigiendo a rutinas para ${clientName}` })
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

  const state: TrainerDashboardState = {
    activeTab,
    sidebarCollapsed,
    theme,
    searchTerm,
    clientFilter,
    isEditDialogOpen,
    editingClient,
    expandedClientIds,
    chatSearchTerm,
    chatFilter,
    selectedChat,
    chatMessage,
    showEmojiPicker,
    isNewClientDialogOpen,
    isNewChatDialogOpen,
    newChatSearchTerm,
    showArchived,
    isAddEventDialogOpen,
    selectedEvent,
    isEventDetailsOpen,
    isCreateExerciseDialogOpen,
    calendarEvents,
    selectedDate,
    currentMonth,
    currentYear,
    newEventForm,
    newExerciseForm,
    exercisesCatalog,
    loadingExercises,
    routineFolders,
    selectedFolderId,
    routineSearch,
    exerciseFilter,
    editingRoutine,
    isRoutineEditorOpen,
    isExerciseSelectorOpen,
    selectedBlockId,
    exerciseSearchTerm,
    expandedBlocks,
    viewingRoutine,
    isRoutineViewerOpen,
    showNewFolderInput,
    newFolderName,
    showExerciseCatalog,
    catalogSearch,
    restInput,
    restBlockId,
    exerciseInputs,
    pendingExercise,
    showNewRoutineInput,
    newRoutineName,
    newBlockName,
    chatConversations,
  }

  const data: TrainerDashboardData = {
    stats,
    upcomingSessions,
    recentClients,
    allClients,
    filteredClients,
    filteredChats,
    dedupedNewChatResults,
  }

  const actions: TrainerDashboardActions = {
    setActiveTab,
    setSidebarCollapsed,
    setTheme,
    setSearchTerm,
    setClientFilter,
    setIsEditDialogOpen,
    setEditingClient,
    setExpandedClientIds,
    setChatSearchTerm,
    setChatFilter,
    setSelectedChat,
    setChatMessage,
    setShowEmojiPicker,
    setIsNewClientDialogOpen,
    setIsNewChatDialogOpen,
    setNewChatSearchTerm,
    setShowArchived,
    setIsAddEventDialogOpen,
    setSelectedEvent,
    setIsEventDetailsOpen,
    setIsCreateExerciseDialogOpen,
    setCalendarEvents,
    setSelectedDate,
    setCurrentMonth,
    setCurrentYear,
    setNewEventForm,
    setNewExerciseForm,
    setExercisesCatalog,
    setLoadingExercises,
    setRoutineFolders,
    setSelectedFolderId,
    setRoutineSearch,
    setExerciseFilter,
    setEditingRoutine,
    setIsRoutineEditorOpen,
    setIsExerciseSelectorOpen,
    setSelectedBlockId,
    setExerciseSearchTerm,
    setExpandedBlocks,
    setViewingRoutine,
    setIsRoutineViewerOpen,
    setShowNewFolderInput,
    setNewFolderName,
    setShowExerciseCatalog,
    setCatalogSearch,
    setRestInput,
    setRestBlockId,
    setExerciseInputs,
    setPendingExercise,
    setShowNewRoutineInput,
    setNewRoutineName,
    setNewBlockName,
    setChatConversations,
    handleEditClient,
    handleDeleteClient,
    handleMarkAsActive,
    handleViewHistory,
    handleSendMessage,
    handleEmojiPicker,
    addEmoji,
    handleStartChat,
    handleNewClient,
    handleCreateRoutine,
    handleScheduleAppointment,
    handleScheduleSession,
    handleRegisterPayment,
    handleAddEvent,
    handleCreateEvent,
    handleCreateExercise,
    handleExportRoutineToPDF,
    handleExportRoutineToExcel,
    handleCreateFolder,
    handleDeleteTemplate,
    handleMoveTemplate,
    handleCreateTemplate,
    handleAssignTemplateToClient,
    handleEditRoutine,
    handleAddBlock,
    handleAddExerciseToBlock,
    handleAddRest,
    handleSelectExercise,
    confirmAddExercise,
    cancelAddExercise,
    handleSaveRoutine,
    handleDeleteExercise,
    handleDeleteBlock,
    toggleBlockExpansion,
    handleViewAllClients,
    handleAddSession,
    handleEventClick,
    handleEditEvent,
    handleDeleteEvent,
    handleUpdateEvent,
    handleCompleteEvent,
    handleGoToRoutines,
    handleFileAttachment,
    handleImageAttachment,
    handleChatFromClient,
  }

  const contextValue: TrainerDashboardContextValue = {
    state,
    data,
    actions,
  }

  return (
    <TrainerDashboardProvider value={contextValue}>
      <div className={`min-h-screen ${theme === "dark" ? "dark" : ""}`}>
      {/* Theme Toggle moved to header actions */}

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className={`${sidebarCollapsed ? "ml-20" : "ml-64"} transition-all duration-300`}>
        {/* Header */}
        <TrainerHeader />

        {/* Dashboard Content */}
        {activeTab === "dashboard" && <DashboardTab />}

        {/* Clients Content */}
        {activeTab === "clients" && <ClientsTab />}

        {/* Schedule/Agenda Content */}
        {activeTab === "schedule" && <ScheduleTab />}

        {/* Routines Content */}
        {activeTab === "routines" && <RoutinesTab />}

        {/* Chat Content */}
        {activeTab === "chat" && <ChatTab />}

      </div>
    </div>
    </TrainerDashboardProvider>
  )
}
