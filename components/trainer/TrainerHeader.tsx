"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Bell, Moon, Sun, RefreshCw } from "lucide-react"
import { useTrainerDashboard } from "@/components/trainer/TrainerDashboardContext"
import { useAuth } from "@/lib/auth-context"
import { useState } from "react"

const TAB_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  clients: "Gestión de Alumnos",
  // schedule: "Agenda", // removed
  routines: "Rutinas",
  // payments: "Pagos", // removed
  // chat: "Chat", // removed previously
  settings: "Configuración",
}

export function TrainerHeader() {
  const {
    state: { activeTab, theme },
    actions: { setTheme },
  } = useTrainerDashboard()
  
  const { customUser, refreshUserData } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const title = TAB_LABELS[activeTab] ?? "Dashboard"

  const handleRefreshData = async () => {
    try {
      setIsRefreshing(true)
      await refreshUserData()
    } catch (error) {
      console.error("Error refreshing user data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 w-full flex-shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon">
          <Bell className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefreshData}
          disabled={isRefreshing}
          title="Actualizar datos"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="bg-background border-border"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">
              {customUser?.name || "Usuario"}
            </p>
            <p className="text-xs text-muted-foreground">
              {customUser?.role || "entrenador"}
            </p>
          </div>
          <Avatar>
            <AvatarImage src={customUser?.avatar_url || "/trainer-profile.png"} />
            <AvatarFallback>
              {customUser?.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
