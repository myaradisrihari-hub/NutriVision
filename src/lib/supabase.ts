import { createClient } from '@supabase/supabase-js';

function normalizeSupabaseUrl(url: string): string {
  if (!url) return '';
  // Common misconfig: pasting the REST endpoint instead of project URL
  return url.replace(/\/rest\/v1\/?$/i, '').replace(/\/$/, '');
}

const supabaseUrl = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL as string);
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not set. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  );
} else if (import.meta.env.DEV) {
  console.info('[NutriVision] Supabase URL:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
