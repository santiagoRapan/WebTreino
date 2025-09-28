import { useUIState } from './useUIState'
import { useClientState } from './useClientState'
// Agenda/Calendar removed
import { useRoutineState } from './useRoutineState'

import { createClientHandlers } from '@/lib/trainer/clientHandlers'
// Calendar handlers removed
import { createRoutineHandlers } from '@/lib/trainer/routineHandlers'
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react'
import type { DashboardStat, RecentClient, ClientStatus } from '@/lib/types/trainer'

export function useTrainerDashboard() {
  // Individual state hooks
  const uiState = useUIState()
  const clientState = useClientState()
  const routineState = useRoutineState()

  // Create handlers with state dependencies
  const clientHandlers = createClientHandlers(clientState, uiState)
  // Calendar handlers removed
  const routineHandlers = createRoutineHandlers(routineState, uiState)

  // Computed data
  const filteredClients = clientState.getFilteredClients(uiState.searchTerm, uiState.clientFilter)
  // Calendar computed data removed

  // Additional handlers needed for context compatibility
  // Schedule appointment handler removed

  const handleRegisterPayment = () => {
    // Mock implementation - will be expanded when payment system is implemented
    console.log('Register payment functionality will be available when payment section is implemented')
  }

  // Mock stats data
  const mockStats: DashboardStat[] = [
    { titleKey: "dashboard.stats.activeClients", value: "24", change: "+3", icon: Users, color: "text-primary" },
    { titleKey: "dashboard.stats.sessionsToday", value: "8", change: "+2", icon: Calendar, color: "text-primary" },
    { titleKey: "dashboard.stats.monthlyRevenue", value: "$4,250", change: "+12%", icon: DollarSign, color: "text-primary" },
    { titleKey: "dashboard.stats.averageProgress", value: "82%", change: "+5%", icon: TrendingUp, color: "text-primary" },
  ]

  // Mock recent clients data
  const mockRecentClients: RecentClient[] = [
    {
      id: 1,
      name: "María González",
      status: "active",
      lastSession: "2 horas",
      progress: 85,
      avatar: "/images/woman-workout.png"
    },
    {
      id: 2,
      name: "Carlos López",
      status: "active", 
      lastSession: "1 día",
      progress: 72,
      avatar: "/images/man-gym.png"
    },
    {
      id: 3,
      name: "Ana Martínez",
      status: "pending",
      lastSession: "3 días",
      progress: 91,
      avatar: "/images/fit-woman-outdoors.png"
    },
    {
      id: 4,
      name: "Roberto Silva",
      status: "active",
      lastSession: "5 horas",
      progress: 78,
      avatar: "/images/fit-man-gym.png"
    },
    {
      id: 5,
      name: "Laura Hernández",
      status: "inactive",
      lastSession: "1 semana",
      progress: 45,
      avatar: "/images/trainer-profile.png"
    }
  ]

  return {
    // UI State
    ...uiState,
    
    // Client State
    ...clientState,
    
    // Routine State
    ...routineState,
    
    // All Handlers
    ...clientHandlers,
    ...routineHandlers,
    
    handleRegisterPayment,
    
    // Computed Data
    filteredClients,
    
    // Mock Dashboard Data
    stats: mockStats,
    recentClients: mockRecentClients,
  }
}