import { toast } from "@/hooks/use-toast"
import { supabase } from "@/services/database"
import type {
  BlockExerciseV2,
  BlockExerciseSetV2,
  BlockExerciseWithSetsV2,
  RoutineBlockV2,
  RoutineWithBlocksV2,
  CreateBlockExerciseV2Payload,
  UpdateBlockExerciseV2Payload
} from "../types"

/**
 * V2 Routine Handlers
 * ==================
 * These handlers work with the new normalized schema (block_exercise_v2 and block_exercise_set_v2)
 * Status: Ready for implementation, not yet integrated into the UI
 */

/**
 * Create a complete routine with blocks and exercises using V2 schema
 */
export async function createRoutineV2(
  name: string,
  description: string | null,
  ownerId: string,
  blocks: Array<{
    name: string
    block_order: number
    notes?: string | null
    exercises: CreateBlockExerciseV2Payload[]
  }>
): Promise<string | null> {
  try {
    console.log('📝 Creating routine V2:', { name, ownerId })

    // 1. Create the routine
    const { data: routineData, error: routineError } = await supabase
      .from('routines')
      .insert({
        owner_id: ownerId,
        name,
        description
      })
      .select()
      .single()

    if (routineError) {
      console.error('Error creating routine:', routineError)
      toast({
        title: "Error",
        description: "No se pudo crear la rutina.",
        variant: "destructive"
      })
      return null
    }

    const routineId = routineData.id
    console.log('✅ Routine created:', routineId)

    // 2. Create blocks
    for (const block of blocks) {
      const { data: blockData, error: blockError } = await supabase
        .from('routine_block')
        .insert({
          routine_id: routineId,
          name: block.name,
          block_order: block.block_order,
          notes: block.notes || null
        })
        .select()
        .single()

      if (blockError) {
        console.error('Error creating block:', blockError)
        toast({
          title: "Error",
          description: `No se pudo crear el bloque "${block.name}".`,
          variant: "destructive"
        })
        continue
      }

      const blockId = blockData.id
      console.log(`✅ Block created: ${block.name} (${blockId})`)

      // 3. Create exercises for this block
      for (const exercise of block.exercises) {
        // Insert the exercise
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('block_exercise_v2')
          .insert({
            block_id: blockId,
            exercise_id: exercise.exercise_id,
            display_order: exercise.display_order,
            superset_group: exercise.superset_group || null,
            notes: exercise.notes || null
          })
          .select()
          .single()

        if (exerciseError) {
          console.error('Error creating exercise:', exerciseError)
          continue
        }

        const exerciseV2Id = exerciseData.id
        console.log(`✅ Exercise created: ${exercise.exercise_id}`)

        // 4. Create sets for this exercise
        if (exercise.sets && exercise.sets.length > 0) {
          const setsToInsert = exercise.sets.map(set => ({
            block_exercise_id: exerciseV2Id,
            set_index: set.set_index,
            reps: set.reps || null,
            load_kg: set.load_kg || null,
            unit: set.unit || null,
            notes: set.notes || null
          }))

          const { error: setsError } = await supabase
            .from('block_exercise_set_v2')
            .insert(setsToInsert)

          if (setsError) {
            console.error('Error creating sets:', setsError)
          } else {
            console.log(`✅ ${setsToInsert.length} sets created`)
          }
        }
      }
    }

    toast({
      title: "¡Rutina creada!",
      description: `La rutina "${name}" ha sido guardada exitosamente.`,
    })

    return routineId

  } catch (error) {
    console.error('Error in createRoutineV2:', error)
    toast({
      title: "Error",
      description: "Ocurrió un error al crear la rutina.",
      variant: "destructive"
    })
    return null
  }
}

/**
 * Load a complete routine with all blocks, exercises, and sets (V2 schema)
 */
export async function loadRoutineV2(routineId: string): Promise<RoutineWithBlocksV2 | null> {
  try {
    console.log('📖 Loading routine V2:', routineId)

    const { data: routineData, error: routineError } = await supabase
      .from('routines')
      .select(`
        *,
        routine_block (
          *,
          block_exercise_v2 (
            *,
            exercises (
              name
            ),
            block_exercise_set_v2 (
              *
            )
          )
        )
      `)
      .eq('id', routineId)
      .single()

    if (routineError || !routineData) {
      console.error('Error loading routine:', routineError)
      return null
    }

    // Transform the data
    const blocks: RoutineBlockV2[] = (routineData.routine_block || [])
      .sort((a: any, b: any) => a.block_order - b.block_order)
      .map((block: any) => {
        const exercises: BlockExerciseWithSetsV2[] = (block.block_exercise_v2 || [])
          .sort((a: any, b: any) => a.display_order - b.display_order)
          .map((exercise: any) => {
            const sets: BlockExerciseSetV2[] = (exercise.block_exercise_set_v2 || [])
              .sort((a: any, b: any) => a.set_index - b.set_index)

            return {
              id: exercise.id,
              block_id: exercise.block_id,
              exercise_id: exercise.exercise_id,
              display_order: exercise.display_order,
              superset_group: exercise.superset_group,
              notes: exercise.notes,
              exercises: exercise.exercises, // Pass through the joined data
              sets
            }
          })

        return {
          id: block.id,
          routine_id: block.routine_id,
          name: block.name,
          block_order: block.block_order,
          notes: block.notes,
          exercises
        }
      })

    return {
      id: routineData.id,
      owner_id: routineData.owner_id,
      name: routineData.name,
      description: routineData.description,
      created_on: routineData.created_on,
      blocks
    }

  } catch (error) {
    console.error('Error in loadRoutineV2:', error)
    return null
  }
}

