"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Check, Edit, MessageSquare, MoreVertical, Trash2, X } from "lucide-react"
import type { Client } from "../types"
import { useTranslation } from "@/lib/i18n/LanguageProvider"
import { useIsMobile } from "@/hooks/use-mobile"
import { useRouter } from "next/navigation"

interface ClientTableProps {
  clients: Client[]
  onChatWithClient?: (clientName: string, client: Client) => void
  onEditClient: (client: Client) => void
  onDeleteClient: (clientId: string) => Promise<void>
  onAcceptRequest?: (client: Client) => void
  onRejectRequest?: (client: Client) => void
  onCancelRequest?: (client: Client) => void
}

export function ClientTable({
  clients,
  onChatWithClient,
  onEditClient,
  onDeleteClient,
  onAcceptRequest,
  onRejectRequest,
  onCancelRequest,
}: ClientTableProps) {
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const router = useRouter()

  const handleClientClick = (client: Client) => {
    if (client.status !== "pending") {
      router.push(`/alumnos/${encodeURIComponent(client.userId)}`)
    }
  }

  // Mobile card view
  if (isMobile) {
    return (
      <div className="space-y-3">
        {clients.map((client) => {
          const displayName = client.name || "Alumno"
          const avatarFallback = displayName
            .split(" ")
            .filter(Boolean)
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
          const joinDate = client.joinDate 
            ? new Date(client.joinDate).toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })
            : "—"

          return (
            <Card 
              key={client.id} 
              className="overflow-hidden hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => handleClientClick(client)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={client.avatar || "/images/placeholder.svg"} />
                      <AvatarFallback>{avatarFallback || "A"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">{client.email || "—"}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {client.status === "pending" ? (
                        <>
                          {onCancelRequest && client.requestedBy === 'entrenador' && (
                            <DropdownMenuItem onClick={() => onCancelRequest(client)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t("clients.actions.cancelRequest")}
                            </DropdownMenuItem>
                          )}
                        </>
                      ) : (
                        <>
                          {onChatWithClient && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation()
                              onChatWithClient(displayName, client)
                            }}>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              {t("clients.actions.chat")}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            onEditClient(client)
                          }}>
                            <Edit className="w-4 h-4 mr-2" />
                            {t("clients.actions.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={async (e) => {
                              e.stopPropagation()
                              try {
                                await onDeleteClient(client.id)
                              } catch (error) {
                                console.error('Error deleting client:', error)
                              }
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t("clients.actions.delete")}
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("clients.table.phone")}:</span>
                    <span>{client.phone || "—"}</span>
                  </div>
                  {client.status === "pending" && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t("clients.table.status")}:</span>
                      <Badge variant="secondary">
                        {t(`dashboard.status.${client.status}`)}
                      </Badge>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unido:</span>
                    <span>{joinDate}</span>
                  </div>
                </div>

                {client.status === "pending" && client.requestedBy === 'alumno' && onAcceptRequest && onRejectRequest && (
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white flex-1"
                      onClick={() => onAcceptRequest(client)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      {t("clients.actions.accept")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50 flex-1"
                      onClick={() => onRejectRequest(client)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      {t("clients.actions.decline")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
        {clients.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {t("clients.noResults")}
          </div>
        )}
      </div>
    )
  }

  // Desktop table view
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-muted/40 text-muted-foreground">
            <th className="px-3 py-2 text-left">{t("clients.table.name")}</th>
            <th className="px-3 py-2 text-left">{t("clients.table.email")}</th>
            <th className="px-3 py-2 text-left">{t("clients.table.phone")}</th>
            <th className="px-3 py-2 text-left">Fecha de unión</th>
            <th className="px-6 py-2 text-center">{t("clients.table.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => {
            const displayName = client.name || "Alumno"
            const avatarFallback = displayName
              .split(" ")
              .filter(Boolean)
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
            const phone = client.phone || "—"
            const joinDate = client.joinDate 
              ? new Date(client.joinDate).toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })
              : "—"

            return (
              <tr 
                key={client.id} 
                className="border-b border-border hover:bg-accent/50 transition-colors items-center cursor-pointer"
                onClick={() => handleClientClick(client)}
              >
                <td className="px-3 py-2 font-medium flex items-center gap-2">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={client.avatar || "/images/placeholder.svg"} />
                    <AvatarFallback>
                      {avatarFallback || "A"}
                    </AvatarFallback>
                  </Avatar>
                  {displayName}
                </td>
                <td className="px-3 py-2">{client.email || "—"}</td>
                <td className="px-3 py-2">{phone}</td>
                <td className="px-3 py-2">
                  {client.status === "pending" ? (
                    <Badge variant="secondary">
                      {t(`dashboard.status.${client.status}`)}
                    </Badge>
                  ) : (
                    <span>{joinDate}</span>
                  )}
                </td>
                <td className="px-6 py-2">
                  <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {/* Accept/Decline buttons for pending students */}
                    {client.status === "pending" && client.requestedBy === 'alumno' && onAcceptRequest && onRejectRequest && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white px-3"
                          onClick={() => onAcceptRequest(client)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          {t("clients.actions.accept")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50 px-3"
                          onClick={() => onRejectRequest(client)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          {t("clients.actions.decline")}
                        </Button>
                      </>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {client.status === "pending" ? (
                          <>
                            {/* Cancel only if requested_by = entrenador (trainer initiated) */}
                            {onCancelRequest && client.requestedBy === 'entrenador' && (
                              <DropdownMenuItem onClick={() => onCancelRequest(client)}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                {t("clients.actions.cancelRequest")}
                              </DropdownMenuItem>
                            )}
                            {/* Show a placeholder if no actions are available */}
                            {(!onCancelRequest || client.requestedBy !== 'entrenador') && (
                              <DropdownMenuItem disabled>
                                {t("clients.actions.noActionsAvailable")}
                              </DropdownMenuItem>
                            )}
                          </>
                        ) : (
                          <>
                            {onChatWithClient && (
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation()
                                onChatWithClient(displayName, client)
                              }}>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                {t("clients.actions.chat")}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation()
                              onEditClient(client)
                            }}>
                              <Edit className="w-4 h-4 mr-2" />
                              {t("clients.actions.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={async (e) => {
                                e.stopPropagation()
                                try {
                                  await onDeleteClient(client.id)
                                } catch (error) {
                                  console.error('Error deleting client:', error)
                                }
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t("clients.actions.delete")}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            )
          })}
          {clients.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-8 text-muted-foreground">
                {t("clients.noResults")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
