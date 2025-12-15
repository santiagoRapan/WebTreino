# Trainer Feature

This feature module handles trainer-specific client management functionality.

## Structure

```
trainer/
├── components/
│   ├── ClientsTab.tsx          # Main clients management tab
│   ├── ClientTable.tsx         # Client list table view
│   ├── ClientFilters.tsx       # Search and filter controls
│   ├── ClientsHeader.tsx       # Clients section header
│   ├── NewClientDialog.tsx     # Dialog for adding new clients
│   ├── EditClientDialog.tsx    # Dialog for editing client info
│   ├── ClientHistoryDialog.tsx # Dialog showing client workout history
│   └── index.ts                # Component barrel exports
├── hooks/
│   ├── useClientState.ts       # Client data state management
│   ├── useUIState.ts           # UI state (filters, dialogs, theme)
│   ├── useTrainerDashboard.ts  # Main dashboard orchestration hook
│   └── useCalendarState.ts     # Calendar state (stub for future)
├── services/
│   ├── clientHandlers.ts       # Client CRUD operations
│   └── calendarHandlers.ts     # Calendar operations (stub for future)
├── types.ts                     # Trainer-specific TypeScript types
├── index.ts                     # Barrel exports
└── README.md                    # This file
```

## Components

### `ClientsTab`
Main client management interface for trainers.

**Features:**
- Client list with search and filters
- Add/edit/delete client operations
- View client workout history
- Accept/reject link requests from students
- Integrated with real Supabase data

**Usage:**
```tsx
import { ClientsTab } from '@/features/trainer'

export default function AlumnosPage() {
  return (
    <TrainerLayout>
      <ClientsTab />
    </TrainerLayout>
  )
}
```

### `ClientTable`
Table view component for displaying clients.

**Features:**
- Sortable columns
- Client status badges
- Action menu per client (edit, delete, history, chat)
- Avatar display
- Responsive design

### `ClientFilters`
Search and filter controls for client list.

**Features:**
- Search by name
- Filter by status (all, active, pending)
- Client count display
- Real-time filtering

### `NewClientDialog` / `EditClientDialog`
Dialogs for client management.

**Features:**
- Form validation
- Status selection
- Goal setting
- Contact information

### `ClientHistoryDialog`
Shows detailed workout history for a client.

**Features:**
- Workout sessions list
- Exercise logs per session
- Performance metrics
- Date filtering

## Hooks

### `useClientState`
Manages client data and operations.

**State:**
- `clients` - Array of clients from database
- `editingClient` - Currently selected client for editing
- `loadingClients` - Loading state
- `clientsError` - Error state

**Methods:**
- `getFilteredClients(searchTerm, filter)` - Filter clients
- `refreshClients()` - Reload from database
- Uses `useStudents` hook for real data

### `useUIState`
Manages UI state across the application.

**State:**
- `activeTab` - Current tab
- `sidebarCollapsed` - Sidebar state
- `theme` - Light/dark theme
- `searchTerm` - Global search
- `clientFilter` - Client filter state
- `isEditDialogOpen` - Dialog visibility states
- `isNewClientDialogOpen`
- `isHistoryDialogOpen`

### `useTrainerDashboard`
Main orchestration hook combining all state and handlers.

**Returns:**
- All UI state from `useUIState`
- All client state from `useClientState`
- All client handlers
- Dashboard statistics
- Recent clients for dashboard view

**Note:** Routine-related functionality temporarily disabled until Routines feature migration is complete.

### `useCalendarState`
Stub for future calendar functionality (currently returns empty object).

## Services

### `clientHandlers.ts`
Client CRUD operations.

**Handlers:**
- `handleEditClient(client)` - Edit client info
- `handleDeleteClient(clientId)` - Delete client
- `handleMarkAsActive(clientId)` - Activate client
- `handleSaveClient()` - Save client changes
- `handleCancelEdit()` - Cancel editing
- `handleNewClient()` - Open new client dialog
- `handleViewAllClients()` - Navigate to clients page
- `handleChatWithClient(client)` - Future: Open chat
- `handleViewHistory(client)` - View workout history
- `handleAcceptRequest(requestId, studentId)` - Accept link request
- `handleRejectRequest(requestId)` - Reject link request

All handlers include:
- Error handling
- Toast notifications
- Supabase integration
- State updates

### `calendarHandlers.ts`
Stub for future calendar functionality.

## Types

### `Client`
Main client data structure (real database data).

**Properties:**
- `id`, `name`, `email`, `phone`
- `status`: "active" | "pending" | "inactive"
- `joinDate`, `lastSession`, `nextSession`
- `progress`, `goal`, `avatar`
- `sessionsCompleted`, `totalSessions`, `plan`
- `userId`, `requestId`, `requestedBy` (Supabase fields)

### `DashboardStat`
Dashboard statistic card data.

### `RecentClient`
Simplified client data for dashboard display.

### `CalendarEvent`, `EventFormState`
Future calendar event types (placeholders).

## Database Integration

**Tables Used:**
- `users` - Client profiles
- `trainer_student` - Trainer-student relationships
- `trainer_link_request` - Link requests
- `workout_session` - Workout sessions (for history)
- `workout_set_log` - Exercise logs (for history)

**Real-time Features:**
- Automatic updates on roster changes
- Toast notifications for new requests
- Live student data sync

## Removed/Deprecated

The following were mock/placeholder features and have been removed:
- ❌ Chat functionality (mock data from AI)
- ❌ Mock client data (hardcoded clients)
- ❌ useChatState hook
- ❌ chatHandlers service
- ❌ mockData file

All current data comes from **real Supabase database queries**.

## Future Enhancements

- [ ] Calendar integration (currently stub)
- [ ] Real chat functionality (not mock)
- [ ] Client notes/annotations
- [ ] Client progress photos
- [ ] Client measurements tracking
- [ ] Payment tracking
- [ ] Session scheduling
- [ ] Automated reminders
- [ ] Client portal access management

## Integration with Other Features

**Dependencies:**
- `@/features/students` - Uses `useStudents` hook for real client data
- `@/features/routines` - Will integrate after routines migration (currently commented out)
- `@/features/exercises` - Client history shows exercises
- `@/services/database` - Supabase client

**Used By:**
- Dashboard pages
- Alumnos (clients) page
- Client management flows

## Notes

- All client data is real, fetched from Supabase
- No hardcoded/mock data in production code
- useTrainerDashboard has TODO comments for routines integration
- Calendar functionality is planned but not yet implemented
- Chat will be re-implemented with real messaging (not the old mock)

