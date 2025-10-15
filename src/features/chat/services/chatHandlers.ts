/**
 * Chat Handlers
 * 
 * Business logic handlers for chat/messaging operations
 */

import { toast } from '@/hooks/use-toast'
import type { ChatState } from '../hooks/useChatState'
import { chatDatabase } from './chatDatabase'

interface ChatHandlers {
  handleSelectConversation: (conversationId: string) => Promise<void>
  handleSendMessage: (content: string) => Promise<void>
  handleLoadConversations: () => Promise<void>
  handleMarkAsRead: (conversationId: string) => void
  handleArchiveConversation: (conversationId: string) => Promise<void>
  handleDeleteConversation: (conversationId: string) => Promise<void>
  handleNewConversation: (participantId: string) => Promise<void>
}

export function createChatHandlers(
  chatState: ChatState,
  userId: string
): ChatHandlers {
  return {
    /**
     * Select a conversation and load its messages
     */
    handleSelectConversation: async (conversationId: string) => {
      try {
        chatState.setActiveConversationId(conversationId)
        chatState.setLoadingMessages(true)
        
        // Fetch messages for this conversation
        const messages = await chatDatabase.fetchMessages(conversationId, userId)
        chatState.setMessages(conversationId, messages)
        
        // Mark messages as read
        await chatDatabase.markAsRead(conversationId, userId)
        
        // Update unread count in conversation
        const updatedConversations = chatState.conversations.map(conv =>
          conv.id === conversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
        chatState.setConversations(updatedConversations)
        
      } catch (error) {
        console.error('Error selecting conversation:', error)
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los mensajes',
          variant: 'destructive'
        })
      } finally {
        chatState.setLoadingMessages(false)
      }
    },

    /**
     * Send a new message in the active conversation
     */
    handleSendMessage: async (content: string) => {
      if (!chatState.activeConversationId || !content.trim()) return
      
      try {
        chatState.setSendingMessage(true)
        
        // Send message to database
        const newMessage = await chatDatabase.sendMessage(
          chatState.activeConversationId,
          userId,
          content.trim()
        )
        
        // Add message to local state
        const currentMessages = chatState.messages[chatState.activeConversationId] || []
        chatState.setMessages(chatState.activeConversationId, [...currentMessages, newMessage])
        
        // Update conversation's last message
        const updatedConversations = chatState.conversations.map(conv =>
          conv.id === chatState.activeConversationId
            ? {
                ...conv,
                lastMessage: {
                  content: content.trim(),
                  timestamp: newMessage.timestamp,
                  senderId: userId
                },
                updatedAt: newMessage.timestamp
              }
            : conv
        )
        chatState.setConversations(updatedConversations)
        
      } catch (error) {
        console.error('Error sending message:', error)
        toast({
          title: 'Error',
          description: 'No se pudo enviar el mensaje',
          variant: 'destructive'
        })
      } finally {
        chatState.setSendingMessage(false)
      }
    },

    /**
     * Load all conversations for the user
     */
    handleLoadConversations: async () => {
      try {
        chatState.setLoadingConversations(true)
        
        const conversations = await chatDatabase.fetchConversations(userId)
        chatState.setConversations(conversations)
        
      } catch (error) {
        console.error('Error loading conversations:', error)
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las conversaciones',
          variant: 'destructive'
        })
      } finally {
        chatState.setLoadingConversations(false)
      }
    },

    /**
     * Mark conversation as read
     */
    handleMarkAsRead: (conversationId: string) => {
      chatDatabase.markAsRead(conversationId, userId).catch(error => {
        console.error('Error marking as read:', error)
      })
    },

    /**
     * Archive a conversation
     */
    handleArchiveConversation: async (conversationId: string) => {
      try {
        await chatDatabase.archiveConversation(conversationId)
        
        // Update local state
        const updatedConversations = chatState.conversations.map(conv =>
          conv.id === conversationId
            ? { ...conv, status: 'archived' as const }
            : conv
        )
        chatState.setConversations(updatedConversations)
        
        // Clear active conversation if it was archived
        if (chatState.activeConversationId === conversationId) {
          chatState.setActiveConversationId(null)
        }
        
        toast({
          title: 'Conversación archivada',
          description: 'La conversación se ha archivado correctamente'
        })
        
      } catch (error) {
        console.error('Error archiving conversation:', error)
        toast({
          title: 'Error',
          description: 'No se pudo archivar la conversación',
          variant: 'destructive'
        })
      }
    },

    /**
     * Delete a conversation
     */
    handleDeleteConversation: async (conversationId: string) => {
      try {
        await chatDatabase.deleteConversation(conversationId)
        
        // Remove from local state
        const updatedConversations = chatState.conversations.filter(
          conv => conv.id !== conversationId
        )
        chatState.setConversations(updatedConversations)
        
        // Clear active conversation if it was deleted
        if (chatState.activeConversationId === conversationId) {
          chatState.setActiveConversationId(null)
        }
        
        toast({
          title: 'Conversación eliminada',
          description: 'La conversación se ha eliminado correctamente'
        })
        
      } catch (error) {
        console.error('Error deleting conversation:', error)
        toast({
          title: 'Error',
          description: 'No se pudo eliminar la conversación',
          variant: 'destructive'
        })
      }
    },

    /**
     * Start a new conversation with a user
     */
    handleNewConversation: async (participantId: string) => {
      try {
        const newConversation = await chatDatabase.createConversation(userId, participantId)
        
        // Add to local state
        chatState.setConversations([newConversation, ...chatState.conversations])
        
        // Select the new conversation
        chatState.setActiveConversationId(newConversation.id)
        
        toast({
          title: 'Nueva conversación',
          description: 'Se ha creado una nueva conversación'
        })
        
      } catch (error) {
        console.error('Error creating conversation:', error)
        toast({
          title: 'Error',
          description: 'No se pudo crear la conversación',
          variant: 'destructive'
        })
      }
    }
  }
}
