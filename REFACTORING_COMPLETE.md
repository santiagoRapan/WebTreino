# Routine Refactoring Complete ✅

## Date: October 14, 2025

## Summary
Successfully refactored the routines feature to remove multi-block functionality and simplify to a single list of exercises with expandable GIF viewer.

## Key Changes

### 1. Data Model Simplified
- **Before**: `RoutineTemplate` had `blocks: RoutineBlock[]` with nested exercises
- **After**: `RoutineTemplate` has `exercises: RoutineExercise[]` (flat array)
- **Database**: Still uses `routine_block` table internally for backward compatibility

### 2. New Types (`src/features/routines/types.ts`)
```typescript
export interface RoutineExercise {
  exerciseId: string
  sets: number | null
  reps: string | null
  rest_seconds: number | null
  load_target?: string | null
  tempo?: string | null
  notes?: string | null
}

export type RoutineTemplate = {
  id: string
  name: string
  description?: string | null
  exercises: RoutineExercise[]
}

export type RoutineFolder = {
  id: string  // Changed from number to string
  name: string
  templates: RoutineTemplate[]
}
```

### 3. Database Layer (`src/features/routines/hooks/useRoutineDatabase.ts`)
- **Internal abstraction**: Creates a single default block named "Ejercicios"
- **Save**: Stores all exercises in one block
- **Load**: Flattens block exercises into `exercises[]` array
- **Update**: Deletes old block and recreates with new exercises
- **Backward compatible**: Existing routines continue to work

### 4. Business Logic (`src/features/routines/services/routineHandlers.ts`)

#### Removed Handlers:
- ❌ `handleAddBlock()`
- ❌ `handleDeleteBlock(blockId)`
- ❌ `toggleBlockExpansion(blockId)`
- ❌ `handleAddRest(blockId)`

#### Updated Handlers:
- ✅ `handleAddExerciseToRoutine()` - No blockId parameter needed
- ✅ `handleDeleteExercise(exerciseIndex)` - Only needs index
- ✅ `confirmAddExercise()` - Works with flat exercises array
- ✅ `handleExportRoutineToPDF()` - Updated for flat structure
- ✅ `handleExportRoutineToExcel()` - Updated for flat structure

### 5. New UI Component (`src/features/routines/components/ExerciseListItem.tsx`)

**Features:**
- 📍 Exercise number badge (1, 2, 3...)
- 📝 Exercise name and details (sets, reps, rest)
- 🎬 **Expandable GIF viewer** - Click chevron to show/hide
- 🗑️ Delete button for each exercise

**Props:**
```typescript
interface ExerciseListItemProps {
  exercise: RoutineExercise
  exerciseData?: Exercise // Full data with name & GIF
  index: number
  onDelete: (index: number) => void
  translations: {
    sets: string
    reps: string
    restShort: string
    noGifAvailable: string
  }
}
```

### 6. Updated Components

#### `RoutineEditorDialog.tsx`
**Removed props:**
- `newBlockName`
- `onNewBlockNameChange`
- `expandedBlocks`
- `onToggleBlockExpansion`
- `onAddBlock`
- `onDeleteBlock`
- `onAddExerciseToBlock`

**New props:**
- `onAddExercise` (no blockId)
- `noGifAvailable` translation

**UI Changes:**
- Single "Add Exercise" button
- List of ExerciseListItem components
- No block management UI

#### `RoutinesTemplatesList.tsx`
- Shows exercise count instead of block count
- Removed block badges display
- Updated to use `exercises.length`

#### `RoutinesTab.tsx`
- Removed block-related state from destructuring
- Updated handler references
- Added `noGifAvailable` translation

### 7. State Management

#### `TrainerDashboardContext.tsx`
**Removed state:**
- `expandedBlocks: Set<number>`
- `newBlockName: string`
- `selectedBlockId: number | null`
- `restInput: string`
- `restBlockId: number | null`

**Type updates:**
- `selectedFolderId: string | null` (was `number | null`)

#### `useRoutineState.ts`
- Removed block-related state variables
- Cleaned up return object

## User Experience Improvements

### Before:
1. Create routine
2. Add block with name
3. Add exercises to block
4. Repeat for multiple blocks
5. Complex nested structure

### After:
1. Create routine
2. Add exercises directly
3. Click any exercise to view GIF
4. Simple numbered list (1, 2, 3...)
5. Clear, flat structure

## Migration Notes

### Existing Routines
- ✅ **Automatically compatible** - existing multi-block routines are flattened on load
- All exercises from all blocks are merged into single list
- No data loss

### Database Schema
- ✅ **No changes required** - still uses same tables
- `routine_block` table still used (single default block)
- `block_exercise` table unchanged

## Technical Details

### GIF Display Implementation
```typescript
// In ExerciseListItem component
const [isExpanded, setIsExpanded] = useState(false)

// Shows GIF when expanded
{isExpanded && hasGif && (
  <Image
    src={exerciseData.gif_URL!}
    alt={exerciseName}
    fill
    className="object-contain"
    unoptimized // Required for GIF animations
  />
)}
```

### Exercise Order
- Exercises displayed in order based on array index
- Number badge shows position (index + 1)
- Maintains order in database via `display_order` field

## Testing Checklist

- [x] Create new routine
- [x] Add exercises to routine
- [x] Edit routine
- [x] Delete exercises
- [x] Save routine to database
- [x] Load routines from database
- [x] Update existing routine
- [x] Delete routine
- [x] Export to Excel (updated for flat structure)
- [x] Export to PDF (updated for flat structure)
- [x] Assign routine to student
- [x] View exercise GIF (expandable)
- [x] Existing routines still load

## Files Modified

### Core Files
1. `src/features/routines/types.ts`
2. `src/features/routines/hooks/useRoutineDatabase.ts`
3. `src/features/routines/hooks/useRoutineState.ts`
4. `src/features/routines/services/routineHandlers.ts`

### Components
5. `src/features/routines/components/ExerciseListItem.tsx` (NEW)
6. `src/features/routines/components/RoutineEditorDialog.tsx`
7. `src/features/routines/components/RoutinesTemplatesList.tsx`
8. `src/features/routines/components/RoutinesTab.tsx`

### Context
9. `src/lib/context/TrainerDashboardContext.tsx`

## Known Issues Resolved
- ✅ Fixed runtime error: "Cannot read properties of undefined (reading 'length')"
- ✅ Fixed type mismatches for folder IDs (string vs number)
- ✅ Updated all handler signatures for consistency
- ✅ Removed all block-related references

## Future Enhancements
- [ ] Add drag-and-drop exercise reordering
- [ ] Add exercise duplication
- [ ] Add exercise notes field in editor
- [ ] Add tempo and load_target inputs
- [ ] Bulk exercise operations (delete multiple)

## Rollback Plan
If needed, previous block functionality can be restored by:
1. Reverting types to include `blocks` array
2. Re-adding block management handlers
3. Updating database hook to use multiple blocks
4. Restoring block UI components

However, **database schema remains unchanged**, so rollback is safe.

---

**Refactoring Status**: ✅ **COMPLETE**
**Tests**: ✅ **Passing**
**Deployment**: ✅ **Ready**
