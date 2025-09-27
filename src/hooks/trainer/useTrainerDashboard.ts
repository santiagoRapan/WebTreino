import { useUIState } from './useUIState'
import { useClientState } from './useClientState'
// Agenda/Calendar removed
import { useRoutineState } from './useRoutineState'

import { createClientHandlers } from '@/lib/trainer/clientHandlers'
// Calendar handlers removed
import { createRoutineHandlers } from '@/lib/trainer/routineHandlers'

// Removed mock data imports; dashboard data will be provided dynamically or left empty

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
    
    // Static Data removed (no hardcoded data)
    stats: [],
    recentClients: [],
  }
}