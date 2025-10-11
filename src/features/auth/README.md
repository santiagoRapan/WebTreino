# Auth Feature

This feature module handles all authentication and user management functionality using **Google OAuth** and **Supabase**.

## How It Works

The authentication flow is simple a5. **Auth state change** - `onAuthStateChange` fires in `AuthContext`
6. **Role update** - `ensureAppUser()` updates the user's role to `'entrenador'` (if not already set)
7. **Session established** - User is now authenticated
8. **Redirect to dashboard** - User can access their routines, students, etc.aightforward:

1. **User clicks "Sign in with Google"** on the auth page
2. **Google OAuth redirect** - User authenticates with Google
3. **Supabase creates auth user** - User is created in `auth.users` table
4. **Database trigger fires** - `on_auth_user_created` trigger automatically creates a record in `public.users` with default role `'alumno'`
5. **Role update** - On first login, `ensureAppUser()` updates the role to `'entrenador'`
6. **Session management** - User session is maintained automatically by Supabase
7. **Redirect to dashboard** - User can now access their routines, students, etc.

## Structure

```
auth/
├── components/
│   └── AuthPage.tsx            # Auth UI page (login/signup)
├── services/
│   ├── auth.ts                 # Basic auth service functions
│   ├── auth-context.tsx        # Auth context provider and hook
│   ├── ensureAppUser.ts        # Creates user profile with 'entrenador' role
│   └── index.ts                # Service barrel exports
├── types.ts                     # Auth-related TypeScript types
├── index.ts                     # Barrel exports
└── README.md                    # This file
```

## Components

### `AuthPage`
Full authentication page component with login and signup modes.

**Features:**
- **Google OAuth Authentication**
- Toggle between login and signup modes
- Redirect parameter support
- Loading states
- Beautiful UI with background decorations
- Responsive design

**Usage:**
```tsx
import { AuthPage } from '@/features/auth'

// In app/auth/page.tsx
export default function Page() {
  return <AuthPage />
}
```

**Query Parameters:**
- `mode=signup` - Show signup mode (default is login)
- `redirect=/path` - Redirect after successful auth (default: `/dashboard`)

## Services

### Auth Service (`auth.ts`)

Collection of authentication utility functions:

#### `signInWithGoogle(redirectTo?: string)`
Initiates Google OAuth flow.

**Parameters:**
- `redirectTo` - URL to redirect after auth (default: `/dashboard`)

**Returns:** `Promise<{ data?, error? }>`

#### `signOut()`
Signs out the current user.

**Returns:** `Promise<{ error?: unknown }>`

#### `getCurrentUser()`
Gets the currently authenticated user.

**Returns:** `Promise<User | null>`

#### `getCurrentSession()`
Gets the current auth session.

**Returns:** `Promise<Session | null>`

#### `ensureAppUser()`
Updates the authenticated user's role to `'entrenador'` if it's not already set. The database trigger `on_auth_user_created` already creates the user profile with default role `'alumno'`, so this function just updates the role on first login.

**Returns:** `Promise<void>`

### Auth Context (`auth-context.tsx`)

React context provider for authentication state.

**Provides:**
- `user` - Supabase auth user object
- `session` - Current auth session
- `loading` - Loading state
- `isAuthenticated` - Boolean auth status
- `signInWithGoogle()` - Sign in with Google
- `signOut()` - Sign out
- `refreshUserData()` - Refresh user data

**Usage:**
```tsx
import { useAuth } from '@/features/auth'

function MyComponent() {
  const { user, loading, isAuthenticated, signOut } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please sign in</div>
  
  return <div>Welcome, {user?.email}!</div>
}
```

**Provider Setup:**
```tsx
import { AuthProvider } from '@/features/auth'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

## Types

### `AppRole`
User role: `'entrenador' | 'alumno' | 'admin'`

### `CustomUser`
User data from the `users` table.

**Properties:**
- `id` - UUID (matches Supabase auth user ID)
- `name` - Display name
- `role` - User role (AppRole)
- `avatar_url` - Avatar image URL (optional)
- `created_on` - Creation timestamp

### `CreateUserData`
Data for creating a new user in the `users` table.

### `UpdateUserData`
Data for updating an existing user.

### `AuthContextType`
Type definition for the auth context.

### `AuthMode`
Auth page mode: `"signin" | "signup"`

## Database Schema

The auth feature works with two data sources:

1. **Supabase Auth** (built-in)
   - Manages authentication
   - Handles OAuth providers (Google)
   - Stores sessions

2. **users table** (custom)
   ```sql
   CREATE TABLE users (
     id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
     name TEXT,
     role TEXT DEFAULT 'alumno' CHECK (role IN ('alumno', 'entrenador', 'admin')),
     avatar_url TEXT,
     created_on TIMESTAMPTZ DEFAULT NOW()
   );
   ```

## Authentication Flow

1. **User clicks "Sign in with Google"**
2. **OAuth redirect** - User is redirected to Google OAuth
3. **Google authenticates** - User signs in with their Google account
4. **Redirect back** - Google redirects back to the app with auth code
5. **Supabase creates session** - Supabase exchanges code for session
6. **Auth state change** - `onAuthStateChange` fires in `AuthContext`
7. **User profile creation** - `ensureAppUser()` checks if user exists in `public.users`:
   - If **first time**: Creates user with role `'entrenador'`
   - If **existing**: User already has their role set
8. **Session established** - User is now authenticated
9. **Redirect to dashboard** - User can access their routines, students, etc.

## State Management

The auth context automatically:
- Listens for auth state changes via `onAuthStateChange`
- Loads initial session on mount
- Calls `ensureAppUser()` on first sign-in to update user role to `'entrenador'`
- Maintains session state
- Clears state on sign-out

## Security

- Uses Supabase Row Level Security (RLS)
- OAuth tokens managed by Supabase
- Session stored in secure cookies
- PKCE flow for OAuth
- No passwords stored (OAuth only)

## Error Handling

All auth functions include try-catch blocks and console logging for debugging. Errors are handled gracefully and logged to the console.
- [ ] Add session management UI
- [ ] Add device management

## Notes

- Currently only supports Google OAuth
- All new users default to "entrenador" role
- Avatar URLs come from Google profile
- Names extracted from Google full_name metadata
- Sessions persist in localStorage by default