/**
 * Load all routines for a user (V2 schema)
 */
export async function loadAllRoutinesV2(ownerId: string): Promise<RoutineWithBlocksV2[]> {
  try {
    console.log('📚 Loading all routines V2 for user:', ownerId)

    const { data: routinesData, error: routinesError } = await supabase
      .from('routines')
      .select(`
        *,
        routine_block (
          *,
          block_exercise_v2 (
            *,
            exercises (
              name
            ),
            block_exercise_set_v2 (
              *
            )
          )
        )
      `)
      .eq('owner_id', ownerId)
      .order('created_on', { ascending: false })

    if (routinesError) {
      console.error('Error loading routines:', routinesError)
      return []
    }

    if (!routinesData || routinesData.length === 0) {
      return []
    }

    // Transform all routines
    return routinesData.map((routineData: any) => {
      const blocks: RoutineBlockV2[] = (routineData.routine_block || [])
        .sort((a: any, b: any) => a.block_order - b.block_order)
        .map((block: any) => {
          const exercises: BlockExerciseWithSetsV2[] = (block.block_exercise_v2 || [])
            .sort((a: any, b: any) => a.display_order - b.display_order)
            .map((exercise: any) => {
              const sets: BlockExerciseSetV2[] = (exercise.block_exercise_set_v2 || [])
                .sort((a: any, b: any) => a.set_index - b.set_index)

              return {
                id: exercise.id,
                block_id: exercise.block_id,
                exercise_id: exercise.exercise_id,
                display_order: exercise.display_order,
                superset_group: exercise.superset_group,
                notes: exercise.notes,
                exercises: exercise.exercises, // Pass through the joined data
                sets
              }
            })

          return {
            id: block.id,
            routine_id: block.routine_id,
            name: block.name,
            block_order: block.block_order,
            notes: block.notes,
            exercises
          }
        })

      return {
        id: routineData.id,
        owner_id: routineData.owner_id,
        name: routineData.name,
        description: routineData.description,
        created_on: routineData.created_on,
        blocks
      }
    })

  } catch (error) {
    console.error('Error in loadAllRoutinesV2:', error)
    return []
  }
}

/**
 * Update a complete routine (V2 schema)
 * This deletes and recreates all blocks and exercises
 */
export async function updateRoutineV2(
  routineId: string,
  name: string,
  description: string | null,
  ownerId: string,
  blocks: Array<{
    name: string
    block_order: number
    notes?: string | null
    exercises: CreateBlockExerciseV2Payload[]
  }>
): Promise<boolean> {
  try {
    console.log('✏️ Updating routine V2:', routineId)

    // 1. Update routine metadata
    const { error: routineError } = await supabase
      .from('routines')
      .update({
        name,
        description
      })
      .eq('id', routineId)
      .eq('owner_id', ownerId)

    if (routineError) {
      console.error('Error updating routine:', routineError)
      return false
    }

    // 2. Delete existing blocks (CASCADE should handle exercises and sets)
    const { error: deleteBlocksError } = await supabase
      .from('routine_block')
      .delete()
      .eq('routine_id', routineId)

    if (deleteBlocksError) {
      console.error('Error deleting blocks:', deleteBlocksError)
      return false
    }

    // 3. Recreate blocks with new data (same logic as create)
    for (const block of blocks) {
      const { data: blockData, error: blockError } = await supabase
        .from('routine_block')
        .insert({
          routine_id: routineId,
          name: block.name,
          block_order: block.block_order,
          notes: block.notes || null
        })
        .select()
        .single()

      if (blockError) {
        console.error('Error creating block:', blockError)
        continue
      }

      const blockId = blockData.id

      for (const exercise of block.exercises) {
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('block_exercise_v2')
          .insert({
            block_id: blockId,
            exercise_id: exercise.exercise_id,
            display_order: exercise.display_order,
            superset_group: exercise.superset_group || null,
            notes: exercise.notes || null
          })
          .select()
          .single()

        if (exerciseError) {
          console.error('Error creating exercise:', exerciseError)
          continue
        }

        const exerciseV2Id = exerciseData.id

        if (exercise.sets && exercise.sets.length > 0) {
          const setsToInsert = exercise.sets.map(set => ({
            block_exercise_id: exerciseV2Id,
            set_index: set.set_index,
            reps: set.reps || null,
            load_kg: set.load_kg || null,
            unit: set.unit || null,
            notes: set.notes || null
          }))

          const { error: setsError } = await supabase
            .from('block_exercise_set_v2')
            .insert(setsToInsert)

          if (setsError) {
            console.error('Error creating sets:', setsError)
          }
        }
      }
    }

    toast({
      title: "Rutina actualizada",
      description: `La rutina "${name}" ha sido actualizada exitosamente.`,
    })

    return true

  } catch (error) {
    console.error('Error in updateRoutineV2:', error)
    return false
  }
}

