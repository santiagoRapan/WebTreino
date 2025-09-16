"use client"

import { useState } from "react"
import type { CalendarEvent, EventFormState } from "@/types/trainer"

export interface UseCalendarStateReturn {
  // Calendar State
  calendarEvents: CalendarEvent[]
  setCalendarEvents: (events: CalendarEvent[]) => void
  selectedEvent: CalendarEvent | null
  setSelectedEvent: (event: CalendarEvent | null) => void
  selectedDate: string
  setSelectedDate: (date: string) => void
  currentMonth: number
  setCurrentMonth: (month: number) => void
  currentYear: number
  setCurrentYear: (year: number) => void
  
  // Form State
  newEventForm: EventFormState
  setNewEventForm: (form: EventFormState) => void
  
  // Helper functions
  getEventsForDate: (date: string) => CalendarEvent[]
  getUpcomingEvents: () => CalendarEvent[]
}

export function useCalendarState(): UseCalendarStateReturn {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear())
  
  // Mock calendar events - in a real app, this would come from an API/database
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    { 
      id: 1, 
      title: "Entrenamiento con María González", 
      description: "Sesión presencial de fuerza y cardio", 
      date: "2024-01-15", 
      time: "09:00", 
      type: "training", 
      clientId: 1, 
      clientName: "María González", 
      isPresential: true, 
      status: "pending", 
      color: "bg-blue-500" 
    },
    { 
      id: 2, 
      title: "Enviar rutina a Carlos Ruiz", 
      description: "Nueva rutina de hipertrofia", 
      date: "2024-01-15", 
      time: "14:00", 
      type: "routine_send", 
      clientId: 2, 
      clientName: "Carlos Ruiz", 
      status: "pending", 
      color: "bg-green-500" 
    },
    { 
      id: 3, 
      title: "Pago mensual - Ana López", 
      description: "Renovación de plan mensual", 
      date: "2024-01-16", 
      time: "10:00", 
      type: "payment", 
      clientId: 3, 
      clientName: "Ana López", 
      status: "pending", 
      color: "bg-orange-500" 
    },
    { 
      id: 4, 
      title: "Entrenamiento con Carlos Ruiz", 
      description: "Sesión de cardio por su cuenta", 
      date: "2024-01-16", 
      time: "16:00", 
      type: "training", 
      clientId: 2, 
      clientName: "Carlos Ruiz", 
      isPresential: false, 
      status: "pending", 
      color: "bg-purple-500" 
    }
  ])

  // Form state for new event
  const [newEventForm, setNewEventForm] = useState<EventFormState>({
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

  const getEventsForDate = (date: string): CalendarEvent[] => {
    return calendarEvents.filter(event => event.date === date)
  }

  const getUpcomingEvents = (): CalendarEvent[] => {
    const today = new Date().toISOString().split('T')[0]
    return calendarEvents
      .filter(event => event.date >= today)
      .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())
      .slice(0, 5) // Get next 5 upcoming events
  }

  return {
    calendarEvents,
    setCalendarEvents,
    selectedEvent,
    setSelectedEvent,
    selectedDate,
    setSelectedDate,
    currentMonth,
    setCurrentMonth,
    currentYear,
    setCurrentYear,
    newEventForm,
    setNewEventForm,
    getEventsForDate,
    getUpcomingEvents,
  }
}