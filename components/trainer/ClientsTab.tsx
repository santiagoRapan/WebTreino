"use client"

import { useTrainerDashboard } from "@/components/trainer/TrainerDashboardContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Calendar, Edit, MessageSquare, MoreVertical, Plus, Search, Trash2 } from "lucide-react"

export function ClientsTab() {
  const {
    state: {
      searchTerm,
      clientFilter,
      isEditDialogOpen,
      editingClient,
      isNewClientDialogOpen,
    },
    data: { allClients, filteredClients },
    actions: {
      setSearchTerm,
      setClientFilter,
      setIsEditDialogOpen,
      setEditingClient,
      setIsNewClientDialogOpen,
      handleNewClient,
      handleEditClient,
      handleDeleteClient,
      handleScheduleSession,
      handleChatFromClient,
    },
  } = useTrainerDashboard()

  return (
    <>
      <main className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Listado de Alumnos</h2>
            <p className="text-muted-foreground">Visualiza y gestiona todos tus alumnos en una sola vista</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleNewClient} className="hover:bg-accent hover:text-accent-foreground transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Alumno
            </Button>
          </div>
        </div>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar alumnos por nombre, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={clientFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setClientFilter("all")}
                  className="hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Todos ({allClients.length})
                </Button>
                <Button
                  variant={clientFilter === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setClientFilter("active")}
                  className="hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Activos ({allClients.filter((c) => c.status === "Activo").length})
                </Button>
                <Button
                  variant={clientFilter === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setClientFilter("pending")}
                  className="hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Pendientes ({allClients.filter((c) => c.status === "Pendiente").length})
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 text-muted-foreground">
                    <th className="px-3 py-2 text-left">Nombre</th>
                    <th className="px-3 py-2 text-left">Email</th>
                    <th className="px-3 py-2 text-left">Teléfono</th>
                    <th className="px-3 py-2 text-left">Estado</th>
                    <th className="px-3 py-2 text-left">Progreso</th>
                    <th className="px-3 py-2 text-left">Próxima sesión</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="border-b border-border hover:bg-muted/30 transition-colors items-center">
                      <td className="px-3 py-2 font-medium flex items-center gap-2">
                        <Avatar className="w-14 h-14">
                          <AvatarImage src={client.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {client.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        {client.name}
                      </td>
                      <td className="px-3 py-2">{client.email}</td>
                      <td className="px-3 py-2">{client.phone}</td>
                      <td className="px-3 py-2">
                        <Badge
                          variant={
                            client.status === "Activo"
                              ? "default"
                              : client.status === "Pendiente"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {client.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-left align-middle">{client.progress}%</td>
                      <td className="px-3 py-2">{client.nextSession}</td>
                      <td className="w-12 px-1 py-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleChatFromClient(client.name)}>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Chat
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClient(client)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleScheduleSession(client.id)}>
                              <Calendar className="w-4 h-4 mr-2" />
                              Agendar sesión
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClient(client.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {filteredClients.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        No se encontraron alumnos con los filtros aplicados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Editar información del alumno</DialogTitle>
            <DialogDescription>Actualiza los datos y guarda los cambios.</DialogDescription>
          </DialogHeader>
          {editingClient && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="edit-name"
                  value={editingClient.name}
                  onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  value={editingClient.email}
                  onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-phone" className="text-right">
                  Teléfono
                </Label>
                <Input
                  id="edit-phone"
                  value={editingClient.phone}
                  onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Estado
                </Label>
                <Select
                  value={editingClient.status}
                  onValueChange={(value) => setEditingClient({ ...editingClient, status: value as Client["status"] })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                toast({ title: "Datos guardados (temporal, sin base de datos)" })
                setIsEditDialogOpen(false)
              }}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Alumno</DialogTitle>
            <DialogDescription>
              Completa la información del nuevo alumno. Los campos marcados con * son obligatorios.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre *
              </Label>
              <Input id="name" placeholder="Nombre completo" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email *
              </Label>
              <Input id="email" type="email" placeholder="email@ejemplo.com" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Teléfono
              </Label>
              <Input id="phone" placeholder="+54 9 11 1234-5678" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="goal" className="text-right">
                Objetivo
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar objetivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight-loss">Pérdida de peso</SelectItem>
                  <SelectItem value="muscle-gain">Ganancia muscular</SelectItem>
                  <SelectItem value="endurance">Resistencia</SelectItem>
                  <SelectItem value="strength">Fuerza</SelectItem>
                  <SelectItem value="general">Fitness general</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plan" className="text-right">
                Plan
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Básico - 2 sesiones/semana</SelectItem>
                  <SelectItem value="standard">Estándar - 3 sesiones/semana</SelectItem>
                  <SelectItem value="premium">Premium - 4 sesiones/semana</SelectItem>
                  <SelectItem value="unlimited">Ilimitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewClientDialogOpen(false)}
              className="hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                alert("Alumno agregado correctamente (funcionalidad completa disponible con base de datos)")
                setIsNewClientDialogOpen(false)
              }}
              className="hover:bg-orange-500 transition-colors"
            >
              Agregar Alumno
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
