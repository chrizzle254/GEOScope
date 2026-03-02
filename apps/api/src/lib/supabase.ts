import { createClient } from '@supabase/supabase-js';
import { env } from '../env';

// Create a single, reusable Supabase client for the API (uses Service Role Key)
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: 'public',
  },
});
