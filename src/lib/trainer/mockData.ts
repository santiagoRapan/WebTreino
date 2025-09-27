import type { DashboardStat, UpcomingSession, RecentClient } from "@/src/lib/types/trainer"
import { BarChart3, Users, Calendar, DollarSign } from "lucide-react"

export const DASHBOARD_STATS: DashboardStat[] = [
  {
    title: "Clientes Activos",
    value: "24",
    change: "+12%",
    icon: Users,
    color: "text-blue-600"
  },
  {
    title: "Sesiones del Mes",
    value: "156",
    change: "+8%", 
    icon: Calendar,
    color: "text-green-600"
  },
  {
    title: "Ingresos del Mes",
    value: "€3,240",
    change: "+15%",
    icon: DollarSign,
    color: "text-orange-600"
  },
  {
    title: "Progreso Promedio",
    value: "78%",
    change: "+5%",
    icon: BarChart3,
    color: "text-purple-600"
  }
]

export const MOCK_UPCOMING_SESSIONS: UpcomingSession[] = [
  {
    id: 1,
    client: "María González",
    time: "09:00",
    type: "Entrenamiento Personal",
    avatar: "/fit-woman-outdoors.png",
  },
  { 
    id: 2, 
    client: "Carlos Ruiz", 
    time: "10:30", 
    type: "Rutina de Fuerza", 
    avatar: "/fit-man-gym.png" 
  },
  { 
    id: 3, 
    client: "Ana López", 
    time: "14:00", 
    type: "Cardio + Tonificación", 
    avatar: "/woman-workout.png" 
  },
]

export const MOCK_RECENT_CLIENTS: RecentClient[] = [
  {
    id: 1,
    name: "María González",
    status: "Activo",
    avatar: "/fit-woman-outdoors.png",
    lastSession: "2 días",
    progress: 85,
  },
  {
    id: 2,
    name: "Carlos Ruiz",
    status: "Activo", 
    avatar: "/fit-man-gym.png",
    lastSession: "1 día",
    progress: 72,
  },
  {
    id: 3,
    name: "Ana López",
    status: "Pendiente",
    avatar: "/woman-workout.png", 
    lastSession: "5 días",
    progress: 45,
  },
]