/**
 * Delete a routine (V2 schema)
 * Note: CASCADE should handle deletion of blocks, exercises, and sets
 */
export async function deleteRoutineV2(
  routineId: string,
  ownerId: string
): Promise<boolean> {
  try {
    console.log('🗑️ Deleting routine V2:', routineId)

    const { error } = await supabase
      .from('routines')
      .delete()
      .eq('id', routineId)
      .eq('owner_id', ownerId)

    if (error) {
      console.error('Error deleting routine:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la rutina.",
        variant: "destructive"
      })
      return false
    }

    toast({
      title: "Rutina eliminada",
      description: "La rutina ha sido eliminada exitosamente.",
    })

    return true

  } catch (error) {
    console.error('Error in deleteRoutineV2:', error)
    return false
  }
}

/**
 * Add an exercise with sets to a block (V2 schema)
 */
export async function addExerciseToBlockV2(
  payload: CreateBlockExerciseV2Payload
): Promise<BlockExerciseWithSetsV2 | null> {
  try {
    // 1. Create the exercise
    const { data: exerciseData, error: exerciseError } = await supabase
      .from('block_exercise_v2')
      .insert({
        block_id: payload.block_id,
        exercise_id: payload.exercise_id,
        display_order: payload.display_order,
        superset_group: payload.superset_group || null,
        notes: payload.notes || null
      })
      .select()
      .single()

    if (exerciseError) {
      console.error('Error adding exercise:', exerciseError)
      return null
    }

    const exerciseV2Id = exerciseData.id

    // 2. Create sets
    const createdSets: BlockExerciseSetV2[] = []
    if (payload.sets && payload.sets.length > 0) {
      const setsToInsert = payload.sets.map(set => ({
        block_exercise_id: exerciseV2Id,
        set_index: set.set_index,
        reps: set.reps || null,
        load_kg: set.load_kg || null,
        unit: set.unit || null,
        notes: set.notes || null
      }))

      const { data: setsData, error: setsError } = await supabase
        .from('block_exercise_set_v2')
        .insert(setsToInsert)
        .select()

      if (setsError) {
        console.error('Error adding sets:', setsError)
      } else if (setsData) {
        createdSets.push(...setsData)
      }
    }

    return {
      ...exerciseData,
      sets: createdSets
    }

  } catch (error) {
    console.error('Error in addExerciseToBlockV2:', error)
    return null
  }
}

/**
 * Update an exercise and its sets (V2 schema)
 */
export async function updateExerciseV2(
  exerciseId: string,
  payload: UpdateBlockExerciseV2Payload
): Promise<boolean> {
  try {
    // 1. Update exercise metadata
    const updateData: any = {}
    if (payload.display_order !== undefined) updateData.display_order = payload.display_order
    if (payload.superset_group !== undefined) updateData.superset_group = payload.superset_group
    if (payload.notes !== undefined) updateData.notes = payload.notes

    if (Object.keys(updateData).length > 0) {
      const { error: exerciseError } = await supabase
        .from('block_exercise_v2')
        .update(updateData)
        .eq('id', exerciseId)

      if (exerciseError) {
        console.error('Error updating exercise:', exerciseError)
        return false
      }
    }

    // 2. Update sets if provided
    if (payload.sets) {
      // Delete existing sets and recreate (simpler than selective update)
      const { error: deleteSetsError } = await supabase
        .from('block_exercise_set_v2')
        .delete()
        .eq('block_exercise_id', exerciseId)

      if (deleteSetsError) {
        console.error('Error deleting sets:', deleteSetsError)
        return false
      }

      // Insert new sets
      const setsToInsert = payload.sets.map(set => ({
        block_exercise_id: exerciseId,
        set_index: set.set_index,
        reps: set.reps || null,
        load_kg: set.load_kg || null,
        unit: set.unit || null,
        notes: set.notes || null
      }))

      const { error: setsError } = await supabase
        .from('block_exercise_set_v2')
        .insert(setsToInsert)

      if (setsError) {
        console.error('Error inserting sets:', setsError)
        return false
      }
    }

    return true

  } catch (error) {
    console.error('Error in updateExerciseV2:', error)
    return false
  }
}

/**
 * Delete an exercise and its sets (V2 schema)
 */
export async function deleteExerciseV2(exerciseId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('block_exercise_v2')
      .delete()
      .eq('id', exerciseId)

    if (error) {
      console.error('Error deleting exercise:', error)
      return false
    }

    return true

  } catch (error) {
    console.error('Error in deleteExerciseV2:', error)
    return false
  }
}

