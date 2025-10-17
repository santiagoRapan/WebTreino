/**
 * Chat Database Service
 *
 * Integrates with Supabase tables:
 * - trainer_student: links trainer/student pairs ("conversation")
 * - message: messages within a conversation, with fields: content, sender_id, conversation_id, created_at
 */

import type { Conversation, Message, ChatUser } from '../types'
import { supabase } from '@/services/database/supabaseClient'

type TrainerStudentRow = {
  id?: string
  trainer_id: string
  student_id: string
  joined_at?: string
}

type DbMessage = {
  id?: string
  content: string
  sender_id: string
  conversation_id: string
  created_at?: string
}

export class ChatDatabase {
  private messageTableCache: 'message' | 'messages' | null = null

  private logSupabaseError(context: string, error: any) {
    try {
      // PostgrestError fields: message, code, details, hint
      const info = {
        message: (error && (error.message || error.error_description)) || 'Unknown',
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      }
      console.error(`${context} error:`, info)
    } catch {
      console.error(`${context} error (raw):`, error)
    }
  }
  
  private async getMessageTable(): Promise<'message' | 'messages'> {
    if (this.messageTableCache) return this.messageTableCache
    // Try 'message'
    const tryTable = async (name: 'message' | 'messages') => {
      const { error } = await supabase
        .from(name)
        .select('*')
        .limit(1)
      return !error
    }
    if (await tryTable('message')) {
      this.messageTableCache = 'message'
    } else if (await tryTable('messages')) {
      this.messageTableCache = 'messages'
    } else {
      // Default to 'message' to surface clearer errors downstream
      this.messageTableCache = 'message'
    }
    return this.messageTableCache
  }
  /**
   * Fetch all conversations (trainer-student pairs) for the user, as trainer or student.
   * Creates Conversation objects with last message (if any).
   */
  async fetchConversations(userId: string): Promise<Conversation[]> {
    // Get all trainer_student rows where the user participates
    const { data: pairs, error } = await supabase
      .from('trainer_student')
      .select('id, trainer_id, student_id, joined_at')
      .or(`trainer_id.eq.${userId},student_id.eq.${userId}`)

    if (error) {
      console.error('fetchConversations error:', error)
      return []
    }

    if (!pairs || pairs.length === 0) return []

    // For each pair, determine the participant (the other user)
    const participantIds = Array.from(
      new Set(
        pairs.map((p) => (p.trainer_id === userId ? p.student_id : p.trainer_id))
      )
    )

    // Fetch participant profiles
    const { data: users, error: usersErr } = await supabase
      .from('users')
      .select('id, name, avatar_url, role')
      .in('id', participantIds)

    if (usersErr) {
      console.error('fetchConversations users error:', usersErr)
    }

    const userMap = new Map((users || []).map((u) => [u.id, u]))

    // Nota: omitimos consulta de "último mensaje" para evitar dependencia de created_at.

    const conversations: Conversation[] = pairs.map((p) => {
      const conversationId = this.getConversationIdFromPair(p)
      const participantId = p.trainer_id === userId ? p.student_id : p.trainer_id
      const participant = userMap.get(participantId)
      return {
        id: conversationId,
        participantId,
        participantName: participant?.name || 'Usuario',
        participantAvatar: participant?.avatar_url || undefined,
        participantRole: 'client', // Desde perspectiva de entrenador; para alumno se mostrará igualmente como "Cliente"
        lastMessage: undefined,
        unreadCount: 0, // Sin soporte de leídos en el esquema actual
        status: 'active',
        createdAt: p.joined_at ? new Date(p.joined_at) : new Date(),
        updatedAt: p.joined_at ? new Date(p.joined_at) : new Date(),
      }
    })

    // Sort by updatedAt desc
    conversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    return conversations
  }

