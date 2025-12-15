# Routines Feature

This is the **CORE** feature of the Treino platform - managing workout routines, templates, and blocks.

## Structure

```
routines/
├── components/
│   └── RoutinesTab.tsx          # Main routines management UI (1,252 lines!)
├── hooks/
│   ├── useRoutineState.ts       # Routine state management
│   ├── useRoutineDatabase.ts    # Database CRUD operations
│   └── useRoutineAssignments.ts # Assign routines to students
├── services/
│   └── routineHandlers.ts       # Routine handlers and business logic (707 lines!)
├── types.ts                      # Routine-specific TypeScript types
├── index.ts                      # Barrel exports
└── README.md                     # This file
```

**Total: ~2,795 lines of code** - The largest and most complex feature!

## Components

### `RoutinesTab`
The main routine management interface - a massive component with full CRUD functionality.

**Features:**
- **Folder Organization**: Create folders to organize routine templates
- **Template Management**: Create, edit, delete routine templates
- **Routine Builder**: Visual block-based routine builder
- **Exercise Selection**: Integrated exercise search and selection
- **Block System**: Create blocks with exercises, sets, reps, rest
- **Exercise Catalog**: Browse all exercises with filters
- **PDF Export**: Export routines to PDF format
- **Excel Export**: Export routines to Excel spreadsheets
- **Assign to Clients**: Assign routine templates to specific clients
- **Routine Preview**: View routine details before assigning
- **Create Exercises**: Add new exercises to the database
- **Search & Filter**: Search routines and filter exercises
- **i18n Support**: Fully internationalized

**Usage:**
```tsx
import { RoutinesTab } from '@/features/routines'

export default function RutinasPage() {
  return (
    <TrainerLayout>
      <RoutinesTab />
    </TrainerLayout>
  )
}
```

**Integration:**
- Uses `useTrainerDashboard` context for state management
- Uses `useExerciseSearch` from exercises feature
- Integrates with clients from trainer feature
- Real Supabase database operations

## Hooks

### `useRoutineState`
Manages all routine-related state.

**State Management:**
- `routineFolders` - Array of routine folders with templates
- `selectedFolderId` - Currently selected folder
- `editingRoutine` - Routine being edited
- `exercisesCatalog` - Exercise list for selection
- `newExerciseForm` - Form state for creating exercises
- `exerciseInputs` - Sets/reps/rest input state
- Dialog visibility states
- Search and filter states
- Block expansion states

