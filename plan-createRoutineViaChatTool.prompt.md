# Plan: Create Routine via Chat Tool

The goal is to allow users to create routines by prompting (e.g., "quiero que hagas una rutina de pecho, espalda, bicep"). The LLM will use tools to search exercises and create the routine.

## Steps

1. **Delete current tool implementation** in `app/api/chat/route.ts` and create fresh tools
2. **Create `getExercises` tool** - search exercises by name, muscle, or equipment
3. **Create `createRoutine` tool** - create a routine with blocks, exercises, and sets using the V2 schema via `supabase`, with exercise validation
4. **Update system prompt** - instruct the LLM on how to create routines (search exercises first, validate IDs, use gym standards)
5. **Update TrainerAssistant** - pass `owner_id` (user ID) in the request body

## Design Decisions

1. **User authentication**: Pass `owner_id` from the frontend in the request body (from auth context)
2. **Exercise validation**: YES - validate that all exercise IDs exist before creating the routine
3. **Default values**: Follow gym standard routines:
   - Compound exercises: 4 sets x 6-8 reps (heavy)
   - Isolation exercises: 3 sets x 10-12 reps (moderate)
   - Warm-up: 2 sets x 15 reps (light)
   - Default rest: 60-90 seconds between sets

## Database Schema Reference

### Tables Hierarchy
```
routines (1) → routine_block (many) → block_exercise (many) → block_exercise_set (many)
                                              ↓
                                         exercises (referenced by exercise_id - TEXT type)
```

## Tool Schemas

### getExercises Tool
```typescript
getExercises: tool({
  description: 'Search for exercises in the database. Use this BEFORE creating a routine to get valid exercise IDs.',
  parameters: z.object({
    name: z.string().optional().describe('Exercise name to search for'),
    muscle: z.string().optional().describe('Target muscle (e.g., "pectorales", "dorsales", "biceps")'),
    equipment: z.string().optional().describe('Equipment type (e.g., "barra", "mancuerna", "cable")'),
    limit: z.number().optional().default(10).describe('Max results to return'),
  }),
})
```

### createRoutine Tool
```typescript
createRoutine: tool({
  description: 'Create a new workout routine. ALWAYS search for exercises first to get valid exercise IDs.',
  parameters: z.object({
    name: z.string().describe('Routine name'),
    description: z.string().optional().describe('Routine description'),
    blocks: z.array(z.object({
      name: z.string().describe('Block name (e.g., "Calentamiento", "Pecho", "Espalda")'),
      exercises: z.array(z.object({
        exercise_id: z.string().describe('Valid exercise ID from getExercises'),
        sets: z.number().default(3).describe('Number of sets (gym standard: 3-4)'),
        reps: z.string().default('10').describe('Reps per set (e.g., "10", "8-12", "6-8")'),
        rest_seconds: z.number().optional().describe('Rest between sets in seconds'),
        notes: z.string().optional(),
      })),
    })),
  }),
})
```
