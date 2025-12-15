/**
 * Conversation List Component
 * 
 * Displays the list of conversations with search and filters
 */

"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Loader2, MessageSquarePlus } from 'lucide-react'
import type { Conversation, ChatFilter } from '../types'
import { format, isToday, isYesterday } from 'date-fns'

interface ConversationListProps {
  conversations: Conversation[]
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  searchTerm: string
  onSearchChange: (term: string) => void
  filter: ChatFilter
  onFilterChange: (filter: ChatFilter) => void
  loading?: boolean
  onNewConversation?: () => void
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  loading = false,
  onNewConversation
}: ConversationListProps) {
  const formatLastMessageTime = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'HH:mm')
    } else if (isYesterday(date)) {
      return 'Ayer'
    }
    return format(date, 'dd/MM/yy')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const truncateMessage = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="w-full border-r border-border bg-card flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Mensajes</h2>
          {onNewConversation && (
            <Button
              size="sm"
              variant="outline"
              onClick={onNewConversation}
              className="gap-2"
            >
              <MessageSquarePlus className="w-4 h-4" />
              Nuevo
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversaciones..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <Tabs value={filter} onValueChange={(v) => onFilterChange(v as ChatFilter)} className="mt-3">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="unread">No leídas</TabsTrigger>
            <TabsTrigger value="archived">Archivadas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-muted-foreground">No hay conversaciones</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filter === 'unread' && 'No tienes mensajes sin leer'}
              {filter === 'archived' && 'No hay conversaciones archivadas'}
              {filter === 'all' && searchTerm && 'No se encontraron resultados'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {conversations.map((conversation) => {
              const isActive = conversation.id === activeConversationId

              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`w-full p-4 text-left hover:bg-accent transition-colors ${
                    isActive ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex gap-3 min-w-0">
                    {/* Avatar */}
                    <Avatar className="w-12 h-12 shrink-0">
                      <AvatarImage src={conversation.participantAvatar} />
                      <AvatarFallback>
                        {getInitials(conversation.participantName)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-medium truncate ${
                            conversation.unreadCount > 0 ? 'text-foreground' : 'text-foreground'
                          }`}>
                            {conversation.participantName}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">Cliente</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {conversation.lastMessage && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatLastMessageTime(conversation.lastMessage.timestamp)}
                            </span>
                          )}
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Last Message */}
                      {conversation.lastMessage && (
                        <p className={`text-sm line-clamp-2 overflow-hidden ${
                          conversation.unreadCount > 0
                            ? 'text-foreground font-medium'
                            : 'text-muted-foreground'
                        }`}>
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
