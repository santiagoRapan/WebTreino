/**
 * Chat Database Service
 * 
 * Handles all database operations for chat/messaging
 * TODO: Integrate with Supabase once database schema is ready
 */

import type { Conversation, Message, ChatUser } from '../types'

export class ChatDatabase {
  /**
   * Fetch all conversations for the authenticated user
   * TODO: Replace with Supabase query
   */
  async fetchConversations(userId: string): Promise<Conversation[]> {
    // PLACEHOLDER: This will be replaced with actual Supabase call
    // Example query:
    // const { data, error } = await supabase
    //   .from('conversations')
    //   .select('*, participants!inner(*)')
    //   .eq('participants.user_id', userId)
    //   .order('updated_at', { ascending: false })
    
    console.log('📡 [PLACEHOLDER] Fetching conversations for user:', userId)
    
    // Mock data for development - Only trainer-client conversations
    return [
      {
        id: '1',
        participantId: 'client-001',
        participantName: 'María García',
        participantAvatar: undefined,
        participantRole: 'client',
        lastMessage: {
          content: '¿Cómo debo ajustar mi dieta para esta rutina?',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
          senderId: 'client-001'
        },
        unreadCount: 2,
        status: 'active',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 30)
      },
      {
        id: '2',
        participantId: 'client-002',
        participantName: 'Carlos Rodríguez',
        participantAvatar: undefined,
        participantRole: 'client',
        lastMessage: {
          content: 'Gracias por la nueva rutina!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          senderId: 'client-002'
        },
        unreadCount: 0,
        status: 'active',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
      },
      {
        id: '3',
        participantId: 'client-003',
        participantName: 'Ana Martínez',
        participantAvatar: undefined,
        participantRole: 'client',
        lastMessage: {
          content: 'Hola! Tengo una duda sobre el ejercicio de piernas',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
          senderId: 'client-003'
        },
        unreadCount: 1,
        status: 'active',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5)
      }
    ]
  }

  /**
   * Fetch messages for a specific conversation
   * TODO: Replace with Supabase query
   */
  async fetchMessages(conversationId: string, userId: string): Promise<Message[]> {
    // PLACEHOLDER: This will be replaced with actual Supabase call
    // Example query:
    // const { data, error } = await supabase
    //   .from('messages')
    //   .select('*, sender:users(*)')
    //   .eq('conversation_id', conversationId)
    //   .order('timestamp', { ascending: true })
    
    console.log('📡 [PLACEHOLDER] Fetching messages for conversation:', conversationId)
    
    // Mock data - Trainer-client conversation
    if (conversationId === '1') {
      return [
        {
          id: 'm1',
          conversationId: '1',
          senderId: userId,
          senderName: 'Tú',
          content: 'Hola María! ¿Cómo vas con la rutina de esta semana?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          status: 'read',
          isOwnMessage: true
        },
        {
          id: 'm2',
          conversationId: '1',
          senderId: 'client-001',
          senderName: 'María García',
          content: 'Hola! Muy bien, he completado 3 sesiones',
          timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 min ago
          status: 'read',
          isOwnMessage: false
        },
        {
          id: 'm3',
          conversationId: '1',
          senderId: 'client-001',
          senderName: 'María García',
          content: '¿Cómo debo ajustar mi dieta para esta rutina?',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
          status: 'delivered',
          isOwnMessage: false
        }
      ]
    }
    
    if (conversationId === '2') {
      return [
        {
          id: 'm4',
          conversationId: '2',
          senderId: 'client-002',
          senderName: 'Carlos Rodríguez',
          content: 'Gracias por la nueva rutina!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          status: 'read',
          isOwnMessage: false
        },
        {
          id: 'm5',
          conversationId: '2',
          senderId: userId,
          senderName: 'Tú',
          content: 'De nada! Avísame si tienes dudas',
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          status: 'read',
          isOwnMessage: true
        }
      ]
    }
    
    if (conversationId === '3') {
      return [
        {
          id: 'm6',
          conversationId: '3',
          senderId: 'client-003',
          senderName: 'Ana Martínez',
          content: 'Hola! Tengo una duda sobre el ejercicio de piernas',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
          status: 'delivered',
          isOwnMessage: false
        }
      ]
    }
    
    return []
  }

  /**
   * Send a new message
   * TODO: Replace with Supabase insert
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string
  ): Promise<Message> {
    // PLACEHOLDER: This will be replaced with actual Supabase call
    // Example mutation:
    // const { data, error } = await supabase
    //   .from('messages')
    //   .insert({
    //     conversation_id: conversationId,
    //     sender_id: senderId,
    //     content: content,
    //     timestamp: new Date().toISOString()
    //   })
    //   .select()
    //   .single()
    
    console.log('📡 [PLACEHOLDER] Sending message:', { conversationId, senderId, content })
    
    // Mock response
    const newMessage: Message = {
      id: `m-${Date.now()}`,
      conversationId,
      senderId,
      senderName: 'Tú',
      content,
      timestamp: new Date(),
      status: 'sent',
      isOwnMessage: true
    }
    
    return newMessage
  }

  /**
   * Mark messages as read
   * TODO: Replace with Supabase update
   */
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    // PLACEHOLDER: This will be replaced with actual Supabase call
    // Example mutation:
    // await supabase
    //   .from('messages')
    //   .update({ status: 'read' })
    //   .eq('conversation_id', conversationId)
    //   .neq('sender_id', userId)
    //   .eq('status', 'delivered')
    
    console.log('📡 [PLACEHOLDER] Marking messages as read:', conversationId)
  }

  /**
   * Create a new conversation
   * TODO: Replace with Supabase insert
   */
  async createConversation(userId: string, participantId: string): Promise<Conversation> {
    // PLACEHOLDER: This will be replaced with actual Supabase call
    // Example mutation:
    // const { data: conversation, error } = await supabase
    //   .from('conversations')
    //   .insert({ created_at: new Date().toISOString() })
    //   .select()
    //   .single()
    //
    // Then insert participants...
    
    console.log('📡 [PLACEHOLDER] Creating conversation:', { userId, participantId })
    
    // Mock response
    return {
      id: `conv-${Date.now()}`,
      participantId,
      participantName: 'New Contact',
      participantRole: 'trainer',
      unreadCount: 0,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  /**
   * Archive a conversation
   * TODO: Replace with Supabase update
   */
  async archiveConversation(conversationId: string): Promise<void> {
    // PLACEHOLDER
    console.log('📡 [PLACEHOLDER] Archiving conversation:', conversationId)
  }

  /**
   * Delete a conversation
   * TODO: Replace with Supabase delete
   */
  async deleteConversation(conversationId: string): Promise<void> {
    // PLACEHOLDER
    console.log('📡 [PLACEHOLDER] Deleting conversation:', conversationId)
  }

  /**
   * Search for users to start a conversation
   * TODO: Replace with Supabase query
   */
  async searchUsers(query: string, currentUserId: string): Promise<ChatUser[]> {
    // PLACEHOLDER
    console.log('📡 [PLACEHOLDER] Searching users:', query)
    return []
  }
}

export const chatDatabase = new ChatDatabase()
