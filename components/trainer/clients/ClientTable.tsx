"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, Check, Edit, History, MessageSquare, MoreVertical, Trash2, X } from "lucide-react"
import { Client } from "@/types/trainer"

interface ClientTableProps {
  clients: Client[]
  onChatWithClient: (clientName: string) => void
  onEditClient: (client: Client) => void
  onScheduleSession: (clientId: number) => void
  onDeleteClient: (clientId: number) => void
  onAcceptRequest?: (client: Client) => void
  onRejectRequest?: (client: Client) => void
  onCancelRequest?: (client: Client) => void
  onViewHistory?: (client: Client) => void
}

export function ClientTable({
  clients,
  onChatWithClient,
  onEditClient,
  onScheduleSession,
  onDeleteClient,
  onAcceptRequest,
  onRejectRequest,
  onCancelRequest,
  onViewHistory,
}: ClientTableProps) {
  return (
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
          {clients.map((client) => (
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
                    {client.status === "Pendiente" ? (
                      <>
                        {/* Accept/Reject only if requested_by = alumno (trainer is counterpart) */}
                        {onAcceptRequest && client.requestedBy === 'alumno' && (
                          <DropdownMenuItem onClick={() => onAcceptRequest(client)}>
                            <Check className="w-4 h-4 mr-2" />
                            Aceptar solicitud
                          </DropdownMenuItem>
                        )}
                        {onRejectRequest && client.requestedBy === 'alumno' && (
                          <DropdownMenuItem onClick={() => onRejectRequest(client)}>
                            <X className="w-4 h-4 mr-2" />
                            Rechazar solicitud
                          </DropdownMenuItem>
                        )}
                        {/* Cancel only if requested_by = entrenador (trainer initiated) */}
                        {onCancelRequest && client.requestedBy === 'entrenador' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onCancelRequest(client)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Cancelar solicitud
                            </DropdownMenuItem>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem onClick={() => onChatWithClient(client.name)}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Chat
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditClient(client)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        {onViewHistory && (
                          <DropdownMenuItem onClick={() => onViewHistory(client)}>
                            <History className="w-4 h-4 mr-2" />
                            Ver historial
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onScheduleSession(client.id)}>
                          <Calendar className="w-4 h-4 mr-2" />
                          Agendar sesión
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDeleteClient(client.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
          {clients.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-8 text-muted-foreground">
                No se encontraron alumnos con los filtros aplicados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}