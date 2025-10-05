// Trainer feature types
import type { LucideIcon } from "lucide-react"
import type { RequestStatus, RequestActor } from '@/features/students'

/**
 * Client status type (for UI purposes)
 */
export type ClientStatus = "active" | "pending" | "inactive"

/**
 * Client data structure matching database schema
 */
export interface Client {
  id: string
  name: string | null
  email?: string
  avatar_url?: string | null
  role: 'alumno'
  created_on?: string
  // Relationship data
  trainer_id?: string
  joined_at?: string
  request_status?: RequestStatus
  requested_by?: RequestActor
  // UI-specific fields
  status: ClientStatus
  lastSession?: string
  nextSession?: string
  progress?: number
  goal?: string
  sessionsCompleted?: number
  totalSessions?: number
  plan?: string
}

/**
 * Trainer data structure (simplified for UI)
 */
export interface Trainer {
  id: string
  name: string | null
  email?: string
  avatar_url?: string | null
  role: 'entrenador'
  created_on?: string
  // Statistics
  totalStudents?: number
  activeStudents?: number
  pendingRequests?: number
}

/**
 * Calendar event structure (for future implementation)
 */
export type CalendarEvent = {
  id: string
  title: string
  description: string
  date: string
  time: string
  type: "training" | "routine_send" | "payment" | "custom"
  clientId?: string
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
  clientId?: string
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
  id: string
  client: string
  time: string
  type: string
  avatar: string
}

/**
 * Recent client data for dashboard
 */
export type RecentClient = {
  id: string
  name: string
  status: ClientStatus
  lastSession: string
  progress: number
  avatar: string
}
