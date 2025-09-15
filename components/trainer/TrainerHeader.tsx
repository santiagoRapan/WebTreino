"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Bell, Moon, Sun } from "lucide-react"
import { useTrainerDashboard } from "@/components/trainer/TrainerDashboardContext"

const TAB_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  clients: "Gestión de Alumnos",
  schedule: "Agenda",
  routines: "Rutinas",
  payments: "Pagos",
  chat: "Chat",
  settings: "Configuración",
}

export function TrainerHeader() {
  const {
    state: { activeTab, theme },
    actions: { setTheme },
  } = useTrainerDashboard()

  const title = TAB_LABELS[activeTab] ?? "Dashboard"

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
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
  )
}
