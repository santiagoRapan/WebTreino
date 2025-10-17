# Exercise Selector Dialog V2 - Integration Guide

## Overview

The `ExerciseSelectorDialogV2` component replaces the old single-input configuration with **per-set customization**. Users can now configure reps, load, and unit for each set individually.

## Key Features

✅ **Per-Set Configuration** - Each set has its own reps, load, and unit  
✅ **Dynamic Set Management** - Add or remove sets as needed  
✅ **Smart Defaults** - New sets copy values from the previous set  
✅ **Flexible Reps** - Supports "10", "8-12", "AMRAP", "to failure", etc.  
✅ **Multiple Units** - kg, lb, or bodyweight  
✅ **Optional Notes** - Add notes per set (e.g., "Drop set", "Heavy")

## UI Flow

1. **Select Exercise** - Choose from the exercise catalog
2. **Set Number of Sets** - Input total number of sets (e.g., 4)
3. **Configure Each Set**:
   - **Reps**: "10", "8-12", "AMRAP", etc.
   - **Load**: Numeric value (e.g., 60)
   - **Unit**: kg, lb, or bodyweight
   - **Notes**: Optional (e.g., "Warm-up", "Drop set")
4. **Add/Remove Sets** - Dynamically adjust sets
5. **Confirm** - Add to routine

## How to Use

### 1. Import the Component

```typescript
import { ExerciseSelectorDialogV2 } from '@/features/routines/components'
import type { SetInputV2 } from '@/features/routines/types'
```

### 2. Set Up State

```typescript
const [exerciseInputsV2, setExerciseInputsV2] = useState<{
  numSets: number
  sets: SetInputV2[]
}>({
  numSets: 3,
  sets: [
    { set_index: 1, reps: '10', load_kg: null, unit: 'kg' },
    { set_index: 2, reps: '10', load_kg: null, unit: 'kg' },
    { set_index: 3, reps: '10', load_kg: null, unit: 'kg' }
  ]
})
```

### 3. Use the Component

```typescript
<ExerciseSelectorDialogV2
  open={isExerciseSelectorOpen}
  onOpenChange={setIsExerciseSelectorOpen}
  exerciseSearch={exerciseSearch}
  pendingExercise={pendingExercise}
  exerciseInputs={exerciseInputsV2}
  onExerciseInputsChange={setExerciseInputsV2}
  onSelectExercise={handleSelectExercise}
  onConfirmAdd={confirmAddExerciseV2}
  onCancelAdd={cancelAddExercise}
  onClearPendingExercise={clearPendingExercise}
  translations={{
    title: "Seleccionar Ejercicio",
    description: "Elige un ejercicio para añadir",
    searchPlaceholder: "Buscar ejercicios...",
    filterByCategory: "Filtrar por categoría",
    allCategories: "Todas las categorías",
    filterByEquipment: "Filtrar por equipo",
    allEquipments: "Todos los equipos",
    configureExercise: "Configurar Ejercicio",
    numberOfSets: "Número de Series",
    sets: "Series",
    repetitions: "Repeticiones",
    load: "Carga (kg)",
    unit: "Unidad",
    notes: "Notas (opcional)",
    confirmAdd: "Confirmar Añadir",
    cancel: "Cancelar",
    close: "Cerrar",
    loadingMore: "Cargando más...",
    noResults: "No se encontraron ejercicios",
    scrollForMore: "Desliza para cargar más",
    addSet: "Añadir Serie",
    removeSet: "Eliminar Serie",
    clickToChange: "Click para cambiar ejercicio"
  }}
/>
```

### 4. Handle Confirm Add (V2 Format)

