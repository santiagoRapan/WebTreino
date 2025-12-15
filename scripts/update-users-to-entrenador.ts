/**
 * One-time script to update all existing users to 'entrenador' role
 * Run this with: npx tsx scripts/update-users-to-entrenador.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://xuixyepowawocvniusgb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1aXh5ZXBvd2F3b2N2bml1c2diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODAxMjEsImV4cCI6MjA3MjA1NjEyMX0.TT6H_-8XnYtQEIb00YB19R1YDoXgTLNciRP78wGx-Co";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateAllUsersToEntrenador() {
  console.log('Fetching all users with alumno role...');
  
  const { data: users, error: fetchError } = await supabase
    .from('users')
    .select('id, name, email, role')
    .eq('role', 'alumno');

  if (fetchError) {
    console.error('Error fetching users:', fetchError);
    return;
  }

  if (!users || users.length === 0) {
    console.log('No users with alumno role found.');
    return;
  }

  console.log(`Found ${users.length} users with alumno role:`, users);

  console.log('\nUpdating all to entrenador...');
  
  const { error: updateError } = await supabase
    .from('users')
    .update({ role: 'entrenador' })
    .eq('role', 'alumno');

  if (updateError) {
    console.error('Error updating users:', updateError);
    return;
  }

  console.log('✅ Successfully updated all users to entrenador role!');
}

updateAllUsersToEntrenador()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
