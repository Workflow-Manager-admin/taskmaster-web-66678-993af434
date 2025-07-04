import { createClient } from '@supabase/supabase-js';

// PUBLIC_INTERFACE
/** Supabase client instance, initialized using environment variables 
 * for URL and Key provided at runtime (from .env or direct process.env).
 * Exposes authentication and database client for the todo_app.
 */
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_KEY || process.env.SUPABASE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
