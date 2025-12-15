/**
 * Chat Tab Component
 * 
 * Main chat interface with conversation list and message view
 * Responsive: Shows conversation list OR message view on mobile
 */

"use client"

import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Archive, Trash2, MessageSquare, ArrowLeft } from 'lucide-react'
import { ConversationList } from './ConversationList'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { useChatState } from '../hooks/useChatState'
import { createChatHandlers } from '../services/chatHandlers'
import { chatDatabase } from '../services/chatDatabase'
import { useAuth } from '@/features/auth/services/auth-context'
import { supabase } from '@/services/database'

export function ChatTab() {
  const { authUser } = useAuth()
  const chatState = useChatState()
  const [showMobileMessages, setShowMobileMessages] = useState(false)
  
  // Create handlers
  const handlers = createChatHandlers(chatState, authUser?.id || '')

  // Load conversations on mount
  useEffect(() => {
    if (authUser?.id) {
      handlers.handleLoadConversations()
    }
  }, [authUser?.id])

  // Handle mobile view when conversation is selected
  useEffect(() => {
    if (chatState.activeConversationId) {
      setShowMobileMessages(true)
    }
  }, [chatState.activeConversationId])

  // Realtime subscription for new messages on the active conversation
  const unsubscribeRef = useRef<(() => void) | null>(null)
  useEffect(() => {
    // Cleanup previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
      unsubscribeRef.current = null
    }

    const conversationId = chatState.activeConversationId
    if (!conversationId || !authUser?.id) return

    // Si el id actual es sintético trainer:student, escuchar también el id real si logra resolverse
    const idsToListen = [conversationId]
    const active = chatState.getActiveConversation()
    if (active && conversationId.includes(':')) {
      // Nota: no esperamos, el resolve se hace durante el envío; por ahora escuchamos solo el sintético
      // El servicio puede soportar array más adelante cuando tengamos el real.
    }

    unsubscribeRef.current = chatDatabase.subscribeToConversation(
      idsToListen,
      async (dbMessage) => {
        // Debug: confirma que llegó un evento
        // console.log('[Realtime] new message payload:', dbMessage)

        // Fetch sender information for real-time messages
        let senderName = 'Usuario'
        let senderAvatar: string | undefined = undefined
        
        if (dbMessage.sender_id !== authUser.id) {
          try {
            const { data: sender, error } = await supabase
              .from('users')
              .select('name, avatar_url')
              .eq('id', dbMessage.sender_id)
              .single()
            
            if (!error && sender) {
              senderName = sender.name || 'Usuario'
              senderAvatar = sender.avatar_url
            }
          } catch (error) {
            console.error('Error fetching sender info for realtime message:', error)
          }
        }

        const m = {
          id: dbMessage.id ?? `${dbMessage.sender_id}-${Date.now()}`,
          conversationId: dbMessage.conversation_id,
          senderId: dbMessage.sender_id,
          senderName: dbMessage.sender_id === authUser.id ? 'Tú' : senderName,
          senderAvatar: dbMessage.sender_id === authUser.id ? undefined : senderAvatar,
          content: dbMessage.content,
          timestamp: dbMessage.created_at ? new Date(dbMessage.created_at) : new Date(),
          status: 'delivered' as const,
          isOwnMessage: dbMessage.sender_id === authUser.id,
        }

        chatState.appendMessage(dbMessage.conversation_id, m)

        // Update last message for conversation list ordering
        const updatedConversations = chatState.conversations.map((conv) =>
          conv.id === dbMessage.conversation_id
            ? {
                ...conv,
                lastMessage: {
                  content: m.content,
                  timestamp: m.timestamp,
                  senderId: m.senderId,
                },
                updatedAt: m.timestamp,
              }
            : conv
        )
        chatState.setConversations(updatedConversations)
      }
    )

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [chatState.activeConversationId, authUser?.id])

  const activeConversation = chatState.getActiveConversation()
  const activeMessages = chatState.getActiveMessages()
  const filteredConversations = chatState.getFilteredConversations()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleBackToConversations = () => {
    setShowMobileMessages(false)
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* Conversation List Sidebar - Hidden on mobile when showing messages */}
      <div className={`${showMobileMessages ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 min-h-0`}>
        <ConversationList
          conversations={filteredConversations}
          activeConversationId={chatState.activeConversationId}
          onSelectConversation={handlers.handleSelectConversation}
          searchTerm={chatState.searchTerm}
          onSearchChange={chatState.setSearchTerm}
          filter={chatState.chatFilter}
          onFilterChange={chatState.setChatFilter}
          loading={chatState.loadingConversations}
          onNewConversation={() => {
            // TODO: Implement new conversation dialog
            console.log('New conversation clicked')
          }}
        />
      </div>

      {/* Message View - Hidden on mobile when showing conversation list */}
      <div className={`${showMobileMessages ? 'flex' : 'hidden md:flex'} flex-1 min-h-0 flex-col bg-card`}>
        {activeConversation ? (
          <>
            {/* Conversation Header */}
            <div className="border-b border-border p-4 bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Back button for mobile */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={handleBackToConversations}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={activeConversation.participantAvatar} />
                    <AvatarFallback>
                      {getInitials(activeConversation.participantName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {activeConversation.participantName}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      Cliente
                    </Badge>
                  </div>
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handlers.handleArchiveConversation(activeConversation.id)}
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archivar conversación
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handlers.handleDeleteConversation(activeConversation.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar conversación
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <MessageList
              messages={activeMessages}
              loading={chatState.loadingMessages}
              currentUserId={authUser?.id || ''}
            />

            {/* Message Input */}
            <MessageInput
              onSendMessage={handlers.handleSendMessage}
              sending={chatState.sendingMessage}
              disabled={!authUser?.id}
            />
          </>
        ) : (
          // No conversation selected
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Selecciona una conversación
              </h3>
              <p className="text-muted-foreground">
                Elige un cliente de la lista para comenzar a chatear
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
