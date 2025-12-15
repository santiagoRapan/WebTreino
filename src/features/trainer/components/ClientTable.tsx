"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Check, Edit, History, MessageSquare, MoreVertical, Trash2, X } from "lucide-react"
import type { Client } from "../types"
import { useTranslation } from "@/lib/i18n/LanguageProvider"
import { useIsMobile } from "@/hooks/use-mobile"

interface ClientTableProps {
  clients: Client[]
  onChatWithClient?: (clientName: string, client: Client) => void
  onEditClient: (client: Client) => void
  onDeleteClient: (clientId: string) => Promise<void>
  onAcceptRequest?: (client: Client) => void
  onRejectRequest?: (client: Client) => void
  onCancelRequest?: (client: Client) => void
  onViewHistory?: (client: Client) => void
  onUpdateStatus?: (client: Client, newStatus: "active" | "inactive" | "pending") => void
}

export function ClientTable({
  clients,
  onChatWithClient,
  onEditClient,
  onDeleteClient,
  onAcceptRequest,
  onRejectRequest,
  onCancelRequest,
  onViewHistory,
  onUpdateStatus,
}: ClientTableProps) {
  const { t } = useTranslation()
  const isMobile = useIsMobile()

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
          const progress = typeof client.progress === "number" ? client.progress : 0

          return (
            <Card key={client.id} className="overflow-hidden">
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
                    <DropdownMenuTrigger asChild>
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
                            <DropdownMenuItem onClick={() => onChatWithClient(displayName, client)}>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              {t("clients.actions.chat")}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => onEditClient(client)}>
                            <Edit className="w-4 h-4 mr-2" />
                            {t("clients.actions.edit")}
                          </DropdownMenuItem>
                          {onViewHistory && (
                            <DropdownMenuItem onClick={() => onViewHistory(client)}>
                              <History className="w-4 h-4 mr-2" />
                              {t("clients.actions.viewHistory")}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={async () => {
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
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t("clients.table.status")}:</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                          <Badge
                            variant={
                              client.status === "active"
                                ? "default"
                                : client.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="cursor-pointer hover:opacity-80"
                          >
                            {t(`dashboard.status.${client.status}`)}
                          </Badge>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onUpdateStatus?.(client, "active")}>
                          {t("dashboard.status.active")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUpdateStatus?.(client, "pending")}>
                          {t("dashboard.status.pending")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUpdateStatus?.(client, "inactive")}>
                          {t("dashboard.status.inactive")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("clients.table.progress")}:</span>
                    <span>{progress}%</span>
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
            <th className="px-3 py-2 text-left">{t("clients.table.status")}</th>
            <th className="px-3 py-2 text-left">{t("clients.table.progress")}</th>
            <th className="px-3 py-2 text-left">{t("clients.table.nextSession")}</th>
            <th className="w-48 text-right">{t("clients.table.actions")}</th>
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
            const progress = typeof client.progress === "number" ? client.progress : 0

            return (
              <tr key={client.id} className="border-b border-border hover:bg-muted/30 transition-colors items-center">
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                        <Badge
                          variant={
                            client.status === "active"
                              ? "default"
                              : client.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                          className="cursor-pointer hover:opacity-80"
                        >
                          {t(`dashboard.status.${client.status}`)}
                        </Badge>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => onUpdateStatus?.(client, "active")}>
                        {t("dashboard.status.active")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdateStatus?.(client, "pending")}>
                        {t("dashboard.status.pending")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdateStatus?.(client, "inactive")}>
                        {t("dashboard.status.inactive")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
                <td className="px-3 py-2 text-left align-middle">{progress}%</td>
                <td className="px-3 py-2">{client.nextSession || "—"}</td>
                <td className="w-48 px-1 py-2">
                  <div className="flex items-center gap-2">
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
                      <DropdownMenuTrigger asChild>
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
                              <DropdownMenuItem onClick={() => onChatWithClient(displayName, client)}>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                {t("clients.actions.chat")}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onEditClient(client)}>
                              <Edit className="w-4 h-4 mr-2" />
                              {t("clients.actions.edit")}
                            </DropdownMenuItem>
                            {onViewHistory && (
                              <DropdownMenuItem onClick={() => onViewHistory(client)}>
                                <History className="w-4 h-4 mr-2" />
                                {t("clients.actions.viewHistory")}
                              </DropdownMenuItem>
                            )}
                            {/* Agenda removed */}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={async () => {
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
              <td colSpan={7} className="text-center py-8 text-muted-foreground">
                {t("clients.noResults")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
