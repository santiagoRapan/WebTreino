import { toast } from "@/hooks/use-toast"
import type { CalendarEvent, EventFormState } from "@/types/trainer"

export interface CalendarHandlers {
  handleAddEvent: () => void
  handleEventClick: (event: CalendarEvent) => void
  handleEditEvent: (event: CalendarEvent) => void
  handleDeleteEvent: (eventId: number) => void
  handleCompleteEvent: (eventId: number) => void
  handleCreateEvent: (eventData: EventFormState & { clientName?: string }) => void
  handleUpdateEvent: (eventData: EventFormState & { clientName?: string }) => void
  handleGoToRoutines: (clientName: string) => void
  handleAddSession: () => void
}

export function createCalendarHandlers(
  calendarState: any,
  uiState: any
): CalendarHandlers {
  return {
    handleAddEvent: () => {
      uiState.setIsAddEventDialogOpen(true)
    },

    handleEventClick: (event: CalendarEvent) => {
      calendarState.setSelectedEvent(event)
      uiState.setIsEventDetailsOpen(true)
    },

    handleEditEvent: (event: CalendarEvent) => {
      calendarState.setSelectedEvent(event)
      calendarState.setNewEventForm({
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        type: event.type,
        clientId: event.clientId,
        isPresential: event.isPresential,
        status: event.status,
        color: event.color || '#3b82f6'
      })
      uiState.setIsAddEventDialogOpen(true)
    },

    handleDeleteEvent: (eventId: number) => {
      const updatedEvents = calendarState.calendarEvents.filter(
        (event: CalendarEvent) => event.id !== eventId
      )
      calendarState.setCalendarEvents(updatedEvents)
      uiState.setIsEventDetailsOpen(false)
      
      toast({
        title: "Evento eliminado",
        description: "El evento ha sido eliminado exitosamente.",
      })
    },

    handleCompleteEvent: (eventId: number) => {
      const updatedEvents = calendarState.calendarEvents.map((event: CalendarEvent) =>
        event.id === eventId
          ? { ...event, status: "completed" as const }
          : event
      )
      calendarState.setCalendarEvents(updatedEvents)
      uiState.setIsEventDetailsOpen(false)
      
      toast({
        title: "Evento completado",
        description: "El evento ha sido marcado como completado.",
      })
    },

    handleCreateEvent: (eventData: EventFormState & { clientName?: string }) => {
      const newEvent: CalendarEvent = {
        id: Date.now(),
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        type: eventData.type,
        clientId: eventData.clientId,
        clientName: eventData.clientName,
        isPresential: eventData.isPresential,
        status: eventData.status,
        color: eventData.color || 'bg-blue-500'
      }

      calendarState.setCalendarEvents([...calendarState.calendarEvents, newEvent])
      uiState.setIsAddEventDialogOpen(false)
      
      // Reset form
      calendarState.setNewEventForm({
        title: '',
        description: '',
        date: '',
        time: '',
        type: 'training',
        clientId: undefined,
        isPresential: undefined,
        status: 'pending',
        color: '#3b82f6'
      })

      toast({
        title: "Evento creado",
        description: "El evento ha sido creado exitosamente.",
      })
    },

    handleUpdateEvent: (eventData: EventFormState & { clientName?: string }) => {
      if (!calendarState.selectedEvent) return

      const updatedEvents = calendarState.calendarEvents.map((event: CalendarEvent) =>
        event.id === calendarState.selectedEvent.id
          ? {
              ...event,
              title: eventData.title,
              description: eventData.description,
              date: eventData.date,
              time: eventData.time,
              type: eventData.type,
              clientId: eventData.clientId,
              clientName: eventData.clientName,
              isPresential: eventData.isPresential,
              status: eventData.status,
              color: eventData.color || event.color
            }
          : event
      )

      calendarState.setCalendarEvents(updatedEvents)
      uiState.setIsAddEventDialogOpen(false)
      calendarState.setSelectedEvent(null)

      toast({
        title: "Evento actualizado",
        description: "El evento ha sido actualizado exitosamente.",
      })
    },

    handleGoToRoutines: (clientName: string) => {
      uiState.setActiveTab("routines")
      toast({
        title: "Ver rutinas",
        description: `Mostrando rutinas para ${clientName}`,
      })
    },

    handleAddSession: () => {
      uiState.setIsAddEventDialogOpen(true)
    },
  }
}