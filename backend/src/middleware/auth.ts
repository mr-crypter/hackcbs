import { Request, Response, NextFunction } from 'express';
import { expressjwt, GetVerificationKey } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import { config } from '../config/env';

// Extend Express Request to include auth
export interface AuthRequest extends Request {
  auth?: {
    sub: string;
    permissions?: string[];
    [key: string]: any;
  };
}

// JWT verification middleware
export const checkJwt = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${config.auth0Domain}/.well-known/jwks.json`,
  }) as GetVerificationKey,
  audience: config.auth0Audience,
  issuer: config.auth0Issuer,
  algorithms: ['RS256'],
});

// Optional auth middleware (doesn't throw on missing token)
export const optionalAuth = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${config.auth0Domain}/.well-known/jwks.json`,
  }) as GetVerificationKey,
  audience: config.auth0Audience,
  issuer: config.auth0Issuer,
  algorithms: ['RS256'],
  credentialsRequired: false,
});

// Role-based access control
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userRoles = req.auth.permissions || [];
    const hasRole = roles.some(role => userRoles.includes(role));

    if (!hasRole) {
      res.status(403).json({
        error: 'Insufficient permissions',
        required: roles,
      });
      return;
    }

    next();
  };
}

// Extract user ID from JWT
export function getUserId(req: AuthRequest): string {
  return req.auth?.sub || 'anonymous';
}

// Check if user is moderator or official
export function isModerator(req: AuthRequest): boolean {
  const permissions = req.auth?.permissions || [];
  return permissions.includes('moderator') || permissions.includes('official');
}

