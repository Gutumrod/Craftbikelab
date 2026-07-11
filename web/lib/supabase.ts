import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let browserSafeClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (browserSafeClient) return browserSafeClient;

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  browserSafeClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return browserSafeClient;
}