  /**
   * Fetch messages for a specific conversation (trainer_student pair id or synthetic key)
   */
  async fetchMessages(conversationId: string, userId: string): Promise<Message[]> {
    const table = await this.getMessageTable()
    // Intento A: underscore con created_at (si existe)
    let rows: DbMessage[] = []
    {
      const { data, error } = await supabase
        .from(table)
        .select('content, sender_id, conversation_id, created_at')
        .eq('conversation_id', conversationId)

      if (!error && data) {
        rows = (data as any) || []
      } else {
        if (error) this.logSupabaseError('fetchMessages (underscore with created_at)', error)
        // Intento B: underscore sin created_at
        const { data: dataB, error: errB } = await supabase
          .from(table)
          .select('content, sender_id, conversation_id')
          .eq('conversation_id', conversationId)

        if (!errB && dataB) {
          rows = (dataB as any) || []
        } else {
          if (errB) this.logSupabaseError('fetchMessages (underscore minimal)', errB)
          // Intento C: columnas con espacios
          const { data: dataC, error: errC } = await supabase
            .from(table)
            .select('content, "sender id", "conversation id"')
            .eq('"conversation id"', conversationId)

          if (errC) {
            this.logSupabaseError('fetchMessages (space cols)', errC)
            rows = []
          } else {
            rows = (dataC as any[]).map((r) => ({
              content: r.content,
              sender_id: r['sender id'],
              conversation_id: r['conversation id'],
            }))
          }
        }
      }
    }

    const messages: Message[] = (rows || []).map((m) => ({
      id: m.id ?? `${m.sender_id}-${Math.random().toString(36).slice(2)}`,
      conversationId: m.conversation_id,
      senderId: m.sender_id,
      senderName: m.sender_id === userId ? 'Tú' : 'Contacto',
      content: m.content,
      timestamp: m.created_at ? new Date(m.created_at) : new Date(),
      status: 'read',
      isOwnMessage: m.sender_id === userId,
    }))

    return messages
  }

  /**
   * Send a new message
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string
  ): Promise<Message> {
    const payloadUnderscore: Record<string, any> = {
      conversation_id: conversationId,
      sender_id: senderId,
      content,
    }
    const payloadSpace: Record<string, any> = {
      'conversation id': conversationId,
      'sender id': senderId,
      content,
    }

    const table = await this.getMessageTable()
    // Intento 1: underscore con created_at
    {
      const { data: d1, error: e1 } = await supabase
        .from(table)
        .insert(payloadUnderscore)
        .select('content, sender_id, conversation_id, created_at')
        .single()

      if (!e1 && d1) {
        return {
          id: `${senderId}-${Date.now()}`,
          conversationId: (d1 as any).conversation_id,
          senderId: (d1 as any).sender_id,
          senderName: 'Tú',
          content: (d1 as any).content,
          timestamp: (d1 as any).created_at ? new Date((d1 as any).created_at) : new Date(),
          status: 'sent',
          isOwnMessage: true,
        }
      }
      if (e1) this.logSupabaseError('sendMessage (underscore with created_at)', e1)
    }

    // Intento 2: underscore minimal
    {
      const { data: dB, error: eB } = await supabase
        .from(table)
        .insert(payloadUnderscore)
        .select('content, sender_id, conversation_id')
        .single()

      if (!eB && dB) {
        return {
          id: `${senderId}-${Date.now()}`,
          conversationId: (dB as any).conversation_id,
          senderId: (dB as any).sender_id,
          senderName: 'Tú',
          content: (dB as any).content,
          timestamp: new Date(),
          status: 'sent',
          isOwnMessage: true,
        }
      }
      if (eB) this.logSupabaseError('sendMessage (underscore minimal)', eB)
    }

    // Intento 3: columnas con espacios
    const { data: d2, error: e2 } = await supabase
      .from(table)
      .insert(payloadSpace)
      .select('content, "sender id", "conversation id"')
      .single()

    if (e2) {
      this.logSupabaseError('sendMessage (space payload)', e2)
      throw e2
    }

    return {
      id: `${senderId}-${Date.now()}`,
      conversationId: (d2 as any)['conversation id'],
      senderId: (d2 as any)['sender id'],
      senderName: 'Tú',
      content: (d2 as any).content,
      timestamp: new Date(),
      status: 'sent',
      isOwnMessage: true,
    }
  }

  /**
   * Mark messages as read - no-op as schema does not include read tracking
   */
  async markAsRead(_conversationId: string, _userId: string): Promise<void> {
    return
  }

