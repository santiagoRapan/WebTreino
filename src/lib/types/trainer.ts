import type { LucideIcon } from "lucide-react"

export type ClientStatus = "active" | "pending" | "inactive"

export type Client = {
  id: number
  name: string
  email: string
  phone: string
  status: ClientStatus
  joinDate: string
  lastSession: string
  nextSession: string
  progress: number
  goal: string
  avatar: string
  sessionsCompleted: number
  totalSessions: number
  plan: string
  // Supabase identifiers to support roster/requests
  userId?: string
  requestId?: string
  requestedBy?: "alumno" | "entrenador"
}

export type ChatMessage = {
  id: number
  message: string
  timestamp: string
  isTrainer: boolean
  isRead: boolean
  senderId?: number | "trainer"
  senderName?: string
}

export type Chat = {
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

export type Exercise = {
  id: string
  name: string
  gif_URL?: string
  target_muscles: string[]
  body_parts: string[]
  equipments: string[]
  description?: string
  category?: string
  secondary_muscles: string[]
}

export type RoutineBlock = {
  id: number
  name: string
  exercises: {
    exerciseId: string
    sets: number
    reps: number
    restSec: number
  }[]
  repetitions: number
  restBetweenRepetitions: number
  restAfterBlock: number
}

export type RoutineTemplate = {
  id: number | string // Allow both number (database ID) and string (temp ID)
  name: string
  description?: string
  blocks: RoutineBlock[]
}

export type RoutineFolder = {
  id: number
  name: string
  templates: RoutineTemplate[]
}

export type CalendarEvent = {
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

export type EventFormState = {
  title: string
  description: string
  date: string
  time: string
  type: CalendarEvent["type"]
  clientId?: number
  isPresential?: boolean
  status: CalendarEvent["status"]
  color: string
}

export type ExerciseFormState = {
  name: string
  gif_URL: string
  target_muscles: string[]
  body_parts: string[]
  equipments: string[]
  secondary_muscles: string[]
  description?: string
  category?: string
}

export type ExerciseInputsState = {
  sets: string
  reps: string
  restSec: string
}

export type ExerciseFilterState = {
  category?: string
  equipment?: string
}

export type DashboardStat = {
  titleKey: string // Translation key instead of hardcoded title
  value: string
  change: string
  icon: LucideIcon
  color: string
}

export type UpcomingSession = {
  id: number
  client: string
  time: string
  type: string
  avatar: string
}

export type RecentClient = {
  id: number
  name: string
  status: ClientStatus
  lastSession: string
  progress: number
  avatar: string
}
