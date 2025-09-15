"use client"

import { useTrainerDashboard } from "@/components/trainer/TrainerDashboardContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  formatDate,
  getDaysInMonth,
  getEventTypeIcon,
  getEventTypeLabel,
  getFirstDayOfMonth,
  getMonthName,
} from "@/lib/trainer-utils"
import { Calendar as CalendarIcon, Edit, Plus, Trash2 } from "lucide-react"

export function ScheduleTab() {
  const {
    state: {
      calendarEvents,
      selectedDate,
      currentMonth,
      currentYear,
      newEventForm,
      isAddEventDialogOpen,
      isEventDetailsOpen,
      selectedEvent,
    },
    data: { allClients },
    actions: {
      setSelectedDate,
      setCurrentMonth,
      setCurrentYear,
      setNewEventForm,
      setIsAddEventDialogOpen,
      setSelectedEvent,
      setIsEventDetailsOpen,
      handleAddEvent,
      handleCreateEvent,
      handleEventClick,
      handleEditEvent,
      handleDeleteEvent,
      handleUpdateEvent,
      handleCompleteEvent,
      handleGoToRoutines,
    },
  } = useTrainerDashboard()

  const getEventsForDate = (date: string) => calendarEvents.filter((event) => event.date === date)

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11)
        setCurrentYear((prev) => prev - 1)
      } else {
        setCurrentMonth((prev) => prev - 1)
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0)
        setCurrentYear((prev) => prev + 1)
      } else {
        setCurrentMonth((prev) => prev + 1)
      }
    }
  }

  return (
    <>
      <main className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Agenda</h2>
            <p className="text-muted-foreground">Gestiona tu calendario de entrenamientos y eventos</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddEvent} className="hover:bg-orange-500 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Evento
            </Button>
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-card-foreground">Calendario</CardTitle>
                <CardDescription>Selecciona una fecha para ver los eventos</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth("prev")}
                  className="hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  ←
                </Button>
                <div className="text-center min-w-[120px]">
                  <div className="font-medium text-card-foreground">
                    {getMonthName(currentMonth)} {currentYear}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth("next")}
                  className="hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  →
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {(() => {
                const daysInMonth = getDaysInMonth(currentMonth, currentYear)
                const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
                const cells: JSX.Element[] = []

                for (let i = 0; i < firstDay; i++) {
                  cells.push(
                    <div key={`empty-${i}`} className="min-h-[80px] p-1 border border-border bg-muted/30"></div>
                  )
                }

                for (let day = 1; day <= daysInMonth; day++) {
                  const dateString = formatDate(day, currentMonth, currentYear)
                  const isToday = dateString === new Date().toISOString().split("T")[0]
                  const isSelected = dateString === selectedDate
                  const events = getEventsForDate(dateString)

                  cells.push(
                    <div
                      key={day}
                      className={`min-h-[80px] p-1 border border-border cursor-pointer hover:bg-accent/50 transition-colors ${
                        isToday ? "ring-2 ring-primary" : ""
                      } ${isSelected ? "bg-primary/20" : "bg-card"}`}
                      onClick={() => setSelectedDate(dateString)}
                    >
                      <div className="text-xs text-muted-foreground mb-1">{day}</div>
                      <div className="space-y-1">
                        {events.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEventClick(event)
                            }}
                            className={`text-xs p-1 rounded cursor-pointer transition-colors hover:opacity-80 ${event.color}`}
                            title={`${event.title} - ${event.time}`}
                          >
                            <div className="truncate font-medium text-white">
                              {getEventTypeIcon(event.type)} {event.title.substring(0, 15)}
                            </div>
                            <div className="text-white/80 text-[10px]">{event.time}</div>
                          </div>
                        ))}
                        {events.length > 2 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{events.length - 2} más
                          </div>
                        )}
                      </div>
                    </div>
                  )
                }

                return cells
              })()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Eventos del {new Date(selectedDate).toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardTitle>
            <CardDescription>Detalles de los eventos programados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {getEventsForDate(selectedDate).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay eventos programados para este día</p>
              </div>
            ) : (
              getEventsForDate(selectedDate).map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="p-4 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-block w-3 h-3 rounded-full ${event.color}`}></span>
                        <h4 className="font-medium text-card-foreground">{event.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {getEventTypeLabel(event.type)}
                        </Badge>
                        <Badge
                          variant={
                            event.status === "completed"
                              ? "default"
                              : event.status === "cancelled"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {event.status === "completed"
                            ? "Completado"
                            : event.status === "cancelled"
                            ? "Cancelado"
                            : "Pendiente"}
                        </Badge>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>🕐 {event.time}</span>
                        {event.clientName && <span>👤 {event.clientName}</span>}
                        {event.type === "training" && event.isPresential !== undefined && (
                          <Badge variant="outline" className="text-xs">
                            {event.isPresential ? "Presencial" : "Por su cuenta"}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEventClick(event)
                      }}
                      className="hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog
        open={isAddEventDialogOpen}
        onOpenChange={(open) => {
          setIsAddEventDialogOpen(open)
          if (!open) {
            setNewEventForm({
              title: '',
              description: '',
              date: '',
              time: '',
              type: 'training',
              clientId: undefined,
              isPresential: undefined,
              status: 'pending',
              color: '#3b82f6',
            })
            setSelectedEvent(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedEvent ? 'Editar Evento' : 'Agregar Evento'}</DialogTitle>
            <DialogDescription>
              Completa la información del evento. Los campos marcados con * son obligatorios.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Título *
              </Label>
              <Input
                id="title"
                placeholder="Título del evento"
                className="col-span-3"
                value={newEventForm.title}
                onChange={(e) => setNewEventForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descripción
              </Label>
              <Textarea
                id="description"
                placeholder="Descripción del evento"
                className="col-span-3"
                value={newEventForm.description}
                onChange={(e) => setNewEventForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Fecha *
              </Label>
              <Input
                id="date"
                type="date"
                className="col-span-3"
                value={newEventForm.date}
                onChange={(e) => setNewEventForm((prev) => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Hora *
              </Label>
              <Input
                id="time"
                type="time"
                className="col-span-3"
                value={newEventForm.time}
                onChange={(e) => setNewEventForm((prev) => ({ ...prev, time: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Tipo *
              </Label>
              <Select
                value={newEventForm.type}
                onValueChange={(value) => setNewEventForm((prev) => ({ ...prev, type: value as CalendarEvent['type'] }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="training">Entrenamiento</SelectItem>
                  <SelectItem value="routine_send">Enviar Rutina</SelectItem>
                  <SelectItem value="payment">Pago</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientId" className="text-right">
                Alumno
              </Label>
              <Select
                value={newEventForm.clientId ? String(newEventForm.clientId) : ''}
                onValueChange={(value) =>
                  setNewEventForm((prev) => ({ ...prev, clientId: value ? Number(value) : undefined }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar alumno" />
                </SelectTrigger>
                <SelectContent>
                  {allClients.map((client) => (
                    <SelectItem key={client.id} value={String(client.id)}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isPresential" className="text-right">
                Presencial
              </Label>
              <Select
                value={
                  newEventForm.isPresential !== undefined ? String(newEventForm.isPresential) : ''
                }
                onValueChange={(value) =>
                  setNewEventForm((prev) => ({ ...prev, isPresential: value === 'true' }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Sí</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Estado *
              </Label>
              <Select
                value={newEventForm.status}
                onValueChange={(value) => setNewEventForm((prev) => ({ ...prev, status: value as CalendarEvent['status'] }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Color *
              </Label>
              <Input
                id="color"
                type="color"
                className="col-span-3"
                value={newEventForm.color}
                onChange={(e) => setNewEventForm((prev) => ({ ...prev, color: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddEventDialogOpen(false)}
              className="hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                const required: string[] = []
                if (!newEventForm.title.trim()) required.push("Título")
                if (!newEventForm.date.trim()) required.push("Fecha")
                if (!newEventForm.time.trim()) required.push("Hora")

                if (required.length > 0) {
                  alert(`Por favor completa los siguientes campos obligatorios: ${required.join(", ")}`)
                  return
                }

                const clientName = newEventForm.clientId
                  ? allClients.find((client) => client.id === newEventForm.clientId)?.name
                  : undefined

                if (selectedEvent) {
                  handleUpdateEvent({
                    title: newEventForm.title,
                    description: newEventForm.description,
                    date: newEventForm.date,
                    time: newEventForm.time,
                    type: newEventForm.type,
                    clientId: newEventForm.clientId,
                    clientName,
                    isPresential: newEventForm.isPresential,
                    status: newEventForm.status,
                    color: newEventForm.color,
                  })
                  alert("Evento actualizado correctamente")
                } else {
                  handleCreateEvent({
                    title: newEventForm.title,
                    description: newEventForm.description,
                    date: newEventForm.date,
                    time: newEventForm.time,
                    type: newEventForm.type,
                    clientId: newEventForm.clientId,
                    clientName,
                    isPresential: newEventForm.isPresential,
                    status: newEventForm.status,
                    color: `bg-[${newEventForm.color}]`,
                  })
                  alert("Evento agregado correctamente")
                }

                setNewEventForm({
                  title: '',
                  description: '',
                  date: '',
                  time: '',
                  type: 'training',
                  clientId: undefined,
                  isPresential: undefined,
                  status: 'pending',
                  color: '#3b82f6',
                })
                setSelectedEvent(null)
              }}
              className="hover:bg-orange-500 transition-colors"
            >
              {selectedEvent ? 'Actualizar Evento' : 'Agregar Evento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEventDetailsOpen} onOpenChange={setIsEventDetailsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Detalles del Evento</DialogTitle>
            <DialogDescription>Aquí puedes ver los detalles del evento seleccionado.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-title" className="text-right">
                Título
              </Label>
              <p id="event-title" className="col-span-3">{selectedEvent?.title}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-description" className="text-right">
                Descripción
              </Label>
              <p id="event-description" className="col-span-3">{selectedEvent?.description}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-date" className="text-right">
                Fecha
              </Label>
              <p id="event-date" className="col-span-3">{selectedEvent?.date}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-time" className="text-right">
                Hora
              </Label>
              <p id="event-time" className="col-span-3">{selectedEvent?.time}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-type" className="text-right">
                Tipo
              </Label>
              <p id="event-type" className="col-span-3">{selectedEvent?.type ? getEventTypeLabel(selectedEvent.type) : ''}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-client" className="text-right">
                Alumno
              </Label>
              <p id="event-client" className="col-span-3">{selectedEvent?.clientName}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-isPresential" className="text-right">
                Presencial
              </Label>
              <p id="event-isPresential" className="col-span-3">{selectedEvent?.isPresential ? 'Sí' : 'No'}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-status" className="text-right">
                Estado
              </Label>
              <p id="event-status" className="col-span-3">{selectedEvent?.status}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-color" className="text-right">
                Color
              </Label>
              <div id="event-color" className="col-span-3" style={{ backgroundColor: selectedEvent?.color }}></div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEventDetailsOpen(false)}
              className="hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Cerrar
            </Button>
            <Button
              onClick={() => {
                if (selectedEvent) {
                  handleEditEvent(selectedEvent)
                }
              }}
              className="hover:bg-blue-500 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            {selectedEvent?.type === 'routine_send' && selectedEvent.clientName && (
              <Button
                onClick={() => {
                  handleGoToRoutines(selectedEvent.clientName)
                  setIsEventDetailsOpen(false)
                }}
                className="hover:bg-orange-500 transition-colors"
              >
                Ir a Rutinas
              </Button>
            )}
            <Button
              onClick={() => {
                if (selectedEvent?.id) {
                  handleCompleteEvent(selectedEvent.id)
                  alert('Evento marcado como completado')
                  setIsEventDetailsOpen(false)
                }
              }}
              className="hover:bg-green-500 transition-colors"
            >
              Marcar como Completado
            </Button>
            <Button
              onClick={() => {
                if (selectedEvent?.id) {
                  handleDeleteEvent(selectedEvent.id)
                }
              }}
              className="hover:bg-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