**Methods:**
- All setters for state management
- Integration with `useRoutineDatabase`
- Loads routines from database on mount
- Auth-aware (loads user's routines)

**Database Integration:**
- Automatically loads routines when auth user is available
- Creates default "Rutinas Principales" folder if none exist
- Real-time data from Supabase

### `useRoutineDatabase`
Handles all database operations for routines.

**Operations:**

#### `saveRoutineToDatabase(routine, ownerId)`
Saves a complete routine with all blocks and exercises to database.

**Process:**
1. Insert routine record
2. Insert each block with order
3. Insert each exercise with order within block
4. Return saved routine ID

#### `loadRoutinesFromDatabase(ownerId)`
Loads all routines for a trainer.

**Returns:**
- Array of `RoutineTemplate` objects
- Includes all blocks and exercises
- Sorted by creation date (newest first)

#### `updateRoutineInDatabase(routineId, routine, ownerId)`
Updates existing routine.

**Process:**
1. Update routine metadata
2. Delete existing blocks/exercises
3. Re-insert updated blocks/exercises

#### `deleteRoutineFromDatabase(routineId, ownerId)`
Deletes routine and all related data.

**Cascade:**
- Deletes routine
- Automatically deletes blocks (ON DELETE CASCADE)
- Automatically deletes exercises (ON DELETE CASCADE)

**State:**
- `loading` - Loading state for operations
- `error` - Error message if operation fails

### `useRoutineAssignments`
Handles assigning routines to students.

**Operations:**

#### `assignRoutineToStudent(routine, studentId, trainerId, notes?)`
Assigns a routine template to a specific student.

**Features:**
- Prevents duplicate assignments
- Saves to `routine_assignments` table
- Toast notifications for success/error
- Status: 'active' by default

#### `getStudentAssignments(studentId)`
Retrieves all routines assigned to a student.

**Returns:**
- Array of assignments with routine details
- Filtered by student ID

#### `updateAssignmentStatus(assignmentId, status)`
Updates assignment status.

**Statuses:**
- 'active' - Currently active
- 'completed' - Finished
- 'paused' - Temporarily paused

## Services

### `routineHandlers.ts`
Business logic and handlers for routine operations (707 lines!).

**Handlers:**

#### Routine Management
- `handleCreateRoutine()` - Initialize new routine creation
- `handleEditRoutine(template)` - Edit existing routine
- `handleSaveRoutine()` - Save routine to database
- `handleDeleteTemplate(templateId)` - Delete routine (with confirmation)
- `handleCreateTemplate()` - Create new template from form

#### Folder Management
- `handleCreateFolder()` - Create new routine folder
- `handleMoveTemplate(templateId, folderId)` - Move routine between folders

#### Block Management
- `handleAddBlock()` - Add new block to routine
- `handleDeleteBlock(blockId)` - Remove block from routine
- `toggleBlockExpansion(blockId)` - Expand/collapse block in UI

#### Exercise Management
- `handleAddExerciseToBlock(blockId)` - Open exercise selector
- `handleSelectExercise(exercise)` - Select exercise from catalog
- `confirmAddExercise()` - Add selected exercise to block
- `cancelAddExercise()` - Cancel exercise selection
- `handleDeleteExercise(blockId, exerciseIndex)` - Remove exercise
- `handleCreateExercise()` - Open create exercise dialog
- `handleAddRest(blockId)` - Add rest period to block

#### Assignment
- `handleAssignTemplateToClient(template, client)` - Assign to client
- `assignRoutineToClient(routineId, traineeId)` - Direct assignment

#### Export
- `handleExportRoutineToPDF(template)` - Export to PDF
- `handleExportRoutineToExcel(template)` - Export to Excel

**Export Features:**

**PDF Export:**
- Professional formatting
- Includes routine name and description
- Lists all blocks and exercises
- Shows sets, reps, rest periods
- Styled headers and sections
- Uses html2canvas + jsPDF

**Excel Export:**
- Structured spreadsheet format
- Header with routine info
- Separate rows for each exercise
- Columns: Block, Exercise, Sets, Reps, Rest
- Professional styling
- Uses ExcelJS library

## Types

### `RoutineBlock`
Represents a block within a routine.

**Properties:**
- `id` - Unique block ID
- `name` - Block name (e.g., "Warm-up", "Main Set")
- `exercises` - Array of exercise configurations
  - `exerciseId` - Exercise reference
  - `sets` - Number of sets
  - `reps` - Repetitions per set
  - `restSec` - Rest between sets
- `repetitions` - How many times to repeat the block
- `restBetweenRepetitions` - Rest between block repetitions
- `restAfterBlock` - Rest after completing block

### `RoutineTemplate`
Complete routine template.

**Properties:**
- `id` - Database ID or temp ID (string for new)
- `name` - Routine name
- `description` - Optional description
- `blocks` - Array of RoutineBlock objects

### `RoutineFolder`
Folder for organizing routines.

**Properties:**
- `id` - Folder ID
- `name` - Folder name
- `templates` - Array of RoutineTemplate objects

### `ExerciseInputsState`
Form state for exercise inputs.

### `ExerciseFilterState`
Filter state for exercise catalog.

### `ExerciseFormState`
Form state for creating new exercises.

### `PendingExercise`
State for exercise being added to routine.

### `DatabaseBlockExercise`
Database representation of exercise in block.

## Database Schema

**Tables:**

### `routines`
```sql
id: uuid PRIMARY KEY
owner_id: uuid REFERENCES users(id)
name: text
description: text
created_on: timestamptz
```

### `routine_block`
```sql
id: uuid PRIMARY KEY
routine_id: uuid REFERENCES routines(id) ON DELETE CASCADE
name: text
block_order: integer
notes: text
```

### `block_exercise`
```sql
id: uuid PRIMARY KEY
block_id: uuid REFERENCES routine_block(id) ON DELETE CASCADE
exercise_id: uuid REFERENCES exercises(id)
display_order: integer
sets: integer
reps: integer
rest_seconds: integer
is_superset_group: text
notes: text
```

### `routine_assignments`
```sql
id: serial PRIMARY KEY
routine_id: integer REFERENCES routines(id) ON DELETE CASCADE
student_id: uuid REFERENCES users(id)
assigned_by: text
assigned_at: timestamptz
status: text CHECK (status IN ('active', 'completed', 'paused'))
notes: text
UNIQUE(routine_id, student_id, status)
```

**Cascade Behavior:**
- Deleting routine → deletes all blocks → deletes all exercises in blocks
- Deleting block → deletes all exercises in that block

## Integration with Other Features

**Dependencies:**
- `@/features/exercises` - Exercise types and search
- `@/features/trainer` - Client types for assignment
- `@/services/database` - Supabase client
- `@/lib/context/TrainerDashboardContext` - Global state management

**Used By:**
- Trainer dashboard (`useTrainerDashboard` re-exports routine state)
- Routines page (`/rutinas`)
- Client management (assigning routines)

## Key Workflows

### Creating a Routine
1. Click "Nueva Rutina"
2. Enter routine name and description
3. Add blocks to routine
4. Add exercises to each block
5. Configure sets, reps, rest for each exercise
6. Save routine to database
7. Routine appears in folder

### Assigning a Routine
1. Select routine template
2. Click assign button
3. Select client from dropdown
4. Optionally add notes
5. Confirm assignment
6. Saved to `routine_assignments` table

### Exporting a Routine
1. Select routine
2. Choose export format (PDF or Excel)
3. System generates formatted document
4. Auto-download to user's device

## Performance Optimizations

- **Lazy Loading**: Exercises loaded on-demand
- **Debounced Search**: 300ms debounce on exercise search
- **Pagination**: Exercise search supports pagination (50 per page)
- **Optimistic UI**: Immediate state updates with database sync
- **Cascade Deletes**: Database handles deletion efficiently

## Future Enhancements

- [ ] Routine templates marketplace (share with other trainers)
- [ ] Routine versioning (track changes over time)
- [ ] Routine duplication (copy existing routines)
- [ ] Bulk assignment (assign to multiple clients at once)
- [ ] Routine calendar integration
- [ ] Progress tracking per routine
- [ ] Auto-progression rules (progressive overload)
- [ ] Video tutorials per exercise
- [ ] Routine analytics (most used exercises, etc.)
- [ ] Import routines from files
- [ ] Routine comparison tool

## Notes

- Routines are the **core value** of the platform
- Most complex feature with ~2,795 lines of code
- Fully integrated with exercises and trainer features
- Real-time database synchronization
- Professional export capabilities
- Scalable folder organization
- No mock data - all real Supabase operations

