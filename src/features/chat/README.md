# Chat Feature

## Overview
The chat feature enables **direct messaging between trainers and their clients** within the Treino platform. It provides a familiar chat interface with conversation management, message history, and status indicators.

**Important:** This feature is designed exclusively for trainer-client communication. Trainers cannot message other trainers through this system.

## Responsive Design
The chat interface is **fully responsive** and optimized for both desktop and mobile devices:

- **Desktop (md and above):** Side-by-side layout with conversation list on the left and messages on the right
- **Mobile:** Single-view layout that switches between conversation list and message view
  - Shows conversation list by default
  - Taps on a conversation to view messages in full screen
  - Back button returns to conversation list
  - Touch-optimized interactions

## Architecture

### File Structure
```
src/features/chat/
├── components/
│   ├── ChatTab.tsx              # Main chat interface
│   ├── ConversationList.tsx     # Sidebar with conversations
│   ├── MessageList.tsx          # Message display area
│   └── MessageInput.tsx         # Text input for messages
├── hooks/
│   └── useChatState.ts          # State management hook
├── services/
│   ├── chatDatabase.ts          # Database operations
│   └── chatHandlers.ts          # Business logic handlers
├── types.ts                     # TypeScript type definitions
├── index.ts                     # Barrel exports
└── README.md                    # This file
```

## Components

### ChatTab
**Location:** `components/ChatTab.tsx`

Main container component that orchestrates the entire chat interface.

**Features:**
- Responsive two-panel layout (conversations + messages)
- Auto-loads conversations on mount
- Integrates all sub-components
- Handles authentication check
- Mobile: Toggles between conversation list and message view
- Desktop: Shows both panels simultaneously



**Responsive Behavior:**
- On mobile screens, only one panel is visible at a time
- Back button appears in message header on mobile to return to conversation list
- Selecting a conversation automatically switches to message view on mobile
- Seamless desktop experience with both panels always visible

### ConversationList
**Location:** `components/ConversationList.tsx`

Displays list of conversations with search and filters.

**Features:**
- Search conversations by participant name or message content
- Filter by: All, Unread, Archived
- Shows unread count badges
- Displays last message preview
- Real-time timestamp formatting

**Props:**
```typescript
{
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
```

### MessageList
**Location:** `components/MessageList.tsx`

Renders messages in a conversation with auto-scrolling.

**Features:**
- Auto-scroll to latest message
- Grouped messages by sender
- Avatar display for other users
- Message status indicators (sent/delivered/read)
- Smart timestamp formatting (Today/Yesterday/Date)
- Loading state

**Props:**
```typescript
{
  messages: Message[]
  loading?: boolean
  currentUserId: string
}
```

### MessageInput
**Location:** `components/MessageInput.tsx`

Text input for composing and sending messages.

**Features:**
- Multi-line textarea (resizable)
- Send on Enter (Shift+Enter for new line)
- Disabled state while sending
- Loading spinner
- Character validation

**Props:**
```typescript
{
  onSendMessage: (content: string) => void
  disabled?: boolean
  sending?: boolean
  placeholder?: string
}
```

## State Management

### useChatState Hook
**Location:** `hooks/useChatState.ts`

Centralized state management for chat feature.

**State:**
```typescript
{
  // Data
  conversations: Conversation[]
  messages: Record<string, Message[]>
  activeConversationId: string | null
  typingIndicators: TypingIndicator[]
  
  // UI
  chatFilter: ChatFilter
  searchTerm: string
  isSidebarCollapsed: boolean
  
  // Loading
  loadingConversations: boolean
  loadingMessages: boolean
  sendingMessage: boolean
}
```

**Computed Methods:**
- `getActiveConversation()` - Get currently selected conversation
- `getActiveMessages()` - Get messages for active conversation
- `getFilteredConversations()` - Apply filters and search
- `getUnreadCount()` - Total unread message count

## Services

### chatDatabase
**Location:** `services/chatDatabase.ts`

**Purpose:** Database operations layer with placeholder implementations

**Methods:**
- `fetchConversations(userId)` - Get all conversations for user
- `fetchMessages(conversationId, userId)` - Get messages for conversation
- `sendMessage(conversationId, senderId, content)` - Send new message
- `markAsRead(conversationId, userId)` - Mark messages as read
- `createConversation(userId, participantId)` - Start new conversation
- `archiveConversation(conversationId)` - Archive conversation
- `deleteConversation(conversationId)` - Delete conversation
- `searchUsers(query, currentUserId)` - Find users to chat with

**Integration Points:**
```typescript
// TODO: Replace with Supabase queries
// Example:
// const { data, error } = await supabase
//   .from('conversations')
//   .select('*, participants!inner(*)')
//   .eq('participants.user_id', userId)
```

### chatHandlers
**Location:** `services/chatHandlers.ts`

**Purpose:** Business logic handlers

**Handlers:**
- `handleSelectConversation(id)` - Load and display conversation
- `handleSendMessage(content)` - Send message and update state
- `handleLoadConversations()` - Initialize conversations list
- `handleMarkAsRead(conversationId)` - Update read status
- `handleArchiveConversation(id)` - Archive conversation
- `handleDeleteConversation(id)` - Delete conversation
- `handleNewConversation(participantId)` - Create new conversation

## Types

### Core Types

**Message:**
```typescript
{
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: Date
  status: 'sent' | 'delivered' | 'read'
  isOwnMessage: boolean
}
```

**Conversation:**
```typescript
{
  id: string
  participantId: string
  participantName: string
  participantAvatar?: string
  participantRole: 'trainer' | 'client'
  lastMessage?: {
    content: string
    timestamp: Date
    senderId: string
  }
  unreadCount: number
  status: 'active' | 'archived' | 'muted'
  createdAt: Date
  updatedAt: Date
}
```

**ChatUser:**
```typescript
{
  id: string
  name: string
  avatar?: string
  role: 'trainer' | 'client'
  online: boolean
  lastSeen?: Date
}
```

## Database Schema (Proposed)

### Tables

**conversations**
```sql
id: uuid (PK)
created_at: timestamp
updated_at: timestamp
status: enum('active', 'archived', 'muted')
```

**conversation_participants**
```sql
id: uuid (PK)
conversation_id: uuid (FK -> conversations)
user_id: uuid (FK -> users)
joined_at: timestamp
last_read_at: timestamp
```

**messages**
```sql
id: uuid (PK)
conversation_id: uuid (FK -> conversations)
sender_id: uuid (FK -> users)
content: text
timestamp: timestamp
status: enum('sent', 'delivered', 'read')
```

## Features

### Implemented
- ✅ Conversation list with search
- ✅ Filter by all/unread/archived
- ✅ Real-time message display
- ✅ Send messages
- ✅ Message status indicators
- ✅ Archive/delete conversations
- ✅ Auto-scroll to latest message
- ✅ Loading states
- ✅ Empty states
- ✅ Responsive design

### TODO (Future Enhancements)
- ⏳ Real-time updates (Supabase Realtime)
- ⏳ Typing indicators
- ⏳ File/image attachments
- ⏳ Message reactions
- ⏳ Message editing/deletion
- ⏳ Read receipts
- ⏳ Push notifications
- ⏳ Message search within conversation
- ⏳ Pinned messages
- ⏳ Group conversations

## Integration Steps

### 1. Database Setup
Create tables in Supabase:
```sql
-- See "Database Schema (Proposed)" section above
```

### 2. Replace Placeholders
Update `chatDatabase.ts` methods with actual Supabase queries.

### 3. Real-time Subscriptions
Add Supabase Realtime listeners:
```typescript
const channel = supabase
  .channel('messages')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'messages' },
    (payload) => {
      // Update state with new message
    }
  )
  .subscribe()
```

### 4. Authentication
Ensure user ID is available from auth context.

## Usage Example

```tsx
import { ChatTab } from '@/features/chat'

export default function ChatPage() {
  return (
    <TrainerLayout>
      <ChatTab />
    </TrainerLayout>
  )
}
```

## Styling
- Uses shadcn/ui components (Card, Button, Avatar, Badge, etc.)
- Tailwind CSS for styling
- Responsive breakpoints: `lg:` for desktop layout
- Dark mode compatible via CSS variables

## Dependencies
- `@/components/ui/*` - shadcn/ui components
- `@/features/auth` - Authentication context
- `@/hooks/use-toast` - Toast notifications
- `date-fns` - Date formatting
- `lucide-react` - Icons

## Performance Considerations
- Messages are cached per conversation (Record<string, Message[]>)
- Conversations are filtered client-side
- Auto-scroll uses refs to avoid re-renders
- Memo'd computed values in state hook

## Accessibility
- Keyboard navigation support (Enter to send)
- ARIA labels on interactive elements
- Focus management
- Screen reader friendly timestamps

---

**Status:** ✅ Complete - Ready for database integration
**Last Updated:** 2025-10-15
