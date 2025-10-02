// Dashboard feature types
import type { LucideIcon } from "lucide-react"

/**
 * Dashboard statistic card data
 */
export interface DashboardStat {
  titleKey: string
  value: string | number
  change: string
  icon: LucideIcon
  color: string
}

/**
 * Dashboard quick action
 */
export interface DashboardAction {
  label: string
  icon: LucideIcon
  onClick: () => void
  variant?: "default" | "outline" | "ghost"
}

/**
 * User profile information for settings
 */
export interface UserProfile {
  email?: string
  name?: string
  role?: string
  avatar_url?: string
}

/**
 * Theme preference type
 */
export type ThemePreference = "light" | "dark" | "system"

/**
 * Language/Locale preference type
 */
export type LocalePreference = "es" | "en" | "pt"

/**
 * Notification settings
 */
export interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
}

/**
 * Settings tab sections
 */
export interface SettingsSection {
  id: string
  title: string
  description: string
  icon: LucideIcon
}
