import dotenv from 'dotenv';
import { cleanEnv, num, str } from 'envalid';
// Load from .env.local in development; in production, environment should be injected by platform
dotenv.config();
export const env = cleanEnv(process.env, {
    PORT: num({ default: 4000 }),
    STRIPE_API_KEY: str(),
});
