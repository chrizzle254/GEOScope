import { Request, Response, NextFunction } from 'express';
import { jwtVerify, createRemoteJWKSet, JWTPayload } from 'jose';
import { env } from '../env';
import { supabaseAdmin } from '../lib/supabase';

// Normalize URL to prevent double-slashes and set up JWKS
const SUPABASE_AUTH_URL = `${env.SUPABASE_URL.replace(/\/$/, '')}/auth/v1`;
const JWKS = createRemoteJWKSet(new URL(`${SUPABASE_AUTH_URL}/.well-known/jwks.json`));

/**
 * Type definitions for the Express Request context
 */
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string; // internal public.users.id (UUID)
      auth_id: string; // Supabase auth.users.id (sub claim)
      role: string; // Role from organization_members
      organization_id: string;
    };
  }
}

/**
 * Shape of the Supabase JWT payload
 */
interface SupabaseJwtPayload extends JWTPayload {
  role?: string;
}

/**
 * Shape of the joined query result from Supabase
 */
interface UserOrgContext {
  id: string;
  organization_members: {
    organization_id: string;
    role: string;
  }[];
}

/**
 * Middleware to authenticate Supabase JWTs and resolve Organization context.
 * Performs a single-query join to minimize database latency.
 */
export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Verify JWT via remote JWKS (handles ES256/RS256/HS256)
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: SUPABASE_AUTH_URL,
    });

    const decoded = payload as SupabaseJwtPayload;
    if (!decoded.sub) throw new Error('Missing sub claim');

    // 2. Resolve internal Profile and Organization context in one round-trip
    const { data, error: contextError } = await supabaseAdmin
      .from('users')
      .select(
        `
        id,
        organization_members!inner (
          organization_id,
          role
        )
      `,
      )
      .eq('auth_id', decoded.sub)
      .single();

    // Type casting the Supabase response to our interface
    const context = data as unknown as UserOrgContext;

    if (contextError || !context || !context.organization_members?.[0]) {
      console.error('Auth Context Resolution Failed:', contextError?.message || 'No org mapping');
      return res.status(403).json({ error: 'User profile or organization context not found.' });
    }

    const membership = context.organization_members[0];

    // 3. Attach strictly typed context to the request
    req.user = {
      id: context.id,
      auth_id: decoded.sub,
      role: membership.role,
      organization_id: membership.organization_id,
    };

    next();
  } catch (error) {
    console.error('JWT_VERIFICATION_ERROR:', error);
    return res.status(401).json({
      error: 'Authentication failed: Invalid or expired token.',
    });
  }
}

/**
 * Role-based access control middleware
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
