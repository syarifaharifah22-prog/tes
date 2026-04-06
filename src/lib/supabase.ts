import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;|| https://sjwapdvdmgrfwmajknvl.supabase.co
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;|| sb_publishable_Nx53zAD79ML-XBO79f-sxA_a0uByc5y

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
