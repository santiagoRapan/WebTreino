# Exercise Set UI Improvements

## Overview
Redesigned the exercise set configuration UI throughout the application to be more compact and user-friendly, replacing card-based layouts with row-based inputs.

## Changes Made

### 1. **File: `ExerciseSelectorDialogV2.tsx`** (Add Exercise Dialog)

#### New Features:

**A. Identical Sets Toggle**
- Added a `Switch` component next to the "Number of Sets" selector
- When enabled (default): All sets share the same configuration
  - Shows a single row with format "1-N" where N is total sets
  - Any change to this row automatically applies to all sets
- When disabled: Each set can be configured individually
  - Shows one row per set
  - Each set can have different reps, load, unit, rest, RIR

**B. Compact Row-Based Layout**
- Replaced bulky `Card` components with lightweight rows
- Each row contains inline inputs for:
  - **Serie** (set number/range)
  - **Repetitions** (text input for flexibility: "10", "8-12", etc.)
  - **Load** (numeric input with 0.5 step)
  - **Unit** (dropdown: kg, lb, BW - bodyweight)
  
**C. Optional Fields System**
- Added plus buttons to add optional fields:
  - **Rest Time** (in seconds)
  - **RIR** (Reps in Reserve: 0-10)
- Each optional field can be added/removed independently
- When added, the field appears as a new column in all rows
- Visual feedback with `X` button to remove optional fields

**D. Dynamic Column Headers**
- Column headers adjust automatically based on which optional fields are visible
- Grid layout adapts: 4 columns (base) → 5 columns (+ rest) → 6 columns (+ rest + RIR)

**E. Visual Improvements**
- Hover effects on rows (`group-hover` for delete button)
- Delete button only appears on hover for individual sets
- Muted background colors for better visual hierarchy
- Responsive grid layouts
- Better spacing and alignment

#### Technical Implementation:

```typescript
// State management
const [identicalSets, setIdenticalSets] = useState(true)
const [showRestTime, setShowRestTime] = useState(false)
const [showRIR, setShowRIR] = useState(false)

// Smart set updates
const handleSetChange = (index, field, value) => {
  if (identicalSets) {
    // Update ALL sets
    newSets.forEach(set => set[field] = value)
  } else {
    // Update ONLY specific set
    newSets[index][field] = value
  }
}
```

### 2. **File: `EditableExerciseCard.tsx`** (Exercise List in Routine Editor)

#### Changes:
Replaced card-based sets display with compact row-based layout matching the add exercise dialog.

**Before:**
- Each set shown in a separate Card component
- Labels above each input field
- Notes field below the inputs
- Significant vertical space per set

**After:**
- Grid-based row layout (50px | 80px | 100px | 100px | 40px)
- Column headers at the top
- Inline inputs without individual labels
- Delete button appears on hover
- ~65% less vertical space

**Grid Layout:**
```
Serie  │ Reps │ Load │ Unit │ [Delete]
───────┼──────┼──────┼──────┼─────────
  1    │ [10] │ [50] │ [kg] │  [🗑️]
  2    │ [10] │ [55] │ [kg] │  [🗑️]
  3    │ [8]  │ [60] │ [kg] │  [🗑️]
```

**Visual Improvements:**
- Consistent styling with add exercise dialog
- `bg-muted/30` background with `border border-border/40`
- Input fields: `bg-background/60 border-border`
- Hover states: `bg-muted/40`
- Delete button only visible on row hover

### 3. **File: `types.ts`**

#### Extended SetInputV2 Interface:
```typescript
export interface SetInputV2 {
  set_index: number
  reps: string
  load_kg?: number | null
  unit?: string
  notes?: string
  rest_seconds?: number | null  // NEW
  rir?: number | null            // NEW
}
```

Added two new optional fields:
- `rest_seconds`: Rest time between sets
- `rir`: Reps In Reserve (intensity metric)

## Benefits

### User Experience:
✅ **Space Efficiency**: Rows take ~70% less space than cards
✅ **Faster Input**: Identical sets mode allows configuring all sets with one input
✅ **Flexibility**: Individual mode for progressive overload or dropsets
✅ **Optional Complexity**: Advanced fields (rest, RIR) only shown when needed
✅ **Visual Clarity**: Column headers, better alignment, hover states

### Developer Experience:
✅ **Type Safety**: Full TypeScript support for all fields
✅ **Maintainability**: Clear separation of concerns (identical vs individual logic)
✅ **Extensibility**: Easy to add more optional fields in the future

## UI Layout Comparison

### Before:
```
┌─────────────────────────────────┐
│ Set 1                     [🗑️]  │
│ ┌─────┐ ┌──────┐ ┌──────┐      │
│ │ Reps│ │ Load │ │ Unit │      │
│ └─────┘ └──────┘ └──────┘      │
│ ┌──────────────────────┐       │
│ │ Notes (optional)      │       │
│ └──────────────────────┘       │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ Set 2                     [🗑️]  │
│ ┌─────┐ ┌──────┐ ┌──────┐      │
│ │ Reps│ │ Load │ │ Unit │      │
│ └─────┘ └──────┘ └──────┘      │
│ ┌──────────────────────┐       │
│ │ Notes (optional)      │       │
│ └──────────────────────┘       │
└─────────────────────────────────┘
```

### After (Identical Mode):
```
Series: [3] ━━━━━━ [✓] Series idénticas

Serie  │ Reps │ Load │ Unit │
───────┼──────┼──────┼──────┤
 1-3   │ [10] │ [50] │ [kg] │

[+ Descanso] [+ RIR]
```

### After (Individual Mode):
```
Series: [3] ━━━━━━ [  ] Series idénticas

Serie  │ Reps │ Load │ Unit │ Rest │ RIR │
───────┼──────┼──────┼──────┼──────┼─────┤
  1    │ [12] │ [50] │ [kg] │ [60] │ [2] │ [🗑️]
  2    │ [10] │ [55] │ [kg] │ [60] │ [1] │ [🗑️]
  3    │ [8]  │ [60] │ [kg] │ [90] │ [0] │ [🗑️]

[- Quitar descanso] [- Quitar RIR]
```

## Database Implications

When `identicalSets` is enabled:
- Frontend shows 1 row (e.g., "1-3")
- Backend receives 3 identical sets in the `sets` array
- Each set has the same `reps`, `load_kg`, `unit`, `rest_seconds`, `rir`
- Database stores them as separate rows (allows future individual tracking)

This approach provides:
- Simple UI for identical sets
- Flexibility to switch to individual mode
- Full history if trainer later wants to modify individual sets
- Clean data structure for workout tracking

## Future Enhancements

Potential additions:
- [ ] Tempo field (e.g., "3-1-2-0")
- [ ] Drop sets toggle
- [ ] Superset grouping
- [ ] Notes per set (currently removed for space)
- [ ] Copy set button
- [ ] Bulk edit mode
- [ ] Preset templates (3x10, 5x5, pyramid, etc.)

## Migration Notes

No database migration required. The new fields (`rest_seconds`, `rir`) are optional and nullable.

Existing code remains compatible:
- Old sets without these fields will work fine
- New sets can include these fields
- TypeScript ensures type safety throughout
