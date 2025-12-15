// Trainer feature exports

// Components (Real client management)
export { ClientsTab } from './components/ClientsTab'
export { ClientTable } from './components/ClientTable'
export { ClientFilters } from './components/ClientFilters'
export { ClientsHeader } from './components/ClientsHeader'
export { NewClientDialog } from './components/NewClientDialog'
export { EditClientDialog } from './components/EditClientDialog'
export { ClientHistoryDialog } from './components/ClientHistoryDialog'

// Hooks (Real functionality only)
export { useClientState } from './hooks/useClientState'
export { useUIState } from './hooks/useUIState'
export { useTrainerDashboard } from './hooks/useTrainerDashboard'
export { useCalendarState } from './hooks/useCalendarState'

// Services (Real business logic)
export * from './services/clientHandlers'
export * from './services/calendarHandlers'

// Types
export type {
  ClientStatus,
  Client,
  CalendarEvent,
  EventFormState,
  DashboardStat,
  UpcomingSession,
  RecentClient
} from './types'
