import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from './database.types';

export const supabase = createClientComponentClient<Database>();

// Helper function to get a server-side Supabase client
export function getSupabaseClient() {
  return createClientComponentClient<Database>();
}