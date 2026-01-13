import { createClient } from '@supabase/supabase-js';
import { env } from '../env';
// Create Supabase client with anon key for JWT verification
const supabase = createClient(env.SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY);
export async function authenticateUser(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }
    const token = authHeader.split(' ')[1];
    try {
        // Verify JWT and get user
        const { data: { user }, error, } = await supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        // Attach user to request
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Authentication failed: ' + error });
    }
}
// Optional: Middleware to check if user has specific role
export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        if (!roles.includes(req.user.role || '')) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
}
