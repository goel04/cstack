import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read from Vite environment variables if provided
export const SUPABASE_URL: string =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  (typeof window !== 'undefined' ? localStorage.getItem('cstack_supabase_url') || '' : '');

export const SUPABASE_ANON_KEY: string =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  (typeof window !== 'undefined' ? localStorage.getItem('cstack_supabase_anon_key') || '' : '');

// Safe placeholder project for instant local execution if keys haven't been provided yet
const FALLBACK_URL = 'https://xyzcompany.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhbnkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYyMDAwMDAwMCwiZXhwIjoxOTM1NTY4MDAwfQ.placeholder';

export const isSupabaseConfigured = (): boolean => {
  const url = (import.meta as any).env?.VITE_SUPABASE_URL || localStorage.getItem('cstack_supabase_url');
  const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || localStorage.getItem('cstack_supabase_anon_key');
  return Boolean(url && key && url.includes('supabase.co') && !url.includes('xyzcompany'));
};

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (clientInstance) return clientInstance;

  const url =
    (import.meta as any).env?.VITE_SUPABASE_URL ||
    (typeof window !== 'undefined' ? localStorage.getItem('cstack_supabase_url') : '') ||
    FALLBACK_URL;

  const key =
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
    (typeof window !== 'undefined' ? localStorage.getItem('cstack_supabase_anon_key') : '') ||
    FALLBACK_KEY;

  clientInstance = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return clientInstance;
};

export const updateSupabaseCredentials = (url: string, anonKey: string): SupabaseClient => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cstack_supabase_url', url.trim());
    localStorage.setItem('cstack_supabase_anon_key', anonKey.trim());
  }
  clientInstance = createClient(url.trim(), anonKey.trim(), {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return clientInstance;
};

export const supabase = getSupabaseClient();
