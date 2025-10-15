/**
 * Message List Component
 * 
 * Displays the list of messages in a conversation
 */

"use client"

import { useEffect, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2 } from 'lucide-react'
import type { Message } from '../types'
import { format, isToday, isYesterday } from 'date-fns'

interface MessageListProps {
  messages: Message[]
  loading?: boolean
  currentUserId: string
}

export function MessageList({ messages, loading, currentUserId }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const formatMessageTime = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'HH:mm')
    } else if (isYesterday(date)) {
      return `Ayer ${format(date, 'HH:mm')}`
    }
    return format(date, 'dd/MM/yyyy HH:mm')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando mensajes...</p>
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No hay mensajes aún</p>
          <p className="text-sm text-muted-foreground mt-1">
            Envía un mensaje para iniciar la conversación
          </p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      <div className="space-y-4">
        {messages.map((message, index) => {
          const isOwnMessage = message.senderId === currentUserId
          const showAvatar = !isOwnMessage && (
            index === 0 || messages[index - 1].senderId !== message.senderId
          )

          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar (only for other users' messages) */}
              <div className="flex-shrink-0">
                {showAvatar && !isOwnMessage ? (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={message.senderAvatar} />
                    <AvatarFallback className="text-xs">
                      {getInitials(message.senderName)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-8" />
                )}
              </div>

              {/* Message Content */}
              <div className={`flex flex-col gap-1 max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                {/* Sender name (only for other users' first message in a group) */}
                {showAvatar && !isOwnMessage && (
                  <span className="text-xs font-medium text-muted-foreground px-2">
                    {message.senderName}
                  </span>
                )}

                {/* Message bubble */}
                <div
                  className={`rounded-lg px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>

                {/* Timestamp and status */}
                <div className={`flex items-center gap-2 px-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className="text-xs text-muted-foreground">
                    {formatMessageTime(message.timestamp)}
                  </span>
                  {isOwnMessage && (
                    <Badge variant="outline" className="text-xs py-0 px-1">
                      {message.status === 'read' && '✓✓'}
                      {message.status === 'delivered' && '✓'}
                      {message.status === 'sent' && '○'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
