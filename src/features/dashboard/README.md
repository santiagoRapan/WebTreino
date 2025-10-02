# Dashboard Feature

This feature module handles the trainer's dashboard overview and settings/configuration.

## Structure

```
dashboard/
├── components/
│   ├── DashboardTab.tsx        # Main dashboard overview
│   └── SettingsTab.tsx         # Settings and preferences
├── types.ts                     # Dashboard-related TypeScript types
├── index.ts                     # Barrel exports
└── README.md                    # This file
```

## Components

### `DashboardTab`
The main dashboard overview component showing trainer statistics and quick actions.

**Features:**
- **Stats Cards**: Displays key metrics
  - Active Clients count
  - Sessions Today
  - Monthly Revenue
  - Average Progress
  
- **Recent Clients**: Shows last active clients with:
  - Client avatar and name
  - Last session date
  - Status badge (active/pending/inactive)
  - Progress percentage
  - Quick link to view all clients

- **Quick Actions**: Fast access buttons for:
  - Adding new client
  - Creating new routine
  - Registering payment (commented out)

**Usage:**
```tsx
import { DashboardTab } from '@/features/dashboard'

export default function DashboardPage() {
  return (
    <TrainerLayout>
      <DashboardTab />
    </TrainerLayout>
  )
}
```

**Dependencies:**
- Uses `TrainerDashboardContext` for data and actions
- Supports i18n via `useTranslation` hook
- Displays data from `stats` and `recentClients` arrays

### `SettingsTab`
Settings and configuration component for user preferences.

**Features:**

1. **Profile Information**
   - Display user email
   - Display user name
   - Display user role
   - Refresh button to reload user data

2. **Preferences**
   - Theme toggle (light/dark mode)
   - Language selector (Spanish, English, Portuguese)
   - Uses `next-themes` for theme management
   - Persists language preference

3. **Notifications** (UI only, functionality pending)
   - Email notifications toggle
   - Push notifications toggle

4. **Logout**
   - Sign out button
   - Redirects to landing page after logout
   - Shows toast notifications for success/error

**Usage:**
```tsx
import { SettingsTab } from '@/features/dashboard'

export default function ConfiguracionPage() {
  return (
    <TrainerLayout>
      <SettingsTab />
    </TrainerLayout>
  )
}
```

**Dependencies:**
- `useAuth` hook for user data and sign out
- `useTheme` from `next-themes` for theme management
- `useTranslation` for i18n support
- `useRouter` for navigation

## Types

### `DashboardStat`
Structure for dashboard statistic cards.

**Properties:**
- `titleKey`: i18n key for the stat title
- `value`: The stat value (number or string)
- `change`: Change indicator text (e.g., "+12% from last month")
- `icon`: Lucide icon component
- `color`: Tailwind color class for the icon

### `DashboardAction`
Quick action button configuration.

**Properties:**
- `label`: Action button label
- `icon`: Lucide icon component
- `onClick`: Click handler function
- `variant`: Button variant (optional)

### `UserProfile`
User profile information structure.

**Properties:**
- `email`: User email address
- `name`: User display name
- `role`: User role (e.g., "entrenador", "alumno")
- `avatar_url`: URL to user avatar image

### `ThemePreference`
Theme preference type: `"light" | "dark" | "system"`

### `LocalePreference`
Supported language codes: `"es" | "en" | "pt"`

### `NotificationSettings`
Notification preferences structure.

**Properties:**
- `email`: Email notifications enabled
- `push`: Push notifications enabled
- `sms`: SMS notifications enabled

## Internationalization

Both components are fully internationalized with support for:
- **Spanish (es)** - Default
- **English (en)**
- **Portuguese (pt)**

Translation keys used:
- `dashboard.*` - Dashboard tab strings
- `settings.*` - Settings tab strings
- `language.*` - Language names

## Integration with TrainerDashboardContext

The `DashboardTab` component integrates with the global trainer context:

```tsx
const {
  data: { stats, recentClients },
  actions: {
    handleViewAllClients,
    handleNewClient,
    handleCreateRoutine,
    handleRegisterPayment,
  },
} = useTrainerDashboard()
```

**Stats Array Structure:**
Each stat object should have:
```typescript
{
  titleKey: string,      // i18n key
  value: string|number,  // displayed value
  change: string,        // change indicator
  icon: LucideIcon,      // icon component
  color: string          // Tailwind color class
}
```

**Recent Clients Array:**
Uses `Client` type from trainer feature with these properties displayed:
- `id`, `name`, `avatar`, `lastSession`, `status`, `progress`

## Theme Management

Uses `next-themes` for theme switching:
- Supports light, dark, and system preferences
- Persists theme choice in localStorage
- Applies theme classes to document root

## Routes

Dashboard components are used in these Next.js routes:
- `/dashboard` - DashboardTab
- `/configuracion` - SettingsTab

## State Management

- **DashboardTab**: Stateless, receives all data from context
- **SettingsTab**: Local state for refresh loading indicator

## Future Enhancements

- [ ] Implement actual notification settings persistence
- [ ] Add profile editing functionality
- [ ] Add password change functionality
- [ ] Add 2FA settings
- [ ] Add data export/import
- [ ] Add account deletion option
- [ ] Make payment registration functional
- [ ] Add dashboard customization (drag-and-drop widgets)
- [ ] Add more detailed analytics and charts

## Notes

- Dashboard stats are currently static/mock data in the context
- Settings changes (except theme/language) are UI-only
- Logout properly clears auth session and redirects
- All text is internationalized for multi-language support
- Components use Tailwind CSS for styling with theme variables

