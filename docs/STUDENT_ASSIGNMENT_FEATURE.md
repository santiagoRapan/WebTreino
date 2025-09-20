# Student Assignment Feature

## Overview
This feature allows trainers to assign routines to students by fetching users with `role="alumno"` from the Supabase `users` table.

## Implementation

### 1. Database Requirements
Make sure your Supabase database has the following tables:

#### `users` table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'alumno',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  avatar_url TEXT
);
```

#### `routine_assignments` table (optional, for tracking assignments)
```sql
CREATE TABLE routine_assignments (
  id SERIAL PRIMARY KEY,
  routine_id INTEGER REFERENCES routines(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  assigned_by TEXT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  notes TEXT,
  UNIQUE(routine_id, student_id, status) -- Prevent duplicate active assignments
);
```

### 2. Key Components

#### `useStudents` Hook
- Fetches users with `role="alumno"` from the database
- Provides loading states and error handling
- Includes a refresh function to reload the list

#### `useRoutineAssignments` Hook
- Handles assignment of routines to students
- Prevents duplicate assignments
- Provides functions for managing assignment status

#### Updated `RoutinesTab` Component
- Replaces the old client list with real database students
- Includes a refresh button to reload students
- Shows loading states and handles empty states
- Displays student email alongside name for better identification

### 3. Features

#### Student Selection
- Dropdown shows all users with `role="alumno"`
- Displays both name and email for clarity
- Loading indicator while fetching data
- Empty state when no students are available

#### Assignment Tracking
- Prevents duplicate routine assignments
- Saves assignment details to database
- Shows success/error notifications
- Includes assignment metadata (assigned by, date, notes)

#### User Experience
- Refresh button to reload student list
- Clear loading and error states
- Intuitive interface with proper feedback

### 4. Usage

1. Navigate to the Routines tab
2. Find the routine you want to assign
3. Click on the "Asignar a alumno" dropdown
4. Select a student from the list
5. The routine will be assigned and saved to the database

### 5. Testing

To test this feature:

1. Make sure you have users with `role="alumno"` in your database:
```sql
INSERT INTO users (name, email, role) VALUES 
('Juan Pérez', 'juan@example.com', 'alumno'),
('María García', 'maria@example.com', 'alumno'),
('Carlos López', 'carlos@example.com', 'alumno');
```

2. Create some routines in the app
3. Try assigning routines to different students
4. Check the `routine_assignments` table to verify assignments are saved

### 6. Future Enhancements

- Add authentication context to get real trainer ID
- Implement assignment management (view, edit, remove assignments)
- Add student dashboard to view assigned routines
- Include assignment history and progress tracking
- Add bulk assignment functionality
- Implement assignment notifications

