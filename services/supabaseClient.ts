import { createClient } from '@supabase/supabase-js';

// Configuration
const supabaseUrl = 'https://wbidmujhfmvoibxrfzwt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiaWRtdWpoZm12b2lieHJmend0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjI3ODAsImV4cCI6MjA4NjkzODc4MH0.CznZNqXerA4Q-4Ovd5wF_nVAARnCj7xF4QYWno_ObAE';

// Export a flag so the UI can handle missing config gracefully
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

// Create client with the provided configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey);