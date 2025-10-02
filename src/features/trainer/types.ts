// Trainer feature types
import type { LucideIcon } from "lucide-react"

/**
 * Client status type
 */
export type ClientStatus = "active" | "pending" | "inactive"

/**
 * Client data structure (real data from database)
 */
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

/**
 * Calendar event structure (for future implementation)
 */
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

/**
 * Event form state for creating/editing events (for future implementation)
 */
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

/**
 * Dashboard statistic card data
 */
export type DashboardStat = {
  titleKey: string // Translation key instead of hardcoded title
  value: string
  change: string
  icon: LucideIcon
  color: string
}

/**
 * Upcoming session data (for future implementation)
 */
export type UpcomingSession = {
  id: number
  client: string
  time: string
  type: string
  avatar: string
}

/**
 * Recent client data for dashboard
 */
export type RecentClient = {
  id: number
  name: string
  status: ClientStatus
  lastSession: string
  progress: number
  avatar: string
}
