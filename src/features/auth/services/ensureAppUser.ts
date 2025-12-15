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
  // Wrap entire function with timeout
  const timeoutPromise = new Promise<void>((_, reject) => {
    setTimeout(() => reject(new Error('ensureAppUser timeout after 10 seconds')), 10000);
  });

  const workPromise = (async () => {
    try {
      console.log('[ensureAppUser] 🔧 Getting authenticated user...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.log('[ensureAppUser] ⚠️ No authenticated user found');
        return;
      }

      console.log('[ensureAppUser] ✅ Authenticated user:', user.email);

      // Wait a moment for the database trigger to create the user profile
      console.log('[ensureAppUser] ⏳ Waiting 100ms for trigger...');
      await sleep(100);

      // Check current user role
      console.log('[ensureAppUser] 🔍 Checking if user exists in users table...');
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id, role, name')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('[ensureAppUser] ❌ Error fetching user:', fetchError.message || fetchError);
        console.error('[ensureAppUser] Error details:', fetchError);
        return;
      }

      if (!existingUser) {
        console.warn('[ensureAppUser] ⚠️ User profile not found in database!');
        console.warn('[ensureAppUser] User ID:', user.id);
        console.warn('[ensureAppUser] This means the database trigger did not create the user.');
        return;
      }

      console.log('[ensureAppUser] ✅ User found:', existingUser.name || existingUser.id);
      console.log('[ensureAppUser] Current role:', existingUser.role);

      // Update role to 'entrenador' if needed
      if (existingUser.role !== 'entrenador') {
        console.log('[ensureAppUser] 🔄 Updating role to entrenador...');
        
        // Use database function to bypass RLS policies
        const { data, error } = await supabase.rpc('set_user_as_entrenador');
        
        if (error) {
          console.error('[ensureAppUser] ❌ Failed to update role:', error.message || error);
          console.error('[ensureAppUser] Error code:', error.code);
        } else {
          console.log('[ensureAppUser] ✅ Role update function called successfully');
          
          // Verify the update
          const { data: updatedUser } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
          
          console.log('[ensureAppUser] ✅ New role confirmed:', updatedUser?.role);
        }
      } else {
        console.log('[ensureAppUser] ✅ User already has entrenador role');
      }
      
      console.log('[ensureAppUser] ✅ ensureAppUser completed successfully');
    } catch (error: any) {
      console.error('[ensureAppUser] ❌ Unexpected error:', error.message || error);
      throw error;
    }
  })();

  try {
    await Promise.race([workPromise, timeoutPromise]);
  } catch (error: any) {
    console.error('[ensureAppUser] ❌ Critical error or timeout:', error.message || error);
    // Don't throw - let the app continue even if this fails
  }
}
