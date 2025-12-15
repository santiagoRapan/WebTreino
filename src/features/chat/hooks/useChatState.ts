/**
 * Chat State Hook
 * 
 * Manages chat/messaging state including conversations, messages, and UI state
 */

import { useState, useCallback, useMemo } from 'react'
import type { Conversation, Message, ChatFilter, TypingIndicator } from '../types'

export interface ChatState {
  // Data State
  conversations: Conversation[]
  messages: Record<string, Message[]> // Keyed by conversationId
  activeConversationId: string | null
  typingIndicators: TypingIndicator[]
  
  // UI State
  chatFilter: ChatFilter
  searchTerm: string
  isSidebarCollapsed: boolean
  
  // Loading States
  loadingConversations: boolean
  loadingMessages: boolean
  sendingMessage: boolean
  
  // Setters
  setConversations: (conversations: Conversation[]) => void
  setMessages: (conversationId: string, messages: Message[]) => void
  setActiveConversationId: (id: string | null) => void
  setTypingIndicators: (indicators: TypingIndicator[]) => void
  setChatFilter: (filter: ChatFilter) => void
  setSearchTerm: (term: string) => void
  setIsSidebarCollapsed: (collapsed: boolean) => void
  setLoadingConversations: (loading: boolean) => void
  setLoadingMessages: (loading: boolean) => void
  setSendingMessage: (sending: boolean) => void
  appendMessage: (conversationId: string, message: Message) => void
  
  // Computed
  getActiveConversation: () => Conversation | null
  getActiveMessages: () => Message[]
  getFilteredConversations: () => Conversation[]
  getUnreadCount: () => number
}

export function useChatState(): ChatState {
  // Data State
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessagesMap] = useState<Record<string, Message[]>>({})
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([])
  
  // UI State
  const [chatFilter, setChatFilter] = useState<ChatFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  
  // Loading States
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  
  // Helper to set messages for a specific conversation
  const setMessages = useCallback((conversationId: string, newMessages: Message[]) => {
    setMessagesMap(prev => ({
      ...prev,
      [conversationId]: newMessages
    }))
  }, [])

  // Append helper with in-reducer dedup to avoid stale closures
  const appendMessage = useCallback((conversationId: string, message: Message) => {
    setMessagesMap(prev => {
      const prevMsgs = prev[conversationId] || []
      // Dedup: by id, or same sender+content within 15s
      const exists = prevMsgs.some(x => (
        x.id === message.id || (
          x.senderId === message.senderId &&
          x.content === message.content &&
          Math.abs((x.timestamp?.getTime?.() || 0) - message.timestamp.getTime()) < 15000
        )
      ))
      if (exists) return prev
      return {
        ...prev,
        [conversationId]: [...prevMsgs, message]
      }
    })
  }, [])
  
  // Computed: Get active conversation
  const getActiveConversation = useCallback((): Conversation | null => {
    if (!activeConversationId) return null
    return conversations.find(c => c.id === activeConversationId) || null
  }, [activeConversationId, conversations])
  
  // Computed: Get messages for active conversation
  const getActiveMessages = useCallback((): Message[] => {
    if (!activeConversationId) return []
    return messages[activeConversationId] || []
  }, [activeConversationId, messages])
  
  // Computed: Get filtered conversations based on filter and search
  const getFilteredConversations = useCallback((): Conversation[] => {
    let filtered = conversations
    
    // Apply status filter
    if (chatFilter === 'unread') {
      filtered = filtered.filter(c => c.unreadCount > 0)
    } else if (chatFilter === 'archived') {
      filtered = filtered.filter(c => c.status === 'archived')
    } else {
      // 'all' - exclude archived
      filtered = filtered.filter(c => c.status !== 'archived')
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(c => 
        c.participantName.toLowerCase().includes(search) ||
        c.lastMessage?.content.toLowerCase().includes(search)
      )
    }
    
    // Sort by last message timestamp
    return filtered.sort((a, b) => {
      const timeA = a.lastMessage?.timestamp || a.updatedAt
      const timeB = b.lastMessage?.timestamp || b.updatedAt
      return timeB.getTime() - timeA.getTime()
    })
  }, [conversations, chatFilter, searchTerm])
  
  // Computed: Total unread count
  const getUnreadCount = useCallback((): number => {
    return conversations
      .filter(c => c.status !== 'archived')
      .reduce((sum, c) => sum + c.unreadCount, 0)
  }, [conversations])
  
  return {
    // Data State
    conversations,
    messages,
    activeConversationId,
    typingIndicators,
    
    // UI State
    chatFilter,
    searchTerm,
    isSidebarCollapsed,
    
    // Loading States
    loadingConversations,
    loadingMessages,
    sendingMessage,
    
    // Setters
    setConversations,
    setMessages,
    setActiveConversationId,
    setTypingIndicators,
    setChatFilter,
    setSearchTerm,
    setIsSidebarCollapsed,
    setLoadingConversations,
    setLoadingMessages,
    setSendingMessage,
  appendMessage,
    
    // Computed
    getActiveConversation,
    getActiveMessages,
    getFilteredConversations,
    getUnreadCount,
  }
}