```typescript
const confirmAddExerciseV2 = () => {
  if (!pendingExercise || !editingRoutine) return

  const { exercise } = pendingExercise
  
  // V2 format - stores each set individually
  const exerciseForRoutineV2 = {
    exerciseId: exercise.id.toString(),
    sets: exerciseInputsV2.sets, // Array of SetInputV2
    notes: null
  }

  const updatedRoutine = {
    ...editingRoutine,
    exercises: [...editingRoutine.exercises, exerciseForRoutineV2]
  }

  setEditingRoutine(updatedRoutine)
  setPendingExercise(null)
  
  // Reset to default
  setExerciseInputsV2({
    numSets: 3,
    sets: [
      { set_index: 1, reps: '10', load_kg: null, unit: 'kg' },
      { set_index: 2, reps: '10', load_kg: null, unit: 'kg' },
      { set_index: 3, reps: '10', load_kg: null, unit: 'kg' }
    ]
  })
}
```

## Example Use Cases

### Pyramid Sets

```typescript
{
  numSets: 5,
  sets: [
    { set_index: 1, reps: '12', load_kg: 60, unit: 'kg' },
    { set_index: 2, reps: '10', load_kg: 70, unit: 'kg' },
    { set_index: 3, reps: '8', load_kg: 80, unit: 'kg' },
    { set_index: 4, reps: '10', load_kg: 70, unit: 'kg' },
    { set_index: 5, reps: '12', load_kg: 60, unit: 'kg' }
  ]
}
```

### Drop Sets

```typescript
{
  numSets: 4,
  sets: [
    { set_index: 1, reps: '10', load_kg: 20, unit: 'kg', notes: 'Full weight' },
    { set_index: 2, reps: '10', load_kg: 15, unit: 'kg', notes: 'Drop 25%' },
    { set_index: 3, reps: '10', load_kg: 12, unit: 'kg', notes: 'Drop 40%' },
    { set_index: 4, reps: 'to failure', load_kg: 10, unit: 'kg', notes: 'Burnout' }
  ]
}
```

### Bodyweight Exercise

```typescript
{
  numSets: 3,
  sets: [
    { set_index: 1, reps: '15', load_kg: null, unit: 'bw' },
    { set_index: 2, reps: '15', load_kg: null, unit: 'bw' },
    { set_index: 3, reps: 'AMRAP', load_kg: null, unit: 'bw' }
  ]
}
```

## Differences from V1

| Feature | V1 (Old) | V2 (New) |
|---------|----------|----------|
| **Configuration** | 3 inputs (sets, reps, rest) | Per-set configuration |
| **Reps per set** | Same for all sets | Different per set |
| **Load per set** | N/A | Custom per set |
| **Units** | N/A | kg, lb, bodyweight |
| **Notes** | N/A | Optional per set |
| **Flexibility** | Low | High |
| **UI Complexity** | Simple | Moderate |

## Translation Keys Needed

Add these to your i18n configuration:

```typescript
"routines.forms.numberOfSets": "Número de Series",
"routines.forms.load": "Carga",
"routines.forms.unit": "Unidad",
"routines.forms.notes": "Notas (opcional)",
"routines.actions.addSet": "Añadir Serie",
"routines.actions.removeSet": "Eliminar Serie",
"routines.messages.clickToChange": "Click para cambiar ejercicio"
```

## Integration Checklist

- [ ] Import `ExerciseSelectorDialogV2` component
- [ ] Update state to use `SetInputV2[]` format
- [ ] Update confirm handler to process per-set data
- [ ] Add translation keys
- [ ] Update save routine logic to use V2 schema
- [ ] Test with pyramid sets
- [ ] Test with drop sets
- [ ] Test add/remove sets functionality
- [ ] Test with bodyweight exercises
- [ ] Update routineHandlers to save V2 format to database

## Next Steps

1. **Test the Component** - Replace `ExerciseSelectorDialog` with `ExerciseSelectorDialogV2` in your `RoutinesTab`
2. **Update State Management** - Modify `useRoutineState` to handle V2 format
3. **Update Save Logic** - Use `saveRoutineV2()` from `useRoutineDatabaseV2` hook
4. **Create Database Tables** - Run the V2 schema SQL (see `docs/database-schema.md`)

## Support

For implementation help:
- See `src/features/routines/components/ExampleRoutineV2.tsx` for a working example
- Check `docs/ROUTINE_V2_USAGE.md` for comprehensive guide
- Review `src/features/routines/services/routineHandlersV2.ts` for backend integration

