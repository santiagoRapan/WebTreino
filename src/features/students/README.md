# Students Feature

This feature module handles all student/alumno-related functionality for trainers.

## Structure

```
students/
├── hooks/
│   ├── useStudents.ts          # Fetches and manages trainer's student roster
│   └── useStudentHistory.ts    # Fetches workout session history for a student
├── types.ts                     # Student-related TypeScript types
├── index.ts                     # Barrel exports
└── README.md                    # This file
```

## Hooks

### `useStudents`
Manages the trainer's student roster and link requests.

**Features:**
- Fetches students from `trainer_student` table
- Fetches pending link requests from `trainer_link_request` table
- Real-time subscriptions for automatic updates
- Debounced refresh to prevent excessive API calls
- Returns combined list of active students and pending requests

**Usage:**
```tsx
import { useStudents } from '@/features/students'

const { students, loading, error, refreshStudents, fetchStudentSessions } = useStudents()
```

**Returns:**
- `students`: Array of Client objects (roster + pending)
- `loading`: Boolean loading state
- `error`: Error message if any
- `refreshStudents`: Function to manually refresh the list
- `fetchStudentSessions`: Function to fetch workout sessions for a specific student

### `useStudentHistory`
Fetches workout history for a specific student.

**Features:**
- Fetches workout sessions for a student
- Fetches exercise set logs for those sessions
- Enriches logs with exercise names
- No trainer ownership filter (shows all student sessions)

**Usage:**
```tsx
import { useStudentHistory } from '@/features/students'

const { loadingHistory, sessions, logs, fetchHistory, clearHistory } = useStudentHistory()

// Fetch history for a student
await fetchHistory(studentId)
```

**Returns:**
- `loadingHistory`: Boolean loading state
- `sessions`: Array of WorkoutSession objects
- `logs`: Array of WorkoutSetLog objects
- `fetchHistory`: Function to fetch history for a student ID
- `clearHistory`: Function to clear the current history data

## Types

### `WorkoutSession`
Represents a workout session performed by a student.

### `WorkoutSetLog`
Represents a single set logged during a workout session.

### `UseStudentsReturn`
Return type for the `useStudents` hook.

### `UseStudentHistoryReturn`
Return type for the `useStudentHistory` hook.

## Database Tables Used

- `trainer_student` - Stores trainer-student relationships
- `trainer_link_request` - Stores pending connection requests
- `users` - User profiles (students and trainers)
- `workout_session` - Workout sessions performed by students
- `workout_set_log` - Individual set logs within sessions
- `exercises` - Exercise definitions

## Real-time Features

The `useStudents` hook subscribes to real-time changes on:
1. `trainer_link_request` table - Shows toast notifications for new requests
2. `trainer_student` table - Shows toast notifications when students are added

## Notes

- Students are also referred to as "alumnos" throughout the codebase
- The feature integrates with the trainer feature for displaying student data
- Student history can be viewed without requiring the routine to be owned by the trainer

