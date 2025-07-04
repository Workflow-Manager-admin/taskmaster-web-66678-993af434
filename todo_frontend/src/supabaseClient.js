import { createClient } from '@supabase/supabase-js';

// PUBLIC_INTERFACE
/**
 * Supabase client instance for the "todo_app".
 *
 * This module initializes Supabase using environment variables which should be set in the
 * .env file at the root of the repo (or at the root of the frontend project).
 * 
 * Required variables (see also .env.example):
 *   REACT_APP_SUPABASE_URL  - your Supabase project URL (NOT service_role, just anon)
 *   REACT_APP_SUPABASE_KEY  - your Supabase anon public API key
 *
 * Both variables MUST start with REACT_APP_ for Create React App to make them available at build time.
 * Runtime access to process.env.SUPABASE_URL will not work in the browser.
 *
 * If the variables are missing, the app will throw a console error with a clear message.
 */

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error(
    "[Supabase] Environment variables missing! Please set both REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY " +
    "in your .env file at the root of the React project.\n" +
    "Example:\n" +
    "REACT_APP_SUPABASE_URL=https://tdfmyfdpvnuseomlevun.supabase.co\n" +
    "REACT_APP_SUPABASE_KEY=your-anon-public-api-key"
  );
  // Optionally, throw error to prevent further app usage
  throw new Error("[Supabase] App misconfigured: Supabase URL/Key missing from environment (.env). See console for details.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

