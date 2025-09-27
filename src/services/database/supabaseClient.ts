"use client";
import { createClient } from '@supabase/supabase-js';

//const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseUrl = "https://xuixyepowawocvniusgb.supabase.co";
//const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1aXh5ZXBvd2F3b2N2bml1c2diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODAxMjEsImV4cCI6MjA3MjA1NjEyMX0.TT6H_-8XnYtQEIb00YB19R1YDoXgTLNciRP78wGx-Co";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);