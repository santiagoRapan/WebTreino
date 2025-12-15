// Server-side Supabase client for API routes
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = "https://xuixyepowawocvniusgb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1aXh5ZXBvd2F3b2N2bml1c2diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODAxMjEsImV4cCI6MjA3MjA1NjEyMX0.TT6H_-8XnYtQEIb00YB19R1YDoXgTLNciRP78wGx-Co";

// Use service role key if available (bypasses RLS), otherwise fall back to anon key
// The service role key should be set in .env as SUPABASE_SERVICE_ROLE_KEY
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Default server client (uses service role or anon key)
export const supabaseServer = createClient(supabaseUrl, supabaseKey);

/**
 * Create an authenticated Supabase client using the user's access token
 * This respects RLS policies as if the user was making the request directly
 */
export function createAuthenticatedClient(accessToken: string): SupabaseClient {
    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    });
}