  /**
   * Conversations are defined by trainer_student relation; creation is out of scope.
   * This method tries to ensure a pair exists and returns its conversation id.
   */
  async createConversation(_userId: string, _participantId: string): Promise<Conversation> {
    throw new Error('La creación de conversaciones depende de la relación trainer_student. Crea el vínculo primero.')
  }

  /**
   * Archive a conversation - not supported at DB level; handled in UI only
   */
  async archiveConversation(_conversationId: string): Promise<void> {
    return
  }

  /**
   * Delete a conversation - not supported (would imply deleting trainer_student)
   */
  async deleteConversation(_conversationId: string): Promise<void> {
    return
  }

  /**
   * Search users - simple search by name
   */
  async searchUsers(query: string, _currentUserId: string): Promise<ChatUser[]> {
    const q = query.trim()
    if (!q) return []

    const { data, error } = await supabase
      .from('users')
      .select('id, name, avatar_url, role')
      .ilike('name', `%${q}%`)
      .limit(10)

    if (error) {
      console.error('searchUsers error:', error)
      return []
    }

    return (data || []).map((u) => ({
      id: u.id,
      name: u.name || 'Usuario',
      avatar: u.avatar_url || undefined,
      role: u.role === 'entrenador' ? 'trainer' : 'client',
      online: false,
    }))
  }

  /**
   * Resolve real conversation id (trainer_student.id) for a pair of users.
   */
  async resolveConversationId(userId: string, participantId: string): Promise<string | null> {
    // The pair can be (trainer=userId, student=participantId) or vice versa
    const { data, error } = await supabase
      .from('trainer_student')
      .select('id, trainer_id, student_id')
      .or(
        `and(trainer_id.eq.${userId},student_id.eq.${participantId}),and(trainer_id.eq.${participantId},student_id.eq.${userId})`
      )
      .limit(1)
      .maybeSingle()

    if (error) {
      this.logSupabaseError('resolveConversationId', error)
      return null
    }

    return (data as any)?.id || null
  }

  /**
   * Subscribe to realtime inserts on message table for a conversation_id
   * Returns an unsubscribe function
   */
  subscribeToConversation(
    conversationIds: string | string[],
    onInsert: (dbMessage: DbMessage) => void
  ): () => void {
    const idSet = new Set(Array.isArray(conversationIds) ? conversationIds : [conversationIds])
    // Suscribimos a ambas tablas por compatibilidad y filtramos client-side
    const ch1 = supabase
      .channel(`rt-message-${Array.from(idSet).join('|')}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'message' },
        (payload) => {
          const r = payload.new as any
          const conv = r?.conversation_id ?? r?.['conversation id']
          if (!idSet.has(String(conv))) return
          const mapped: DbMessage = {
            id: r?.id,
            content: r?.content,
            sender_id: r?.sender_id ?? r?.['sender id'],
            conversation_id: conv,
            created_at: r?.created_at,
          }
          onInsert(mapped)
        }
      )
      .subscribe()

    const ch2 = supabase
      .channel(`rt-messages-${Array.from(idSet).join('|')}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const r = payload.new as any
          const conv = r?.conversation_id ?? r?.['conversation id']
          if (!idSet.has(String(conv))) return
          const mapped: DbMessage = {
            id: r?.id,
            content: r?.content,
            sender_id: r?.sender_id ?? r?.['sender id'],
            conversation_id: conv,
            created_at: r?.created_at,
          }
          onInsert(mapped)
        }
      )
      .subscribe()

    return () => {
      try { supabase.removeChannel(ch1) } catch (e) { console.warn('Error removing channel 1', e) }
      try { supabase.removeChannel(ch2) } catch (e) { console.warn('Error removing channel 2', e) }
    }
  }

  /**
   * Helper: derive conversation id string from trainer_student row.
   * Prefer the row.id if present; otherwise build a stable synthetic key.
   */
  private getConversationIdFromPair(p: TrainerStudentRow): string {
    if (p.id) return p.id
    // Synthetic key ensures uniqueness even if table lacks id
    return `${p.trainer_id}:${p.student_id}`
  }
}

export const chatDatabase = new ChatDatabase()
