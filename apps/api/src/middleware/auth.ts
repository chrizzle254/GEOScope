import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../env';

// Extend Express Request type to include the decoded user payload
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string; // 'sub' claim from the JWT
      role: string;
      // Add other properties from your JWT payload as needed
    };
  }
}

interface JwtPayload {
  sub: string;
  role: string;
  // Add other properties from your JWT payload as needed
}

export function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token using the secret
    const decoded = jwt.verify(token, env.SUPABASE_JWT_SECRET) as JwtPayload;

    // Attach user payload to request. The user ID is in the 'sub' claim.
    req.user = {
      id: decoded.sub,
      role: decoded.role,
    };

    next();
  } catch (error) {
    // This will catch errors like expired tokens or invalid signatures
    return res
      .status(401)
      .json({ error: 'Authentication failed: Invalid or expired token. ' + error });
  }
}

// This optional middleware can remain as is, it's still useful.
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role || '')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}
