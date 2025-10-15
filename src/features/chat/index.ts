/**
 * Chat Feature - Barrel Exports
 * 
 * Central export point for the chat/messaging feature
 */

// Components
export { ChatTab } from './components/ChatTab'
export { ConversationList } from './components/ConversationList'
export { MessageList } from './components/MessageList'
export { MessageInput } from './components/MessageInput'

// Hooks
export { useChatState } from './hooks/useChatState'
export type { ChatState } from './hooks/useChatState'

// Services
export { createChatHandlers } from './services/chatHandlers'
export { chatDatabase } from './services/chatDatabase'

// Types
export type {
  Message,
  Conversation,
  ChatUser,
  MessageStatus,
  ConversationStatus,
  ChatFilter,
  TypingIndicator
} from './types'
