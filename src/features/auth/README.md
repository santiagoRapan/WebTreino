# Auth Feature

This feature module handles all authentication and user management functionality.

## Structure

```
auth/
├── components/
│   └── AuthPage.tsx            # Auth UI page (login/signup)
├── services/
│   ├── auth.ts                 # Auth service functions
│   ├── auth-context.tsx        # Auth context provider and hook
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

**Returns:** `Promise<AuthResponse>`

#### `createOrUpdateCustomUser(authUser: User)`
Creates or updates user in the `users` table after authentication.

**Parameters:**
- `authUser` - Supabase auth user object

**Returns:** `Promise<CustomUserResponse>`

#### `signOut()`
Signs out the current user.

**Returns:** `Promise<{ error?: AuthError }>`

#### `getCurrentUser()`
Gets the currently authenticated user.

**Returns:** `Promise<User | null>`

#### `getCurrentSession()`
Gets the current auth session.

**Returns:** `Promise<Session | null>`

#### `isAuthenticated()`
Checks if user is authenticated.

**Returns:** `Promise<boolean>`

#### `refreshSession()`
Refreshes the current auth session.

**Returns:** `Promise<{ session, error }>`

#### `getCustomUser(userId: string)`
Fetches custom user data from the `users` table.

**Parameters:**
- `userId` - User's UUID

**Returns:** `Promise<CustomUserResponse>`

#### `updateCustomUser(userId: string, updateData: UpdateUserData)`
Updates custom user data in the `users` table.

**Parameters:**
- `userId` - User's UUID
- `updateData` - Fields to update

**Returns:** `Promise<CustomUserResponse>`

#### `getFullUserData(authUser: User | null)`
Gets complete user data (both auth and custom).

**Parameters:**
- `authUser` - Supabase auth user object or null

**Returns:** `Promise<FullUserData>`

### Auth Context (`auth-context.tsx`)

React context provider for authentication state.

**Provides:**
- `authUser` - Supabase auth user object
- `customUser` - Custom user data from `users` table
- `session` - Current auth session
- `loading` - Loading state
- `signInWithGoogle()` - Sign in with Google
- `signOut()` - Sign out
- `isAuthenticated` - Boolean auth status
- `fullUserData` - Combined user data
- `refreshUserData()` - Refresh user data

**Usage:**
```tsx
import { useAuth } from '@/features/auth'

function MyComponent() {
  const { authUser, customUser, loading, isAuthenticated, signOut } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please sign in</div>
  
  return <div>Welcome, {customUser?.name}!</div>
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

### `CustomUser`
User data from the `users` table.

**Properties:**
- `id` - UUID (matches Supabase auth user ID)
- `name` - Display name
- `role` - User role ("entrenador" or "alumno")
- `avatar_url` - Avatar image URL (optional)
- `created_on` - Creation timestamp (optional)

### `CreateUserData`
Data for creating a new user in the `users` table.

### `UpdateUserData`
Data for updating an existing user.

### `FullUserData`
Combined auth and custom user data.

**Properties:**
- `authUser` - Supabase auth user
- `customUser` - Custom user data
- `isAuthenticated` - Auth status

### `AuthResponse`
Response from auth operations.

### `CustomUserResponse`
Response from custom user operations.

### `AuthContextType`
Type definition for the auth context.

### `AuthMode`
Auth page mode: `"signin" | "signup"`

## Database Schema

The auth feature works with two data sources:

1. **Supabase Auth** (built-in)
   - Manages authentication
   - Handles OAuth providers
   - Stores sessions

2. **users table** (custom)
   ```sql
   CREATE TABLE users (
     id UUID PRIMARY KEY,  -- matches auth.users.id
     name TEXT NOT NULL,
     role TEXT NOT NULL CHECK (role IN ('entrenador', 'alumno')),
     avatar_url TEXT,
     created_on TIMESTAMPTZ DEFAULT NOW()
   );
   ```

## Authentication Flow

1. **User clicks "Sign in with Google"**
2. Redirected to Google OAuth
3. Google authenticates and redirects back
4. `onAuthStateChange` fires in `AuthContext`
5. `createOrUpdateCustomUser` creates/updates user in `users` table
6. `customUser` state is updated
7. User is redirected to dashboard

## State Management

The auth context automatically:
- Listens for auth state changes
- Loads initial session on mount
- Creates/updates custom user on sign-in
- Refreshes custom user data on token refresh
- Clears state on sign-out

## Security

- Uses Supabase Row Level Security (RLS)
- OAuth tokens managed by Supabase
- Session stored in secure cookies
- PKCE flow for OAuth
- No passwords stored (OAuth only)

## Error Handling

All auth functions include try-catch blocks and console logging for debugging. Errors are returned in response objects.

## Future Enhancements

- [ ] Add email/password authentication
- [ ] Add magic link authentication
- [ ] Add phone number authentication
- [ ] Add 2FA support
- [ ] Add social providers (GitHub, Facebook)
- [ ] Add password reset flow
- [ ] Add email verification
- [ ] Add session management UI
- [ ] Add device management

## Notes

- Currently only supports Google OAuth
- All new users default to "entrenador" role
- Avatar URLs come from Google profile
- Names extracted from Google full_name metadata
- Sessions persist in localStorage by default

