"use client"

import { useMemo } from "react"
import { useTrainerDashboard } from "@/components/trainer/TrainerDashboardContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import {
  Archive,
  Check,
  CheckCheck,
  ImageIcon,
  MessageSquare,
  Mic,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Star,
  Trash2,
  User,
  Video,
  VolumeX,
  X,
} from "lucide-react"

const EMOJIS = [
  "😊",
  "👍",
  "💪",
  "🔥",
  "⚡",
  "🎯",
  "✅",
  "❤️",
  "👏",
  "🙌",
  "💯",
  "🏆",
  "⭐",
  "🎉",
  "💪🏻",
  "🏃‍♂️",
  "🏋️‍♀️",
  "🥇",
]

export function ChatTab() {
  const {
    state: {
      chatConversations,
      chatFilter,
      chatSearchTerm,
      selectedChat,
      chatMessage,
      showEmojiPicker,
      isNewChatDialogOpen,
      newChatSearchTerm,
      showArchived,
    },
    data: { filteredChats, dedupedNewChatResults, allClients },
    actions: {
      setChatFilter,
      setChatSearchTerm,
      setSelectedChat,
      setChatMessage,
      setShowEmojiPicker,
      setIsNewChatDialogOpen,
      setNewChatSearchTerm,
      setShowArchived,
      setChatConversations,
      handleSendMessage,
      handleEmojiPicker,
      addEmoji,
      handleStartChat,
      handleFileAttachment,
      handleImageAttachment,
      handleChatFromClient,
      setActiveTab,
    },
  } = useTrainerDashboard()

  const clientsWithChats = useMemo(
    () => new Set(chatConversations.map((chat) => chat.clientId)),
    [chatConversations]
  )

  return (
    <main className="p-6 h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Chat List */}
        <div className="lg:col-span-1 relative">
          <Card className="bg-card border-border h-full flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-card-foreground">Conversaciones</CardTitle>
                <Badge variant="secondary">
                  {chatConversations.reduce((acc, chat) => acc + chat.unreadCount, 0)} nuevos
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  variant={chatFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChatFilter("all")}
                  className="text-xs"
                >
                  Todos ({chatConversations.length})
                </Button>
                <Button
                  variant={chatFilter === "unread" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChatFilter("unread")}
                  className="text-xs"
                >
                  No leídos ({chatConversations.filter((c) => c.unreadCount > 0).length})
                </Button>
                <Button
                  variant={chatFilter === "favorites" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChatFilter("favorites")}
                  className="text-xs"
                >
                  <Star className="w-3 h-3 mr-1" /> Favoritos ({chatConversations.filter((c) => c.isFavorite).length})
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar conversaciones..."
                  value={chatSearchTerm}
                  onChange={(e) => setChatSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex justify-end mt-3">
                <Button
                  variant={showArchived ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowArchived((prev) => !prev)}
                  className="text-xs"
                >
                  Archivados ({chatConversations.filter((c) => c.isArchived).length})
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-0">
              <div className="space-y-1">
                {filteredChats.length > 0 ? (
                  filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={`p-4 cursor-pointer transition-colors border-b border-border hover:bg-muted/50 ${
                        selectedChat?.id === chat.id ? "bg-muted" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={chat.clientAvatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {chat.clientName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          {chat.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-card-foreground truncate">{chat.clientName}</h4>
                              {chat.isFavorite && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                            </div>
                            <span className="text-xs text-muted-foreground">{chat.lastMessageTime}</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                        </div>
                        {chat.unreadCount > 0 && (
                          <Badge className="ml-auto" variant="default">
                            {chat.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-muted-foreground text-sm">
                    No hay conversaciones que coincidan con el filtro.
                  </div>
                )}
              </div>
            </CardContent>
        
            <div className="p-4">
              <Button className="w-full" onClick={() => setIsNewChatDialogOpen(true)}>
                Iniciar nueva conversación
              </Button>
            </div>
          </Card>
        </div>

        {/* Chat Detail */}
        <div className="lg:col-span-2 flex flex-col">
          {selectedChat ? (
            <Card className="bg-card border-border h-full flex flex-col">
              <CardHeader className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedChat.clientAvatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {selectedChat.clientName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-card-foreground">{selectedChat.clientName}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{selectedChat.isOnline ? "En línea" : "Desconectado"}</span>
                        <span>•</span>
                        <span>{selectedChat.lastMessageTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" title="Llamar" onClick={() => toast({ title: "Llamada iniciada" })}>
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" title="Videollamada" onClick={() => toast({ title: "Videollamada iniciada" })}>
                      <Video className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48">
                        <DropdownMenuItem
                          onClick={() => {
                            setChatConversations((prev) =>
                              prev.map((chat) =>
                                selectedChat && chat.id === selectedChat.id
                                  ? { ...chat, isFavorite: !chat.isFavorite }
                                  : chat
                              )
                            )
                            toast({ title: "Favoritos actualizado" })
                          }}
                        >
                          <Star className="w-4 h-4 mr-2" />
                          {selectedChat.isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toast({ title: `Navegando al perfil de ${selectedChat.clientName}` })}
                        >
                          <User className="w-4 h-4 mr-2" />
                          Ver perfil del alumno
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setChatConversations((prev) =>
                              prev.map((chat) =>
                                selectedChat && chat.id === selectedChat.id
                                  ? { ...chat, isArchived: !chat.isArchived }
                                  : chat
                              )
                            )
                            toast({ title: selectedChat.isArchived ? "Chat desarchivado" : "Chat archivado" })
                          }}
                        >
                          <Archive className="w-4 h-4 mr-2" />
                          {selectedChat.isArchived ? "Desarchivar" : "Archivar"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast({ title: "Chat silenciado por 1 hora" })}>
                          <VolumeX className="w-4 h-4 mr-2" /> Silenciar 1 hora
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast({ title: "Chat eliminado" })}>
                          <Trash2 className="w-4 h-4 mr-2" /> Eliminar conversación
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedChat.messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isTrainer ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.isTrainer
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs opacity-70">{message.timestamp}</span>
                        {message.isTrainer && (
                          <div className="text-xs opacity-70">
                            {message.isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>

              <div className="p-4 border-t border-border space-y-4">
                {showEmojiPicker && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Seleccionar emoji</span>
                      <Button variant="ghost" size="icon" onClick={() => setShowEmojiPicker(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-8 gap-2 text-lg">
                      {EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          className="p-2 hover:bg-background rounded"
                          onClick={() => addEmoji(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <Textarea
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    className="min-h-[120px]"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={handleEmojiPicker}>
                        <Smile className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={handleFileAttachment}>
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={handleImageAttachment}>
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => toast({ title: "Grabando audio..." })}>
                        <Mic className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button onClick={handleSendMessage} disabled={!chatMessage.trim()} className="hover:bg-orange-500 transition-colors">
                      <Send className="w-4 h-4 mr-2" /> Enviar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="bg-card border-border h-full flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-card-foreground mb-2">Selecciona una conversación</h3>
                <p className="text-muted-foreground">Elige un alumno de la lista para comenzar a chatear</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={isNewChatDialogOpen} onOpenChange={setIsNewChatDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Nueva conversación</DialogTitle>
            <DialogDescription>Elige un alumno para iniciar un chat o busca uno existente.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar alumno..."
                value={newChatSearchTerm}
                onChange={(e) => setNewChatSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="max-h-80 overflow-auto space-y-2">
              {dedupedNewChatResults.map((client) => {
                const existing = chatConversations.find((c) => c.clientId === client.id)
                const isInDefaultList = !clientsWithChats.has(client.id)
                const shouldShow = isInDefaultList || (!!newChatSearchTerm && !!existing)
                if (!shouldShow) return null
                return (
                  <div key={client.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={client.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {client.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-card-foreground">{client.name}</p>
                        <p className="text-xs text-muted-foreground">{client.email}</p>
                      </div>
                    </div>
                    {existing ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedChat(existing)
                          setActiveTab("chat")
                          setIsNewChatDialogOpen(false)
                        }}
                        className="hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        Ir al chat
                      </Button>
                    ) : (
                      <Button onClick={() => handleStartChat(client)} className="hover:bg-orange-500 transition-colors">
                        Iniciar chat
                      </Button>
                    )}
                  </div>
                )
              })}
              {dedupedNewChatResults.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No se encontraron alumnos.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewChatDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
