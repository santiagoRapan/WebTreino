import { toast } from "@/hooks/use-toast"
import type { Chat, ChatMessage } from "@/src/lib/types/trainer"

export interface ChatHandlers {
  handleSendMessage: () => void
  handleEmojiPicker: () => void
  addEmoji: (emoji: string) => void
  handleStartChat: (clientId: number) => void
  handleSelectChat: (chat: Chat) => void
  handleFileAttachment: () => void
  handleImageAttachment: () => void
}

export function createChatHandlers(
  chatState: any,
  uiState: any
): ChatHandlers {
  return {
    handleSendMessage: () => {
      if (!chatState.chatMessage.trim() || !chatState.selectedChat) return

      const newMessage: ChatMessage = {
        id: Date.now(),
        message: chatState.chatMessage,
        timestamp: new Date().toISOString(),
        isTrainer: true,
        isRead: true,
      }

      // Update the selected chat with the new message
      const updatedConversations = chatState.chatConversations.map((chat: Chat) =>
        chat.id === chatState.selectedChat.id
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessage: chatState.chatMessage,
              lastMessageTime: new Date().toLocaleTimeString(),
            }
          : chat
      )

      chatState.setChatConversations(updatedConversations)
      chatState.setChatMessage("")
      uiState.setShowEmojiPicker(false)

      toast({
        title: "Mensaje enviado",
        description: "Tu mensaje ha sido enviado exitosamente.",
      })
    },

    handleEmojiPicker: () => {
      uiState.setShowEmojiPicker(!uiState.showEmojiPicker)
    },

    addEmoji: (emoji: string) => {
      chatState.setChatMessage(chatState.chatMessage + emoji)
      uiState.setShowEmojiPicker(false)
    },

    handleStartChat: (clientId: number) => {
      uiState.setIsNewChatDialogOpen(true)
    },

    handleSelectChat: (chat: Chat) => {
      chatState.setSelectedChat(chat)
      
      // Mark messages as read
      const updatedConversations = chatState.chatConversations.map((conv: Chat) =>
        conv.id === chat.id
          ? {
              ...conv,
              unreadCount: 0,
              messages: conv.messages.map((msg: ChatMessage) => ({ ...msg, isRead: true }))
            }
          : conv
      )
      
      chatState.setChatConversations(updatedConversations)
    },

    handleFileAttachment: () => {
      toast({
        title: "Adjuntar archivo",
        description: "Funcionalidad de adjuntar archivo próximamente.",
      })
    },

    handleImageAttachment: () => {
      toast({
        title: "Adjuntar imagen",
        description: "Funcionalidad de adjuntar imagen próximamente.",
      })
    },
  }
}