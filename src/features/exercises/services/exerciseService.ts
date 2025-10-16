import { supabase } from "@/services/database"
import type { Exercise } from "../types"

/**
 * Create a custom exercise in the database
 * @param exerciseData - Exercise data without id and owner_id
 * @param ownerId - UUID of the trainer/owner creating the exercise
 * @returns The created exercise with id, or null if failed
 */
export async function createCustomExercise(
  exerciseData: Omit<Exercise, "id" | "owner_id">,
  ownerId: string
): Promise<Exercise | null> {
  try {
    // Generate a unique ID for the exercise
    const exerciseId = `custom_${ownerId}_${Date.now()}`

    // Prepare the exercise object for database insertion
    const exerciseToInsert = {
      id: exerciseId,
      name: exerciseData.name,
      gif_URL: exerciseData.gif_URL || null,
      target_muscles: exerciseData.target_muscles || [],
      body_parts: exerciseData.body_parts || [],
      equipments: exerciseData.equipments || [],
      secondary_muscles: exerciseData.secondary_muscles || [],
      instructions: exerciseData.instructions || null,
      owner_id: ownerId,
    }

    // Insert into the database
    const { data, error } = await supabase
      .from("exercises")
      .insert(exerciseToInsert)
      .select()
      .single()

    if (error) {
      console.error("Error creating custom exercise:", error)
      throw error
    }

    // Return the created exercise
    return data as Exercise

  } catch (error) {
    console.error("Failed to create custom exercise:", error)
    return null
  }
}

/**
 * Update an existing custom exercise
 * Only allows updating exercises owned by the user
 */
export async function updateCustomExercise(
  exerciseId: string,
  updates: Partial<Omit<Exercise, "id" | "owner_id">>,
  ownerId: string
): Promise<Exercise | null> {
  try {
    // Verify ownership before updating
    const { data: existing, error: fetchError } = await supabase
      .from("exercises")
      .select("owner_id")
      .eq("id", exerciseId)
      .single()

    if (fetchError || !existing) {
      console.error("Exercise not found:", exerciseId)
      return null
    }

    if (existing.owner_id !== ownerId) {
      console.error("User does not own this exercise")
      return null
    }

    // Update the exercise
    const { data, error } = await supabase
      .from("exercises")
      .update(updates)
      .eq("id", exerciseId)
      .select()
      .single()

    if (error) {
      console.error("Error updating exercise:", error)
      return null
    }

    return data as Exercise

  } catch (error) {
    console.error("Failed to update exercise:", error)
    return null
  }
}

/**
 * Delete a custom exercise
 * Only allows deleting exercises owned by the user
 */
export async function deleteCustomExercise(
  exerciseId: string,
  ownerId: string
): Promise<boolean> {
  try {
    // Verify ownership before deleting
    const { data: existing, error: fetchError } = await supabase
      .from("exercises")
      .select("owner_id")
      .eq("id", exerciseId)
      .single()

    if (fetchError || !existing) {
      console.error("Exercise not found:", exerciseId)
      return false
    }

    if (existing.owner_id !== ownerId) {
      console.error("User does not own this exercise")
      return false
    }

    // Delete the exercise
    const { error } = await supabase
      .from("exercises")
      .delete()
      .eq("id", exerciseId)

    if (error) {
      console.error("Error deleting exercise:", error)
      return false
    }

    return true

  } catch (error) {
    console.error("Failed to delete exercise:", error)
    return false
  }
}

/**
 * Get all custom exercises created by a specific trainer
 */
export async function getCustomExercises(ownerId: string): Promise<Exercise[]> {
  try {
    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .eq("owner_id", ownerId)
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching custom exercises:", error)
      return []
    }

    return (data as Exercise[]) || []

  } catch (error) {
    console.error("Failed to fetch custom exercises:", error)
    return []
  }
}

