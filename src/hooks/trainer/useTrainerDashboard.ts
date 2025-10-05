import { useUIState } from './useUIState'
import { useClientState } from './useClientState'
import { useRoutineState } from './useRoutineState'
import { createClientHandlers } from '@/lib/trainer/clientHandlers'
import { createRoutineHandlers } from '@/lib/trainer/routineHandlers'
import { Users, Dumbbell, UserPlus, UserCheck } from 'lucide-react'
import type { DashboardStat, RecentClient } from '@/lib/types/trainer'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'

export function useTrainerDashboard() {
  // Individual state hooks
  const uiState = useUIState()
  const clientState = useClientState()
  const routineState = useRoutineState()
  const router = useRouter()

  // Create handlers with state dependencies
  const clientHandlers = createClientHandlers(clientState, uiState, router)
  const routineHandlers = createRoutineHandlers(routineState, uiState, router)

  // Computed data
  const filteredClients = clientState.getFilteredClients(uiState.searchTerm, uiState.clientFilter)

  const handleRegisterPayment = () => {
    console.log('Register payment functionality will be available when payment section is implemented')
  }

  // Real-time stats computed from state
  const stats: DashboardStat[] = useMemo(() => {
    const activeClients = clientState.clients.filter(c => c.status === 'active').length
    const studentRequests = clientState.clients.filter(c => c.status === 'pending' && c.requestedBy === 'alumno').length
    const trainerRequests = clientState.clients.filter(c => c.status === 'pending' && c.requestedBy === 'entrenador').length
    const totalRoutines = routineState.routineFolders.reduce((acc, folder) => acc + folder.templates.length, 0)

    return [
      { titleKey: "Alumnos Activos", value: activeClients.toString(), change: "", icon: Users, color: "text-primary" },
      { titleKey: "Rutinas Creadas", value: totalRoutines.toString(), change: "", icon: Dumbbell, color: "text-primary" },
      { titleKey: "Solicitudes de Alumnos", value: studentRequests.toString(), change: "", icon: UserPlus, color: "text-primary" },
    ]
  }, [clientState.clients, routineState.routineFolders])

  // Real recent clients from state
  const recentClients: RecentClient[] = useMemo(() => {
    return clientState.clients
      .slice(0, 5)
      .map(client => ({
        id: client.id,
        name: client.name,
        status: client.status,
        avatar: client.avatar,
        // These were mock values, can be replaced with real data if available
        lastSession: 'N/A', 
        progress: 0,
      }))
  }, [clientState.clients])

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
    
    // Dashboard Data
    stats,
    recentClients,
  }
}