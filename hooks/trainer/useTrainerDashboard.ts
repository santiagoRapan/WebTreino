import { useUIState } from './useUIState'
import { useClientState } from './useClientState'
import { useChatState } from './useChatState'
import { useCalendarState } from './useCalendarState'
import { useRoutineState } from './useRoutineState'

import { createClientHandlers } from '@/lib/trainer/clientHandlers'
import { createChatHandlers } from '@/lib/trainer/chatHandlers'
import { createCalendarHandlers } from '@/lib/trainer/calendarHandlers'
import { createRoutineHandlers } from '@/lib/trainer/routineHandlers'

import { DASHBOARD_STATS, MOCK_UPCOMING_SESSIONS, MOCK_RECENT_CLIENTS } from '@/lib/trainer/mockData'

export function useTrainerDashboard() {
  // Individual state hooks
  const uiState = useUIState()
  const clientState = useClientState()
  const chatState = useChatState()
  const calendarState = useCalendarState()
  const routineState = useRoutineState()

  // Create handlers with state dependencies
  const clientHandlers = createClientHandlers(clientState, uiState)
  const chatHandlers = createChatHandlers(chatState, uiState)
  const calendarHandlers = createCalendarHandlers(calendarState, uiState)
  const routineHandlers = createRoutineHandlers(routineState, uiState)

  // Computed data
  const filteredClients = clientState.getFilteredClients(uiState.searchTerm, uiState.clientFilter)
  const filteredChats = chatState.getFilteredChats(chatState.chatSearchTerm, chatState.chatFilter)
  const upcomingEvents = calendarState.getUpcomingEvents()
  
  // Additional computed data for new chat functionality
  const dedupedNewChatResults = clientState.clients.filter(client => 
    !chatState.chatConversations.some(chat => chat.clientName === client.name) &&
    client.name.toLowerCase().includes(chatState.newChatSearchTerm.toLowerCase())
  )

  // Additional handlers needed for context compatibility
  const handleScheduleAppointment = () => {
    // Navigate to schedule tab first, then open the event dialog
    uiState.setActiveTab("schedule")
    // Use setTimeout to ensure the tab change is processed first
    setTimeout(() => {
      // Reset and open the event form
      calendarState.setNewEventForm({
        title: '',
        description: '',
        date: '',
        time: '',
        type: 'custom',
        clientId: undefined,
        isPresential: undefined,
        status: 'pending',
        color: '#3b82f6'
      })
      uiState.setIsAddEventDialogOpen(true)
    }, 100)
  }

  const handleRegisterPayment = () => {
    // Mock implementation - will be expanded when payment system is implemented
    console.log('Register payment functionality will be available when payment section is implemented')
  }

  return {
    // UI State
    ...uiState,
    
    // Chat State
    ...chatState,
    
    // Calendar State
    ...calendarState,
    
    // Client State
    ...clientState,
    
    // Routine State
    ...routineState,
    
    // All Handlers
    ...clientHandlers,
    ...chatHandlers,
    ...calendarHandlers,
    ...routineHandlers,
    
    // Additional context handlers
    handleScheduleAppointment,
    handleRegisterPayment,
    
    // Computed Data
    filteredClients,
    filteredChats,
    upcomingEvents,
    dedupedNewChatResults,
    
    // Static Data
    stats: DASHBOARD_STATS,
    upcomingSessions: MOCK_UPCOMING_SESSIONS,
    recentClients: MOCK_RECENT_CLIENTS,
  }
}