/**
 * Ensures that the authenticated user has role='entrenador'.
 * The trigger 'on_auth_user_created' creates the user in public.users with default role='alumno'.
 * This function updates it to 'entrenador' on first login.
 */

import { supabase } from '@/services/database/supabaseClient';

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function ensureAppUser(): Promise<void> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('[ensureAppUser] No authenticated user');
      return;
    }

    console.log('[ensureAppUser] Starting for user:', user.email);

    // Wait a moment for the database trigger to create the user profile
    await sleep(100);

    // Check current user role
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', user.id)
      .maybeSingle();

    if (fetchError) {
      console.error('[ensureAppUser] Error fetching user:', fetchError);
      return;
    }

    if (!existingUser) {
      console.log('[ensureAppUser] User profile not found, trigger may still be running');
      return;
    }

    console.log('[ensureAppUser] Current role:', existingUser.role);

    // Update role to 'entrenador' if needed
    if (existingUser.role !== 'entrenador') {
      console.log('[ensureAppUser] Calling set_user_as_entrenador()...');
      
      // Use database function to bypass RLS policies
      const { data, error } = await supabase.rpc('set_user_as_entrenador');
      
      if (error) {
        console.error('[ensureAppUser] ❌ Failed to update role:', error);
        console.error('[ensureAppUser] Error details:', JSON.stringify(error, null, 2));
      } else {
        console.log('[ensureAppUser] ✅ Successfully called function, result:', data);
        
        // Verify the update
        const { data: updatedUser } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        
        console.log('[ensureAppUser] New role:', updatedUser?.role);
      }
    } else {
      console.log('[ensureAppUser] User already has entrenador role');
    }
  } catch (error) {
    console.error('[ensureAppUser] Unexpected error:', error);
  }
}
