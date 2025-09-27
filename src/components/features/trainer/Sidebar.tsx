"use client"

import {
  Activity,
  BarChart3,
  ChevronRight,
  Settings,
  Users,
} from "lucide-react"
import { useTrainerDashboard } from "@/components/features/trainer/TrainerDashboardContext"

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "clients", label: "Alumnos", icon: Users },
  // schedule tab removed
  { id: "routines", label: "Rutinas", icon: Activity },
  // Payments tab removed
  //{ id: "chat", label: "Chat", icon: MessageSquare },
  { id: "settings", label: "Configuración", icon: Settings },
] as const

export function Sidebar() {
  const {
    state: { activeTab, sidebarCollapsed },
    actions: { setActiveTab, setSidebarCollapsed },
  } = useTrainerDashboard()

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 ${sidebarCollapsed ? "w-20" : "w-64"} bg-sidebar border-r border-sidebar-border transition-all duration-300`}
    >
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-10 h-10 flex items-center justify-center"
          >
            <img src="/treinologo.png" alt="Toggle Sidebar" className="w-full h-full object-contain" />
          </button>
          {!sidebarCollapsed && <span className="text-lg font-semibold text-sidebar-foreground">Treino</span>}
        </div>
        {sidebarCollapsed && (
          <button onClick={() => setSidebarCollapsed(false)} className="ml-2 p-1 hover:bg-sidebar-accent rounded">
            <ChevronRight className="w-4 h-4 text-sidebar-foreground" />
          </button>
        )}
      </div>

      <nav className="p-4 space-y-2">
        {NAV_ITEMS.map((item) => (
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
  )
}
