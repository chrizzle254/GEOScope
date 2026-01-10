import dotenv from 'dotenv';
import { cleanEnv, num, str } from 'envalid';
const nodeEnv = process.env.NODE_ENV || 'development';
// Load env files in layering order, similar to Next.js
// Base
dotenv.config({ path: '.env' });
// Environment-specific
dotenv.config({ path: `.env.${nodeEnv}` });
// Local overrides
dotenv.config({ path: '.env.local', override: true });
dotenv.config({ path: `.env.${nodeEnv}.local`, override: true });
export const env = cleanEnv(process.env, {
    PORT: num({ default: 4000 }),
    SUPABASE_URL: str(),
    SUPABASE_ANON_KEY: str(),
    SUPABASE_SERVICE_ROLE_KEY: str(),
});
