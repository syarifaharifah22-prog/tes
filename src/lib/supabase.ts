import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sjwapdvdmgrfwmajknvl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqd2FwZHZkbWdyZndtYWprbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODQxMzAsImV4cCI6MjA5MTA2MDEzMH0.hDXz8UULBuCaYxxXurQsWVhEokUx4bBEAJTU-Cx6jZ0';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
