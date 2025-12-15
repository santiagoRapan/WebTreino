/**
 * Chat Feature Types
 * 
 * Type definitions for the chat/messaging system between trainers and clients
 * 
 * NOTE: This chat system is designed exclusively for trainer-client communication.
 * Trainers cannot message other trainers through this feature.
 */

export type MessageStatus = 'sent' | 'delivered' | 'read'

export type ConversationStatus = 'active' | 'archived' | 'muted'

/**
 * Represents a single message in a conversation
 */
export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: Date
  status: MessageStatus
  isOwnMessage: boolean
}

/**
 * Represents a conversation/chat thread between a trainer and a client
 * 
 * NOTE: participantRole will always be 'client' from the trainer's perspective
 */
export interface Conversation {
  id: string
  participantId: string
  participantName: string
  participantAvatar?: string
  participantRole: 'client' // Always 'client' - trainers only chat with clients
  lastMessage?: {
    content: string
    timestamp: Date
    senderId: string
  }
  unreadCount: number
  status: ConversationStatus
  createdAt: Date
  updatedAt: Date
}

/**
 * Represents a user in the chat system
 */
export interface ChatUser {
  id: string
  name: string
  avatar?: string
  role: 'trainer' | 'client'
  online: boolean
  lastSeen?: Date
}

/**
 * Chat state filter options
 */
export type ChatFilter = 'all' | 'unread' | 'archived'

/**
 * Typing indicator for real-time updates
 */
export interface TypingIndicator {
  userId: string
  userName: string
  conversationId: string
}
