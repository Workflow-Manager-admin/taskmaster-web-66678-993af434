import { createClient } from '@supabase/supabase-js';

// PUBLIC_INTERFACE
/**
 * Supabase client instance for the "todo_app".
 *
 * This module initializes Supabase using configuration found in the manifest file,
 * instead of environment variables (such as .env or process.env).
 *
 * The manifest configuration should be present and imported via `import manifest from '../manifest.json';`
 *
 * If you update your Supabase project credentials, change them in the manifest file directly.
 */

// Try to import Supabase configuration from manifest.json.
// The convention is to place it at the project root as "manifest.json".
let SUPABASE_URL = '';
let SUPABASE_ANON_KEY = '';

try {
  // If using a build-time injected global manifest object (such as from public/manifest.json)
  // use that for config. Otherwise, expect a src/manifest.json to be imported.
  // Change as per your project's actual convention.
  // We use dynamic import so this file can be used in test environments without errors.
  // eslint-disable-next-line no-undef
  const manifest =
    (window && window.__APP_MANIFEST__)
      ? window.__APP_MANIFEST__
      : require('../manifest.json');

  SUPABASE_URL = manifest.supabaseUrl || manifest.supabase_url || manifest.SUPABASE_URL;
  SUPABASE_ANON_KEY = manifest.supabaseKey || manifest.supabase_key || manifest.SUPABASE_KEY;
} catch (err) {
  // Fallback to hardcoded demo project if manifest is missing
  SUPABASE_URL = 'https://tdfmyfdpvnuseomlevun.supabase.co';
  SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkZm15ZmRwdm51c2VvbWxldnVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzIzNjUsImV4cCI6MjA2NzIwODM2NX0.Ty-8ZYrdt9g6yMKMlA2bfnaKSb2vqZ11zFKFipUPaqc';
  // eslint-disable-next-line no-console
  console.warn('[Supabase] Could not read manifest config, using fallback project keys. Update manifest.json for production.');
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.error(
    "[Supabase] Manifest configuration missing! Add supabaseUrl and supabaseKey to your manifest.json file at the root of the project:\n" +
    `{
  "supabaseUrl": "https://tdfmyfdpvnuseomlevun.supabase.co",
  "supabaseKey": "<your-anon-public-api-key>"
}`
  );
  throw new Error("[Supabase] App misconfigured: Supabase URL/Key missing from manifest.json. See console for details.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

